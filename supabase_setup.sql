-- ============================================================================
--  SGA · FIFA WC 2026 — Supabase setup
--  Paste this whole file into Supabase → SQL Editor → Run.
--  Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- 1) PROFILES ---------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  nickname   text unique not null,
  is_admin   boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- helper used by policies (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "profiles_read"   on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update" on public.profiles for update to authenticated using (id = auth.uid());

-- 2) PREDICTIONS (stored in table "bets") -----------------------------------
create table if not exists public.bets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  nickname    text not null,
  code        text unique not null,
  items       jsonb not null,
  total_stake numeric not null,
  potential   numeric not null,
  payout      numeric default 0,
  status      text default 'open',          -- open | won | lost
  placed_at   timestamptz default now()
);
alter table public.bets enable row level security;

drop policy if exists "bets_read"        on public.bets;
drop policy if exists "bets_insert_own"  on public.bets;
drop policy if exists "bets_admin_update" on public.bets;
create policy "bets_read"         on public.bets for select to authenticated using (true);
create policy "bets_insert_own"   on public.bets for insert to authenticated with check (user_id = auth.uid());
create policy "bets_admin_update" on public.bets for update to authenticated using (public.is_admin());

-- 3) RESULTS ----------------------------------------------------------------
create table if not exists public.results (
  match_no   int primary key,
  payload    jsonb not null,
  settled_by uuid references auth.users,
  settled_at timestamptz default now()
);
alter table public.results enable row level security;

drop policy if exists "results_read"         on public.results;
drop policy if exists "results_admin_insert" on public.results;
drop policy if exists "results_admin_update" on public.results;
create policy "results_read"         on public.results for select to authenticated using (true);
create policy "results_admin_insert" on public.results for insert to authenticated with check (public.is_admin());
create policy "results_admin_update" on public.results for update to authenticated using (public.is_admin());

-- 4) REALTIME (live updates for picks + results) ----------------------------
alter publication supabase_realtime add table public.bets;
alter publication supabase_realtime add table public.results;

-- ============================================================================
--  AFTER everyone has signed up once, make yourself the admin:
--    update public.profiles set is_admin = true where nickname = 'YOUR_NICKNAME';
-- ============================================================================
