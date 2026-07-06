// Demo content matching the design handoff. Replaced by live data
// (Supabase + sports API) as backend features land.

export const demoProfile = {
  name: 'Carlos',
  phone: '+43 664 123 45',
  country: 'Austria',
  tier: 'THINKER',
  nextTier: 'ANALYST',
  xp: 2340,
  xpForNextTier: 3000,
  streakDays: 4,
  chats: 128,
  eventsFollowed: 37,
  achievements: 6,
  activeDays: 92,
  daysSinceJoining: 118,
  memberSince: 'March 2026',
  favouriteSport: 'Football',
  favouriteTeam: 'Barcelona',
};

export type Tier = {
  name: string;
  minXp: number;
  maxXp: number | null;
  cashback: string;
  gold?: boolean;
};

export const tiers: Tier[] = [
  { name: 'INITIATE', minXp: 0, maxXp: 999, cashback: '—' },
  { name: 'THINKER', minXp: 1000, maxXp: 2999, cashback: '2%' },
  { name: 'ANALYST', minXp: 3000, maxXp: 7999, cashback: '4%' },
  { name: 'MASTERMIND', minXp: 8000, maxXp: 19999, cashback: '6%' },
  { name: 'GENIUS', minXp: 20000, maxXp: null, cashback: '10%', gold: true },
];

export type DemoEvent = {
  id: string;
  league: string;
  leagueEmoji: string;
  home: string;
  homeShort: string;
  away: string;
  awayShort: string;
  time: string;
  featured?: boolean;
  live?: boolean;
  minute?: string;
  homeScore?: number;
  awayScore?: number;
  tagline?: string;
  venue?: string;
};

export const demoEvents: DemoEvent[] = [
  {
    id: 'clasico',
    league: 'LA LIGA · EL CLÁSICO',
    leagueEmoji: '⚽',
    home: 'Barcelona',
    homeShort: 'FCB',
    away: 'Real Madrid',
    awayShort: 'RMA',
    time: '21:00',
    featured: true,
    venue: 'Camp Nou, Barcelona',
    tagline: 'El Clásico',
  },
  {
    id: 'atp-finals',
    league: 'ATP FINALS',
    leagueEmoji: '🎾',
    home: 'Alcaraz',
    homeShort: 'ALC',
    away: 'Sinner',
    awayShort: 'SIN',
    time: '18:30',
  },
  {
    id: 'atletico',
    league: 'LA LIGA',
    leagueEmoji: '⚽',
    home: 'Atlético',
    homeShort: 'ATM',
    away: 'Sevilla',
    awayShort: 'SEV',
    time: '23:00',
  },
];

export type DemoNotification = {
  id: string;
  kind: 'tierup' | 'event' | 'betina' | 'xp' | 'result';
  icon: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  section: 'TODAY' | 'YESTERDAY';
};

export const demoNotifications: DemoNotification[] = [
  {
    id: 'n1',
    kind: 'tierup',
    icon: '🏆',
    title: "Tier up! You're a THINKER",
    body: 'You crossed 2,000 XP. Next stop: ANALYST.',
    time: '20:14',
    unread: true,
    section: 'TODAY',
  },
  {
    id: 'n2',
    kind: 'event',
    icon: '⚽',
    title: 'El Clásico starts in 1 hour',
    body: 'Barcelona vs Real Madrid · 21:00 · La Liga',
    time: '20:00',
    unread: true,
    section: 'TODAY',
  },
  {
    id: 'n3',
    kind: 'betina',
    icon: '',
    title: 'BETina sent you a message',
    body: '"Lineups are out — Lewandowski starts! 🔥"',
    time: '19:42',
    unread: true,
    section: 'TODAY',
  },
  {
    id: 'n4',
    kind: 'xp',
    icon: '⚡',
    title: '+120 XP earned',
    body: 'Daily streak ×4 — keep it going for a bonus.',
    time: '22:31',
    section: 'YESTERDAY',
  },
  {
    id: 'n5',
    kind: 'result',
    icon: '🎾',
    title: 'Alcaraz won in straight sets',
    body: 'ATP Finals result — you followed this match.',
    time: '21:05',
    section: 'YESTERDAY',
  },
];

export const demoNews = [
  { id: 'news1', title: 'Flick confirms Pedri fit for the Champions League run', age: '12 min' },
  { id: 'news2', title: 'ATP Finals: Alcaraz–Sinner rivalry hits chapter 15 tonight', age: '1 h' },
];

export const languages = [
  { code: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'German', native: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', native: 'Português' },
  { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', native: 'Italiano' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', native: 'Türkçe' },
];

export const sports = [
  { id: 'football', emoji: '⚽', label: 'Football' },
  { id: 'tennis', emoji: '🎾', label: 'Tennis' },
  { id: 'basketball', emoji: '🏀', label: 'Basketball' },
  { id: 'hockey', emoji: '🏒', label: 'Ice Hockey' },
  { id: 'esports', emoji: '🎮', label: 'eSports' },
  { id: 'nfl', emoji: '🏈', label: 'NFL' },
  { id: 'mma', emoji: '🥊', label: 'MMA' },
];
