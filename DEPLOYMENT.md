# BETina — Deployment & Handoff Checklist

Alles, was **außerhalb der App** erledigt werden muss (Backend, Datenbank, Deploys, Store).
Stand: 9. Juli 2026. Abhaken und melden, dann macht Claude in der App weiter.

---

## 1. 🔴 SICHERHEIT (dringend)

- [ ] **Anthropic API-Key rotieren.** Der aktuelle Key wurde im Chat gepostet und gilt als kompromittiert.
  1. [console.anthropic.com](https://console.anthropic.com) → **API Keys** → aktuellen Key **widerrufen**.
  2. Neuen Key erstellen.
  3. Neuen Key in `.env` als `EXPO_PUBLIC_CLAUDE_API_KEY=` eintragen (**nicht** im Chat posten — `.env` ist gitignored).
  4. Im Anthropic-Dashboard ein **Ausgabenlimit** setzen (Billing → Limits).

> ⚠️ Hinweis: `EXPO_PUBLIC_*`-Variablen landen **im App-Bundle** und sind auf dem Gerät auslesbar. Für den echten Release den Claude-Call hinter einen Server legen (siehe Abschnitt 5).

---

## 2. 🗄️ SUPABASE DATENBANK

Neue Tabellen/Spalten für Push, Gedächtnis, Reminders und Notification-Prefs.
**Supabase Dashboard → SQL Editor → dieses Skript einfügen und ausführen.** Es ist idempotent (mehrfaches Ausführen schadet nicht).

```sql
-- ── Profile-Spalten (falls noch nicht vorhanden) ──────────────────────────────
alter table public.profiles
  add column if not exists name                  text,
  add column if not exists country               text,
  add column if not exists language              text,
  add column if not exists birthday              text,
  add column if not exists vip_tier              text default 'INITIATE',
  add column if not exists xp_points             integer default 100,
  add column if not exists streak_days           integer default 0,
  add column if not exists favourite_sport       text,
  add column if not exists favourite_sports      text,
  add column if not exists favourite_team        text,
  add column if not exists favourite_team_id     text,
  add column if not exists favourite_team_sport  text,
  add column if not exists favourite_team_league text,
  add column if not exists push_token            text,
  add column if not exists last_alerted_event_id text,
  add column if not exists notify_events         boolean default true,
  add column if not exists notify_betina         boolean default true,
  add column if not exists notify_tier           boolean default false;

-- ── Gedächtnis (Fakten, die BETina sich merkt) ────────────────────────────────
create table if not exists public.betina_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ── Reminders ─────────────────────────────────────────────────────────────────
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  remind_at timestamptz not null,
  sent boolean default false,
  created_at timestamptz default now()
);
create index if not exists reminders_due_idx on public.reminders (remind_at) where sent = false;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.betina_memories enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "Own memories" on public.betina_memories;
create policy "Own memories" on public.betina_memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Own reminders" on public.reminders;
create policy "Own reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Der Push-Job (service_role) muss Notifications für beliebige User schreiben dürfen
drop policy if exists "Service role inserts notifications" on public.notifications;
create policy "Service role inserts notifications" on public.notifications
  for insert to service_role with check (true);
```

> Alternativ, falls ihr die Supabase CLI mit dem Projekt verbunden habt:
> `supabase db push` — spielt die Dateien in `supabase/migrations/` ein.

- [ ] SQL ausgeführt, keine Fehler.
- [ ] Prüfen: Tabellen `betina_memories` und `reminders` existieren, `profiles` hat die neuen Spalten.

---

## 3. 🖥️ BACKEND / APIs (müssen laufen)

Die App hängt an eurem Server `https://intelligence.geniusbet.com`. Diese Endpoints werden genutzt — sie müssen erreichbar bleiben:

| Zweck | Endpoint |
|---|---|
| OTP senden (SMSEagle) | `POST /api/sms/otp/send` — Body `{ phone }` |
| OTP prüfen + **Supabase-Session minten** | `POST /api/sms/otp/verify` — Body `{ phone, otp }` → gibt `{ access_token, refresh_token, user }` zurück |
| Team — nächste Spiele | `GET /api/sports/team/{teamId}/next` → `{ events: [...] }` |
| Team — letzte Ergebnisse | `GET /api/sports/team/{teamId}/last` → `{ events: [...] }` |
| News | `GET /api/sports/news?sport={sport}&count={n}` → `{ items: [...] }` |
| Artikel-Volltext | `GET /api/sports/article?url={url}` |

Zusätzlich ruft die App **TheSportsDB direkt** (öffentliche API, kein Key): `searchteams.php` (Team-Suche) und `lookupteam.php` (Wappen). Nur relevant, falls ihr sie mal proxien/absichern wollt.

- [ ] Bestätigen, dass alle Endpoints in Produktion stabil laufen.
- [ ] `/api/sms/otp/verify` mintet die Supabase-Session korrekt (nutzt vermutlich die Supabase Admin API mit Service-Role-Key auf eurem Server).

---

## 4. 📲 PUSH-NOTIFICATIONS (proaktive Nachrichten)

Damit BETina „dein Team hat gewonnen!" / Reminder auch bei geschlossener App schickt.

### 4a. EAS-Projekt (für Push-Tokens)
```bash
npm install -g eas-cli
eas login
eas init          # legt eine projectId an, die für Push-Tokens nötig ist
```
- [ ] `projectId` steht danach in `app.json` unter `extra.eas.projectId` (EAS trägt das ein).

### 4b. Edge Functions deployen
Beide Funktionen liegen fertig im Repo unter `supabase/functions/`.
```bash
supabase login
supabase link --project-ref <DEIN_PROJECT_REF>

# Secrets, die die Functions brauchen:
supabase secrets set SUPABASE_URL=https://<ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<dein_service_role_key>

supabase functions deploy match-alerts  --no-verify-jwt
supabase functions deploy reminders-due --no-verify-jwt
```
- [ ] Beide Functions deployed.

### 4c. Zeitplan (pg_cron + pg_net)
Im **SQL Editor** (einmalig). Extensions aktivieren, dann Cron anlegen:
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Ergebnis-Alerts alle 10 Min
select cron.schedule('match-alerts', '*/10 * * * *', $$
  select net.http_post(
    url     := 'https://<ref>.functions.supabase.co/match-alerts',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
  );
$$);

-- Fällige Reminder alle 5 Min
select cron.schedule('reminders-due', '*/5 * * * *', $$
  select net.http_post(
    url     := 'https://<ref>.functions.supabase.co/reminders-due',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
  );
$$);
```
- [ ] Cron-Jobs angelegt (`<ref>` und `<SERVICE_ROLE_KEY>` ersetzt).
- [ ] Test: einen Reminder in der App setzen → nach der nächsten Cron-Runde kommt der Push (echter Build nötig, siehe Abschnitt 6).

> 🔧 Offen (kann Claude nachziehen): Die Functions respektieren die `notify_*`-Toggles noch nicht — sie senden immer. Sag Bescheid, dann filtert Claude nach den Präferenzen.

---

## 5. 🤖 CLAUDE-KEY IN PRODUKTION (empfohlen)

Aktuell steckt der Claude-Key im App-Bundle. Für den Release besser: **Chat über einen Server proxien**, damit der Key nie ausgeliefert wird.
- [ ] Entscheidung: bleibt der Key vorerst im Bundle (nur für Testflight/Beta) **oder** wird eine Supabase Edge Function `chat` gebaut, die den Claude-Call macht?
- Wenn Server-Proxy gewünscht: Claude baut die Edge Function + stellt die App darauf um. Nur sagen.

---

## 6. 🍎 APP STORE / STORE-BUILD

### 6a. Accounts
- [ ] **Apple Developer Program** ($99/Jahr) — für iOS.
- [ ] **Google Play Console** ($25 einmalig) — falls Android.

### 6b. App-Identität (in `app.json` prüfen/setzen)
- [ ] `ios.bundleIdentifier` und `android.package` gesetzt (z.B. `com.geniusbet.betina`).
- [ ] App-Icon + Splash final.

### 6c. Build (EAS)
```bash
eas build:configure          # legt eas.json an
# Env-Variablen für den Build hinterlegen (nicht nur lokale .env!):
eas secret:create --name EXPO_PUBLIC_CLAUDE_API_KEY   --value <key>
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL     --value https://<ref>.supabase.co
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon_key>

eas build --platform ios      # bzw. android
```
- [ ] Erster Build läuft durch.
- [ ] **Push testen** geht nur mit echtem Build (Dev-Client oder Store-Build), **nicht** in Expo Go / Web.

### 6d. App Store Connect Metadaten
- [ ] **Privacy-Policy-URL** hinterlegen (Pflicht — siehe Abschnitt 7).
- [ ] **Altersfreigabe 18+** setzen.
- [ ] App-Beschreibung: klar als **„AI Companion / Entertainment"**, **keine** Gambling-App (kein echtes Geld, keine Wetten in der App).
- [ ] Screenshots, Keywords, Support-URL, Kategorie.
- [ ] Apple-Review-Hinweis vorbereiten: erklärt, dass die App eine reine KI-Begleiter-/Info-App ist, keine Wetten.

---

## 7. 🌐 WEBSITE + RECHTLICHES

- [ ] **Extra-Homepage** für die App bauen (in Arbeit).
- [ ] **Privacy Policy + Terms + Imprint online hosten** (Apple braucht die URL; die In-App-Texte allein reichen oft nicht).
  - Inhalte sind identisch mit den In-App-Seiten (`src/lib/legal.ts`). Claude kann sie als fertige HTML-Seiten für die Website exportieren — nur sagen.
- [ ] ⚠️ **Rechtstexte juristisch prüfen lassen** (Privacy & Terms) vor der Einreichung.
- [ ] Support-E-Mail `marketing@geniusbet.com` ist erreichbar / wird beantwortet.

---

## 8. ⚙️ ENV / SECRETS — Übersicht

| Variable | Wo | Wert |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | App `.env` + EAS Secret | `https://djnmrvhdklpclbrhxxqs.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | App `.env` + EAS Secret | euer anon key |
| `EXPO_PUBLIC_CLAUDE_API_KEY` | App `.env` + EAS Secret | **neuer** rotierter Key |
| `SUPABASE_URL` | Edge Function Secret | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function Secret | euer service_role key (nur Server!) |

---

## 9. ℹ️ BEKANNTE APP-LÜCKEN (zur Info, blockieren den Store nicht)

Diese sind Claudes Aufgabe, wenn ihr sie wollt — nur zur Transparenz:
- **Event-Detail-Screen** nutzt noch Demo-Daten (fixes El Clásico, Form-Balken) und der „Remind me at kickoff"-Knopf macht noch nichts. Wird der Screen überhaupt gebraucht? Sonst raus.
- **Notification-Prefs-Seite** (`app/notification-prefs.tsx`) existiert, ist aber nirgends verlinkt (die Settings-Toggles decken es ab).
- **`notify_*`-Toggles** werden von den Push-Jobs noch nicht respektiert (siehe 4c).

---

### Reihenfolge-Empfehlung
1 (Key) → 2 (SQL) → 3 (Backend bestätigen) → 4 (Push) → 6 (Build/Store) → 7 (Website/Legal) → 5 (Server-Proxy optional).

Wenn du 1–4 erledigt hast, melde dich — dann testet Claude Push/Reminders/Gedächtnis live und macht die App-seitigen Rest-Punkte.
