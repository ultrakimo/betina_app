// BETina proactive triggers engine — Supabase Edge Function (Deno).
//
// Runs on a schedule (every 15 min via pg_cron). For every player with a push
// token it evaluates a registry of TRIGGERS. For the first trigger that fires
// (and passes the frequency caps + its own cooldown) it asks Claude to write a
// short, on-persona push, sends it, stores it in `notifications`, and records
// it in `trigger_log`.
//
// Frequency caps (per user):
//   • marketing: max 1 / day, max 3 / week
//   • every trigger also has its own cooldown so it can't repeat too soon
//   • at most ONE proactive message per user per run
//
// This file ships the ENGINE plus a few real starter triggers. The full
// blueprint set drops straight into the TRIGGERS array below — each entry is
// { key, category, cooldownHours, evaluate(ctx) -> brief|null }.
//
// Deploy:  supabase functions deploy proactive-triggers --no-verify-jwt
// Env:     SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
// Schedule: see supabase/migrations/006_proactive_triggers.sql

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SPORTS_API = 'https://intelligence.geniusbet.com';
const EXPO_PUSH = 'https://exp.host/--/api/v2/push/send';
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const MODEL = 'claude-sonnet-5';

// Marketing frequency caps.
const MARKETING_MAX_PER_DAY = 1;
const MARKETING_MAX_PER_WEEK = 3;

const LANG_NAMES: Record<string, string> = {
  en: 'English', de: 'German', es: 'Spanish', pt: 'Portuguese', fr: 'French', it: 'Italian', ro: 'Romanian',
};

type Profile = {
  id: string;
  name: string | null;
  language: string | null;
  favourite_team: string | null;
  favourite_team_id: string | null;
  favourite_team_sport: string | null;
  vip_tier: string | null;
  xp_points: number | null;
  streak_days: number | null;
  last_login_date: string | null; // 'YYYY-MM-DD'
  push_token: string | null;
  created_at: string | null;
};

type MatchEvent = {
  id: string; home: string; away: string;
  homeScore: string | null; awayScore: string | null; date: string; league: string;
};

type LogRow = { trigger_key: string; category: string; sent_at: string };

type TriggerCtx = {
  p: Profile;
  now: Date;
  today: string;              // 'YYYY-MM-DD' (UTC)
  daysSinceLogin: number | null;
  // Lazily-fetched, cached per user for the whole run:
  nextFixture: () => Promise<MatchEvent | null>;
};

type Trigger = {
  key: string;
  category: 'marketing' | 'engagement' | 'transactional';
  cooldownHours: number;
  // Return a short natural-language brief describing WHY to message them
  // (Claude turns it into the actual push), or null to skip.
  evaluate: (c: TriggerCtx) => Promise<string | null> | string | null;
};

// ── Trigger registry ─────────────────────────────────────────────────────────
// Starter set of real triggers. Add the blueprint's triggers here in priority
// order (first match wins per run).
const TRIGGERS: Trigger[] = [
  {
    // Favourite team plays today → build hype.
    key: 'match_day',
    category: 'engagement',
    cooldownHours: 20,
    evaluate: async (c) => {
      if (!c.p.favourite_team_id) return null;
      const next = await c.nextFixture();
      if (!next || next.date !== c.today) return null;
      const opp = next.home.toLowerCase().includes((c.p.favourite_team ?? '').toLowerCase())
        ? next.away : next.home;
      return `Their favourite team ${c.p.favourite_team} plays TODAY vs ${opp} (${next.league}). Hype them up for match day and invite them to chat about it.`;
    },
  },
  {
    // A good streak is about to break (evening, hasn't opened today).
    key: 'streak_at_risk',
    category: 'engagement',
    cooldownHours: 20,
    evaluate: (c) => {
      const streak = c.p.streak_days ?? 0;
      if (streak < 3) return null;
      if (c.p.last_login_date === c.today) return null; // already opened today
      if (c.now.getUTCHours() < 17) return null;         // only nudge in the evening
      return `They're on a ${streak}-day streak but haven't opened the app today — it's evening. Warmly nudge them to hop in so they don't lose the streak.`;
    },
  },
  {
    // Been away a while → gentle re-engagement (marketing).
    key: 'we_miss_you',
    category: 'marketing',
    cooldownHours: 96,
    evaluate: (c) => {
      if (c.daysSinceLogin == null || c.daysSinceLogin < 4) return null;
      return `They haven't opened the app in ${c.daysSinceLogin} days. Send a warm, flirty "I miss you" nudge that makes them want to come back — mention their team ${c.p.favourite_team ?? 'and the latest sport action'} if there is one.`;
    },
  },
];

// ── Message generation ───────────────────────────────────────────────────────
async function generateMessage(p: Profile, brief: string): Promise<string | null> {
  const lang = LANG_NAMES[p.language ?? 'en'] ?? 'English';
  const name = p.name ?? 'you';
  const system = `You are BETina, a charming, playful, lightly flirty companion for GeniusBet sports fans. Write ONE short push-notification body in ${lang}, addressed to ${name}. Warm and teasing, WhatsApp-style, max ~140 characters, at most one emoji. No quotes, no title, just the message text. NEVER promise wins, never pressure them to bet.`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 200, thinking: { type: 'disabled' },
        system, messages: [{ role: 'user', content: brief }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // deno-lint-ignore no-explicit-any
    const text = (data.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
    return text || null;
  } catch {
    return null;
  }
}

async function sendPush(token: string, title: string, body: string) {
  await fetch(EXPO_PUSH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: token, title, body, sound: 'default' }),
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function hoursSince(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / 36e5;
}
function daysBetween(dateStr: string | null, now: Date): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr + 'T00:00:00Z').getTime();
  const today = new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
  return Math.round((today - then) / 864e5);
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, language, favourite_team, favourite_team_id, favourite_team_sport, vip_tier, xp_points, streak_days, last_login_date, push_token, created_at')
    .not('push_token', 'is', null);

  let sent = 0;

  for (const p of (profiles ?? []) as Profile[]) {
    try {
      // One week of this user's log → compute caps + cooldowns in memory.
      const { data: logs } = await supabase
        .from('trigger_log')
        .select('trigger_key, category, sent_at')
        .eq('user_id', p.id)
        .gte('sent_at', new Date(now.getTime() - 7 * 864e5).toISOString());
      const log = (logs ?? []) as LogRow[];

      const marketingDay = log.filter((l) => l.category === 'marketing' && hoursSince(l.sent_at, now) < 24).length;
      const marketingWeek = log.filter((l) => l.category === 'marketing').length;

      // Cache the next fixture lookup so multiple triggers share one request.
      let fixtureLoaded = false;
      let fixtureCache: MatchEvent | null = null;
      const nextFixture = async () => {
        if (fixtureLoaded) return fixtureCache;
        fixtureLoaded = true;
        if (!p.favourite_team_id) return null;
        try {
          const r = await fetch(`${SPORTS_API}/api/sports/team/${p.favourite_team_id}/next`);
          const d = await r.json();
          fixtureCache = (d.events ?? [])[0] ?? null;
        } catch { fixtureCache = null; }
        return fixtureCache;
      };

      const ctx: TriggerCtx = {
        p, now, today,
        daysSinceLogin: daysBetween(p.last_login_date, now),
        nextFixture,
      };

      for (const trig of TRIGGERS) {
        // Per-trigger cooldown.
        const last = log.find((l) => l.trigger_key === trig.key);
        if (last && hoursSince(last.sent_at, now) < trig.cooldownHours) continue;
        // Marketing caps.
        if (trig.category === 'marketing' && (marketingDay >= MARKETING_MAX_PER_DAY || marketingWeek >= MARKETING_MAX_PER_WEEK)) continue;

        const brief = await trig.evaluate(ctx);
        if (!brief) continue;

        const body = await generateMessage(p, brief);
        if (!body) continue; // don't send an empty/failed generation

        await supabase.from('notifications').insert({ user_id: p.id, type: trig.key, title: 'BETina', body });
        await supabase.from('trigger_log').insert({ user_id: p.id, trigger_key: trig.key, category: trig.category });
        if (p.push_token) await sendPush(p.push_token, 'BETina 💚', body);
        sent++;
        break; // at most one proactive message per user per run
      }
    } catch (_e) {
      // one player failing shouldn't stop the batch
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), { headers: { 'Content-Type': 'application/json' } });
});
