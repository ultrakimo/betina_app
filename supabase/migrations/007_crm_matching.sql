-- BETina App — CRM matching
--
-- Links each app user (profile) to their CRM player by normalized phone.
-- The phone_normalized value MUST match the CRM's normalization and the
-- TypeScript normalizePhone() in supabase/functions/_shared/phone.ts:
--   strip spaces/dashes/parens · leading "00" → "+" · result is "+"+digits.

alter table public.profiles add column if not exists crm_player_id   text;
alter table public.profiles add column if not exists crm_synced_at   timestamptz;
alter table public.profiles add column if not exists phone_normalized text;

create index if not exists profiles_phone_normalized_idx on public.profiles (phone_normalized);

-- Keep phone_normalized in sync on every insert/update.
create or replace function public.normalize_phone_trigger()
returns trigger
language plpgsql
as $$
declare
  p text := coalesce(NEW.phone, '');
  digits text;
begin
  p := regexp_replace(p, '[\s\-()]', '', 'g');   -- strip spaces / dashes / parens
  if left(p, 2) = '00' then
    p := substring(p from 3);                     -- 00-prefix → drop (becomes +digits below)
  end if;
  digits := regexp_replace(p, '[^0-9]', '', 'g'); -- digits only (no country-code guessing)
  NEW.phone_normalized := '+' || digits;
  return NEW;
end;
$$;

drop trigger if exists set_phone_normalized on public.profiles;
create trigger set_phone_normalized
  before insert or update on public.profiles
  for each row execute function public.normalize_phone_trigger();

-- Backfill existing rows.
update public.profiles
   set phone_normalized = '+' || regexp_replace(
         case when left(regexp_replace(coalesce(phone, ''), '[\s\-()]', '', 'g'), 2) = '00'
              then substring(regexp_replace(coalesce(phone, ''), '[\s\-()]', '', 'g') from 3)
              else regexp_replace(coalesce(phone, ''), '[\s\-()]', '', 'g')
         end, '[^0-9]', '', 'g')
 where phone is not null;
