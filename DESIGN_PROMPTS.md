# BETina — Design Prompts für Claude.ai
# Jeden Prompt einzeln in claude.ai reinkopieren, Artifact reviewen, Feedback geben

---

## 📱 SCREEN 1 — Splash Screen

```
Create an interactive HTML mockup of a mobile app splash screen (375x812px, centered on page).

App: BETina — AI companion for GeniusBet sports betting players.

Design:
- Background: deep black #0A0A0F with subtle animated gold particles floating upward (CSS animation, ~30 particles, slow and elegant)
- Center: A glowing circular avatar frame (120px) — use a gradient circle (purple #6B21A8 to lime #BFFF00) as placeholder for BETina's AI face. Add a soft pulsing glow animation.
- Below avatar: "BETina" in bold white 36px, letter-spacing 4px
- Below name: "Your GeniusBet Companion" in #9999AA, 14px, letter-spacing 2px
- At bottom: GeniusBet logo text in white 18px bold + small tagline "geniusbet.com" in muted
- Loading bar at very bottom: slim 2px line animating from left to right in #BFFF00, then screen fades out

Animations (CSS):
- Avatar: subtle scale pulse (1.0 → 1.05 → 1.0, 3s loop)
- Gold particles: float upward, random x positions, 0.3 opacity, vary speed
- "BETina" text: fade in after 0.5s
- Loading bar: fills over 2.5s then triggers fade-out of whole screen

Feel: cinematic, premium, alive. Like the app is waking up.
Show in a phone frame mockup (dark rounded frame around the 375x812 content).
```

---

## 📱 SCREEN 2 — Login Screen

```
Create an interactive HTML mockup of a mobile app login screen (375x812px, in a phone frame).

App: BETina — AI companion for GeniusBet.

Design:
- Background: #0A0A0F with very subtle purple radial glow at top center
- Top (30% of screen): BETina avatar (glowing circle placeholder, 80px) + "Welcome back 👋" in white bold 28px + "Enter your number to continue" in #9999AA 14px
- Middle: 
  - Country code selector button (flag emoji + "+503" in a glassmorphism pill: rgba(255,255,255,0.05) bg, white border 1px rgba(255,255,255,0.1), 16px font)
  - Phone number input field — glassmorphism style, white text, placeholder "Your phone number" in #555566, neon green #BFFF00 bottom border when focused (simulate focused state)
  - Both elements side by side in one row
- Below input: "Continue" button — full width, background #BFFF00, text #0A0A0F bold, border-radius 50px, box-shadow: 0 0 20px rgba(191,255,0,0.4)
- Small text below button: "By continuing you agree to our Terms" in #555566 12px
- Bottom: "New to GeniusBet? Register here" — "Register here" in #BFFF00

Glassmorphism cards: rgba(255,255,255,0.05) background, 1px rgba(255,255,255,0.08) border, backdrop-filter blur(10px)

Make the Continue button have a hover/click effect (glow intensifies).
Show in phone frame.
```

---

## 📱 SCREEN 3 — Home Screen

```
Create an interactive HTML mockup of a mobile app home screen (375x812px, in a phone frame).

App: BETina — AI companion for GeniusBet. Player name: "Carlos".

Design:
- Background: #0A0A0F with continuous subtle gold particle animation (slow floating upward, ~20 particles)
- Status bar area: time left, icons right (all in white/muted)

TOP SECTION (Hero):
- BETina avatar: large glowing circle (90px) top center with purple-to-lime gradient border, pulsing glow
- "Hey Carlos! 👋" — white bold 24px
- "Ready for tonight's matches?" — #9999AA 15px
- Small "ONLINE" badge in neon green (#BFFF00) next to avatar, pulsing dot

BALANCE CARD (Glassmorphism):
- Full width card, bg: rgba(107,33,168,0.2), border: 1px rgba(107,33,168,0.4), border-radius 20px
- Left: "Balance" label in #9999AA 12px, "$124.50" in white bold 32px (animated count-up), "Available" in #9999AA 11px
- Right: "Bonus" label, "$20.00" in #BFFF00 bold 20px
- Small "Deposit" button: #BFFF00 bg, #0A0A0F text, small pill shape

QUICK ACTIONS (2x2 grid of glassmorphism cards):
- 🎯 Bet Now — purple glow
- 💬 Chat with BETina — lime glow  
- 📊 My Stats — gold glow
- 🎁 Bonuses — purple glow
Each card: icon large (32px), label below, glassmorphism style

BETINA'S TIP (card):
- Header: "⚡ BETina's Pick" in #BFFF00 bold
- Content: "Barcelona vs Madrid tonight — this is your match Carlos! Kick-off 21:00" 
- "View Match →" link in #BFFF00

BOTTOM NAV:
- 5 icons: Home (active, #BFFF00), Chat (💬), Notifications (🔔 with badge "3"), Stats (📊), Profile (👤)
- Active item has neon green glow underneath
- Background: rgba(18,18,26,0.95) with top border rgba(255,255,255,0.05)

Make balance card and quick action cards subtly interactive on hover.
```

---

## 📱 SCREEN 4 — Chat Screen

```
Create an interactive HTML mockup of a mobile app chat screen (375x812px, in a phone frame).

App: BETina — AI companion chat. Player: Carlos.

Design:
- Background: #0A0A0F

HEADER:
- Back arrow left, center: BETina avatar (40px circle, purple-lime gradient) + "BETina" bold white + "Online" in #BFFF00 12px with pulsing dot
- Right: info icon

CHAT MESSAGES (scrollable area):

BETina message (left aligned):
- Glassmorphism bubble: rgba(107,33,168,0.2) bg, 1px rgba(107,33,168,0.3) border, border-radius 18px 18px 18px 4px
- Small avatar (24px) to the left
- Text: "Hey Carlos! 🎉 Barcelona is playing tonight at 21:00. Based on your history, this is exactly your kind of match. Want me to show you the best odds?" 
- Timestamp: 17:23 in #555566 11px

Player message (right aligned):
- Solid bubble: #BFFF00 background, #0A0A0F text, border-radius 18px 18px 4px 18px
- Text: "Yes! Show me"
- Timestamp: 17:24

BETina message (left):
- Same glassmorphism style
- Text: "Perfect! Current odds: Barcelona Win @1.85 ⚽ — The stadium is electric tonight. Last 5 home games: 4 wins. Your call, Carlos! 😎"
- Below text: two action buttons inside the bubble: [View Full Odds] [Maybe Later] — styled as small pill buttons in #BFFF00 and ghost style

TYPING INDICATOR (bottom, BETina is typing):
- Small avatar + glassmorphism bubble with 3 animated pulsing dots (purple → lime color shift)

INPUT BAR (bottom):
- Dark bar rgba(18,18,26,0.98), top border rgba(255,255,255,0.05)
- Input field: glassmorphism, placeholder "Message BETina..." in #555566
- Send button: circular #BFFF00 with arrow icon, glow effect
- Mic icon on left of input

Add subtle hover effects on the action buttons inside BETina's message.
```

---

## 📱 SCREEN 5 — Notifications Screen

```
Create an interactive HTML mockup of a mobile notifications/activity screen (375x812px, in phone frame).

App: BETina — GeniusBet AI companion. Player: Carlos.

Design:
- Background: #0A0A0F
- Header: "Activity" bold white 24px left, filter icon right

NOTIFICATION ITEMS (timeline style, newest first):

1. BIG WIN 🏆 (special card):
   - Full width card, gold gradient border (2px), bg: rgba(255,215,0,0.1)
   - Left: golden trophy emoji large (40px)
   - "You Won! +$47.50" bold gold #FFD700 20px
   - "Barcelona vs Madrid — Bet #2847" in white 14px
   - "Just now" timestamp
   - Subtle gold shimmer animation on the card

2. Regular notification:
   - Glassmorphism card, BETina avatar (32px) left
   - "BETina: Hey Carlos, your cashback of $5.20 is ready! 🎁"
   - "2 hours ago" in #555566
   - Unread dot: #BFFF00 4px circle right

3. Regular notification:
   - Football emoji
   - "Barcelona plays tonight at 21:00 — your favorite team!"
   - "5 hours ago"
   - Already read (slightly dimmer)

4. Regular notification:
   - Money emoji
   - "Withdrawal of $50.00 completed successfully ✅"
   - "Yesterday"

5. Regular notification (dimmed):
   - Bell emoji
   - "New bonus available: 20 Free Spins"
   - "2 days ago"

BOTTOM NAV same as Home screen (Notifications tab active).

Make the Big Win card feel special with a subtle shimmer/glow animation.
```

---

## NACH DEM DESIGN: Nächste Schritte

Wenn alle Screens approved:
1. Screenshots machen von den fertigen Designs
2. In Claude Code Ordner legen als Referenz
3. Claude Code Prompt: "Baue diese Screens exakt nach — hier sind die Mockups als Referenz"
