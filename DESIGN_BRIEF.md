# BETina App — Design Brief v2.0
*App Store Safe — AI Companion / Entertainment Category*
*Basis: genius360.io Style + BETina AI Layer*

---

## ⚠️ App Store Regel (oberste Priorität)

**Kein echtes Geld in der App.**
- ❌ Kein Balance in echter Währung ($, €, NGN, etc.)
- ❌ Kein Deposit / Withdrawal Button
- ❌ Kein "Bet Now" / Quoten mit direktem Action
- ❌ Kein Casino direkt spielbar
- ✅ Alles was Geld betrifft → öffnet externen Browser (GeniusBet Website)

**Kategorie:** Entertainment → AI Companion
**Positionierung:** "Your personal AI sports companion" — wie Duolingo, aber für Sports/GeniusBet Fans

---

## Was BETina ZEIGT (App Store safe)

| Feature | In App | Wie dargestellt |
|---|---|---|
| VIP Status | ✅ | Tier Name (INITIATE etc.) + XP Points — kein $ |
| Balance | ✅ Nur lesen, kein Deposit Button | "Dein Konto: verfügbar" → "Details auf GeniusBet →" |
| Sports Events | ✅ | Info-Karten: Team, Zeit, Liga — kein Bet-Button |
| Chat mit BETina | ✅ | AI Companion Chat — Kern der App |
| Aktivitäts-Stats | ✅ | Aktive Tage, Lieblingsteams, Wins (historisch) |
| Push Notifications | ✅ | Über Events, VIP Milestones, BETinas Tipps |
| GeniusBet öffnen | ✅ | Prominenter "Open GeniusBet" Button → Safari |

---

## Visual Identity

**Grundprinzip:** genius360.io auf Mobile — BETinas Persönlichkeit drüber.

### Farbpalette
| Farbe | Hex | Verwendung |
|---|---|---|
| Lime Grün | #BFFF00 | Aktive Nav, CTAs, XP Bar Fill, Highlights |
| Deep Purple | #6B21A8 | Glow Background, VIP Accent, BETina Bubbles |
| Gold | #FFD700 | GENIUS Tier, Achievements, Milestone Moments |
| Near-Black | #0D0D12 | App Background |
| Dark Surface | #13131B | Cards, Header |
| Card | #1A1A28 | Content Cards |
| Text | #FFFFFF / #9999AA | Primary / Secondary |

### Background-System
- Base: #0D0D12
- Subtiler purple Radial Glow zentral/oben (wie genius360 Dashboard)
- Gold Partikel NUR bei Big Achievement Momenten

---

## Screen-by-Screen Design

### 1. Splash Screen
- #0D0D12 Background + purple Glow
- BETinas Avatar (Kreis, purple-lime Gradient Border) erwacht animiert
- "BETina" bold weiß + "by GeniusBet" klein in #9999AA
- Slim Lime Loading Bar unten

### 2. Login Screen
- BETina Avatar oben (kleiner, 70px)
- "Hey! Ich bin BETina 👋" weiß bold 26px
- "Melde dich mit deiner GeniusBet Nummer an" in #9999AA
- Ländercode + Handynummer (Glassmorphism Input, Lime Border bei Focus)
- "Weiter →" Button: Lime Grün full-width, Glow Shadow

### 3. Home Screen ← KERN-SCREEN
**Aufbau (top to bottom):**

**Header Bar:**
- GeniusBet Logo (Lime Grün) links
- Tier Badge rechts: "THINKER" in purple pill

**BETina Hero Section:**
- Avatar (80px) mit purple Glow + pulsierender grüner Online-Dot
- Persönliche Begrüßung: *"Hey Carlos! Barcelona spielt heute Abend — dein Match! ⚽"*
- Timestamp der letzten Aktivität: "Zuletzt aktiv: vor 2h"

**XP / Loyalty Card** (Glassmorphism, purple Glow):
- "THINKER" links in Gold → rechts nächstes Tier "ANALYST"
- XP Progress Bar (Lime Grün Fill): "3.240 / 5.000 XP"
- "+240 XP diese Woche 🔥" in Lime Grün klein

**Today's Events** (horizontal scrollable Cards):
- Jede Card: Team A vs Team B | Liga | Uhrzeit
- "⚽ Barcelona vs Madrid — 21:00" mit leichtem Lime Grün Glow (Lieblingsclub)
- Kein Bet-Button — nur "Auf GeniusBet ansehen →"

**"Open GeniusBet" CTA:**
- Prominenter Button: Lime Grün, full-width, bold
- "Jetzt auf GeniusBet spielen →"
- Öffnet externen Browser

**Quick Chat Access:**
- Kleiner "Chat mit BETina" Banner unten
- BETinas letzter Satz als Preview

### 4. Chat Screen
- **Header:** Avatar (40px) + "BETina" + grüner Online-Dot
- **BG:** #0D0D12 mit subtiler purple Vignette
- **Spieler-Bubble:** Lime Grün bg, dunkler Text, rechts
- **BETina-Bubble:** Glassmorphism (rgba purple), links, mit kleinem Avatar
- **Typing Indicator:** 3 Punkte pulsierend (Purple → Lime)
- **Input Bar:** Glassmorphism Input + Lime Send-Button
- BETina kann über Spieler-Stats sprechen aber **kein** Bet-Empfehlung mit Quoten

### 5. My Journey Screen (Stats)
- **VIP Timeline** groß: INITIATE → THINKER → ANALYST → MASTERMIND → GENIUS
  - Aktuelle Position: "You are here" Badge
  - XP Zähler animiert hoch beim Load
  - Cashback % pro Tier (Info only, kein Deposit)
- **Stats Grid** (4 Cards):
  - 🗓️ Aktive Tage | 🏆 Achievements | ⚽ Lieblingsteam | 🔥 Streak
  - Zahlen animiert hochzählend
- **BETinas Kommentar:** *"Noch 1.760 XP bis ANALYST! Du bist auf dem richtigen Weg 💪"*

### 6. Notifications Screen
- Timeline wie genius360 Transaction History — aber NUR Events, keine Geld-Transaktionen
- Big Achievement (Tier Up) = gold card mit Shimmer
- Sport Event Reminder = dark card mit Team-Farben
- BETina Nachrichten = purple card mit Avatar
- Kein Deposit/Withdrawal in der Notification List

### 7. Settings Screen
- Sprache (Marktsprache)
- Push Notification Preferences
- Responsible Gaming Tools → Link zu GeniusBet RG Seite
- Account verknüpfen / Logout
- "Open GeniusBet" Link

---

## Was "Fancy" bedeutet (AI Companion Layer)

1. **BETina ist immer präsent** — Avatar auf jedem Screen
2. **XP zählt animiert hoch** bei Screen-Load
3. **Tier-Up Moment** — gold Explosion, BETina feiert: *"ANALYST! Das hast du verdient 🎉"*
4. **Streak Animation** — Flame Icon bei aktiven Tagen (wie Duolingo)
5. **Glow auf Lieblingsclub** — wenn Team spielt, leichter grüner Pulse
6. **Haptics** — sanft bei Button Press
7. **Alles personalisiert** — immer Carlos, immer sein Team, immer seine Stats

---

## App Store Submission

**Name:** BETina — GeniusBet Companion
**Kategorie:** Entertainment → AI & Chatbots
**Keywords:** AI companion, sports, GeniusBet, chatbot, loyalty
**Screenshots zeigen:** Chat mit BETina, VIP Journey, Sports Events Info
**Was NICHT in Screenshots:** Geldbeträge, Wett-Quoten, Casino

---

## Claude.ai Master-Prompt (für alle Screen-Mockups)

```
I'm designing BETina, a mobile AI companion app for GeniusBet players.
Category: AI Entertainment (NOT gambling — no real money in app).

DESIGN REFERENCE: genius360.io dashboard style —
- Background: near-black #0D0D12 with subtle purple radial glow
- Lime green #BFFF00 for logo, active elements, CTAs, XP bar
- Deep purple #6B21A8 for accents and glassmorphism cards
- White bold typography for important text, #9999AA for labels
- Glassmorphism cards: rgba(255,255,255,0.05) bg, 1px rgba(255,255,255,0.08) border

BETINA: AI companion character (futuristic woman avatar). She knows the player personally.
Always present. Greets by name. Knows their favorite team, VIP tier, activity.

VIP TIERS (no money — XP based): INITIATE → THINKER → ANALYST → MASTERMIND → GENIUS

NO real money, NO deposit button, NO bet-now buttons.
External link "Open GeniusBet →" for actual betting (opens browser).

Mobile: 375x812px in dark phone frame. Make it feel premium, alive, personalized.
```

---
*Design Brief v2.0 — App Store Safe — 06.07.2026*
