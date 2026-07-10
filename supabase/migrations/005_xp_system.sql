-- BETina App — XP system
--
-- Adds the state + server-side award functions behind BETina's XP economy.
-- All awards happen through SECURITY DEFINER RPCs scoped to auth.uid(), so the
-- increments are atomic (no read-modify-write races) and a user can only ever
-- change their own row. The "once per day" / "one-time" guards live in SQL so
-- they can't be bypassed from the client.
--
-- Rewards:
--   • chat message sent ........... +1   (award_xp)
--   • correct match prediction .... +10  (award_xp)
--   • daily first open ............ +5   (claim_daily_login, once per day)
--   • streak bonus ................ +1 per streak day, on top of the daily open
--   • profile completed ........... +20  (claim_profile_completed, one-time)

alter table public.profiles
  add column if not exists last_login_date date,
  add column if not exists profile_completed boolean default false;

-- ── Generic increment (chat +1, prediction +10) ──────────────────────────────
create or replace function public.award_xp(p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xp integer;
begin
  if auth.uid() is null then
    return null;
  end if;
  update public.profiles
     set xp_points = coalesce(xp_points, 0) + p_amount,
         updated_at = now()
   where id = auth.uid()
   returning xp_points into v_xp;
  return v_xp;
end;
$$;

-- ── Daily first open: +5, plus +1 per streak day. Once per calendar day. ──────
create or replace function public.claim_daily_login()
returns table (awarded integer, xp integer, streak integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last   date;
  v_streak integer;
  v_award  integer := 0;
  v_xp     integer;
begin
  if auth.uid() is null then
    return;
  end if;

  select last_login_date, coalesce(streak_days, 0), coalesce(xp_points, 0)
    into v_last, v_streak, v_xp
  from public.profiles
  where id = auth.uid()
  for update;

  -- Not yet claimed today → award and advance the streak.
  if v_last is distinct from current_date then
    if v_last = current_date - 1 then
      v_streak := v_streak + 1;          -- consecutive day
    else
      v_streak := 1;                      -- first ever, or streak broken
    end if;

    v_award := 5 + v_streak;              -- daily +5 plus the streak bonus

    update public.profiles
       set xp_points       = coalesce(xp_points, 0) + v_award,
           streak_days     = v_streak,
           last_login_date = current_date,
           updated_at      = now()
     where id = auth.uid()
     returning xp_points into v_xp;
  end if;

  return query select v_award, v_xp, v_streak;
end;
$$;

-- ── Profile completed: one-time +20. ─────────────────────────────────────────
create or replace function public.claim_profile_completed()
returns table (awarded integer, xp integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_done  boolean;
  v_award integer := 0;
  v_xp    integer;
begin
  if auth.uid() is null then
    return;
  end if;

  select coalesce(profile_completed, false), coalesce(xp_points, 0)
    into v_done, v_xp
  from public.profiles
  where id = auth.uid()
  for update;

  if not v_done then
    v_award := 20;
    update public.profiles
       set xp_points         = coalesce(xp_points, 0) + 20,
           profile_completed = true,
           updated_at        = now()
     where id = auth.uid()
     returning xp_points into v_xp;
  end if;

  return query select v_award, v_xp;
end;
$$;

grant execute on function public.award_xp(integer)          to authenticated;
grant execute on function public.claim_daily_login()        to authenticated;
grant execute on function public.claim_profile_completed()  to authenticated;
