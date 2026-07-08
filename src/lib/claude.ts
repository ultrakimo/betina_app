// BETina's brain — Claude API when a key is configured, personality-true
// canned replies otherwise (so the chat works in demo/preview builds).
//
// NOTE: shipping an API key inside the app bundle is fine for prototyping
// only. For production, proxy this call through a Supabase Edge Function.

import type { LangCode } from './i18n';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-5';

type Turn = { role: 'user' | 'assistant'; content: string };

const LANG_NAMES: Record<LangCode, string> = {
  en: 'English',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  it: 'Italian',
  ro: 'Romanian',
};

const SYSTEM_PROMPT = (name: string, lang: LangCode) => `You are BETina, the personal AI companion inside the BETina app for GeniusBet players.
Personality: friendly, energetic, a bit cheeky, always positive — the best friend for game night. Never preachy, never pushy.
Rules:
- ALWAYS respond in ${LANG_NAMES[lang]}, regardless of the language the user writes in.
- Short, casual sentences. Emojis sparingly (max 1-2 per message).
- Always address the player by name: ${name}.
- Talk about sports, matches, lineups, stats, the player's XP journey and streaks.
- NEVER promise wins, NEVER suggest chasing losses, NEVER pressure anyone to bet.
- No real money moves in this app — bets happen on the GeniusBet website only.`;

// Demo-mode replies (no API key configured), per language.
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

let fallbackIndex = 0;

export async function askBetina(
  history: Turn[],
  playerName: string,
  lang: LangCode = 'en',
): Promise<string> {
  if (!CLAUDE_API_KEY) {
    // Demo mode: rotate through canned BETina replies in the app language
    await new Promise((r) => setTimeout(r, 1400));
    const replies = FALLBACK_REPLIES[lang] ?? FALLBACK_REPLIES.en;
    const reply = replies[fallbackIndex % replies.length](playerName);
    fallbackIndex += 1;
    return reply;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT(playerName, lang),
        messages: history,
      }),
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text;
    return text ?? (FALLBACK_REPLIES[lang] ?? FALLBACK_REPLIES.en)[0](playerName);
  } catch {
    return (NETWORK_ERROR[lang] ?? NETWORK_ERROR.en)(playerName);
  }
}
