-- Push notifications support

-- Where to send this player's push messages, and which finished match we last
-- alerted them about (so the server job doesn't send the same result twice).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_token TEXT,
  ADD COLUMN IF NOT EXISTS last_alerted_event_id TEXT;

-- The match-alerts job runs as the service role and writes notifications for
-- any user. Allow inserts from the service role (RLS already lets each user
-- read their own rows via the existing "Users can view own notifications" policy).
DROP POLICY IF EXISTS "Service role inserts notifications" ON public.notifications;
CREATE POLICY "Service role inserts notifications" ON public.notifications
  FOR INSERT TO service_role WITH CHECK (true);
