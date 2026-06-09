import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Trophy, Calendar, Clock, Receipt, ListChecks, Crown, ShieldCheck, LogOut,
  Search, Plus, X, Lock, Check, ChevronRight, ChevronLeft, Sun, Moon,
  Settings, BarChart3, Users, Wallet, TrendingUp, Flag, Ticket, AlertCircle,
} from "lucide-react";
import { supabase, hasSupabase } from "./supabaseClient.js";

/* ============================================================================
   SGA FIFA WC 2026 — Private Prediction Pool (multi-user, Supabase-backed)
   Data model: Market → Selection → Odds → Stake. Shared bets, results, leaderboard.
   ============================================================================ */

const FIXTURES = [{"n":1,"day":"Fri","date":"Jun 12, 2026","time":"01:00","home":"Mexico","away":"South Africa","hf":"🇲🇽","af":"🇿🇦"},{"n":2,"day":"Fri","date":"Jun 12, 2026","time":"08:00","home":"Korea Republic","away":"Czech Republic","hf":"🇰🇷","af":"🇨🇿"},{"n":3,"day":"Sat","date":"Jun 13, 2026","time":"01:00","home":"Canada","away":"Bosnia and Herzegovina","hf":"🇨🇦","af":"🇧🇦"},{"n":4,"day":"Sat","date":"Jun 13, 2026","time":"07:00","home":"United States","away":"Paraguay","hf":"🇺🇸","af":"🇵🇾"},{"n":5,"day":"Sun","date":"Jun 14, 2026","time":"07:00","home":"Haiti","away":"Scotland","hf":"🇭🇹","af":"🏴"},{"n":6,"day":"Sun","date":"Jun 14, 2026","time":"10:00","home":"Australia","away":"Turkey","hf":"🇦🇺","af":"🇹🇷"},{"n":7,"day":"Sun","date":"Jun 14, 2026","time":"04:00","home":"Brazil","away":"Morocco","hf":"🇧🇷","af":"🇲🇦"},{"n":8,"day":"Sun","date":"Jun 14, 2026","time":"01:00","home":"Qatar","away":"Switzerland","hf":"🇶🇦","af":"🇨🇭"},{"n":9,"day":"Mon","date":"Jun 15, 2026","time":"05:00","home":"Ivory Coast","away":"Ecuador","hf":"🇨🇮","af":"🇪🇨"},{"n":10,"day":"Sun","date":"Jun 14, 2026","time":"23:00","home":"Germany","away":"Curaçao","hf":"🇩🇪","af":"🇨🇼"},{"n":11,"day":"Mon","date":"Jun 15, 2026","time":"02:00","home":"Netherlands","away":"Japan","hf":"🇳🇱","af":"🇯🇵"},{"n":12,"day":"Mon","date":"Jun 15, 2026","time":"08:00","home":"Sweden","away":"Tunisia","hf":"🇸🇪","af":"🇹🇳"},{"n":13,"day":"Tue","date":"Jun 16, 2026","time":"04:00","home":"Saudi Arabia","away":"Uruguay","hf":"🇸🇦","af":"🇺🇾"},{"n":14,"day":"Mon","date":"Jun 15, 2026","time":"22:00","home":"Spain","away":"Cape Verde","hf":"🇪🇸","af":"🇨🇻"},{"n":15,"day":"Tue","date":"Jun 16, 2026","time":"07:00","home":"Iran","away":"New Zealand","hf":"🇮🇷","af":"🇳🇿"},{"n":16,"day":"Tue","date":"Jun 16, 2026","time":"01:00","home":"Belgium","away":"Egypt","hf":"🇧🇪","af":"🇪🇬"},{"n":17,"day":"Wed","date":"Jun 17, 2026","time":"01:00","home":"France","away":"Senegal","hf":"🇫🇷","af":"🇸🇳"},{"n":18,"day":"Wed","date":"Jun 17, 2026","time":"04:00","home":"Iraq","away":"Norway","hf":"🇮🇶","af":"🇳🇴"},{"n":19,"day":"Wed","date":"Jun 17, 2026","time":"07:00","home":"Argentina","away":"Algeria","hf":"🇦🇷","af":"🇩🇿"},{"n":20,"day":"Wed","date":"Jun 17, 2026","time":"10:00","home":"Austria","away":"Jordan","hf":"🇦🇹","af":"🇯🇴"},{"n":21,"day":"Thu","date":"Jun 18, 2026","time":"05:00","home":"Ghana","away":"Panama","hf":"🇬🇭","af":"🇵🇦"},{"n":22,"day":"Thu","date":"Jun 18, 2026","time":"02:00","home":"England","away":"Croatia","hf":"🏴","af":"🇭🇷"},{"n":23,"day":"Wed","date":"Jun 17, 2026","time":"23:00","home":"Portugal","away":"DR Congo","hf":"🇵🇹","af":"🇨🇩"},{"n":24,"day":"Thu","date":"Jun 18, 2026","time":"08:00","home":"Uzbekistan","away":"Colombia","hf":"🇺🇿","af":"🇨🇴"},{"n":25,"day":"Thu","date":"Jun 18, 2026","time":"22:00","home":"Czech Republic","away":"South Africa","hf":"🇨🇿","af":"🇿🇦"},{"n":26,"day":"Fri","date":"Jun 19, 2026","time":"01:00","home":"Switzerland","away":"Bosnia and Herzegovina","hf":"🇨🇭","af":"🇧🇦"},{"n":27,"day":"Fri","date":"Jun 19, 2026","time":"04:00","home":"Canada","away":"Qatar","hf":"🇨🇦","af":"🇶🇦"},{"n":28,"day":"Fri","date":"Jun 19, 2026","time":"07:00","home":"Mexico","away":"Korea Republic","hf":"🇲🇽","af":"🇰🇷"},{"n":29,"day":"Sat","date":"Jun 20, 2026","time":"06:30","home":"Brazil","away":"Haiti","hf":"🇧🇷","af":"🇭🇹"},{"n":30,"day":"Sat","date":"Jun 20, 2026","time":"04:00","home":"Scotland","away":"Morocco","hf":"🏴","af":"🇲🇦"},{"n":31,"day":"Sat","date":"Jun 20, 2026","time":"09:00","home":"United States","away":"Australia","hf":"🇺🇸","af":"🇦🇺"},{"n":32,"day":"Sat","date":"Jun 20, 2026","time":"01:00","home":"Turkey","away":"Paraguay","hf":"🇹🇷","af":"🇵🇾"},{"n":33,"day":"Sun","date":"Jun 21, 2026","time":"02:00","home":"Germany","away":"Ivory Coast","hf":"🇩🇪","af":"🇨🇮"},{"n":34,"day":"Sun","date":"Jun 21, 2026","time":"06:00","home":"Ecuador","away":"Curaçao","hf":"🇪🇨","af":"🇨🇼"},{"n":35,"day":"Sat","date":"Jun 20, 2026","time":"23:00","home":"Netherlands","away":"Sweden","hf":"🇳🇱","af":"🇸🇪"},{"n":36,"day":"Sun","date":"Jun 21, 2026","time":"10:00","home":"Tunisia","away":"Japan","hf":"🇹🇳","af":"🇯🇵"},{"n":37,"day":"Mon","date":"Jun 22, 2026","time":"04:00","home":"Uruguay","away":"Cape Verde","hf":"🇺🇾","af":"🇨🇻"},{"n":38,"day":"Sun","date":"Jun 21, 2026","time":"22:00","home":"Spain","away":"Saudi Arabia","hf":"🇪🇸","af":"🇸🇦"},{"n":39,"day":"Mon","date":"Jun 22, 2026","time":"01:00","home":"Belgium","away":"Iran","hf":"🇧🇪","af":"🇮🇷"},{"n":40,"day":"Mon","date":"Jun 22, 2026","time":"07:00","home":"New Zealand","away":"Egypt","hf":"🇳🇿","af":"🇪🇬"},{"n":41,"day":"Tue","date":"Jun 23, 2026","time":"06:00","home":"Norway","away":"Senegal","hf":"🇳🇴","af":"🇸🇳"},{"n":42,"day":"Tue","date":"Jun 23, 2026","time":"02:00","home":"France","away":"Iraq","hf":"🇫🇷","af":"🇮🇶"},{"n":43,"day":"Mon","date":"Jun 22, 2026","time":"23:00","home":"Argentina","away":"Austria","hf":"🇦🇷","af":"🇦🇹"},{"n":44,"day":"Tue","date":"Jun 23, 2026","time":"09:00","home":"Jordan","away":"Algeria","hf":"🇯🇴","af":"🇩🇿"},{"n":45,"day":"Wed","date":"Jun 24, 2026","time":"02:00","home":"England","away":"Ghana","hf":"🏴","af":"🇬🇭"},{"n":46,"day":"Wed","date":"Jun 24, 2026","time":"05:00","home":"Panama","away":"Croatia","hf":"🇵🇦","af":"🇭🇷"},{"n":47,"day":"Tue","date":"Jun 23, 2026","time":"23:00","home":"Portugal","away":"Uzbekistan","hf":"🇵🇹","af":"🇺🇿"},{"n":48,"day":"Wed","date":"Jun 24, 2026","time":"08:00","home":"Colombia","away":"DR Congo","hf":"🇨🇴","af":"🇨🇩"},{"n":49,"day":"Thu","date":"Jun 25, 2026","time":"04:00","home":"Scotland","away":"Brazil","hf":"🏴","af":"🇧🇷"},{"n":50,"day":"Thu","date":"Jun 25, 2026","time":"04:00","home":"Morocco","away":"Haiti","hf":"🇲🇦","af":"🇭🇹"},{"n":51,"day":"Thu","date":"Jun 25, 2026","time":"01:00","home":"Switzerland","away":"Canada","hf":"🇨🇭","af":"🇨🇦"},{"n":52,"day":"Thu","date":"Jun 25, 2026","time":"01:00","home":"Bosnia and Herzegovina","away":"Qatar","hf":"🇧🇦","af":"🇶🇦"},{"n":53,"day":"Thu","date":"Jun 25, 2026","time":"07:00","home":"Czech Republic","away":"Mexico","hf":"🇨🇿","af":"🇲🇽"},{"n":54,"day":"Thu","date":"Jun 25, 2026","time":"07:00","home":"South Africa","away":"Korea Republic","hf":"🇿🇦","af":"🇰🇷"},{"n":55,"day":"Fri","date":"Jun 26, 2026","time":"02:00","home":"Curaçao","away":"Ivory Coast","hf":"🇨🇼","af":"🇨🇮"},{"n":56,"day":"Fri","date":"Jun 26, 2026","time":"02:00","home":"Ecuador","away":"Germany","hf":"🇪🇨","af":"🇩🇪"},{"n":57,"day":"Fri","date":"Jun 26, 2026","time":"05:00","home":"Japan","away":"Sweden","hf":"🇯🇵","af":"🇸🇪"},{"n":58,"day":"Fri","date":"Jun 26, 2026","time":"05:00","home":"Tunisia","away":"Netherlands","hf":"🇹🇳","af":"🇳🇱"},{"n":59,"day":"Fri","date":"Jun 26, 2026","time":"08:00","home":"Turkey","away":"United States","hf":"🇹🇷","af":"🇺🇸"},{"n":60,"day":"Fri","date":"Jun 26, 2026","time":"08:00","home":"Paraguay","away":"Australia","hf":"🇵🇾","af":"🇦🇺"},{"n":61,"day":"Sat","date":"Jun 27, 2026","time":"01:00","home":"Norway","away":"France","hf":"🇳🇴","af":"🇫🇷"},{"n":62,"day":"Sat","date":"Jun 27, 2026","time":"01:00","home":"Senegal","away":"Iraq","hf":"🇸🇳","af":"🇮🇶"},{"n":63,"day":"Sat","date":"Jun 27, 2026","time":"09:00","home":"Egypt","away":"Iran","hf":"🇪🇬","af":"🇮🇷"},{"n":64,"day":"Sat","date":"Jun 27, 2026","time":"09:00","home":"New Zealand","away":"Belgium","hf":"🇳🇿","af":"🇧🇪"},{"n":65,"day":"Sat","date":"Jun 27, 2026","time":"06:00","home":"Cape Verde","away":"Saudi Arabia","hf":"🇨🇻","af":"🇸🇦"},{"n":66,"day":"Sat","date":"Jun 27, 2026","time":"06:00","home":"Uruguay","away":"Spain","hf":"🇺🇾","af":"🇪🇸"},{"n":67,"day":"Sun","date":"Jun 28, 2026","time":"03:00","home":"Panama","away":"England","hf":"🇵🇦","af":"🏴"},{"n":68,"day":"Sun","date":"Jun 28, 2026","time":"03:00","home":"Croatia","away":"Ghana","hf":"🇭🇷","af":"🇬🇭"},{"n":69,"day":"Sun","date":"Jun 28, 2026","time":"08:00","home":"Algeria","away":"Austria","hf":"🇩🇿","af":"🇦🇹"},{"n":70,"day":"Sun","date":"Jun 28, 2026","time":"08:00","home":"Jordan","away":"Argentina","hf":"🇯🇴","af":"🇦🇷"},{"n":71,"day":"Sun","date":"Jun 28, 2026","time":"05:30","home":"Colombia","away":"Portugal","hf":"🇨🇴","af":"🇵🇹"},{"n":72,"day":"Sun","date":"Jun 28, 2026","time":"05:30","home":"DR Congo","away":"Uzbekistan","hf":"🇨🇩","af":"🇺🇿"}];

const RULES = { min: 200, max: 1000, minCategories: 2, currency: "Coins" };

/* ---------- helpers ---------- */
const toDecimal = (frac) => {
  if (typeof frac === "number") return frac + 1;
  const [a, b] = String(frac).split("/").map(Number);
  return b ? 1 + a / b : 2;
};
const money = (n) => `${Math.round(n).toLocaleString()} Coins`;

/* ---------- wallet accounting ---------- */
// Bonus tiers applied to each deposit amount:
//   = 10,000           → 10%
//   > 10,000 & < 15,000 → 12%
//   ≥ 15,000 & < 20,000 → 15%
//   ≥ 20,000           → 20%
//   < 10,000           → 0%
function bonusPct(amount) {
  if (amount >= 20000) return 20;
  if (amount >= 15000) return 15;
  if (amount > 10000) return 12;
  if (amount === 10000) return 10;
  return 0;
}
// deposit + bonus credited by admin; every stake leaves the balance; won picks return their payout.
function walletOf(profile, myBets) {
  const deposit = Number(profile?.deposit || 0);
  const bonus = Number(profile?.bonus || 0);
  let inBets = 0, won = 0, lost = 0, staked = 0;
  (myBets || []).forEach((b) => {
    staked += b.totalStake;
    if (b.status === "open") inBets += b.totalStake;
    else if (b.status === "won") won += b.payout || 0;
    else if (b.status === "lost") lost += b.totalStake;
  });
  const net = deposit + bonus - staked + won; // current spendable balance
  return { deposit, bonus, inBets, won, lost, net };
}
const uid = () => Math.random().toString(36).slice(2, 9);
const betCode = () => "WC2026-" + Math.floor(100000 + Math.random() * 899999);

/* ---------- match timing & lock (picks close 15 min before kickoff) ---------- */
const LOCK_MIN = 15;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
function kickoffMs(m) {
  // m.date "Jun 12, 2026", m.time "01:00" — fixtures are in GMT+6 (Dhaka)
  const [mon, day, year] = m.date.replace(",", "").split(/\s+/);
  const mm = String((MONTHS[mon] ?? 0) + 1).padStart(2, "0");
  const dd = String(parseInt(day, 10)).padStart(2, "0");
  return new Date(`${year}-${mm}-${dd}T${m.time}:00+06:00`).getTime();
}
const lockMs = (m) => kickoffMs(m) - LOCK_MIN * 60 * 1000;
const isLocked = (m, now = Date.now()) => now >= lockMs(m);
function lockCountdown(m, now = Date.now()) {
  const diff = lockMs(m) - now;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3.6e6), mn = Math.floor((diff % 3.6e6) / 6e4);
  return h > 0 ? `${h}h ${mn}m` : `${mn}m`;
}

/* ---------- data access (Supabase; shared across all users) ---------- */
const db = {
  async fetchBets() {
    const { data, error } = await supabase.from("bets").select("*").order("placed_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((b) => ({
      id: b.id, code: b.code, user: b.nickname, userId: b.user_id, ts: b.placed_at,
      items: b.items, totalStake: Number(b.total_stake), potential: Number(b.potential),
      payout: Number(b.payout || 0), status: b.status,
    }));
  },
  async fetchResults() {
    const { data, error } = await supabase.from("results").select("*");
    if (error) throw error;
    const map = {};
    (data || []).forEach((r) => { map[r.match_no] = r.payload; });
    return map;
  },
  async insertBet(bet, userId) {
    const { error } = await supabase.from("bets").insert({
      user_id: userId, nickname: bet.user, code: bet.code, items: bet.items,
      total_stake: bet.totalStake, potential: bet.potential, status: "open",
    });
    if (error) throw error;
  },
  async upsertResult(matchNo, payload, userId) {
    const { error } = await supabase.from("results")
      .upsert({ match_no: matchNo, payload, settled_by: userId, settled_at: new Date().toISOString() });
    if (error) throw error;
  },
  async updateBet(id, patch) {
    const { error } = await supabase.from("bets").update(patch).eq("id", id);
    if (error) throw error;
  },
  async fetchConfigs() {
    const { data, error } = await supabase.from("match_config").select("*");
    if (error) throw error;
    const map = {};
    (data || []).forEach((c) => { map[c.match_no] = c.config; });
    return map;
  },
  async saveConfig(matchNo, config, userId) {
    const { error } = await supabase.from("match_config")
      .upsert({ match_no: matchNo, config, updated_by: userId, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
  async fetchProfiles() {
    const { data, error } = await supabase.from("profiles").select("id,nickname,full_name,is_admin,deposit,bonus");
    if (error) throw error;
    return data || [];
  },
  async creditPlayer(id, deposit, bonus) {
    const { error } = await supabase.from("profiles").update({ deposit, bonus }).eq("id", id);
    if (error) throw error;
  },
  async fetchTransactions() {
    const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async addTransaction(t, userId) {
    const { error } = await supabase.from("transactions")
      .insert({ user_id: t.user_id, nickname: t.nickname, deposit: t.deposit, bonus: t.bonus, created_by: userId });
    if (error) throw error;
  },
};

/* ---------- Market template (the FIFA WC prediction sheet, generalized) ---------- */
function defaultPlayers(team, side) {
  const base = side === "home"
    ? [["Striker", "3/1", "1/1"], ["Forward", "7/2", "6/4"], ["Midfielder", "5/1", "2/1"], ["Winger", "6/1", "3/1"]]
    : [["Striker", "4/1", "2/1"], ["Forward", "9/2", "5/2"], ["Midfielder", "6/1", "3/1"], ["Winger", "8/1", "4/1"]];
  return base.map(([role, f, a]) => ({ name: `${team} · ${role}`, first: f, any: a }));
}

function buildMarkets(m, cfg = {}) {
  const H = m.home, A = m.away;
  const sel = (id, label, oddsStr, meta = {}) => ({ id, label, oddsStr, odds: toDecimal(oddsStr), meta });

  const homeP = cfg?.players?.home?.length ? cfg.players.home : defaultPlayers(H, "home");
  const awayP = cfg?.players?.away?.length ? cfg.players.away : defaultPlayers(A, "away");
  const scorerSel = (kind) => [
    ...homeP.map((p, i) => sel("h" + kind[0] + i, p.name, kind === "first" ? (p.first || "10/1") : (p.any || "4/1"), { scorer: p.name, order: kind })),
    ...awayP.map((p, i) => sel("a" + kind[0] + i, p.name, kind === "first" ? (p.first || "10/1") : (p.any || "4/1"), { scorer: p.name, order: kind })),
    sel(kind[0] + "o", "Other Player", kind === "first" ? "12/1" : "8/1", { scorer: "__OTHER__", order: kind }),
  ];

  const markets = [
    { key: "match_result", title: "Match Result", mode: "single", icon: "🏆",
      selections: [
        sel("h", `${H} Win`, "2/1", { res: "H" }),
        sel("d", "Draw", "9/4", { res: "D" }),
        sel("a", `${A} Win`, "5/2", { res: "A" }),
      ] },
    { key: "specials", title: "Match Specials", mode: "multi", icon: "✨",
      selections: [
        sel("cs", "Clean Sheet (either team)", "6/4", { flag: "cleanSheet" }),
        sel("wfb", "Win From Behind", "5/1", { flag: "winFromBehind" }),
        sel("bh", "Team Scores in Both Halves", "3/1", { flag: "bothHalves" }),
      ] },
    { key: "first_scorer", title: "First Goal Scorer", mode: "multi", icon: "🥇", searchable: true, selections: scorerSel("first") },
    { key: "anytime_scorer", title: "Anytime Goal Scorer", mode: "multi", icon: "⚽", searchable: true, selections: scorerSel("any") },
    { key: "ht_score", title: "Half-Time Correct Score", mode: "multi", icon: "⏱️",
      selections: [
        sel("h10", `${H} 1-0`, "1/1", { ht: "1-0" }), sel("h20", `${H} 2-0`, "3/1", { ht: "2-0" }),
        sel("h21", `${H} 2-1`, "10/1", { ht: "2-1" }), sel("hd00", "Draw 0-0", "2/1", { ht: "0-0" }),
        sel("hd11", "Draw 1-1", "4/1", { ht: "1-1" }), sel("ha10", `${A} 1-0`, "5/2", { ht: "0-1" }),
        sel("ha20", `${A} 2-0`, "12/1", { ht: "0-2" }), sel("hot", "Other Score", "30/1", { ht: "__OTHER__" }),
      ] },
    { key: "ft_score", title: "Full-Time Correct Score", mode: "multi", icon: "🎯",
      selections: [
        sel("f10", `${H} 1-0`, "4/1", { ft: "1-0" }), sel("f20", `${H} 2-0`, "5/1", { ft: "2-0" }),
        sel("f21", `${H} 2-1`, "6/1", { ft: "2-1" }), sel("f31", `${H} 3-1`, "10/1", { ft: "3-1" }),
        sel("fd00", "Draw 0-0", "7/1", { ft: "0-0" }), sel("fd11", "Draw 1-1", "5/1", { ft: "1-1" }),
        sel("fd22", "Draw 2-2", "12/1", { ft: "2-2" }), sel("fa10", `${A} 1-0`, "6/1", { ft: "0-1" }),
        sel("fa21", `${A} 2-1`, "10/1", { ft: "1-2" }), sel("fot", "Any Other Score", "25/1", { ft: "__OTHER__" }),
      ] },
    { key: "total_goals", title: "Total Goals", mode: "multi", icon: "🔢",
      selections: [
        sel("ng", "No Goal", "8/1", { tg: { eq: 0 } }), sel("e1", "Exactly 1", "3/1", { tg: { eq: 1 } }),
        sel("e2", "Exactly 2", "3/1", { tg: { eq: 2 } }), sel("e3", "Exactly 3", "4/1", { tg: { eq: 3 } }),
        sel("u15", "Under 1.5", "2/1", { tg: { lt: 1.5 } }), sel("u25", "Under 2.5", "6/4", { tg: { lt: 2.5 } }),
        sel("o15", "Over 1.5", "4/6", { tg: { gt: 1.5 } }), sel("o25", "Over 2.5", "5/4", { tg: { gt: 2.5 } }),
        sel("o35", "Over 3.5", "3/1", { tg: { gt: 3.5 } }),
      ] },
    { key: "first_goal_time", title: "Time of First Goal", mode: "single", icon: "🕐",
      selections: [
        sel("t1", "1–15 min", "2/1", { gt: [1, 15] }), sel("t2", "16–30 min", "2/1", { gt: [16, 30] }),
        sel("t3", "31 – Half Time", "3/1", { gt: [31, 45] }), sel("t4", "46–60 min", "5/1", { gt: [46, 60] }),
        sel("t5", "61–75 min", "7/1", { gt: [61, 75] }), sel("t6", "76 – Full Time", "9/1", { gt: [76, 120] }),
        sel("t0", "No Goal", "10/1", { gt: "none" }),
      ] },
    { key: "first_goal_method", title: "Method of First Goal", mode: "single", icon: "🦶",
      selections: [
        sel("rf", "Right Foot", "1/1", { gm: "rf" }), sel("lf", "Left Foot", "2/1", { gm: "lf" }),
        sel("hd", "Header", "3/1", { gm: "head" }), sel("og", "Own Goal", "6/1", { gm: "og" }),
      ] },
    { key: "total_cards", title: "Total Cards", mode: "single", icon: "🟨",
      selections: [
        sel("c0", "No Cards", "6/1", { c: { eq: 0 } }), sel("c1", "1 Card", "4/1", { c: { eq: 1 } }),
        sel("c2", "2 Cards", "3/1", { c: { eq: 2 } }), sel("c3", "3 Cards", "1/1", { c: { eq: 3 } }),
        sel("c4", "4 Cards", "2/1", { c: { eq: 4 } }), sel("c5", "5 Cards", "4/1", { c: { eq: 5 } }),
        sel("c6", "6 Cards", "6/1", { c: { eq: 6 } }), sel("c8", "More than 7", "10/1", { c: { gt: 7 } }),
      ] },
    { key: "own_goal", title: "Own Goal in Match", mode: "single", icon: "🥅",
      selections: [
        sel("oy", "Yes", "9/1", { owngoal: true }), sel("on", "No", "1/6", { owngoal: false }),
      ] },
  ];

  // apply admin odds overrides for the fixed markets
  if (cfg?.odds) for (const mk of markets) for (const s of mk.selections) {
    const o = cfg.odds[mk.key]?.[s.id];
    if (o) { s.oddsStr = o; s.odds = toDecimal(o); }
  }
  return markets;
}

// names the admin has listed for a match — used so "Other Player" settles correctly
function knownScorerNames(m, cfg = {}) {
  return buildMarkets(m, cfg)
    .find((x) => x.key === "anytime_scorer").selections
    .filter((s) => s.meta.scorer !== "__OTHER__")
    .map((s) => s.meta.scorer.trim().toLowerCase());
}

/* ---------- settlement engine ---------- */
function evaluateItem(item, R) {
  const { marketKey, meta } = item;
  const ftH = R.ft?.h, ftA = R.ft?.a, htH = R.ht?.h, htA = R.ht?.a;
  const total = (ftH ?? 0) + (ftA ?? 0);
  switch (marketKey) {
    case "match_result": {
      const r = ftH > ftA ? "H" : ftH < ftA ? "A" : "D";
      return meta.res === r;
    }
    case "specials":
      return !!R[meta.flag];
    case "first_scorer": {
      const first = (R.scorers?.[0] || "").trim().toLowerCase();
      const known = R.knownScorers || [];
      if (meta.scorer === "__OTHER__") return !!first && !known.includes(first);
      return first === stripPlayer(meta.scorer);
    }
    case "anytime_scorer": {
      const all = (R.scorers || []).map((s) => s.trim().toLowerCase());
      const known = R.knownScorers || [];
      if (meta.scorer === "__OTHER__") return all.some((s) => s && !known.includes(s));
      return all.includes(stripPlayer(meta.scorer));
    }
    case "ht_score": {
      const s = `${htH}-${htA}`;
      if (meta.ht === "__OTHER__") return ![ "1-0","2-0","2-1","0-0","1-1","0-1","0-2" ].includes(s);
      return meta.ht === s;
    }
    case "ft_score": {
      const s = `${ftH}-${ftA}`;
      if (meta.ft === "__OTHER__") return ![ "1-0","2-0","2-1","3-1","0-0","1-1","2-2","0-1","1-2" ].includes(s);
      return meta.ft === s;
    }
    case "total_goals": {
      const t = meta.tg;
      if (t.eq !== undefined) return total === t.eq;
      if (t.lt !== undefined) return total < t.lt;
      if (t.gt !== undefined) return total > t.gt;
      return false;
    }
    case "first_goal_time": {
      if (meta.gt === "none") return total === 0;
      if (total === 0) return false;
      const min = R.firstGoalMinute;
      return min >= meta.gt[0] && min <= meta.gt[1];
    }
    case "first_goal_method":
      return R.firstGoalMethod === meta.gm;
    case "total_cards": {
      const c = meta.c, cards = R.totalCards ?? 0;
      if (c.eq !== undefined) return cards === c.eq;
      if (c.gt !== undefined) return cards > c.gt;
      return false;
    }
    case "own_goal":
      return meta.owngoal === !!R.ownGoal;
    default:
      return false;
  }
}
const stripPlayer = (p) => p.trim().toLowerCase();

/* ---------- exports (CSV for Excel, print-to-PDF) ---------- */
const matchName = (id) => { const m = FIXTURES.find((f) => f.n === id); return m ? `${m.home} v ${m.away}` : `Match ${id}`; };
const fmtN = (n) => Math.round(n).toLocaleString();

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportPicksCSV(bets, filename) {
  const head = ["Player", "Slip ID", "Placed", "Match", "Category", "Selection", "Odds", "Stake (Coins)", "Pick Result", "Slip Status", "Slip Payout (Coins)"];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(",")];
  bets.forEach((b) => b.items.forEach((it) => {
    lines.push([b.user, b.code, new Date(b.ts).toLocaleString(), matchName(it.matchId), it.marketTitle,
      it.label, it.oddsStr, it.stake, it.status, b.status, b.payout || 0].map(esc).join(","));
  }));
  downloadFile(filename, "\ufeff" + lines.join("\n"), "text/csv;charset=utf-8");
}

function picksHTML(bets, title, byPlayer) {
  const groups = {};
  if (byPlayer) bets.forEach((b) => (groups[b.user] ||= []).push(b));
  else groups._ = bets;
  let body = "";
  Object.entries(groups).forEach(([player, pbets]) => {
    if (byPlayer) body += `<h2>${player}</h2>`;
    const byMatch = {};
    pbets.forEach((b) => b.items.forEach((it) => (byMatch[it.matchId] ||= []).push(it)));
    const ids = Object.keys(byMatch).sort((a, b) => a - b);
    if (!ids.length) { body += `<p class="empty">No picks.</p>`; return; }
    ids.forEach((mid) => {
      body += `<h3>${matchName(+mid)}</h3><table><thead><tr><th>Category</th><th>Selection</th><th>Odds</th><th>Stake</th><th>Result</th></tr></thead><tbody>`;
      byMatch[mid].forEach((it) => {
        body += `<tr><td>${it.marketTitle}</td><td>${it.label}</td><td>${it.oddsStr}</td><td>${fmtN(it.stake)}</td><td class="s-${it.status}">${it.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    });
  });
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#13211c;padding:22px;max-width:820px;margin:auto}
    h1{font-size:19px;margin:0 0 3px;color:#0b3d2e}
    .sub{color:#6b7a74;font-size:11px;margin-bottom:14px}
    h2{font-size:15px;margin:18px 0 6px;color:#0e7c5a;border-bottom:2px solid #0e7c5a;padding-bottom:3px}
    h3{font-size:12.5px;margin:11px 0 3px;color:#0b3d2e}
    table{width:100%;border-collapse:collapse;margin-bottom:6px;font-size:11px}
    th{background:#0b3d2e;color:#fff;text-align:left;padding:5px 7px}
    td{border-bottom:1px solid #e2e8e4;padding:4px 7px}
    .s-won{color:#0e7c5a;font-weight:700}.s-lost{color:#c0392b}.empty{color:#6b7a74;font-size:11px}
    @media print{@page{margin:12mm}}
  </style></head><body>
    <h1>🏆 SGA · FIFA WC 2026 — ${title}</h1>
    <div class="sub">Generated ${new Date().toLocaleString()} · Coins are virtual · Play for fun</div>
    ${body || '<p class="empty">No picks yet.</p>'}
  </body></html>`;
}

function printPicks(bets, title, byPlayer) {
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups for this site to download the PDF, then try again."); return; }
  w.document.write(picksHTML(bets, title, byPlayer));
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 500);
}

/* ============================================================================
   UI
   ============================================================================ */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sora:wght@400;500;600;700;800&display=swap');
.font-display{font-family:'Bebas Neue',sans-serif;letter-spacing:.02em}
.font-body{font-family:'Sora',sans-serif}
`;

export default function App() {
  const [dark, setDark] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // {id, nickname, is_admin}
  const [authReady, setAuthReady] = useState(false);
  const [bets, setBets] = useState([]);
  const [results, setResults] = useState({});
  const [configs, setConfigs] = useState({}); // match_no -> { players, odds }
  const [players, setPlayers] = useState([]); // all profiles (for admin + wallet)
  const [txns, setTxns] = useState([]); // coin transactions (credits)
  const [tab, setTab] = useState("matches");
  const [activeMatch, setActiveMatch] = useState(null);
  const [slip, setSlip] = useState([]);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  const showToast = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  // auth session
  useEffect(() => {
    if (!hasSupabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // load profile for the signed-in user
  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(data || null);
    })();
  }, [session]);

  const refresh = useCallback(async () => {
    if (!hasSupabase || !session) return;
    try {
      const [b, r, c, ps, tx] = await Promise.all([db.fetchBets(), db.fetchResults(), db.fetchConfigs(), db.fetchProfiles(), db.fetchTransactions()]);
      setBets(b); setResults(r); setConfigs(c); setPlayers(ps); setTxns(tx);
      const mine = ps.find((p) => p.id === session.user.id);
      if (mine) setProfile((prev) => ({ ...prev, ...mine }));
    } catch (e) { console.error(e); }
  }, [session]);

  // initial load + realtime sync of shared data
  useEffect(() => {
    if (!session) return;
    refresh();
    const ch = supabase.channel("pool")
      .on("postgres_changes", { event: "*", schema: "public", table: "bets" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_config" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, refresh)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [session, refresh]);

  const placeBet = async (bet) => { await db.insertBet(bet, session.user.id); await refresh(); };
  const saveConfig = async (matchNo, config) => { await db.saveConfig(matchNo, config, session.user.id); await refresh(); };
  const creditPlayer = async (player, addDeposit, addBonus) => {
    await db.creditPlayer(player.id, Number(player.deposit || 0) + addDeposit, Number(player.bonus || 0) + addBonus);
    await db.addTransaction({ user_id: player.id, nickname: player.nickname, deposit: addDeposit, bonus: addBonus }, session.user.id);
    await refresh();
  };

  const settleMatch = async (matchNo, R0) => {
    const match = FIXTURES.find((f) => f.n === matchNo);
    const R = { ...R0, knownScorers: knownScorerNames(match, configs[matchNo]) };
    await db.upsertResult(matchNo, R, session.user.id);
    const affected = bets.filter((b) => b.status === "open" && b.items.some((it) => it.matchId === matchNo));
    for (const b of affected) {
      const items = b.items.map((it) => it.matchId === matchNo ? { ...it, status: evaluateItem(it, R) ? "won" : "lost" } : it);
      const decided = items.every((it) => it.status !== "open");
      let status = b.status, payout = b.payout;
      if (decided) {
        const lost = items.some((it) => it.status === "lost");
        status = lost ? "lost" : "won";
        payout = lost ? 0 : items.reduce((a, it) => a + it.stake * it.odds, 0);
      }
      await db.updateBet(b.id, { items, status, payout });
    }
    await refresh();
  };

  if (!hasSupabase) return <ConfigNeeded />;
  if (!authReady) return <Splash msg="Loading…" />;
  if (!session) return <Auth showToast={showToast} />;
  if (!profile) return <Splash msg="Setting up your profile…" />;

  const role = profile.is_admin ? "admin" : "player";
  const user = { nickname: profile.nickname, role };
  const myBets = bets.filter((b) => b.userId === session.user.id);
  const wallet = walletOf(profile, myBets);

  return (
    <div className={dark ? "dark" : ""}>
      <style>{FONTS}</style>
      <div className="font-body min-h-screen bg-[#070b0a] dark:bg-[#070b0a] text-stone-100 selection:bg-amber-400/30">
        <div className="bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(90%_50%_at_90%_0%,rgba(245,158,11,0.12),transparent)] min-h-screen">
          <Header user={user} dark={dark} setDark={setDark} onLogout={async () => { await supabase.auth.signOut(); setSlip([]); setTab("matches"); }} />

          <main className="mx-auto max-w-5xl px-4 pb-32 pt-4">
            {role === "admin" ? (
              <AdminPanel bets={bets} results={results} configs={configs} players={players} txns={txns} settleMatch={settleMatch} saveConfig={saveConfig} creditPlayer={creditPlayer} showToast={showToast} />
            ) : (
              <>
                {tab === "matches" && !activeMatch && <MatchList onOpen={setActiveMatch} results={results} now={now} />}
                {tab === "matches" && activeMatch && (
                  <MatchDetail match={activeMatch} config={configs[activeMatch.n]} onBack={() => setActiveMatch(null)} slip={slip} setSlip={setSlip} results={results} showToast={showToast} now={now} />
                )}
                {tab === "mybets" && <MyBets bets={myBets} wallet={wallet} nickname={profile.nickname} txns={txns} />}
                {tab === "board" && <Leaderboard bets={bets} me={profile.nickname} />}
              </>
            )}
          </main>

          {role === "player" && (
            <>
              <BetSlip slip={slip} setSlip={setSlip} user={user} placeBet={placeBet} available={wallet.net} showToast={showToast} setTab={setTab} setActiveMatch={setActiveMatch} />
              <BottomNav tab={tab} setTab={(t) => { setTab(t); setActiveMatch(null); }} slipCount={slip.length} />
            </>
          )}

          {toast && (
            <div className={`fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-2xl backdrop-blur ${toast.kind === "err" ? "bg-rose-500/90" : "bg-emerald-500/90"} text-black`}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Splash / Config ---------- */
const Shell = ({ children }) => (
  <div className="font-body min-h-screen bg-[#070b0a] text-stone-100">
    <style>{FONTS}</style>
    <div className="min-h-screen bg-[radial-gradient(120%_70%_at_50%_-10%,rgba(16,185,129,0.22),transparent)] flex items-center justify-center px-4">{children}</div>
  </div>
);
const Splash = ({ msg }) => <Shell><div className="text-sm text-emerald-300/80">{msg}</div></Shell>;
const ConfigNeeded = () => (
  <Shell>
    <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
      <h2 className="font-display text-3xl text-white">Almost there</h2>
      <p className="mt-2 text-sm text-stone-400">Add your Supabase keys to a <code className="text-emerald-300">.env</code> file, then redeploy:</p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-black/40 p-3 text-left text-[11px] text-stone-300">VITE_SUPABASE_URL=...{"\n"}VITE_SUPABASE_ANON_KEY=...</pre>
      <p className="mt-2 text-[11px] text-stone-500">See SETUP.md for the 5-minute walkthrough.</p>
    </div>
  </Shell>
);

/* ---------- Login ---------- */
function Auth({ showToast }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [full, setFull] = useState("");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const submit = async () => {
    setBusy(true); setNote("");
    try {
      if (mode === "signup") {
        if (!nick.trim()) throw new Error("Pick a nickname");
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pw });
        if (error) throw error;
        if (data.session && data.user) {
          const { error: pErr } = await supabase.from("profiles")
            .insert({ id: data.user.id, full_name: full || nick, nickname: nick.trim() });
          if (pErr) throw new Error(pErr.message.includes("duplicate") ? "That nickname is taken" : pErr.message);
        } else {
          setNote("Account created. Check your email to confirm, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) throw error;
      }
    } catch (e) { showToast(e.message || "Something went wrong", "err"); }
    finally { setBusy(false); }
  };

  return (
    <Shell>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 shadow-[0_0_40px_-5px_rgba(16,185,129,0.6)]">
            <Trophy className="h-8 w-8 text-black" />
          </div>
          <h1 className="font-display text-5xl text-white">SGA · FIFA WC 2026</h1>
          <p className="mt-1 text-sm text-emerald-300/80">Private World Cup Prediction Pool</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-black/30 p-1">
            {[["signin", "Sign In"], ["signup", "Create Account"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setMode(k); setNote(""); }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === k ? "bg-gradient-to-r from-amber-400 to-emerald-400 text-black" : "text-stone-400"}`}>{lbl}</button>
            ))}
          </div>
          <div className="space-y-3">
            {mode === "signup" && <>
              <Field label="Full Name" v={full} set={setFull} ph="Md. Rahman" />
              <Field label="Nickname (shown on leaderboard)" v={nick} set={setNick} ph="Tiger" />
            </>}
            <Field label="Email" v={email} set={setEmail} ph="you@email.com" type="email" />
            <Field label="Password" v={pw} set={setPw} ph="••••••••" type="password" />
          </div>
          <button disabled={busy || !email || !pw} onClick={submit}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black transition enabled:hover:brightness-110 disabled:opacity-40">
            {busy ? "Please wait…" : mode === "signup" ? "Create Account & Enter" : "Sign In"}
          </button>
          {note && <p className="mt-3 text-center text-[11px] text-emerald-300/80">{note}</p>}
        </div>
        <p className="mt-4 text-center text-[11px] text-stone-600">
          For a private group of friends · {money(RULES.min)}–{money(RULES.max)} per pick · Play for fun
        </p>
      </div>
    </Shell>
  );
}
const Field = ({ label, v, set, ph, type = "text" }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-stone-400">{label}</span>
    <input value={v} onChange={(e) => set(e.target.value)} placeholder={ph} type={type}
      className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-600 focus:border-emerald-400/60" />
  </label>
);

/* ---------- Header ---------- */
function Header({ user, dark, setDark, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500">
            <Trophy className="h-5 w-5 text-black" />
          </div>
          <div className="leading-none">
            <div className="font-display text-2xl text-white">SGA WC 2026</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
              {user.role === "admin" ? "Admin Console" : "Prediction Pool"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-300 sm:block">
            {user.role === "admin" ? "🛡️ Admin" : "👤 " + user.nickname}
          </span>
          <button onClick={() => setDark(!dark)} className="rounded-lg bg-white/5 p-2 text-stone-300 hover:bg-white/10">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={onLogout} className="rounded-lg bg-white/5 p-2 text-stone-300 hover:bg-rose-500/20 hover:text-rose-300">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Match list ---------- */
function MatchList({ onOpen, results, now }) {
  const [q, setQ] = useState("");
  const grouped = useMemo(() => {
    const f = FIXTURES.filter((m) => (m.home + m.away).toLowerCase().includes(q.toLowerCase()));
    const g = {};
    f.forEach((m) => { (g[m.date] ||= []).push(m); });
    return g;
  }, [q]);

  return (
    <div>
      <SectionTitle icon={<Calendar className="h-5 w-5" />} title="Group Stage Fixtures" sub="72 matches · times in GMT+6 (Dhaka)" />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a team…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>
      <div className="space-y-5">
        {Object.entries(grouped).map(([date, ms]) => (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-400/70">
              <span className="h-px flex-1 bg-white/5" />{date}<span className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ms.map((m) => {
                const settled = results[m.n];
                const locked = !settled && isLocked(m, now);
                const closing = !settled && !locked ? lockCountdown(m, now) : null;
                return (
                  <button key={m.n} onClick={() => onOpen(m)}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition hover:border-emerald-400/40 hover:bg-white/[0.06]">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2 text-[11px] text-stone-500">
                        <Clock className="h-3 w-3" /> {m.day} · {m.time}
                        {settled && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">SETTLED {settled.ft.h}–{settled.ft.a}</span>}
                        {locked && <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300">🔒 LOCKED</span>}
                        {closing && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-semibold text-amber-300">closes in {closing}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-lg">{m.hf}</span><span className="truncate">{m.home}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                        <span className="text-lg">{m.af}</span><span className="truncate">{m.away}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-stone-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Match detail (markets) ---------- */
function MatchDetail({ match, config, onBack, slip, setSlip, results, showToast, now }) {
  const markets = useMemo(() => buildMarkets(match, config), [match, config]);
  const settled = results[match.n];
  const locked = isLocked(match, now);
  const closing = !settled && !locked ? lockCountdown(match, now) : null;
  const inSlip = (selId) => slip.some((s) => s.matchId === match.n && s.selId === selId);

  const toggle = (mk, s) => {
    if (settled) { showToast("This match is already settled", "err"); return; }
    if (locked) { showToast("Picks are closed for this match", "err"); return; }
    setSlip((prev) => {
      const exists = prev.find((x) => x.matchId === match.n && x.selId === s.id);
      if (exists) return prev.filter((x) => !(x.matchId === match.n && x.selId === s.id));
      let next = prev;
      if (mk.mode === "single") next = prev.filter((x) => !(x.matchId === match.n && x.marketKey === mk.key));
      return [...next, {
        matchId: match.n, match: `${match.home} v ${match.away}`, marketKey: mk.key, marketTitle: mk.title,
        selId: s.id, label: s.label, odds: s.odds, oddsStr: s.oddsStr, meta: s.meta, stake: RULES.min,
      }];
    });
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-emerald-300">
        <ChevronLeft className="h-4 w-4" /> Fixtures
      </button>
      <div className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-amber-500/5 p-5">
        <div className="flex items-center justify-around">
          <Team flag={match.hf} name={match.home} />
          <div className="text-center">
            <div className="font-display text-3xl text-amber-300">VS</div>
            <div className="mt-1 text-[11px] text-stone-400">{match.day} {match.date}</div>
            <div className="text-[11px] text-stone-400">Kickoff {match.time} (GMT+6) · picks close {LOCK_MIN} min before</div>
          </div>
          <Team flag={match.af} name={match.away} />
        </div>
        {settled ? (
          <div className="mt-4 rounded-xl bg-black/30 p-3 text-center text-sm">
            <span className="font-semibold text-emerald-300">Final: {match.home} {settled.ft.h}–{settled.ft.a} {match.away}</span>
          </div>
        ) : locked ? (
          <div className="mt-4 rounded-xl bg-rose-500/15 p-3 text-center text-sm font-semibold text-rose-300">🔒 Picks are closed for this match</div>
        ) : closing ? (
          <div className="mt-4 rounded-xl bg-amber-500/15 p-3 text-center text-sm font-semibold text-amber-300">Picks close in {closing}</div>
        ) : null}
      </div>

      <div className="space-y-3">
        {markets.map((mk) => (
          <MarketCard key={mk.key} mk={mk} inSlip={inSlip} toggle={toggle} disabled={!!settled || locked} />
        ))}
      </div>
    </div>
  );
}
const Team = ({ flag, name }) => (
  <div className="flex w-24 flex-col items-center gap-1.5 text-center">
    <span className="text-4xl">{flag}</span>
    <span className="text-xs font-semibold leading-tight">{name}</span>
  </div>
);

function MarketCard({ mk, inSlip, toggle, disabled }) {
  const [open, setOpen] = useState(["match_result", "total_goals"].includes(mk.key));
  const [q, setQ] = useState("");
  const sels = mk.searchable && q ? mk.selections.filter((s) => s.label.toLowerCase().includes(q.toLowerCase())) : mk.selections;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="text-base">{mk.icon}</span>{mk.title}
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${mk.mode === "single" ? "bg-sky-500/20 text-sky-300" : "bg-violet-500/20 text-violet-300"}`}>
            {mk.mode === "single" ? "Pick 1" : "Multi"}
          </span>
        </span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/5 p-3">
          {mk.searchable && (
            <div className="relative mb-2.5">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search player…"
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-8 pr-2 text-xs outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
            </div>
          )}
          <div className={`grid gap-2 ${mk.searchable || mk.key.includes("score") ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {sels.map((s) => {
              const on = inSlip(s.id);
              return (
                <button key={s.id} disabled={disabled} onClick={() => toggle(mk, s)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition disabled:opacity-40 ${on ? "border-amber-400 bg-amber-400/15" : "border-white/10 bg-black/20 hover:border-emerald-400/40"}`}>
                  <span className="min-w-0 flex-1 truncate font-medium">{s.label}</span>
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-bold tabular-nums ${on ? "bg-amber-400 text-black" : "bg-white/10 text-emerald-300"}`}>{s.oddsStr}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Pick slip ---------- */
function BetSlip({ slip, setSlip, user, placeBet, available, showToast, setTab, setActiveMatch }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [busy, setBusy] = useState(false);

  const setStake = (selId, matchId, v) =>
    setSlip((p) => p.map((x) => (x.selId === selId && x.matchId === matchId ? { ...x, stake: Math.max(0, +v || 0) } : x)));
  const remove = (selId, matchId) => setSlip((p) => p.filter((x) => !(x.selId === selId && x.matchId === matchId)));

  const totalStake = slip.reduce((a, s) => a + s.stake, 0);
  const potential = slip.reduce((a, s) => a + s.stake * s.odds, 0);
  const categories = new Set(slip.map((s) => s.marketKey)).size;

  const validate = () => {
    if (slip.length === 0) return "Your slip is empty";
    if (categories < RULES.minCategories) return `Pick at least ${RULES.minCategories} categories`;
    for (const s of slip) {
      if (s.stake < RULES.min) return `Min stake is ${money(RULES.min)} per selection`;
      if (s.stake > RULES.max) return `Max stake is ${money(RULES.max)} per selection`;
    }
    const lockedMatch = [...new Set(slip.map((s) => s.matchId))]
      .map((id) => FIXTURES.find((f) => f.n === id))
      .find((f) => f && isLocked(f));
    if (lockedMatch) return `Picks closed for ${lockedMatch.home} v ${lockedMatch.away} — remove it to continue`;
    if (totalStake > available) return `Not enough Coins — you have ${money(available)}. Ask the admin to add more.`;
    return null;
  };

  const place = async () => {
    const err = validate();
    if (err) { showToast(err, "err"); return; }
    const bet = {
      id: uid(), code: betCode(), user: user.nickname, ts: new Date().toISOString(),
      items: slip.map((s) => ({ ...s, status: "open" })), totalStake, potential, status: "open",
    };
    setBusy(true);
    try { await placeBet(bet); setPlaced(bet); setConfirm(false); setSlip([]); }
    catch (e) { showToast(e.message || "Could not submit picks", "err"); }
    finally { setBusy(false); }
  };

  if (placed) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={() => { setPlaced(null); setOpen(false); setTab("mybets"); }}>
        <div className="w-full max-w-sm rounded-3xl border border-emerald-400/30 bg-[#0a1311] p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"><Lock className="h-7 w-7 text-emerald-400" /></div>
          <h3 className="font-display text-3xl text-white">Picks Locked</h3>
          <p className="mt-1 text-sm text-stone-400">Your slip is confirmed and can no longer be edited.</p>
          <div className="mt-4 space-y-1 rounded-xl bg-black/30 p-4 text-left text-sm">
            <Row k="Slip ID" v={placed.code} mono />
            <Row k="Selections" v={placed.items.length} />
            <Row k="Total Stake" v={money(placed.totalStake)} />
            <Row k="Potential Return" v={money(placed.potential)} hi />
            <Row k="Placed" v={new Date(placed.ts).toLocaleString()} />
          </div>
          <button onClick={() => { setPlaced(null); setOpen(false); setActiveMatch(null); setTab("mybets"); }}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black">View My Picks</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {slip.length > 0 && !open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-5 py-3 font-bold text-black shadow-2xl">
          <Ticket className="h-4 w-4" /> Pick Slip · {slip.length} · {money(totalStake)}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a1311] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-2xl text-white"><Receipt className="h-5 w-5 text-amber-400" /> My Pick Slip</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg bg-white/5 p-1.5"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[44vh] space-y-2 overflow-y-auto p-4">
              {slip.length === 0 && <p className="py-8 text-center text-sm text-stone-500">Empty. Tap odds on a match to add selections.</p>}
              {slip.map((s) => (
                <div key={s.matchId + s.selId} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-emerald-400/70">{s.marketTitle} · {s.match}</div>
                      <div className="truncate text-sm font-semibold">{s.label}</div>
                    </div>
                    <button onClick={() => remove(s.selId, s.matchId)} className="rounded p-1 text-stone-500 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-emerald-300">@ {s.oddsStr}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-stone-500">Stake</span>
                      <input type="number" value={s.stake} onChange={(e) => setStake(s.selId, s.matchId, e.target.value)}
                        className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-amber-400/60" />
                    </div>
                  </div>
                  <div className="mt-1.5 text-right text-[11px] text-stone-500">Returns {money(s.stake * s.odds)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 bg-black/20 p-4">
              <div className="mb-3 space-y-1 text-sm">
                <Row k="Categories" v={`${categories} / min ${RULES.minCategories}`} />
                <Row k="Available" v={money(available)} />
                <Row k="Total Stake" v={money(totalStake)} />
                <Row k="Potential Return" v={money(potential)} hi />
              </div>
              {!confirm ? (
                <button onClick={() => { const e = validate(); e ? showToast(e, "err") : setConfirm(true); }}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black">Review & Confirm Picks</button>
              ) : (
                <div className="space-y-2.5">
                  <label className="flex items-start gap-2 rounded-xl bg-amber-400/10 p-3 text-xs text-amber-100">
                    <input type="checkbox" id="cf" className="mt-0.5 accent-amber-400" />
                    <span>I confirm all selections are correct and understand picks cannot be edited after submission.</span>
                  </label>
                  <button disabled={busy} onClick={() => { const c = document.getElementById("cf"); c?.checked ? place() : showToast("Tick the confirmation box", "err"); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-black disabled:opacity-50"><Lock className="h-4 w-4" /> {busy ? "Submitting…" : "Submit Picks"}</button>
                  <button onClick={() => setConfirm(false)} className="w-full text-center text-xs text-stone-500">Back to edit</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
const Row = ({ k, v, hi, mono }) => (
  <div className="flex items-center justify-between">
    <span className="text-stone-400">{k}</span>
    <span className={`font-semibold ${mono ? "font-mono" : ""} ${hi ? "text-amber-300" : "text-white"}`}>{v}</span>
  </div>
);

/* ---------- My Picks + Wallet ---------- */
function MyBets({ bets, wallet, nickname, txns }) {
  const [f, setF] = useState("all");
  const [showHist, setShowHist] = useState(false);
  const filtered = bets.filter((b) => f === "all" || b.status === f);

  const ledger = useMemo(() => {
    const rows = [];
    (txns || []).forEach((t) => rows.push({
      date: t.created_at, kind: "credit", label: "Coins added by admin",
      sub: `Deposit ${fmtN(t.deposit)}${Number(t.bonus) ? ` + ${fmtN(t.bonus)} bonus` : ""}`,
      delta: Number(t.deposit) + Number(t.bonus),
    }));
    bets.forEach((b) => {
      rows.push({ date: b.ts, kind: "stake", label: `Pick ${b.code}`, sub: `${b.items.length} selections placed`, delta: -b.totalStake });
      if (b.status === "won") rows.push({ date: b.ts, kind: "win", label: `Won ${b.code}`, sub: "Returned to balance", delta: b.payout || 0 });
    });
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [txns, bets]);

  return (
    <div>
      <SectionTitle icon={<Wallet className="h-5 w-5" />} title="My Wallet" sub="Coins are virtual · provided by the admin" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label="Deposit" v={money(wallet.deposit)} />
        <Stat label="Bonus" v={money(wallet.bonus)} good />
        <Stat label="In Bets" v={money(wallet.inBets)} />
        <Stat label="Won" v={money(wallet.won)} good />
        <Stat label="Lost" v={money(wallet.lost)} />
        <Stat label="Net Balance" v={money(wallet.net)} good={wallet.net >= 0} />
      </div>

      <button onClick={() => setShowHist(!showHist)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-stone-300">
        <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-300" /> Transaction History ({ledger.length})</span>
        <ChevronRight className={`h-4 w-4 transition ${showHist ? "rotate-90" : ""}`} />
      </button>
      {showHist && (
        <div className="mb-4 space-y-1.5">
          {ledger.length === 0 && <p className="py-4 text-center text-xs text-stone-500">No transactions yet.</p>}
          {ledger.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className={`h-1.5 w-1.5 rounded-full ${r.kind === "credit" ? "bg-sky-400" : r.kind === "win" ? "bg-emerald-400" : "bg-stone-500"}`} />
                  {r.label}
                </div>
                <div className="text-[11px] text-stone-500">{r.sub} · {new Date(r.date).toLocaleString()}</div>
              </div>
              <div className={`shrink-0 text-sm font-bold tabular-nums ${r.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {r.delta >= 0 ? "+" : "−"}{fmtN(Math.abs(r.delta))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <SectionTitle icon={<Receipt className="h-5 w-5" />} title="My Picks" sub={`${bets.length} submitted`} />
        <button onClick={() => printPicks(bets, `${nickname} — My Picks`, false)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <Receipt className="h-3.5 w-3.5" /> Download PDF
        </button>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto">
        {["all", "open", "won", "lost"].map((k) => (
          <button key={k} onClick={() => setF(k)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${f === k ? "bg-amber-400 text-black" : "bg-white/5 text-stone-400"}`}>{k}</button>
        ))}
      </div>
      <div className="space-y-2.5">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No picks here yet.</p>}
        {filtered.map((b) => <BetCard key={b.id} b={b} />)}
      </div>
    </div>
  );
}
function BetCard({ b }) {
  const [open, setOpen] = useState(false);
  const c = { open: "text-sky-300 bg-sky-500/15", won: "text-emerald-300 bg-emerald-500/15", lost: "text-rose-300 bg-rose-500/15" }[b.status];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <div>
          <div className="font-mono text-xs text-stone-500">{b.code}</div>
          <div className="text-sm font-semibold">{b.items.length} selections · {money(b.totalStake)}</div>
          <div className="text-[11px] text-stone-500">{new Date(b.ts).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c}`}>{b.status}</span>
          <div className="mt-1 text-sm font-bold text-amber-300">{money(b.status === "won" ? b.payout : b.potential)}</div>
        </div>
      </button>
      {open && (
        <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
          {b.items.map((it) => (
            <div key={it.selId + it.matchId} className="flex items-center justify-between text-xs">
              <div className="min-w-0">
                <span className="text-stone-500">{it.marketTitle}: </span>
                <span className="font-medium">{it.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-emerald-300">@{it.oddsStr}</span>
                {it.status === "won" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                {it.status === "lost" && <X className="h-3.5 w-3.5 text-rose-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Leaderboard ---------- */
function Leaderboard({ bets, me }) {
  const board = useMemo(() => {
    const map = {};
    bets.forEach((b) => {
      const u = (map[b.user] ||= { nick: b.user, staked: 0, returns: 0, wins: 0, points: 0 });
      u.staked += b.totalStake;
      if (b.status === "won") { u.returns += b.payout || 0; u.wins++; u.points += Math.round((b.payout || 0) - b.totalStake); }
      if (b.status === "lost") u.points -= b.totalStake;
    });
    return Object.values(map).sort((a, b) => b.points - a.points);
  }, [bets]);

  return (
    <div>
      <SectionTitle icon={<Crown className="h-5 w-5" />} title="Leaderboard" sub="Net profit ranking" />
      {board.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No settled picks yet. Rankings appear once the admin settles matches.</p>}
      <div className="space-y-2">
        {board.map((u, i) => (
          <div key={u.nick} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${u.nick === me ? "border-amber-400/50 bg-amber-400/10" : "border-white/10 bg-white/[0.03]"}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-display text-xl ${i === 0 ? "bg-amber-400 text-black" : i === 1 ? "bg-stone-300 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-stone-300"}`}>{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{u.nick} {u.nick === me && <span className="text-[10px] text-amber-300">(you)</span>}</div>
              <div className="text-[11px] text-stone-500">{u.wins} wins · {money(u.staked)} staked</div>
            </div>
            <div className={`text-right font-display text-2xl ${u.points >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{u.points >= 0 ? "+" : ""}{u.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Admin ---------- */
function AdminPanel({ bets, results, configs, players, txns, settleMatch, saveConfig, creditPlayer, showToast }) {
  const [mode, setMode] = useState("settle"); // settle | manage | players
  const [pick, setPick] = useState(null);
  const totals = bets.reduce((a, b) => { a.stake += b.totalStake; if (b.status === "won") a.payout += b.payout || 0; return a; }, { stake: 0, payout: 0 });
  const switchMode = (m) => { setMode(m); setPick(null); };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Players" v={players.filter((p) => !p.is_admin).length} />
        <Stat label="Total Entries" v={bets.length} />
        <Stat label="Total Stakes" v={money(totals.stake)} />
        <Stat label="Total Payouts" v={money(totals.payout)} good />
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Stat label="Settled Matches" v={Object.keys(results).length} />
        <Stat label="Pool P/L" v={money(totals.stake - totals.payout)} good={totals.stake - totals.payout >= 0} />
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => exportPicksCSV(bets, "SGA_WC2026_all_picks.csv")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <BarChart3 className="h-3.5 w-3.5" /> Export Picks (Excel)
        </button>
        <button onClick={() => printPicks(bets, "All Players — Picks", true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <Receipt className="h-3.5 w-3.5" /> Export Picks (PDF)
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-black/30 p-1">
        {[["settle", "Settle", Settings], ["manage", "Odds & Players", ListChecks], ["players", "Coins", Wallet]].map(([k, lbl, Icon]) => (
          <button key={k} onClick={() => switchMode(k)}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition ${mode === k ? "bg-gradient-to-r from-amber-400 to-emerald-400 text-black" : "text-stone-400"}`}>
            <Icon className="h-4 w-4" /> {lbl}
          </button>
        ))}
      </div>

      {mode === "settle" ? (
        <>
          <SectionTitle icon={<Settings className="h-5 w-5" />} title="Result Settlement" sub="Enter outcomes — the engine settles every prediction automatically" />
          {!pick ? (
            <MatchPicker results={results} onPick={setPick} />
          ) : (
            <SettleForm match={pick} onBack={() => setPick(null)} results={results} settleMatch={settleMatch} showToast={showToast} />
          )}
        </>
      ) : mode === "manage" ? (
        <>
          <SectionTitle icon={<ListChecks className="h-5 w-5" />} title="Odds & Players" sub="Set player names and adjust odds per match — saved for everyone" />
          {!pick ? (
            <MatchPicker results={results} configs={configs} onPick={setPick} manage />
          ) : (
            <ManageForm match={pick} config={configs[pick.n]} onBack={() => setPick(null)} saveConfig={saveConfig} showToast={showToast} />
          )}
        </>
      ) : (
        <PlayersPanel players={players} bets={bets} txns={txns} creditPlayer={creditPlayer} showToast={showToast} />
      )}
    </div>
  );
}

/* ---------- Admin: give coins to players ---------- */
function PlayersPanel({ players, bets, txns, creditPlayer, showToast }) {
  const list = players.filter((p) => !p.is_admin);
  return (
    <div>
      <SectionTitle icon={<Wallet className="h-5 w-5" />} title="Players & Coins" sub="Credit Coins to a player — bonus is added automatically by deposit tier" />
      <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-stone-400 sm:grid-cols-4">
        <div><span className="font-bold text-emerald-300">10%</span> · exactly 10,000</div>
        <div><span className="font-bold text-emerald-300">12%</span> · 10,001–14,999</div>
        <div><span className="font-bold text-emerald-300">15%</span> · 15,000–19,999</div>
        <div><span className="font-bold text-emerald-300">20%</span> · 20,000 and above</div>
      </div>
      {list.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No players have signed up yet.</p>}
      <div className="space-y-2.5">
        {list.map((p) => (
          <PlayerCredit key={p.id} p={p} myBets={bets.filter((b) => b.userId === p.id)} myTxns={(txns || []).filter((t) => t.user_id === p.id)} creditPlayer={creditPlayer} showToast={showToast} />
        ))}
      </div>
    </div>
  );
}

function PlayerCredit({ p, myBets, myTxns, creditPlayer, showToast }) {
  const w = walletOf(p, myBets);
  const [amt, setAmt] = useState("");
  const [busy, setBusy] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const a = Math.max(0, parseFloat(amt) || 0);
  const pct = bonusPct(a);
  const bonusCoins = a * pct / 100;

  const add = async () => {
    if (a <= 0) { showToast("Enter an amount", "err"); return; }
    setBusy(true);
    try {
      await creditPlayer(p, a, bonusCoins);
      showToast(`Added ${money(a)} (+${money(bonusCoins)} bonus) to ${p.nickname}`);
      setAmt("");
    } catch (e) { showToast(e.message || "Failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-bold">👤 {p.nickname} <span className="text-[11px] font-normal text-stone-500">{p.full_name}</span></div>
        <div className="text-right"><div className="text-[10px] uppercase tracking-wide text-stone-500">Net Balance</div>
          <div className={`font-display text-xl ${w.net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{money(w.net)}</div></div>
      </div>
      <div className="mb-3 grid grid-cols-5 gap-1.5 text-center text-[10px]">
        {[["Deposit", w.deposit], ["Bonus", w.bonus], ["In Bets", w.inBets], ["Won", w.won], ["Lost", w.lost]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-black/20 px-1 py-1.5">
            <div className="text-stone-500">{k}</div><div className="font-semibold text-white">{fmtN(v)}</div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <label className="flex-1"><span className="mb-1 block text-[10px] text-stone-400">Add Coins (bonus auto-applied)</span>
          <input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="10000" className={ipt} /></label>
        <button onClick={add} disabled={busy} className="rounded-lg bg-gradient-to-r from-amber-400 to-emerald-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-50">
          {busy ? "…" : "Add"}
        </button>
      </div>
      {a > 0 &&
        <p className="mt-1.5 text-[11px] text-emerald-300/80">
          {pct > 0 ? `${pct}% bonus → ${money(a)} deposit + ${money(bonusCoins)} bonus = ${money(a + bonusCoins)} playable` : `No bonus (deposit under 10,000) → ${money(a)} playable`}
        </p>}

      <button onClick={() => setShowHist(!showHist)} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 hover:text-emerald-300">
        <ChevronRight className={`h-3.5 w-3.5 transition ${showHist ? "rotate-90" : ""}`} /> Top-up history ({(myTxns || []).length})
      </button>
      {showHist && (
        <div className="mt-2 space-y-1">
          {(myTxns || []).length === 0 && <p className="text-[11px] text-stone-600">No top-ups yet.</p>}
          {(myTxns || []).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-1.5 text-[11px]">
              <span className="text-stone-400">{new Date(t.created_at).toLocaleString()}</span>
              <span className="font-semibold text-emerald-300">+{fmtN(Number(t.deposit) + Number(t.bonus))} <span className="text-stone-500">({fmtN(t.deposit)}+{fmtN(t.bonus)})</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchPicker({ results, configs, onPick, manage }) {
  const [q, setQ] = useState("");
  const list = FIXTURES.filter((m) => (m.home + m.away).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a team…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {list.map((m) => (
          <button key={m.n} onClick={() => onPick(m)}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm hover:border-emerald-400/40">
            <span className="truncate">{m.hf} {m.home} v {m.away} {m.af}</span>
            {manage
              ? (configs?.[m.n] ? <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">EDITED</span> : <ChevronRight className="h-4 w-4 shrink-0 text-stone-600" />)
              : (results[m.n] ? <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">{results[m.n].ft.h}–{results[m.n].ft.a}</span> : <ChevronRight className="h-4 w-4 shrink-0 text-stone-600" />)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettleForm({ match, onBack, results, settleMatch, showToast }) {
  const prev = results[match.n];
  const [r, setR] = useState(prev
    ? { ...prev, scorers: Array.isArray(prev.scorers) ? prev.scorers.join(", ") : (prev.scorers || "") }
    : {
        ht: { h: 0, a: 0 }, ft: { h: 0, a: 0 }, firstGoalMinute: 10, firstGoalMethod: "rf",
        totalCards: 2, ownGoal: false, scorers: "", cleanSheet: false, winFromBehind: false, bothHalves: false,
      });
  const [busy, setBusy] = useState(false);
  const num = (v) => Math.max(0, parseInt(v) || 0);

  const settle = async () => {
    const scorers = Array.isArray(r.scorers) ? r.scorers : String(r.scorers).split(",").map((s) => s.trim()).filter(Boolean);
    const R = { ...r, scorers };
    setBusy(true);
    try {
      await settleMatch(match.n, R);
      showToast(`Settled ${match.home} ${R.ft.h}–${R.ft.a} ${match.away}`);
      onBack();
    } catch (e) { showToast(e.message || "Settlement failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-emerald-300"><ChevronLeft className="h-4 w-4" /> All matches</button>
      <h3 className="mb-4 font-display text-2xl">{match.hf} {match.home} v {match.away} {match.af}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreRow label="Half-Time Score" h={r.ht.h} a={r.ht.a} setH={(v) => setR({ ...r, ht: { ...r.ht, h: num(v) } })} setA={(v) => setR({ ...r, ht: { ...r.ht, a: num(v) } })} home={match.home} away={match.away} />
        <ScoreRow label="Full-Time Score" h={r.ft.h} a={r.ft.a} setH={(v) => setR({ ...r, ft: { ...r.ft, h: num(v) } })} setA={(v) => setR({ ...r, ft: { ...r.ft, a: num(v) } })} home={match.home} away={match.away} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AdminField label="First Goal Minute (0 = no goal)">
          <input type="number" value={r.firstGoalMinute} onChange={(e) => setR({ ...r, firstGoalMinute: num(e.target.value) })} className={ipt} />
        </AdminField>
        <AdminField label="First Goal Method">
          <select value={r.firstGoalMethod} onChange={(e) => setR({ ...r, firstGoalMethod: e.target.value })} className={ipt}>
            <option value="rf">Right Foot</option><option value="lf">Left Foot</option><option value="head">Header</option><option value="og">Own Goal</option>
          </select>
        </AdminField>
        <AdminField label="Total Cards (Y+R)">
          <input type="number" value={r.totalCards} onChange={(e) => setR({ ...r, totalCards: num(e.target.value) })} className={ipt} />
        </AdminField>
        <AdminField label="Own Goal Occurred?">
          <select value={r.ownGoal ? "1" : "0"} onChange={(e) => setR({ ...r, ownGoal: e.target.value === "1" })} className={ipt}>
            <option value="0">No</option><option value="1">Yes</option>
          </select>
        </AdminField>
      </div>

      <AdminField label="Goal Scorers in order (comma separated — first name decides First Scorer)">
        <input value={r.scorers} onChange={(e) => setR({ ...r, scorers: e.target.value })} placeholder="e.g. Brazil · Striker, France · Forward" className={ipt} />
      </AdminField>

      <div className="mt-3 flex flex-wrap gap-2">
        {[["cleanSheet", "Clean Sheet"], ["winFromBehind", "Win From Behind"], ["bothHalves", "Scored Both Halves"]].map(([k, lbl]) => (
          <button key={k} onClick={() => setR({ ...r, [k]: !r[k] })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r[k] ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-400"}`}>{lbl}: {r[k] ? "Yes" : "No"}</button>
        ))}
      </div>

      <button onClick={settle} disabled={busy} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black disabled:opacity-50">
        {busy ? "Settling…" : prev ? "Re-settle Match" : "Settle Match & Pay Out"}
      </button>
    </div>
  );
}

/* ---------- Manage odds & players (admin) ---------- */
function ManageForm({ match, config, onBack, saveConfig, showToast }) {
  const seedPlayers = (side, team) =>
    (config?.players?.[side]?.length ? config.players[side] : defaultPlayers(team, side)).map((p) => ({ ...p }));
  const [home, setHome] = useState(() => seedPlayers("home", match.home));
  const [away, setAway] = useState(() => seedPlayers("away", match.away));
  const [odds, setOdds] = useState(() => JSON.parse(JSON.stringify(config?.odds || {})));
  const [busy, setBusy] = useState(false);

  // markets to expose for odds editing (scorers handled via the player editor)
  const editable = useMemo(() => buildMarkets(match, { players: { home, away }, odds })
    .filter((mk) => !["first_scorer", "anytime_scorer"].includes(mk.key)), [match, home, away, odds]);

  const setPlayer = (side, i, field, val) => {
    const list = side === "home" ? [...home] : [...away];
    list[i] = { ...list[i], [field]: val };
    side === "home" ? setHome(list) : setAway(list);
  };
  const addPlayer = (side) => {
    const row = { name: "", first: "10/1", any: "4/1" };
    side === "home" ? setHome([...home, row]) : setAway([...away, row]);
  };
  const delPlayer = (side, i) => {
    side === "home" ? setHome(home.filter((_, j) => j !== i)) : setAway(away.filter((_, j) => j !== i));
  };
  const setOdd = (key, id, val) => setOdds((o) => ({ ...o, [key]: { ...(o[key] || {}), [id]: val } }));

  const save = async () => {
    const clean = (arr) => arr.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), first: p.first || "10/1", any: p.any || "4/1" }));
    setBusy(true);
    try {
      await saveConfig(match.n, { players: { home: clean(home), away: clean(away) }, odds });
      showToast("Saved — live for everyone");
      onBack();
    } catch (e) { showToast(e.message || "Save failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-emerald-300"><ChevronLeft className="h-4 w-4" /> All matches</button>
      <h3 className="mb-1 font-display text-2xl">{match.hf} {match.home} v {match.away} {match.af}</h3>
      <p className="mb-4 text-xs text-stone-500">Add the real squad names and set odds. Scorer odds (first / anytime) are set per player below.</p>

      {[["home", match.home, home], ["away", match.away, away]].map(([side, team, list]) => (
        <div key={side} className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold">{team} — Players</span>
            <button onClick={() => addPlayer(side)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300"><Plus className="h-3 w-3" /> Add</button>
          </div>
          <div className="mb-1 grid grid-cols-[1fr_64px_64px_28px] gap-2 px-1 text-[10px] uppercase tracking-wide text-stone-500">
            <span>Player name</span><span>1st</span><span>Anytime</span><span></span>
          </div>
          <div className="space-y-1.5">
            {list.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_64px_64px_28px] items-center gap-2">
                <input value={p.name} onChange={(e) => setPlayer(side, i, "name", e.target.value)} placeholder="e.g. Vinicius Jr" className={ipt} />
                <input value={p.first} onChange={(e) => setPlayer(side, i, "first", e.target.value)} placeholder="5/1" className={ipt + " text-center"} />
                <input value={p.any} onChange={(e) => setPlayer(side, i, "any", e.target.value)} placeholder="2/1" className={ipt + " text-center"} />
                <button onClick={() => delPlayer(side, i)} className="flex h-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            {list.length === 0 && <p className="py-2 text-center text-xs text-stone-600">No players yet — tap Add.</p>}
          </div>
        </div>
      ))}

      <div className="mt-5 mb-2 text-sm font-bold">Odds — other markets</div>
      <div className="space-y-2">
        {editable.map((mk) => (
          <OddsMarket key={mk.key} mk={mk} odds={odds} setOdd={setOdd} />
        ))}
      </div>

      <button onClick={save} disabled={busy} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black disabled:opacity-50">
        {busy ? "Saving…" : "Save Odds & Players"}
      </button>
    </div>
  );
}

function OddsMarket({ mk, odds, setOdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold">
        <span>{mk.icon} {mk.title}</span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-2 border-t border-white/5 p-3">
          {mk.selections.map((s) => (
            <label key={s.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-stone-300">{s.label}</span>
              <input value={odds[mk.key]?.[s.id] ?? s.oddsStr} onChange={(e) => setOdd(mk.key, s.id, e.target.value)}
                className="w-16 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-center text-emerald-300 outline-none focus:border-amber-400/60" />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
const ipt = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/50";
const AdminField = ({ label, children }) => (
  <label className="block"><span className="mb-1 block text-xs text-stone-400">{label}</span>{children}</label>
);
const ScoreRow = ({ label, h, a, setH, setA, home, away }) => (
  <div className="rounded-xl bg-black/20 p-3">
    <div className="mb-2 text-xs font-semibold text-stone-400">{label}</div>
    <div className="flex items-center gap-2">
      <div className="flex-1"><span className="mb-1 block truncate text-[11px] text-stone-500">{home}</span>
        <input type="number" value={h} onChange={(e) => setH(e.target.value)} className={ipt} /></div>
      <span className="pt-5 font-display text-xl text-stone-600">–</span>
      <div className="flex-1"><span className="mb-1 block truncate text-[11px] text-stone-500">{away}</span>
        <input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ipt} /></div>
    </div>
  </div>
);

/* ---------- shared bits ---------- */
const SectionTitle = ({ icon, title, sub }) => (
  <div className="mb-4 flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">{icon}</div>
    <div><h2 className="font-display text-3xl leading-none text-white">{title}</h2>{sub && <p className="text-xs text-stone-500">{sub}</p>}</div>
  </div>
);
const Stat = ({ label, v, good }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
    <div className="text-[10px] uppercase tracking-wide text-stone-500">{label}</div>
    <div className={`font-display text-2xl leading-tight ${good ? "text-emerald-400" : "text-white"}`}>{v}</div>
  </div>
);

function BottomNav({ tab, setTab, slipCount }) {
  const items = [
    { k: "matches", label: "Matches", icon: Calendar },
    { k: "mybets", label: "My Picks", icon: Receipt },
    { k: "board", label: "Ranking", icon: Crown },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070b0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-4 py-2">
        {items.map(({ k, label, icon: Icon }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-semibold ${tab === k ? "text-amber-400" : "text-stone-500"}`}>
            <Icon className="h-5 w-5" />{label}
          </button>
        ))}
      </div>
    </nav>
  );
}
