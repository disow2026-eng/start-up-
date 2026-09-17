# DockClock

**Get paid for every hour you wait at the dock.**

DockClock timestamps a truck's arrival and departure at pickup and delivery,
automatically calculates billable detention time against each load's free-time
and rate terms, and turns it into a professional invoice a broker can't
easily argue with.

This build is a **plain HTML/CSS/JavaScript static site** — no framework, no
build step, no backend. It's designed to be pushed straight to GitHub Pages.

## The problem

Most freight rate confirmations already promise detention pay once a truck
waits past a set amount of free time (commonly 2 hours) at a shipper or
receiver. The money is contractually owed. It almost never gets collected,
because:

- Drivers have no timestamped proof of when they arrived and left — just a
  text to dispatch or a memory of "I waited forever."
- Rate confirmations bury the free-time and detention-rate clauses in dense
  text nobody re-reads at the dock.
- By the time a driver is home, chasing $80–200 from three loads ago isn't
  worth the friction, so it gets written off.

This is a real, recurring, quantifiable loss for a specific audience —
**owner-operators and small trucking fleets (1–20 trucks)** — not an
imagined inconvenience. The product has a reason to exist with zero AI
involved: a timestamp clock, a detention calculator, and an invoice
generator.

## Important limitations of this build

Being a static site with no server changes what the product can honestly
claim, on purpose rather than by accident:

- **All data lives in your browser's `localStorage`.** There is no database,
  no sync across devices, and no account recovery. Clearing site data, using
  a private window, or switching browsers loses everything. Use
  **Settings → Export backup** regularly, and **Import backup** to restore.
- **"Accounts" are not real security.** Passwords are hashed client-side
  (`js/lib/hash.js`, SHA-256 + salt via the Web Crypto API) so they aren't
  sitting in plain text in devtools, but anyone with browser devtools can
  read or edit `localStorage` directly and bypass login entirely. Fine for a
  demo; don't put real sensitive data in it.
- **No real AI.** A static site has nowhere safe to hold an API key —
  anything in client-side JS is visible to every visitor via "view source" or
  the network tab. So "New Load" has a **smart paste** feature instead: a
  regex/heuristic parser (`js/core/rateConParser.js`) that pattern-matches
  common rate-confirmation fields, entirely client-side. It's honestly
  labeled as pattern matching, not AI, and will miss fields a real LLM
  wouldn't.
- **Pricing tiers on the landing page describe the product's intended
  direction** (Pro/Fleet with cloud sync), not what this build implements.
  Only the free, browser-local tier is actually wired up here.

## Target customer & roadmap

Owner-operators and small trucking fleets who already know detention is
owed but don't have a clean way to prove or invoice it. Roadmap beyond this
static build: a real backend (Postgres) for cross-device sync and multi-seat
fleet accounts, email delivery of invoices to brokers, geofenced
auto-arrival detection, and — once there's a server to hold a key — genuine
LLM-based rate confirmation parsing in place of the regex heuristics.

## Project structure

```
index.html, login.html, signup.html      — public pages
app/*.html                                — the logged-in dashboard pages
css/                                      — tokens, base, components, per-section styles
js/lib/       generic, app-agnostic helpers (DOM, storage, currency, hashing, ...)
js/data/      the "database" layer — localStorage-backed CRUD for users/loads/claims
js/core/      pure business logic — detention math, invoice view-model, rate-con parser
js/ui/        small reusable DOM-building components (sidebar, badges, tables, ...)
js/pages/     one controller per HTML page, wiring data + ui together
```

Everything is native ES modules (`<script type="module">`) — no bundler, no
`npm install`, no build step. Open `index.html` in a browser or serve the
folder with any static file server.

## Running locally

```bash
# any static server works, e.g.:
npx serve .
# or
python3 -m http.server 8080
```

Then visit the URL it prints. Sign up, create a load, tap through
arrival/departure at pickup and delivery, and an invoice is generated
automatically the moment the delivery departure is logged.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Repo **Settings → Pages** → set the source to the branch you pushed
   (root directory) — no build step needed, it's already static.
3. Your site is live at `https://<username>.github.io/<repo>/`.

## Core logic

The entire billing model lives in `js/core/detention.js` as pure functions —
wait time per stop minus free time, floored at zero, times the hourly rate.
`js/core/rateConParser.js` is the one "smart" feature, isolated so it's
obvious it's regex, not a network call.
