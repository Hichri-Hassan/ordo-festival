# Ordo Festival Networking MVP — Context for AI / collaborators

Use this document to onboard ChatGPT (or another assistant) on what was built and how the project works.

---

## Product goal

**Ordo** is a white-label student social network for campuses. This repo is a **very simple MVP** for a **campus festival / stand activation** (Pépite Festival)—not a full social platform.

**Goal:** Create real in-person interactions at a stand. Students scan a QR, do 30-second onboarding, join a timed networking session, get randomly matched with partners for short conversations.

**NOT in scope:** App Store app, push notifications, AI matchmaking, Tinder-style UX, production social graph.

---

## User flow (festival day)

1. Student sees stand with post-it: *"Qu'est-ce qu'il manque à votre campus ?"*
2. Scans QR → lands on **networking landing page** (web, not app download)
3. **Quick onboarding:** first name, study year, interests, "what are you looking for"
4. **Session selection:** join one or more slots (14:00, 15:00, 16:00, 17:00)
5. **Waiting screen:** countdown until session (in-browser, not phone push)
6. At stand: scans **session check-in QR**
7. Host on iPad taps **Start session** (or auto-start when ≥2 checked in + time reached)
8. **Live screen:** partner name, shared interests, icebreaker question, 2-minute timer (15s in demo mode)
9. Timer ends → rotate partner → repeat 5 times (~10 min total, 3 times in demo)
10. Session complete → thank-you page

---

## Design system

Minimal, monochrome, premium—Apple / Notion inspired:

- Soft beige background (`#f7f5f0`)
- Black/graphite typography
- White rounded cards, subtle shadows
- No bright gradients, no "startup crypto" colors
- French UI copy

---

## Tech stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **API Routes** for backend
- **In-memory store** (`Map` in `lib/store.ts`)—no database yet
- **nanoid** for profile IDs
- **localStorage** on client for `ordo_profile_id`

---

## Repo structure

```
app/
  networking/page.tsx          # Landing
  onboarding/page.tsx          # Profile form
  sessions/page.tsx            # Pick 14h–17h slots
  session/[sessionId]/
    wait/page.tsx              # Countdown
    checkin/page.tsx           # QR check-in entry
    live/page.tsx              # Partner + timer
    host/page.tsx              # iPad: force-start session
    done/page.tsx              # End screen
  api/
    profile/route.ts
    config/route.ts
    sessions/...
lib/
  store.ts                     # In-memory sessions + profiles
  matching.ts                  # Shuffle + greedy interest pairing
  config.ts                    # Demo mode flags
  types.ts, icebreakers.ts, client.ts
components/
  ui.tsx, DemoBanner.tsx
```

---

## Matching logic (v1)

- Shuffle participants per round
- Greedy pairing prioritizing shared interests
- 5 rounds × 120 seconds (production)
- Icebreakers from fixed French list in `lib/icebreakers.ts`
- No AI

---

## Demo / test mode

Enabled when:
- `ORDO_DEMO_MODE=true` on Railway (or any host), OR
- `NODE_ENV=development` locally (`npm run dev`)

Effects:
- Sessions can start **immediately** (no wait until 14:00)
- **15 seconds** per round instead of 2 minutes
- **3 rounds** instead of 5
- Banner: **"Mode test actif"** on site

Before real festival: remove `ORDO_DEMO_MODE` or set to `false`.

---

## Hosting

- Code on **GitHub:** `https://github.com/Hichri-Hassan/ordo-festival`
- Deployed on **Railway** (single Node process required for in-memory state)
- **Do NOT use Vercel serverless** for this MVP—in-memory state breaks across instances

Railway setup:
1. Deploy from GitHub
2. **Networking → Generate Domain**
3. Variable: `ORDO_DEMO_MODE=true` for testing
4. `nixpacks.toml` configures Node 20, `npm ci`, `npm run build`, `npm start`

QR codes (user creates manually, e.g. qr-code-generator.com):
- Stand: `https://DOMAIN/networking`
- Check-in: `https://DOMAIN/session/14-00/checkin` (etc.)
- Host iPad bookmark: `https://DOMAIN/session/14-00/host`

---

## Issues fixed during development

1. **Git push "Repository not found"** — GitHub repo had to be created first; correct username `Hichri-Hassan`.
2. **Railway build failed** — TypeScript error: duplicate `totalRounds` key in `app/api/sessions/[sessionId]/partner/route.ts` when spreading `getPublicConfig()`. Fixed by only passing `demoMode` from config.
3. Added `nixpacks.toml` for reliable Railway builds.

---

## Common misconceptions (clarify with users)

| Wrong assumption | Reality |
|------------------|---------|
| Scan QR → download app | Opens **website** in browser |
| Phone push notifications | **No push**; countdown is on wait page in browser |
| Vercel is fine | **Railway/single Node** needed for in-memory sessions |

---

## How to run locally

```bash
npm install
npm run dev
# → http://localhost:3000/networking (demo mode auto-on in dev)
```

## Quick test (2 phones)

1. Both: `/networking` → onboarding → join session `14-00`
2. Both: `/session/14-00/checkin`
3. iPad: `/session/14-00/host` → **Lancer maintenant**
4. Both see partner + timer on `/session/14-00/live`

---

## Future improvements (not built)

- PostgreSQL / Redis for persistent multi-instance deploy
- Real push notifications (PWA or native)
- Admin dashboard for stand staff
- English i18n
- Cap participants per session at ~10

---

## Product philosophy

Real-life first. Effortless, fun, social. Ordo is a tool to create **real campus interactions**, not just another app.
