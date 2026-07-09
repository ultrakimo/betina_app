// Shared sports data layer — talks to the GeniusBet intelligence API
// (BBC news + TheSportsDB fixtures). Used by both the Home and Live tabs.

export const SPORTS_API = 'https://intelligence.geniusbet.com';

export type MatchEvent = {
  id: string;
  name: string;
  home: string;
  away: string;
  homeScore: string | null;
  awayScore: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  league: string;
  status?: string;
  venue?: string;
  thumb?: string;
};

export type NewsItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  image?: string;
};

/** Upcoming fixtures for a team (TheSportsDB team id). Empty array on any error. */
export async function fetchTeamNext(teamId: string): Promise<MatchEvent[]> {
  try {
    const r = await fetch(`${SPORTS_API}/api/sports/team/${teamId}/next`);
    const d = await r.json();
    return d.events ?? [];
  } catch {
    return [];
  }
}

/** Recent results for a team. Empty array on any error. */
export async function fetchTeamLast(teamId: string): Promise<MatchEvent[]> {
  try {
    const r = await fetch(`${SPORTS_API}/api/sports/team/${teamId}/last`);
    const d = await r.json();
    return d.events ?? [];
  } catch {
    return [];
  }
}

/** Latest news for a sport (BBC feed). Empty array on any error. */
export async function fetchNews(sport: string, count = 10): Promise<NewsItem[]> {
  try {
    const r = await fetch(`${SPORTS_API}/api/sports/news?sport=${sport}&count=${count}`);
    const d = await r.json();
    return d.items ?? [];
  } catch {
    return [];
  }
}

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽',
  soccer: '⚽',
  tennis: '🎾',
  basketball: '🏀',
  cricket: '🏏',
  rugby: '🏉',
  athletics: '🏃',
  golf: '⛳',
  hockey: '🏒',
  esports: '🎮',
  nfl: '🏈',
  mma: '🥊',
};

export function sportEmoji(sport?: string | null): string {
  if (!sport) return '⚽';
  return SPORT_EMOJI[sport.toLowerCase()] ?? '⚽';
}

/** "Just now" / "3h ago" / "2d ago" — labels passed in for i18n. */
export function timeAgo(
  dateStr: string,
  labels: { justNow: string; hours: string; days: string },
): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const diffH = (Date.now() - d.getTime()) / 3_600_000;
  if (diffH < 1) return labels.justNow;
  if (diffH < 24) return labels.hours.replace('{n}', String(Math.floor(diffH)));
  return labels.days.replace('{n}', String(Math.floor(diffH / 24)));
}

/**
 * Human-friendly kickoff label relative to now:
 * "Today · 21:00", "Tomorrow · 12:00", or "Fri, 24 Jul · 12:00".
 * `locale` (e.g. 'de', 'es') localizes weekday/month; labels are passed in.
 */
export function formatKickoff(
  dateStr: string,
  timeStr: string,
  locale: string,
  labels: { today: string; tomorrow: string },
): string {
  const iso = `${dateStr}T${timeStr || '00:00:00'}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return dateStr;

  const hhmm = timeStr ? timeStr.slice(0, 5) : '';
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);

  let day: string;
  if (dayDiff === 0) day = labels.today;
  else if (dayDiff === 1) day = labels.tomorrow;
  else {
    try {
      day = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  }
  return hhmm ? `${day} · ${hhmm}` : day;
}
