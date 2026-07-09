// BETina's memory + reminders — client side.
// Facts she remembers about the player, and time-based reminders she sets.
// The reminders are DELIVERED by a server job (supabase/functions/reminders-due).

import { supabase } from './supabase';

/** Facts BETina remembers about this player (most recent last). */
export async function fetchMemories(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('betina_memories')
      .select('content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(40);
    return (data ?? []).map((r) => r.content as string);
  } catch {
    return [];
  }
}

/** Save a lasting fact about the player. Returns a short status for the tool. */
export async function saveMemory(content: string): Promise<string> {
  const clean = content.trim();
  if (!clean) return 'Nothing to save.';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Can't save right now (not signed in).";
    const { error } = await supabase.from('betina_memories').insert({ user_id: user.id, content: clean });
    return error ? `Could not save: ${error.message}` : 'Saved.';
  } catch (e) {
    return 'Could not save right now.';
  }
}

/** Set a reminder at an ISO datetime. Returns a short status for the tool. */
export async function setReminder(text: string, remindAtIso: string): Promise<string> {
  const when = new Date(remindAtIso);
  if (Number.isNaN(when.getTime())) return 'That time was unclear — ask the player to be specific.';
  if (when.getTime() < Date.now() - 60_000) return 'That time is in the past — ask for a future time.';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Can't set it right now (not signed in).";
    const { error } = await supabase
      .from('reminders')
      .insert({ user_id: user.id, text: text.trim(), remind_at: when.toISOString() });
    return error ? `Could not set reminder: ${error.message}` : `Reminder set for ${when.toISOString()}.`;
  } catch {
    return 'Could not set the reminder right now.';
  }
}
