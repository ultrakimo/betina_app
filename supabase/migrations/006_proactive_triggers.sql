-- BETina App — proactive triggers engine
--
-- trigger_log records every proactive message BETina sends, so the
-- proactive-triggers Edge Function can enforce:
--   • per-trigger cooldowns (don't re-fire the same trigger too soon)
--   • marketing frequency caps (max 1/day, max 3/week per user)
--
-- Writes happen from the Edge Function using the service-role key (bypasses
-- RLS). Players may read their own log (RLS select policy) if we ever surface it.

create table if not exists public.trigger_log (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  trigger_key text not null,
  category    text not null default 'engagement',  -- 'marketing' | 'engagement' | 'transactional'
  sent_at     timestamptz default now()
);

create index if not exists trigger_log_user_key_idx on public.trigger_log (user_id, trigger_key, sent_at desc);
create index if not exists trigger_log_user_cat_idx on public.trigger_log (user_id, category, sent_at desc);

alter table public.trigger_log enable row level security;

drop policy if exists "Users can view own trigger log" on public.trigger_log;
create policy "Users can view own trigger log" on public.trigger_log
  for select using (auth.uid() = user_id);

-- ── Schedule (run ONCE, replacing <SERVICE_ROLE_KEY>) ─────────────────────────
-- Requires the pg_cron and pg_net extensions (already enabled for match-alerts).
--
--   select cron.schedule(
--     'proactive-triggers',
--     '*/15 * * * *',
--     $$ select net.http_post(
--          url     := 'https://djnmrvhdklpclbrhxxqs.functions.supabase.co/proactive-triggers',
--          headers := jsonb_build_object(
--            'Content-Type', 'application/json',
--            'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--          )
--        ) $$
--   );
