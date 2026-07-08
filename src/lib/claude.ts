// BETina's brain — Claude API via the official SDK when a key is configured,
// personality-true canned replies otherwise (so the chat works in demo builds).
//
// NOTE: shipping an API key inside the app bundle is fine for prototyping
// only. Before the App Store release, move this call behind a server
// (intelligence.geniusbet.com or a Supabase Edge Function) so the key
// never leaves your infrastructure.

import Anthropic from '@anthropic-ai/sdk';
import type { LangCode } from './i18n';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const MODEL = 'claude-sonnet-5';
const MAX_HISTORY_TURNS = 24; // cap what we resend each turn

const client = CLAUDE_API_KEY
  ? new Anthropic({ apiKey: CLAUDE_API_KEY, dangerouslyAllowBrowser: true })
  : null;

export type Turn = { role: 'user' | 'assistant'; content: string };

/** Everything BETina should know about the player she's talking to. */
export type BetinaContext = {
  name: string;
  lang: LangCode;
  team?: string | null;
  sport?: string | null;
  tier?: string | null;
  xp?: number | null;
  streakDays?: number | null;
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

function systemPrompt(ctx: BetinaContext): string {
  const facts = [
    `- Name: ${ctx.name}`,
    ctx.team ? `- Favourite team: ${ctx.team} (follow their matches closely for the player)` : null,
    ctx.sport ? `- Favourite sport: ${ctx.sport}` : null,
    ctx.tier ? `- VIP tier: ${ctx.tier} (earned through activity, never spending)` : null,
    ctx.xp != null ? `- XP: ${ctx.xp}` : null,
    ctx.streakDays != null ? `- Daily streak: ${ctx.streakDays} days` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `You are BETina, the personal AI companion inside the BETina app for GeniusBet players.
Personality: friendly, energetic, a bit cheeky, always positive — the best friend for game night. Never preachy, never pushy.

About the player you're talking to:
${facts}

Rules:
- ALWAYS respond in ${LANG_NAMES[ctx.lang]}, regardless of the language the player writes in.
- Short, casual sentences. Emojis sparingly (max 1-2 per message).
- Address the player by name, but naturally — not in every single message.
- Talk about sports, matches, lineups, stats, the player's XP journey and streaks.
- If asked about live scores or very recent results, be honest that you can't see live data yet and offer what you do know.
- NEVER promise wins, NEVER suggest chasing losses, NEVER pressure anyone to bet.
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

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // Chat companion: snappy replies matter more than deep reasoning
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: systemPrompt(ctx),
      messages: trimmed,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();
    return text || (NETWORK_ERROR[ctx.lang] ?? NETWORK_ERROR.en)(ctx.name);
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
