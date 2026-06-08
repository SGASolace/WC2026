# Setup — Multi-User Pool (Supabase) · ~10 minutes

This makes the app **shared**: everyone signs in, picks against the same matches,
and sees one shared leaderboard. The admin settles results for the whole group.
Login is **email + password** (no SMS). Stakes are virtual **Coins** — no real money.

## 1. Create a free Supabase project
1. Go to https://supabase.com → New project. Pick a name + database password.
2. Wait ~2 min for it to provision.

## 2. Create the database
1. In Supabase, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase_setup.sql` and click **Run**.
   This creates the tables, security rules, and live-updates.

## 3. Turn off email confirmation (so friends can join instantly)
- **Authentication → Providers → Email** → turn **"Confirm email"** OFF → Save.
  (Leave it on if you prefer; users then click a link in their email before signing in.)

## 4. Get your keys
- **Project Settings → API**, copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon public** key → `VITE_SUPABASE_ANON_KEY`
- Copy `.env.example` to `.env` and paste both values in.

## 5. Run locally
```bash
npm install
npm run dev      # http://localhost:5173
```

## 6. Make yourself the admin
1. Open the app, **Create Account** (this is you).
2. Back in Supabase → **Table Editor → profiles**, find your row and set
   `is_admin = true`. (Or run in SQL Editor:
   `update profiles set is_admin = true where nickname = 'YOUR_NICKNAME';`)
3. Refresh the app — you now see the **Admin Console** (result settlement).
   Everyone else stays a player.

## 7. Deploy (free)
**Vercel**
```bash
npm i -g vercel && vercel
```
Then add the two env vars in **Vercel → Project → Settings → Environment Variables**
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and redeploy with `vercel --prod`.

**Netlify** — connect the repo (or `netlify deploy`). Add the same two env vars in
**Site settings → Environment variables**. Build `npm run build`, publish `dist`.

> The `anon` key is safe to expose in a frontend — your data is protected by the
> Row-Level Security policies created in step 2 (players can read the pool and
> insert only their own picks; only admins can settle results).

## How it works
- **Picks** are stored in the `bets` table; **results** in `results`.
- When the admin settles a match, the engine grades every affected pick and writes
  the win/loss + payout. Realtime pushes the update to everyone instantly.
- Odds/markets come from the FIFA template in `src/App.jsx` (`buildMarkets`).
