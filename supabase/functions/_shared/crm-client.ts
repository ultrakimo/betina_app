// CRM read-only client for BETina.
// The CRM (187.124.172.233:5001) is the single source of truth for player data.
// BETina only READS player data and WRITES to the trigger log.
//
// Env: CRM_API_URL, CRM_BETINA_KEY

export interface CRMPlayer {
  id: number;
  external_id: string;
  phone: string;
  username: string;
  country: string;
  country_id: number;
  status: string;
  segment: string;
  vip_tier: string;
  kyc_status: string;
  balance: number;
  bonus_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  total_bets: number;
  total_wins: number;
  total_losses: number;
  loyalty_points: number;
  cashback_balance: number;
  birthday: string | null;
  registration_date: string;
  last_active: string;
  last_login_at: string | null;
  last_deposit_at: string | null;
  last_bet_at: string | null;
  last_withdrawal_at: string | null;
  last_bet_result: 'win' | 'loss' | 'pending' | null;
  last_win_amount: number;
  last_loss_amount: number;
  win_streak: number;
  loss_streak: number;
  open_bet_slips: number;
  fav_sport: string | null;
  fav_team: string | null;
  fav_league: string | null;
  fav_casino_category: string | null;
  active_bonus_name: string | null;
  bonus_expiry: string | null;
  wagering_requirement: number;
  wagering_done: number;
  free_spins_available: number;
  cashout_available: boolean;
  last_withdrawal_status: string | null;
  last_withdrawal_pending_hours: number;
  withdrawal_reversal_count: number;
  risk_flag: boolean;
  self_exclusion: boolean;
  deposit_limit_daily: number;
  deposit_limit_usage_pct: number;
  loss_limit_usage_pct: number;
  avg_session_minutes: number;
  session_count_7d: number;
  login_count_7d: number;
  deposit_count_7d: number;
  inactivity_days: number;
  churn_score: number;
  churn_risk: string;
  preferred_language: string;
}

const CRM_URL = Deno.env.get('CRM_API_URL')!;
const CRM_KEY = Deno.env.get('CRM_BETINA_KEY')!;

export async function getPlayerByPhone(phone: string): Promise<CRMPlayer | null> {
  const res = await fetch(`${CRM_URL}/api/betina/player/${encodeURIComponent(phone)}`, {
    headers: { 'X-BETina-Key': CRM_KEY },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CRM error: ${res.status}`);
  return res.json();
}

export async function getActivePlayers(country?: string, limit = 500, offset = 0): Promise<CRMPlayer[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (country) params.set('country', country);
  const res = await fetch(`${CRM_URL}/api/betina/players/active?${params}`, {
    headers: { 'X-BETina-Key': CRM_KEY },
  });
  if (!res.ok) throw new Error(`CRM error: ${res.status}`);
  const data = await res.json();
  return data.players;
}

export async function logTrigger(phone: string, triggerId: string, channel: string): Promise<void> {
  try {
    await fetch(`${CRM_URL}/api/betina/player/${encodeURIComponent(phone)}/trigger-log`, {
      method: 'POST',
      headers: { 'X-BETina-Key': CRM_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger_id: triggerId, channel }),
    });
  } catch (_) {
    // logging failure shouldn't break the sweep
  }
}

export async function getTriggerLog(phone: string, days = 7): Promise<{ trigger_id: string; sent_at: string }[]> {
  try {
    const res = await fetch(`${CRM_URL}/api/betina/player/${encodeURIComponent(phone)}/trigger-log?days=${days}`, {
      headers: { 'X-BETina-Key': CRM_KEY },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (_) {
    return [];
  }
}

// ── Time / math helpers ───────────────────────────────────────────────────────
export function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}
export function hoursUntil(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 ? Math.floor(diff / 3_600_000) : 0;
}
export function wageringPct(done: number, required: number): number {
  if (!required) return 100;
  return Math.min(100, Math.round((done / required) * 100));
}
