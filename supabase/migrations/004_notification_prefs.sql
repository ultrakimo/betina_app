-- Per-player notification preferences (the Settings toggles).
-- The push jobs (match-alerts, reminders-due) can read these to decide
-- whether to send a given category.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_events BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_betina BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_tier BOOLEAN DEFAULT FALSE;
