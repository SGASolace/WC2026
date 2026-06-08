# SGA · FIFA WC 2026 — Prediction Pool (multi-user)

A World Cup 2026 prediction pool for a private group of friends. Everyone signs in
with **email + password**, makes picks across 11 markets on all 72 group matches,
and competes on one **shared leaderboard**. An admin settles results and the engine
pays out automatically. Stakes are virtual **Coins** — this is a for-fun game, not
real-money gambling.

- **Frontend:** Vite + React + Tailwind v4
- **Backend:** Supabase (Postgres + Auth + Realtime) — no server to run
- **Shared data:** picks, results, and leaderboard are the same for all users

## Quick start
👉 **Follow `SETUP.md`** — it walks through creating the Supabase project, running
`supabase_setup.sql`, adding your keys to `.env`, and deploying free.

```bash
npm install
cp .env.example .env     # paste your Supabase URL + anon key
npm run dev              # http://localhost:5173
npm run build            # production build → dist/
```

If you open the app before adding keys, it shows a friendly "add your keys" screen.

## Files
- `src/App.jsx` — the whole app (UI + prediction markets + settlement engine)
- `src/supabaseClient.js` — Supabase connection
- `supabase_setup.sql` — paste into Supabase SQL Editor to create everything
- `.env.example` — your two Supabase keys
- `vercel.json` / `netlify.toml` — SPA routing for hosting
