// BETina's brain — Claude API when a key is configured, personality-true
// canned replies otherwise (so the chat works in demo/preview builds).
//
// NOTE: shipping an API key inside the app bundle is fine for prototyping
// only. For production, proxy this call through a Supabase Edge Function.

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-5';

type Turn = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = (name: string) => `You are BETina, the personal AI companion inside the BETina app for GeniusBet players.
Personality: friendly, energetic, a bit cheeky, always positive — the best friend for game night. Never preachy, never pushy.
Rules:
- Short, casual sentences. Emojis sparingly (max 1-2 per message).
- Always address the player by name: ${name}.
- Talk about sports, matches, lineups, stats, the player's XP journey and streaks.
- NEVER promise wins, NEVER suggest chasing losses, NEVER pressure anyone to bet.
- No real money moves in this app — bets happen on the GeniusBet website only.`;

const FALLBACK_REPLIES = [
  (n: string) => `Ooh good question, ${n}! 👀 Lewandowski's been on fire — 6 goals in his last month. Tonight could be special.`,
  (n: string) => `On it, ${n}! Barça's unbeaten at home this season. I'll ping you the moment the lineups drop. ⚡`,
  (n: string) => `${n}, I love the enthusiasm! 🔥 Keep the streak alive — you're only 660 XP away from ANALYST.`,
  (n: string) => `Head-to-head? Last 5 Clásicos: 3 Barça wins, 1 draw, 1 Madrid win. History leans blaugrana, ${n}!`,
  (n: string) => `Done, ${n} — reminder set for kickoff. I'll be watching every minute with you. 🎯`,
];

let fallbackIndex = 0;

export async function askBetina(history: Turn[], playerName: string): Promise<string> {
  if (!CLAUDE_API_KEY) {
    // Demo mode: rotate through canned BETina replies
    await new Promise((r) => setTimeout(r, 1400));
    const reply = FALLBACK_REPLIES[fallbackIndex % FALLBACK_REPLIES.length](playerName);
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
        system: SYSTEM_PROMPT(playerName),
        messages: history,
      }),
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text;
    return text ?? FALLBACK_REPLIES[0](playerName);
  } catch {
    return `Hmm, my connection hiccuped, ${playerName} — ask me again in a sec? 📡`;
  }
}
