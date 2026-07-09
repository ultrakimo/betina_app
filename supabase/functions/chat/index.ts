// BETina chat proxy — Supabase Edge Function (Deno).
//
// Holds the Anthropic key server-side (so it never ships in the app bundle),
// verifies the caller's Supabase session, runs BETina's full tool loop
// (team/news lookups + memory + reminders) and returns her reply.
//
// Deploy:
//   supabase functions deploy chat          # JWT verification ON (default)
//   supabase secrets set ANTHROPIC_API_KEY=<your rotated key>
// (SUPABASE_URL / SUPABASE_ANON_KEY are injected automatically.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const MODEL = 'claude-sonnet-5';
const MAX_TOOL_ROUNDS = 5;
const SPORTS_API = 'https://intelligence.geniusbet.com';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Turn = { role: 'user' | 'assistant'; content: string };
type MatchEvent = {
  id: string; home: string; away: string; homeScore: string | null; awayScore: string | null;
  date: string; time: string; league: string;
};
type NewsItem = { title: string; description: string; link: string; pubDate: string; image?: string };
type LiveContext = { next: MatchEvent[]; last: MatchEvent[]; news: NewsItem[] };
type Ctx = {
  name: string; lang: string;
  team?: string | null; teamSport?: string | null; teamLeague?: string | null;
  sports?: string[]; tier?: string | null; xp?: number | null; streakDays?: number | null;
  live?: LiveContext | null; memories?: string[];
};

const LANG_NAMES: Record<string, string> = {
  en: 'English', de: 'German', es: 'Spanish', pt: 'Portuguese', fr: 'French', it: 'Italian', ro: 'Romanian',
};

// ── System prompt (kept in sync with the app's persona) ───────────────────────

function matchLine(e: MatchEvent): string {
  const score = e.homeScore != null && e.awayScore != null ? ` (${e.homeScore}–${e.awayScore})` : '';
  return `${e.home} vs ${e.away}${score} — ${e.date}${e.time ? ` ${e.time.slice(0, 5)}` : ''}, ${e.league}`;
}
function liveDataBlock(live?: LiveContext | null): string {
  if (!live) return '';
  const parts: string[] = [];
  if (live.next?.length) parts.push('Upcoming fixtures:\n' + live.next.map((e) => `  • ${matchLine(e)}`).join('\n'));
  if (live.last?.length) parts.push('Recent results:\n' + live.last.map((e) => `  • ${matchLine(e)}`).join('\n'));
  if (live.news?.length) parts.push('Latest headlines (BBC Sport):\n' + live.news.map((n) => `  • ${n.title}`).join('\n'));
  if (!parts.length) return '';
  const today = new Date().toISOString().slice(0, 10);
  return `\n\nLIVE DATA (from the app's sports feed, today is ${today}) — reference this to answer accurately, don't say you can't see data:\n${parts.join('\n')}`;
}
function memoryBlock(memories?: string[]): string {
  if (!memories?.length) return '';
  return `\n\nWHAT YOU REMEMBER about them (weave in naturally, don't recite):\n${memories.map((m) => `  • ${m}`).join('\n')}`;
}
function systemPrompt(ctx: Ctx): string {
  const facts = [
    `- Name: ${ctx.name}`,
    ctx.team ? `- Favourite team: ${ctx.team}${ctx.teamLeague ? ` (${ctx.teamLeague}${ctx.teamSport ? `, ${ctx.teamSport}` : ''})` : ''}` : null,
    ctx.sports?.length ? `- Follows these sports: ${ctx.sports.join(', ')}` : null,
    ctx.tier ? `- VIP tier: ${ctx.tier} (earned through activity, never spending)` : null,
    ctx.xp != null ? `- XP: ${ctx.xp}` : null,
    ctx.streakDays != null ? `- Daily streak: ${ctx.streakDays} days` : null,
  ].filter(Boolean).join('\n');
  const lang = LANG_NAMES[ctx.lang] ?? 'English';

  return `You are BETina, a charming, playful and lightly flirty companion inside the BETina app for GeniusBet players — like a close friend who's always there for them and happens to know everything about sport.

Tone & style:
- Warm, charming, a little flirty and teasing 😊 — a fun friend who's clearly happy to hear from them, not a formal assistant. Classy and friendly, never crude.
- Short and punchy — WhatsApp style, a line or two, never essays.
- Emojis naturally but sparingly (1-2 max).
- Address the player by name now and then, warmly — not in every message.

About the player you're talking to:
${facts}${memoryBlock(ctx.memories)}${liveDataBlock(ctx.live)}

Rules:
- Respond in ${lang} by default; if the player clearly writes in another language, match theirs.
- Center the chat on their favourite team${ctx.team ? ` (${ctx.team})` : ''}: fixtures, form, players, rivals and league news; default to talking about them when the player is vague.
- Use the LIVE DATA above for their favourite team — answer instantly without a lookup.
- For ANYTHING beyond that — another team, another sport, more news — use your tools: search_team then get_fixtures / get_results, and get_news. Never guess scores, dates or standings from memory; if it's not in LIVE DATA, look it up.
- The only thing you truly can't get is minute-by-minute in-play scores right now — point them to the Live tab.
- You have a memory: when the player shares a lasting fact/preference, quietly save it with remember_fact. Use what you remember to stay personal.
- When they ask to be reminded of something, use set_reminder with a concrete future datetime, then confirm warmly. If timing is unclear, ask.
- NEVER promise wins, NEVER suggest chasing losses, NEVER pressure anyone to bet. Stay caring, not pushy.
- No real money moves in this app — bets happen on the GeniusBet website only.`;
}

// ── Tools ─────────────────────────────────────────────────────────────────────

const TOOLS = [
  { name: 'search_team', description: 'Find a sports team by name across ANY sport to get its id, sport and league. Call this first for a team you do not already have an id for.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'get_fixtures', description: "A team's upcoming matches. Needs a team id from search_team.", input_schema: { type: 'object', properties: { team_id: { type: 'string' } }, required: ['team_id'] } },
  { name: 'get_results', description: "A team's recent finished matches with scores. Needs a team id from search_team.", input_schema: { type: 'object', properties: { team_id: { type: 'string' } }, required: ['team_id'] } },
  { name: 'get_news', description: 'Latest sports headlines. Optional sport filter.', input_schema: { type: 'object', properties: { sport: { type: 'string' } }, required: [] } },
  { name: 'remember_fact', description: 'Save a lasting fact/preference the player shares so you recall it next time. Only worthwhile things, not small talk.', input_schema: { type: 'object', properties: { fact: { type: 'string' } }, required: ['fact'] } },
  { name: 'set_reminder', description: 'Set a reminder. Work out a concrete future ISO datetime from what they said and today\'s date.', input_schema: { type: 'object', properties: { text: { type: 'string' }, datetime: { type: 'string' } }, required: ['text', 'datetime'] } },
];

function compactMatch(e: MatchEvent) {
  return { home: e.home, away: e.away, score: e.homeScore != null && e.awayScore != null ? `${e.homeScore}-${e.awayScore}` : null, date: e.date, time: e.time ? e.time.slice(0, 5) : null, league: e.league };
}

// deno-lint-ignore no-explicit-any
async function runTool(name: string, input: any, supabase: any, userId: string | null): Promise<string> {
  try {
    if (name === 'search_team') {
      const r = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(String(input.query ?? ''))}`);
      const d = await r.json();
      // deno-lint-ignore no-explicit-any
      return JSON.stringify((d.teams ?? []).slice(0, 5).map((t: any) => ({ id: t.idTeam, name: t.strTeam, sport: t.strSport, league: t.strLeague })));
    }
    if (name === 'get_fixtures') {
      const r = await fetch(`${SPORTS_API}/api/sports/team/${input.team_id}/next`);
      const d = await r.json();
      return JSON.stringify((d.events ?? []).slice(0, 5).map(compactMatch));
    }
    if (name === 'get_results') {
      const r = await fetch(`${SPORTS_API}/api/sports/team/${input.team_id}/last`);
      const d = await r.json();
      return JSON.stringify((d.events ?? []).slice(0, 5).map(compactMatch));
    }
    if (name === 'get_news') {
      const r = await fetch(`${SPORTS_API}/api/sports/news?sport=${input.sport ?? 'sport'}&count=8`);
      const d = await r.json();
      return JSON.stringify((d.items ?? []).slice(0, 8).map((n: NewsItem) => n.title));
    }
    if (name === 'remember_fact') {
      if (!userId) return "Can't save (not signed in).";
      const { error } = await supabase.from('betina_memories').insert({ user_id: userId, content: String(input.fact ?? '').trim() });
      return error ? `Could not save: ${error.message}` : 'Saved.';
    }
    if (name === 'set_reminder') {
      if (!userId) return "Can't set it (not signed in).";
      const when = new Date(String(input.datetime ?? ''));
      if (isNaN(when.getTime())) return 'Time unclear — ask the player to be specific.';
      const { error } = await supabase.from('reminders').insert({ user_id: userId, text: String(input.text ?? '').trim(), remind_at: when.toISOString() });
      return error ? `Could not set reminder: ${error.message}` : `Reminder set for ${when.toISOString()}.`;
    }
    return 'Unknown tool.';
  } catch {
    return 'That lookup failed — no data right now.';
  }
}

// deno-lint-ignore no-explicit-any
async function callClaude(system: string, messages: any[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, thinking: { type: 'disabled' }, system, tools: TOOLS, messages }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { history, ctx } = (await req.json()) as { history: Turn[]; ctx: Ctx };

    // Auth-scoped client so memory/reminder writes run as the caller (RLS).
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } });

    // First message must be from the user
    const firstUser = history.findIndex((m) => m.role === 'user');
    const trimmed = firstUser === -1 ? [] : history.slice(firstUser).slice(-24);
    if (!trimmed.length) return new Response(JSON.stringify({ reply: '' }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

    // deno-lint-ignore no-explicit-any
    const messages: any[] = trimmed.map((m) => ({ role: m.role, content: m.content }));
    const system = systemPrompt(ctx);

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await callClaude(system, messages);
      if (response.stop_reason === 'tool_use') {
        // deno-lint-ignore no-explicit-any
        const toolUses = (response.content ?? []).filter((b: any) => b.type === 'tool_use');
        messages.push({ role: 'assistant', content: response.content });
        const results = await Promise.all(
          // deno-lint-ignore no-explicit-any
          toolUses.map(async (tu: any) => ({ type: 'tool_result', tool_use_id: tu.id, content: await runTool(tu.name, tu.input ?? {}, supabase, user.id) })),
        );
        messages.push({ role: 'user', content: results });
        continue;
      }
      // deno-lint-ignore no-explicit-any
      const text = (response.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
      return new Response(JSON.stringify({ reply: text }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ reply: '' }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
