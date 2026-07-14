// Links a BETina app user (Supabase profile) to their CRM player record by
// normalized phone, caching the link on the profile for 15 minutes.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getPlayerByPhone, type CRMPlayer } from './crm-client.ts';
import { normalizePhone } from './phone.ts';

export async function ensurePlayerMatched(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  phone: string,
): Promise<CRMPlayer | null> {
  const normalizedPhone = normalizePhone(phone);

  const { data: profile } = await supabase
    .from('profiles')
    .select('crm_player_id, crm_synced_at')
    .eq('id', userId)
    .single();

  const crmPlayer = await getPlayerByPhone(normalizedPhone);
  if (!crmPlayer) return null; // app-only user, not (yet) a GeniusBet player

  // Refresh the cached link at most every 15 minutes.
  const cacheAge = profile?.crm_synced_at
    ? (Date.now() - new Date(profile.crm_synced_at).getTime()) / 60_000
    : 999;
  if (!(profile?.crm_player_id && cacheAge < 15)) {
    await supabase.from('profiles').update({
      crm_player_id: String(crmPlayer.id),
      crm_synced_at: new Date().toISOString(),
      phone_normalized: normalizedPhone,
    }).eq('id', userId);
  }

  return crmPlayer;
}
