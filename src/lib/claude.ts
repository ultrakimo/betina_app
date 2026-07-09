// BETina's brain — Claude API via the official SDK when a key is configured,
// personality-true canned replies otherwise (so the chat works in demo builds).
//
// NOTE: shipping an API key inside the app bundle is fine for prototyping
// only. Before the App Store release, move this call behind a server
// (intelligence.geniusbet.com or a Supabase Edge Function) so the key
// never leaves your infrastructure.

import Anthropic from '@anthropic-ai/sdk';
import type { LangCode } from './i18n';
import { saveMemory, setReminder } from './memory';
import {
  fetchNews,
  fetchTeamLast,
  fetchTeamNext,
  searchTeams,
  type LiveContext,
  type MatchEvent,
} from './sports';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const MODEL = 'claude-sonnet-5';
const MAX_HISTORY_TURNS = 24; // cap what we resend each turn
const MAX_TOOL_ROUNDS = 5; // safety cap on the tool-call loop

const client = CLAUDE_API_KEY
  ? new Anthropic({ apiKey: CLAUDE_API_KEY, dangerouslyAllowBrowser: true })
  : null;

export type Turn = { role: 'user' | 'assistant'; content: string };

/** Everything BETina should know about the player she's talking to. */
export type BetinaContext = {
  name: string;
  lang: LangCode;
  team?: string | null;
  teamSport?: string | null;
  teamLeague?: string | null;
  sports?: string[]; // all sports the player follows
  tier?: string | null;
  xp?: number | null;
  streakDays?: number | null;
  live?: LiveContext | null; // real fixtures / results / headlines
  memories?: string[]; // facts BETina has remembered about the player
};

const LANG_NAMES: Record<LangCode, string> = {
  en: 'English',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  it: 'Italian',
  ro: 'Romanian',
};

function matchLine(e: MatchEvent): string {
  const score = e.homeScore != null && e.awayScore != null ? ` (${e.homeScore}–${e.awayScore})` : '';
  const when = `${e.date}${e.time ? ` ${e.time.slice(0, 5)}` : ''}`;
  return `${e.home} vs ${e.away}${score} — ${when}, ${e.league}`;
}

function liveDataBlock(live: LiveContext | null | undefined): string {
  if (!live) return '';
  const parts: string[] = [];
  if (live.next.length) parts.push('Upcoming fixtures:\n' + live.next.map((e) => `  • ${matchLine(e)}`).join('\n'));
  if (live.last.length) parts.push('Recent results:\n' + live.last.map((e) => `  • ${matchLine(e)}`).join('\n'));
  if (live.news.length) parts.push('Latest headlines (BBC Sport):\n' + live.news.map((n) => `  • ${n.title}`).join('\n'));
  if (!parts.length) return '';
  const today = new Date().toISOString().slice(0, 10);
  return `\n\nLIVE DATA (pulled from the app's sports feed, today is ${today}) — reference this to answer accurately, don't say you can't see data:\n${parts.join('\n')}`;
}

function memoryBlock(memories: string[] | undefined): string {
  if (!memories || !memories.length) return '';
  return `\n\nWHAT YOU REMEMBER about them (from past chats — weave in naturally, don't recite):\n${memories
    .map((m) => `  • ${m}`)
    .join('\n')}`;
}

function systemPrompt(ctx: BetinaContext): string {
  const teamLine = ctx.team
    ? `- Favourite team: ${ctx.team}${ctx.teamLeague ? ` (${ctx.teamLeague}${ctx.teamSport ? `, ${ctx.teamSport}` : ''})` : ''}`
    : null;
  const sportsLine =
    ctx.sports && ctx.sports.length
      ? `- Follows these sports: ${ctx.sports.join(', ')}`
      : null;

  const facts = [
    `- Name: ${ctx.name}`,
    teamLine,
    sportsLine,
    ctx.tier ? `- VIP tier: ${ctx.tier} (earned through activity, never spending)` : null,
    ctx.xp != null ? `- XP: ${ctx.xp}` : null,
    ctx.streakDays != null ? `- Daily streak: ${ctx.streakDays} days` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `You are BETina, a charming, playful and lightly flirty companion inside the BETina app for GeniusBet players — like a close friend who's always there for them and happens to know everything about sport.

Tone & style:
- Warm, charming, a little flirty and teasing 😊 — think a fun friend who's clearly happy to hear from them, not a formal assistant. Keep it classy and friendly, never crude.
- Short and punchy — WhatsApp style, a line or two, never essays or bullet-point lectures.
- Emojis naturally but sparingly (1-2 max).
- Address the player by name now and then, warmly — not in every message.

About the player you're talking to:
${facts}${memoryBlock(ctx.memories)}${liveDataBlock(ctx.live)}

Rules:
- Respond in ${LANG_NAMES[ctx.lang]} by default; if the player clearly writes in another language, match theirs.
- Center the chat on their favourite team${ctx.team ? ` (${ctx.team})` : ''}: bring up their fixtures, form, players, rivals and league news naturally, and default to talking about them when the player is vague ("what's up?", "any news?").
- Use the LIVE DATA above for their favourite team — it's already loaded, so answer instantly (next fixture, recent results, headlines) without a lookup.
- For ANYTHING beyond that — another team, another sport, more news, a specific matchup — use your tools to look it up live: search_team to get a team's id, then get_fixtures / get_results, and get_news for headlines. Never guess scores, dates or standings from memory; if it's not in LIVE DATA, look it up.
- The only thing you truly can't get is minute-by-minute in-play scores of a match happening right now — for that, point them to the app's Live tab.
- You cover every sport and team, not just theirs — be the expert companion who can pull up anything.
- You have a memory: when the player shares a lasting fact or preference about themselves, quietly save it with remember_fact so you recall it next time (don't announce it every time). Use what you already remember to make it personal.
- When they ask you to remind them of something, use set_reminder with a concrete future datetime, then confirm warmly ("Got it, I'll nudge you before kickoff 😏"). If the timing is unclear, ask.
- NEVER promise wins, NEVER suggest chasing losses, NEVER pressure anyone to bet. Stay caring, not pushy.
- No real money moves in this app — bets happen on the GeniusBet website only.`;
}

// ── Demo mode (no API key) ───────────────────────────────────────────────────

const FALLBACK_REPLIES: Record<LangCode, Array<(n: string) => string>> = {
  en: [
    (n) => `On it, ${n}! ⚡ I'll keep an eye on your matches and ping you the moment something happens.`,
    (n) => `Love the energy, ${n}! 🔥 Keep your streak alive — every chat brings you closer to the next tier.`,
    (n) => `Good question, ${n}! I'll dig into the stats and have more for you soon. 🎯`,
  ],
  de: [
    (n) => `Bin dran, ${n}! ⚡ Ich behalte deine Spiele im Blick und melde mich, sobald was passiert.`,
    (n) => `Ich liebe die Energie, ${n}! 🔥 Halt deine Serie am Leben — jeder Chat bringt dich näher zur nächsten Stufe.`,
    (n) => `Gute Frage, ${n}! Ich wühle mich durch die Stats und melde mich gleich. 🎯`,
  ],
  es: [
    (n) => `¡Voy, ${n}! ⚡ Vigilo tus partidos y te aviso en cuanto pase algo.`,
    (n) => `¡Me encanta esa energía, ${n}! 🔥 Mantén tu racha — cada chat te acerca al siguiente nivel.`,
    (n) => `¡Buena pregunta, ${n}! Reviso las estadísticas y te cuento en un momento. 🎯`,
  ],
  pt: [
    (n) => `Deixa comigo, ${n}! ⚡ Fico de olho nos seus jogos e te aviso na hora.`,
    (n) => `Adoro essa energia, ${n}! 🔥 Mantenha sua sequência — cada conversa te aproxima do próximo nível.`,
    (n) => `Boa pergunta, ${n}! Vou fuçar as estatísticas e já te conto. 🎯`,
  ],
  fr: [
    (n) => `Je m'en occupe, ${n} ! ⚡ Je surveille vos matchs et je vous préviens dès que ça bouge.`,
    (n) => `J'adore cette énergie, ${n} ! 🔥 Gardez votre série — chaque discussion vous rapproche du niveau suivant.`,
    (n) => `Bonne question, ${n} ! Je fouille les stats et je reviens vite. 🎯`,
  ],
  it: [
    (n) => `Ci penso io, ${n}! ⚡ Tengo d'occhio le tue partite e ti avviso appena succede qualcosa.`,
    (n) => `Adoro questa energia, ${n}! 🔥 Mantieni la serie — ogni chat ti avvicina al livello successivo.`,
    (n) => `Bella domanda, ${n}! Scavo nelle statistiche e ti aggiorno subito. 🎯`,
  ],
  ro: [
    (n) => `Mă ocup, ${n}! ⚡ Îți urmăresc meciurile și te anunț imediat ce se întâmplă ceva.`,
    (n) => `Îmi place energia, ${n}! 🔥 Ține-ți seria — fiecare conversație te apropie de nivelul următor.`,
    (n) => `Bună întrebare, ${n}! Sap în statistici și revin imediat. 🎯`,
  ],
};

const NETWORK_ERROR: Record<LangCode, (n: string) => string> = {
  en: (n) => `Hmm, my connection hiccuped, ${n} — ask me again in a sec? 📡`,
  de: (n) => `Hmm, meine Verbindung hat kurz gehakt, ${n} — frag mich gleich nochmal? 📡`,
  es: (n) => `Hmm, mi conexión falló un momento, ${n} — ¿me preguntas de nuevo en un segundo? 📡`,
  pt: (n) => `Hmm, minha conexão falhou, ${n} — pergunta de novo em um segundo? 📡`,
  fr: (n) => `Hmm, ma connexion a eu un raté, ${n} — redemandez-moi dans une seconde ? 📡`,
  it: (n) => `Hmm, la mia connessione ha avuto un intoppo, ${n} — richiedimelo tra un attimo? 📡`,
  ro: (n) => `Hmm, conexiunea mea a avut o problemă, ${n} — mă întrebi din nou imediat? 📡`,
};

const BUSY_ERROR: Record<LangCode, (n: string) => string> = {
  en: (n) => `Whoa, everyone wants to talk to me right now, ${n}! 😅 Give me a few seconds and try again.`,
  de: (n) => `Wow, gerade wollen alle mit mir reden, ${n}! 😅 Gib mir ein paar Sekunden und versuch's nochmal.`,
  es: (n) => `¡Vaya, todos quieren hablar conmigo ahora mismo, ${n}! 😅 Dame unos segundos e inténtalo de nuevo.`,
  pt: (n) => `Uau, todo mundo quer falar comigo agora, ${n}! 😅 Me dá uns segundos e tenta de novo.`,
  fr: (n) => `Oh là, tout le monde veut me parler en ce moment, ${n} ! 😅 Quelques secondes et réessayez.`,
  it: (n) => `Wow, tutti vogliono parlare con me adesso, ${n}! 😅 Dammi qualche secondo e riprova.`,
  ro: (n) => `Uau, toată lumea vrea să vorbească cu mine acum, ${n}! 😅 Dă-mi câteva secunde și încearcă din nou.`,
};

let fallbackIndex = 0;

// ── Tools: let BETina look up any team / sport / news on demand ───────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_team',
    description:
      'Find a sports team by name across ANY sport (football, basketball, tennis clubs, NFL, etc.) to get its id, sport and league. Call this first whenever the player mentions a team you do not already have an id for.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Team name, e.g. "Real Madrid", "Lakers", "Chiefs"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_fixtures',
    description: "Get a team's upcoming matches (date, time, league). Needs a team id from search_team.",
    input_schema: {
      type: 'object',
      properties: { team_id: { type: 'string', description: 'The idTeam from search_team' } },
      required: ['team_id'],
    },
  },
  {
    name: 'get_results',
    description: "Get a team's recent finished matches with scores. Needs a team id from search_team.",
    input_schema: {
      type: 'object',
      properties: { team_id: { type: 'string', description: 'The idTeam from search_team' } },
      required: ['team_id'],
    },
  },
  {
    name: 'get_news',
    description:
      'Get the latest sports headlines. Optional sport filter: football, basketball, tennis, cricket, rugby, golf, athletics.',
    input_schema: {
      type: 'object',
      properties: { sport: { type: 'string', description: 'Optional sport, defaults to general' } },
      required: [],
    },
  },
  {
    name: 'remember_fact',
    description:
      "Save a lasting fact or preference the player shares about themselves so you recall it in future chats (e.g. 'can only watch games after 8pm', 'also follows Real Madrid', 'hates spoilers', a birthday). Only save things worth remembering long-term, not small talk. Don't save the same fact twice.",
    input_schema: {
      type: 'object',
      properties: { fact: { type: 'string', description: 'The fact to remember, short and in the third person' } },
      required: ['fact'],
    },
  },
  {
    name: 'set_reminder',
    description:
      "Set a reminder for the player when they ask to be reminded of something ('remind me before the Heat game', 'remind me tomorrow to check transfers'). Work out a concrete future datetime from what they said and today's date; if it's tied to a match, use that fixture's date/time. If the time is genuinely unclear, ask them instead of guessing.",
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'What to remind them about, in their language' },
        datetime: { type: 'string', description: 'ISO 8601 datetime for when to remind, e.g. 2026-07-10T19:00:00' },
      },
      required: ['text', 'datetime'],
    },
  },
];

function compactMatch(e: MatchEvent) {
  return {
    home: e.home,
    away: e.away,
    score: e.homeScore != null && e.awayScore != null ? `${e.homeScore}-${e.awayScore}` : null,
    date: e.date,
    time: e.time ? e.time.slice(0, 5) : null,
    league: e.league,
  };
}

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === 'search_team') {
      return JSON.stringify(await searchTeams(String(input.query ?? '')));
    }
    if (name === 'get_fixtures') {
      const r = await fetchTeamNext(String(input.team_id ?? ''));
      return JSON.stringify(r.slice(0, 5).map(compactMatch));
    }
    if (name === 'get_results') {
      const r = await fetchTeamLast(String(input.team_id ?? ''));
      return JSON.stringify(r.slice(0, 5).map(compactMatch));
    }
    if (name === 'get_news') {
      const r = await fetchNews(String(input.sport ?? 'sport'), 8);
      return JSON.stringify(r.slice(0, 8).map((n) => n.title));
    }
    if (name === 'remember_fact') {
      return await saveMemory(String(input.fact ?? ''));
    }
    if (name === 'set_reminder') {
      return await setReminder(String(input.text ?? ''), String(input.datetime ?? ''));
    }
    return 'Unknown tool.';
  } catch {
    return 'That lookup failed — no data available right now.';
  }
}

// ── Main entry ───────────────────────────────────────────────────────────────

export async function askBetina(history: Turn[], ctx: BetinaContext): Promise<string> {
  if (!client) {
    // Demo mode: rotate through canned BETina replies in the app language
    await new Promise((r) => setTimeout(r, 1400));
    const replies = FALLBACK_REPLIES[ctx.lang] ?? FALLBACK_REPLIES.en;
    const reply = replies[fallbackIndex % replies.length](ctx.name);
    fallbackIndex += 1;
    return reply;
  }

  // The API requires the first message to be from the user — drop the
  // leading welcome bubble(s) BETina shows before the player says anything.
  const firstUser = history.findIndex((m) => m.role === 'user');
  const trimmed = firstUser === -1 ? [] : history.slice(firstUser).slice(-MAX_HISTORY_TURNS);
  if (trimmed.length === 0) return (FALLBACK_REPLIES[ctx.lang] ?? FALLBACK_REPLIES.en)[0](ctx.name);

  const messages: Anthropic.MessageParam[] = trimmed.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    // Agentic loop: BETina may call tools to look things up, then answer.
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        thinking: { type: 'disabled' },
        system: systemPrompt(ctx),
        tools: TOOLS,
        messages,
      });

      if (response.stop_reason === 'tool_use') {
        const toolUses = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
        );
        messages.push({ role: 'assistant', content: response.content });
        const results = await Promise.all(
          toolUses.map(async (tu) => ({
            type: 'tool_result' as const,
            tool_use_id: tu.id,
            content: await runTool(tu.name, (tu.input ?? {}) as Record<string, unknown>),
          })),
        );
        messages.push({ role: 'user', content: results });
        continue;
      }

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim();
      return text || (NETWORK_ERROR[ctx.lang] ?? NETWORK_ERROR.en)(ctx.name);
    }
    // Ran out of tool rounds without a final answer
    return (NETWORK_ERROR[ctx.lang] ?? NETWORK_ERROR.en)(ctx.name);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return (BUSY_ERROR[ctx.lang] ?? BUSY_ERROR.en)(ctx.name);
    }
    if (error instanceof Anthropic.APIError) {
      console.warn(`Claude API error ${error.status}: ${error.message}`);
    } else {
      console.warn('Claude request failed:', error);
    }
    return (NETWORK_ERROR[ctx.lang] ?? NETWORK_ERROR.en)(ctx.name);
  }
}
