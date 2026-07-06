# BETina App — Startprompt für Claude Code

Kopiere das hier als ersten Prompt in Claude Code:

---

## PROMPT (kopieren):

Ich baue die **BETina App** — eine persönliche KI-Begleiterin für GeniusBet-Spieler.
Die CLAUDE.md in diesem Ordner enthält das vollständige Briefing. Lies sie als erstes.

**Starte jetzt mit Phase 1 — Projekt Setup + erste Screens:**

1. Erstelle ein neues Expo Projekt mit Expo Router (TypeScript)
   ```
   npx create-expo-app@latest betina-app --template tabs
   ```
   Dann alle unnötigen Beispiel-Screens löschen.

2. Installiere alle Dependencies:
   - `@supabase/supabase-js`
   - `react-native-reanimated`
   - `lottie-react-native`
   - `expo-haptics`
   - `expo-linear-gradient`
   - `react-native-safe-area-context`
   - `lucide-react-native`

3. Kopiere `src/theme/index.ts` in das neue Projekt (Design System ist fertig)

4. Baue diese Screens nacheinander, exakt nach Design System:
   - **Splash Screen** — BETinas Avatar "erwacht" (Fade-In + leichter Zoom), GeniusBet Logo, dann auto-navigate zu Login
   - **Login Screen** — Handynummer Input mit Ländercode, "Weiter" Button (Neon Grün Glow), GeniusBet Branding
   - **Home Screen Skeleton** — BETina Avatar oben (groß), persönliche Begrüßung, Balance Card (Glassmorphism), Quick Action Buttons

5. Hintergrund auf ALLEN Screens: Near-Black (#0A0A0F) mit animierten Goldpartikeln (subtil, dauerhaft)

**Design Rules:**
- Alle Farben aus `src/theme/index.ts` — NIEMALS hardcoded
- Glassmorphism Cards für alle Info-Boxen
- Neon Grün (#BFFF00) für alle CTAs mit Glow Shadow
- Animationen mit Reanimated 3
- BETina Avatar als PNG einbinden (Platzhalter OK für jetzt)

Fang an und zeig mir Screen für Screen. Bei jedem Screen: zuerst den Code, dann erkläre kurz was du gemacht hast.

---

## NACH DEM ERSTEN BUILD:

Dann diesen zweiten Prompt:

---

Baue jetzt den **Chat Screen** mit BETina:
- BETinas Avatar oben (klein, persistent)
- Nachrichtenblase Design: Spieler = rechts (Neon Grün), BETina = links (Glassmorphism)
- Input Bar unten mit Send Button
- Neue Nachrichten fliegen sanft ein (Reanimated)
- Typing Indicator mit 3 pulsierenden Punkten (Purple/Gold)
- Chat an Claude API anbinden (System Prompt: BETinas Persönlichkeit aus CLAUDE.md)

---
