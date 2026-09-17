# DockClock

**Get paid for every hour you wait at the dock.**

DockClock timestamps a truck's arrival and departure at pickup and delivery,
automatically calculates billable detention time against each load's free-time
and rate terms, and turns it into a professional invoice a broker can't
easily argue with.

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
generator. AI is used in exactly one place it earns its keep — parsing the
inconsistent free-form text of a rate confirmation into structured fields —
and the app is fully functional without it.

## Why this, and not another idea

Before building, I evaluated several niche B2B problems for a specific,
underserved audience with real financial pain (not another AI wrapper):
grant-compliance reporting for small nonprofits, warranty-claim tracking for
home-service contractors, security-deposit dispute documentation for small
landlords, and detention-pay tracking for owner-operator truckers. Detention
tracking won because the pain is immediate and dollar-denominated (drivers
already know they're owed money and already know roughly how often it
happens), the record-keeping problem is solvable with a very small, buildable
MVP, the audience is large (millions of U.S. truck drivers, a large share
owner-operators or small fleets) and reachable through trucking
Facebook groups / forums / YouTube channels, and the willingness to pay is
obvious — the product pays for itself the first time it recovers an invoice.

## Product roadmap

- **MVP (this build):** auth, load creation (manual + AI-assisted rate
  confirmation parsing), one-tap arrival/departure logging per stop,
  automatic detention math, auto-generated invoices with status tracking
  (draft → sent → acknowledged/disputed → paid), dashboard of
  tracked/pending/recovered totals.
- **Next:** email delivery of invoices directly to the broker (not just
  print/PDF), SMS-based time logging for drivers who don't want to open the
  app mid-dock, geofenced auto-arrival detection, multi-truck/dispatcher
  seats (the "Fleet" plan).
- **Later:** integrations with load boards / TMS platforms (e.g. importing
  loads from a broker portal instead of pasting rate confirmation text),
  a factoring-style "we collect it, you get paid faster" premium tier,
  aggregate/anonymized broker detention-reliability scores.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **SQLite** for local dev (swap the `datasource` provider to
  `postgresql` for production — one line, see `prisma/schema.prisma`)
- **NextAuth** (credentials provider, bcrypt password hashing)
- **Anthropic API** (`claude-haiku-4-5`) for optional rate-confirmation
  parsing — the app works fully without an API key

## Running locally

```bash
npm install
cp .env.example .env   # fill in NEXTAUTH_SECRET (openssl rand -base64 32)
npx prisma db push
npm run dev
```

Visit `http://localhost:3000`. Sign up, create a load, tap through
arrival/departure at pickup and delivery, and an invoice is generated
automatically the moment the delivery departure is logged.

To enable AI-assisted rate confirmation parsing, set `ANTHROPIC_API_KEY` in
`.env`. Without it, the "New Load" screen simply shows the manual entry form.

## Core logic

The entire billing model lives in `lib/detention.ts` as pure functions —
wait time per stop minus free time, floored at zero, times the hourly rate.
`lib/anthropic.ts` is the one AI integration point, isolated behind an
`aiExtractionAvailable()` check so every other code path is AI-agnostic.
