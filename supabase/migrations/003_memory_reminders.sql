-- BETina's memory + reminders

-- Facts BETina remembers about a player across conversations.
CREATE TABLE IF NOT EXISTS public.betina_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time-based reminders BETina sets ("remind me before the Heat game").
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reminders_due_idx ON public.reminders (remind_at) WHERE sent = FALSE;

ALTER TABLE public.betina_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Each player only sees / writes their own rows (the service role bypasses RLS
-- for the reminders-due delivery job).
DROP POLICY IF EXISTS "Own memories" ON public.betina_memories;
CREATE POLICY "Own memories" ON public.betina_memories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Own reminders" ON public.reminders;
CREATE POLICY "Own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
