import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Trophy, Calendar, Clock, Receipt, ListChecks, Crown, ShieldCheck, LogOut,
  Search, Plus, X, Lock, Check, ChevronRight, ChevronLeft, Sun, Moon,
  Settings, BarChart3, Users, Wallet, TrendingUp, Flag, Ticket, AlertCircle, Ban, Zap,
} from "lucide-react";
import { supabase, hasSupabase } from "./supabaseClient.js";

/* ============================================================================
   SGA EPL 26-27 — Private Prediction Pool (multi-user, Supabase-backed)
   Data model: Market → Selection → Odds → Stake. Shared bets, results, leaderboard.
   ============================================================================ */

const FIXTURES = [{"n": 1, "gw": 1, "day": "Sat", "date": "Aug 22, 2026", "time": "01:00", "home": "Arsenal", "away": "Coventry", "hf": "ARS", "af": "COV"}, {"n": 2, "gw": 1, "day": "Sat", "date": "Aug 22, 2026", "time": "17:30", "home": "Hull", "away": "Man Utd", "hf": "HUL", "af": "MUN"}, {"n": 3, "gw": 1, "day": "Sat", "date": "Aug 22, 2026", "time": "20:00", "home": "Everton", "away": "Crystal Palace", "hf": "EVE", "af": "CRY"}, {"n": 4, "gw": 1, "day": "Sat", "date": "Aug 22, 2026", "time": "20:00", "home": "Ipswich", "away": "Sunderland", "hf": "IPS", "af": "SUN"}, {"n": 5, "gw": 1, "day": "Sat", "date": "Aug 22, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Leeds", "hf": "NFO", "af": "LEE"}, {"n": 6, "gw": 1, "day": "Sat", "date": "Aug 22, 2026", "time": "22:30", "home": "Brentford", "away": "Spurs", "hf": "BRE", "af": "TOT"}, {"n": 7, "gw": 1, "day": "Sun", "date": "Aug 23, 2026", "time": "19:00", "home": "Brighton", "away": "Aston Villa", "hf": "BHA", "af": "AVL"}, {"n": 8, "gw": 1, "day": "Sun", "date": "Aug 23, 2026", "time": "19:00", "home": "Man City", "away": "Bournemouth", "hf": "MCI", "af": "BOU"}, {"n": 9, "gw": 1, "day": "Sun", "date": "Aug 23, 2026", "time": "21:30", "home": "Newcastle", "away": "Liverpool", "hf": "NEW", "af": "LIV"}, {"n": 10, "gw": 1, "day": "Tue", "date": "Aug 25, 2026", "time": "01:00", "home": "Fulham", "away": "Chelsea", "hf": "FUL", "af": "CHE"}, {"n": 11, "gw": 2, "day": "Sat", "date": "Aug 29, 2026", "time": "20:00", "home": "Bournemouth", "away": "Everton", "hf": "BOU", "af": "EVE"}, {"n": 12, "gw": 2, "day": "Tue", "date": "Sep 1, 2026", "time": "01:00", "home": "Aston Villa", "away": "Arsenal", "hf": "AVL", "af": "ARS"}, {"n": 13, "gw": 2, "day": "Sun", "date": "Aug 30, 2026", "time": "19:00", "home": "Chelsea", "away": "Brighton", "hf": "CHE", "af": "BHA"}, {"n": 14, "gw": 2, "day": "Sat", "date": "Aug 29, 2026", "time": "20:00", "home": "Coventry", "away": "Hull", "hf": "COV", "af": "HUL"}, {"n": 15, "gw": 2, "day": "Sat", "date": "Aug 29, 2026", "time": "01:00", "home": "Crystal Palace", "away": "Man City", "hf": "CRY", "af": "MCI"}, {"n": 16, "gw": 2, "day": "Sun", "date": "Aug 30, 2026", "time": "19:00", "home": "Leeds", "away": "Brentford", "hf": "LEE", "af": "BRE"}, {"n": 17, "gw": 2, "day": "Sat", "date": "Aug 29, 2026", "time": "17:30", "home": "Liverpool", "away": "Nott'm Forest", "hf": "LIV", "af": "NFO"}, {"n": 18, "gw": 2, "day": "Sun", "date": "Aug 30, 2026", "time": "21:30", "home": "Man Utd", "away": "Ipswich", "hf": "MUN", "af": "IPS"}, {"n": 19, "gw": 2, "day": "Sun", "date": "Aug 30, 2026", "time": "19:00", "home": "Sunderland", "away": "Fulham", "hf": "SUN", "af": "FUL"}, {"n": 20, "gw": 2, "day": "Sat", "date": "Aug 29, 2026", "time": "22:30", "home": "Spurs", "away": "Newcastle", "hf": "TOT", "af": "NEW"}, {"n": 21, "gw": 3, "day": "Sun", "date": "Sep 6, 2026", "time": "21:30", "home": "Arsenal", "away": "Chelsea", "hf": "ARS", "af": "CHE"}, {"n": 22, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "20:00", "home": "Brentford", "away": "Sunderland", "hf": "BRE", "af": "SUN"}, {"n": 23, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "20:00", "home": "Brighton", "away": "Leeds", "hf": "BHA", "af": "LEE"}, {"n": 24, "gw": 3, "day": "Sun", "date": "Sep 6, 2026", "time": "19:00", "home": "Everton", "away": "Man Utd", "hf": "EVE", "af": "MUN"}, {"n": 25, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "20:00", "home": "Fulham", "away": "Crystal Palace", "hf": "FUL", "af": "CRY"}, {"n": 26, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "22:30", "home": "Hull", "away": "Aston Villa", "hf": "HUL", "af": "AVL"}, {"n": 27, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "01:00", "home": "Ipswich", "away": "Liverpool", "hf": "IPS", "af": "LIV"}, {"n": 28, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "20:00", "home": "Man City", "away": "Coventry", "hf": "MCI", "af": "COV"}, {"n": 29, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "17:30", "home": "Newcastle", "away": "Bournemouth", "hf": "NEW", "af": "BOU"}, {"n": 30, "gw": 3, "day": "Sat", "date": "Sep 5, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Spurs", "hf": "NFO", "af": "TOT"}, {"n": 31, "gw": 4, "day": "Sat", "date": "Sep 12, 2026", "time": "20:00", "home": "Bournemouth", "away": "Brentford", "hf": "BOU", "af": "BRE"}, {"n": 32, "gw": 4, "day": "Sat", "date": "Sep 12, 2026", "time": "20:00", "home": "Aston Villa", "away": "Nott'm Forest", "hf": "AVL", "af": "NFO"}, {"n": 33, "gw": 4, "day": "Sat", "date": "Sep 12, 2026", "time": "20:00", "home": "Chelsea", "away": "Hull", "hf": "CHE", "af": "HUL"}, {"n": 34, "gw": 4, "day": "Sun", "date": "Sep 13, 2026", "time": "19:00", "home": "Coventry", "away": "Brighton", "hf": "COV", "af": "BHA"}, {"n": 35, "gw": 4, "day": "Sat", "date": "Sep 12, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Ipswich", "hf": "CRY", "af": "IPS"}, {"n": 36, "gw": 4, "day": "Tue", "date": "Sep 15, 2026", "time": "01:00", "home": "Leeds", "away": "Newcastle", "hf": "LEE", "af": "NEW"}, {"n": 37, "gw": 4, "day": "Sat", "date": "Sep 12, 2026", "time": "20:00", "home": "Liverpool", "away": "Fulham", "hf": "LIV", "af": "FUL"}, {"n": 38, "gw": 4, "day": "Sun", "date": "Sep 13, 2026", "time": "21:30", "home": "Man Utd", "away": "Man City", "hf": "MUN", "af": "MCI"}, {"n": 39, "gw": 4, "day": "Sun", "date": "Sep 13, 2026", "time": "01:00", "home": "Sunderland", "away": "Arsenal", "hf": "SUN", "af": "ARS"}, {"n": 40, "gw": 4, "day": "Sat", "date": "Sep 12, 2026", "time": "22:30", "home": "Spurs", "away": "Everton", "hf": "TOT", "af": "EVE"}, {"n": 41, "gw": 5, "day": "Sun", "date": "Sep 20, 2026", "time": "19:00", "home": "Bournemouth", "away": "Liverpool", "hf": "BOU", "af": "LIV"}, {"n": 42, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "01:00", "home": "Brentford", "away": "Chelsea", "hf": "BRE", "af": "CHE"}, {"n": 43, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "20:00", "home": "Brighton", "away": "Arsenal", "hf": "BHA", "af": "ARS"}, {"n": 44, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "20:00", "home": "Everton", "away": "Ipswich", "hf": "EVE", "af": "IPS"}, {"n": 45, "gw": 5, "day": "Sun", "date": "Sep 20, 2026", "time": "21:30", "home": "Fulham", "away": "Man Utd", "hf": "FUL", "af": "MUN"}, {"n": 46, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "20:00", "home": "Leeds", "away": "Crystal Palace", "hf": "LEE", "af": "CRY"}, {"n": 47, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "20:00", "home": "Man City", "away": "Sunderland", "hf": "MCI", "af": "SUN"}, {"n": 48, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "20:00", "home": "Newcastle", "away": "Hull", "hf": "NEW", "af": "HUL"}, {"n": 49, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "22:30", "home": "Nott'm Forest", "away": "Coventry", "hf": "NFO", "af": "COV"}, {"n": 50, "gw": 5, "day": "Sat", "date": "Sep 19, 2026", "time": "17:30", "home": "Spurs", "away": "Aston Villa", "hf": "TOT", "af": "AVL"}, {"n": 51, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Arsenal", "away": "Leeds", "hf": "ARS", "af": "LEE"}, {"n": 52, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Aston Villa", "away": "Brentford", "hf": "AVL", "af": "BRE"}, {"n": 53, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Chelsea", "away": "Bournemouth", "hf": "CHE", "af": "BOU"}, {"n": 54, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Coventry", "away": "Newcastle", "hf": "COV", "af": "NEW"}, {"n": 55, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Nott'm Forest", "hf": "CRY", "af": "NFO"}, {"n": 56, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Hull", "away": "Everton", "hf": "HUL", "af": "EVE"}, {"n": 57, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Ipswich", "away": "Fulham", "hf": "IPS", "af": "FUL"}, {"n": 58, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Liverpool", "away": "Man City", "hf": "LIV", "af": "MCI"}, {"n": 59, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Man Utd", "away": "Spurs", "hf": "MUN", "af": "TOT"}, {"n": 60, "gw": 6, "day": "Sat", "date": "Oct 10, 2026", "time": "20:00", "home": "Sunderland", "away": "Brighton", "hf": "SUN", "af": "BHA"}, {"n": 61, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Bournemouth", "away": "Sunderland", "hf": "BOU", "af": "SUN"}, {"n": 62, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Brentford", "away": "Liverpool", "hf": "BRE", "af": "LIV"}, {"n": 63, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Brighton", "away": "Crystal Palace", "hf": "BHA", "af": "CRY"}, {"n": 64, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Everton", "away": "Chelsea", "hf": "EVE", "af": "CHE"}, {"n": 65, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Fulham", "away": "Hull", "hf": "FUL", "af": "HUL"}, {"n": 66, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Leeds", "away": "Man Utd", "hf": "LEE", "af": "MUN"}, {"n": 67, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Man City", "away": "Ipswich", "hf": "MCI", "af": "IPS"}, {"n": 68, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Newcastle", "away": "Aston Villa", "hf": "NEW", "af": "AVL"}, {"n": 69, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Arsenal", "hf": "NFO", "af": "ARS"}, {"n": 70, "gw": 7, "day": "Sat", "date": "Oct 17, 2026", "time": "20:00", "home": "Spurs", "away": "Coventry", "hf": "TOT", "af": "COV"}, {"n": 71, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Arsenal", "away": "Everton", "hf": "ARS", "af": "EVE"}, {"n": 72, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Aston Villa", "away": "Man City", "hf": "AVL", "af": "MCI"}, {"n": 73, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Chelsea", "away": "Spurs", "hf": "CHE", "af": "TOT"}, {"n": 74, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Coventry", "away": "Fulham", "hf": "COV", "af": "FUL"}, {"n": 75, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Newcastle", "hf": "CRY", "af": "NEW"}, {"n": 76, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Hull", "away": "Brentford", "hf": "HUL", "af": "BRE"}, {"n": 77, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Ipswich", "away": "Nott'm Forest", "hf": "IPS", "af": "NFO"}, {"n": 78, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Liverpool", "away": "Brighton", "hf": "LIV", "af": "BHA"}, {"n": 79, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Man Utd", "away": "Bournemouth", "hf": "MUN", "af": "BOU"}, {"n": 80, "gw": 8, "day": "Sat", "date": "Oct 24, 2026", "time": "20:00", "home": "Sunderland", "away": "Leeds", "hf": "SUN", "af": "LEE"}, {"n": 81, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Bournemouth", "away": "Leeds", "hf": "BOU", "af": "LEE"}, {"n": 82, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Aston Villa", "away": "Fulham", "hf": "AVL", "af": "FUL"}, {"n": 83, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Brentford", "away": "Nott'm Forest", "hf": "BRE", "af": "NFO"}, {"n": 84, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Chelsea", "away": "Man Utd", "hf": "CHE", "af": "MUN"}, {"n": 85, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Coventry", "away": "Sunderland", "hf": "COV", "af": "SUN"}, {"n": 86, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Hull", "away": "Ipswich", "hf": "HUL", "af": "IPS"}, {"n": 87, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Liverpool", "away": "Arsenal", "hf": "LIV", "af": "ARS"}, {"n": 88, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Man City", "away": "Brighton", "hf": "MCI", "af": "BHA"}, {"n": 89, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Newcastle", "away": "Everton", "hf": "NEW", "af": "EVE"}, {"n": 90, "gw": 9, "day": "Sat", "date": "Oct 31, 2026", "time": "20:00", "home": "Spurs", "away": "Crystal Palace", "hf": "TOT", "af": "CRY"}, {"n": 91, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Arsenal", "away": "Hull", "hf": "ARS", "af": "HUL"}, {"n": 92, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Brighton", "away": "Brentford", "hf": "BHA", "af": "BRE"}, {"n": 93, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Liverpool", "hf": "CRY", "af": "LIV"}, {"n": 94, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Everton", "away": "Coventry", "hf": "EVE", "af": "COV"}, {"n": 95, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Fulham", "away": "Newcastle", "hf": "FUL", "af": "NEW"}, {"n": 96, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Ipswich", "away": "Bournemouth", "hf": "IPS", "af": "BOU"}, {"n": 97, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Leeds", "away": "Spurs", "hf": "LEE", "af": "TOT"}, {"n": 98, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Man Utd", "away": "Aston Villa", "hf": "MUN", "af": "AVL"}, {"n": 99, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Man City", "hf": "NFO", "af": "MCI"}, {"n": 100, "gw": 10, "day": "Sat", "date": "Nov 7, 2026", "time": "20:00", "home": "Sunderland", "away": "Chelsea", "hf": "SUN", "af": "CHE"}, {"n": 101, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Bournemouth", "away": "Nott'm Forest", "hf": "BOU", "af": "NFO"}, {"n": 102, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Aston Villa", "away": "Sunderland", "hf": "AVL", "af": "SUN"}, {"n": 103, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Brentford", "away": "Everton", "hf": "BRE", "af": "EVE"}, {"n": 104, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Chelsea", "away": "Leeds", "hf": "CHE", "af": "LEE"}, {"n": 105, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Coventry", "away": "Crystal Palace", "hf": "COV", "af": "CRY"}, {"n": 106, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Hull", "away": "Brighton", "hf": "HUL", "af": "BHA"}, {"n": 107, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Liverpool", "away": "Man Utd", "hf": "LIV", "af": "MUN"}, {"n": 108, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Man City", "away": "Fulham", "hf": "MCI", "af": "FUL"}, {"n": 109, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Newcastle", "away": "Arsenal", "hf": "NEW", "af": "ARS"}, {"n": 110, "gw": 11, "day": "Sat", "date": "Nov 21, 2026", "time": "20:00", "home": "Spurs", "away": "Ipswich", "hf": "TOT", "af": "IPS"}, {"n": 111, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Arsenal", "away": "Man City", "hf": "ARS", "af": "MCI"}, {"n": 112, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Brighton", "away": "Newcastle", "hf": "BHA", "af": "NEW"}, {"n": 113, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Hull", "hf": "CRY", "af": "HUL"}, {"n": 114, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Everton", "away": "Liverpool", "hf": "EVE", "af": "LIV"}, {"n": 115, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Fulham", "away": "Bournemouth", "hf": "FUL", "af": "BOU"}, {"n": 116, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Ipswich", "away": "Aston Villa", "hf": "IPS", "af": "AVL"}, {"n": 117, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Leeds", "away": "Coventry", "hf": "LEE", "af": "COV"}, {"n": 118, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Man Utd", "away": "Brentford", "hf": "MUN", "af": "BRE"}, {"n": 119, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Chelsea", "hf": "NFO", "af": "CHE"}, {"n": 120, "gw": 12, "day": "Sat", "date": "Nov 28, 2026", "time": "20:00", "home": "Sunderland", "away": "Spurs", "hf": "SUN", "af": "TOT"}, {"n": 121, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Bournemouth", "away": "Brighton", "hf": "BOU", "af": "BHA"}, {"n": 122, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Aston Villa", "away": "Everton", "hf": "AVL", "af": "EVE"}, {"n": 123, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Brentford", "away": "Arsenal", "hf": "BRE", "af": "ARS"}, {"n": 124, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Chelsea", "away": "Crystal Palace", "hf": "CHE", "af": "CRY"}, {"n": 125, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Coventry", "away": "Ipswich", "hf": "COV", "af": "IPS"}, {"n": 126, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Hull", "away": "Nott'm Forest", "hf": "HUL", "af": "NFO"}, {"n": 127, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Liverpool", "away": "Sunderland", "hf": "LIV", "af": "SUN"}, {"n": 128, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Man City", "away": "Leeds", "hf": "MCI", "af": "LEE"}, {"n": 129, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Newcastle", "away": "Man Utd", "hf": "NEW", "af": "MUN"}, {"n": 130, "gw": 13, "day": "Thu", "date": "Dec 3, 2026", "time": "01:00", "home": "Spurs", "away": "Fulham", "hf": "TOT", "af": "FUL"}, {"n": 131, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Bournemouth", "away": "Hull", "hf": "BOU", "af": "HUL"}, {"n": 132, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Aston Villa", "away": "Crystal Palace", "hf": "AVL", "af": "CRY"}, {"n": 133, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Brentford", "away": "Man City", "hf": "BRE", "af": "MCI"}, {"n": 134, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Chelsea", "away": "Liverpool", "hf": "CHE", "af": "LIV"}, {"n": 135, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Everton", "away": "Fulham", "hf": "EVE", "af": "FUL"}, {"n": 136, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Leeds", "away": "Ipswich", "hf": "LEE", "af": "IPS"}, {"n": 137, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Man Utd", "away": "Coventry", "hf": "MUN", "af": "COV"}, {"n": 138, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Newcastle", "away": "Sunderland", "hf": "NEW", "af": "SUN"}, {"n": 139, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Brighton", "hf": "NFO", "af": "BHA"}, {"n": 140, "gw": 14, "day": "Sat", "date": "Dec 5, 2026", "time": "20:00", "home": "Spurs", "away": "Arsenal", "hf": "TOT", "af": "ARS"}, {"n": 141, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Arsenal", "away": "Bournemouth", "hf": "ARS", "af": "BOU"}, {"n": 142, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Brighton", "away": "Everton", "hf": "BHA", "af": "EVE"}, {"n": 143, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Coventry", "away": "Aston Villa", "hf": "COV", "af": "AVL"}, {"n": 144, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Man Utd", "hf": "CRY", "af": "MUN"}, {"n": 145, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Fulham", "away": "Brentford", "hf": "FUL", "af": "BRE"}, {"n": 146, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Hull", "away": "Spurs", "hf": "HUL", "af": "TOT"}, {"n": 147, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Ipswich", "away": "Newcastle", "hf": "IPS", "af": "NEW"}, {"n": 148, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Liverpool", "away": "Leeds", "hf": "LIV", "af": "LEE"}, {"n": 149, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Man City", "away": "Chelsea", "hf": "MCI", "af": "CHE"}, {"n": 150, "gw": 15, "day": "Sat", "date": "Dec 12, 2026", "time": "20:00", "home": "Sunderland", "away": "Nott'm Forest", "hf": "SUN", "af": "NFO"}, {"n": 151, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Bournemouth", "away": "Coventry", "hf": "BOU", "af": "COV"}, {"n": 152, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Arsenal", "away": "Man Utd", "hf": "ARS", "af": "MUN"}, {"n": 153, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Brentford", "away": "Newcastle", "hf": "BRE", "af": "NEW"}, {"n": 154, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Brighton", "away": "Ipswich", "hf": "BHA", "af": "IPS"}, {"n": 155, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Chelsea", "away": "Aston Villa", "hf": "CHE", "af": "AVL"}, {"n": 156, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Leeds", "away": "Fulham", "hf": "LEE", "af": "FUL"}, {"n": 157, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Liverpool", "away": "Spurs", "hf": "LIV", "af": "TOT"}, {"n": 158, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Man City", "away": "Hull", "hf": "MCI", "af": "HUL"}, {"n": 159, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Nott'm Forest", "away": "Everton", "hf": "NFO", "af": "EVE"}, {"n": 160, "gw": 16, "day": "Sat", "date": "Dec 19, 2026", "time": "20:00", "home": "Sunderland", "away": "Crystal Palace", "hf": "SUN", "af": "CRY"}, {"n": 161, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Aston Villa", "away": "Leeds", "hf": "AVL", "af": "LEE"}, {"n": 162, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Coventry", "away": "Chelsea", "hf": "COV", "af": "CHE"}, {"n": 163, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Crystal Palace", "away": "Arsenal", "hf": "CRY", "af": "ARS"}, {"n": 164, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Everton", "away": "Sunderland", "hf": "EVE", "af": "SUN"}, {"n": 165, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Fulham", "away": "Brighton", "hf": "FUL", "af": "BHA"}, {"n": 166, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Hull", "away": "Liverpool", "hf": "HUL", "af": "LIV"}, {"n": 167, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Ipswich", "away": "Brentford", "hf": "IPS", "af": "BRE"}, {"n": 168, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Man Utd", "away": "Nott'm Forest", "hf": "MUN", "af": "NFO"}, {"n": 169, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Newcastle", "away": "Man City", "hf": "NEW", "af": "MCI"}, {"n": 170, "gw": 17, "day": "Sat", "date": "Dec 26, 2026", "time": "20:00", "home": "Spurs", "away": "Bournemouth", "hf": "TOT", "af": "BOU"}, {"n": 171, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Aston Villa", "away": "Liverpool", "hf": "AVL", "af": "LIV"}, {"n": 172, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Coventry", "away": "Brentford", "hf": "COV", "af": "BRE"}, {"n": 173, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Crystal Palace", "away": "Bournemouth", "hf": "CRY", "af": "BOU"}, {"n": 174, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Everton", "away": "Man City", "hf": "EVE", "af": "MCI"}, {"n": 175, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Fulham", "away": "Arsenal", "hf": "FUL", "af": "ARS"}, {"n": 176, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Hull", "away": "Leeds", "hf": "HUL", "af": "LEE"}, {"n": 177, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Ipswich", "away": "Chelsea", "hf": "IPS", "af": "CHE"}, {"n": 178, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Man Utd", "away": "Sunderland", "hf": "MUN", "af": "SUN"}, {"n": 179, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Newcastle", "away": "Nott'm Forest", "hf": "NEW", "af": "NFO"}, {"n": 180, "gw": 18, "day": "Thu", "date": "Dec 31, 2026", "time": "01:00", "home": "Spurs", "away": "Brighton", "hf": "TOT", "af": "BHA"}, {"n": 181, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Bournemouth", "away": "Aston Villa", "hf": "BOU", "af": "AVL"}, {"n": 182, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Arsenal", "away": "Ipswich", "hf": "ARS", "af": "IPS"}, {"n": 183, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Brentford", "away": "Crystal Palace", "hf": "BRE", "af": "CRY"}, {"n": 184, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Brighton", "away": "Man Utd", "hf": "BHA", "af": "MUN"}, {"n": 185, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Chelsea", "away": "Newcastle", "hf": "CHE", "af": "NEW"}, {"n": 186, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Leeds", "away": "Everton", "hf": "LEE", "af": "EVE"}, {"n": 187, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Liverpool", "away": "Coventry", "hf": "LIV", "af": "COV"}, {"n": 188, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Man City", "away": "Spurs", "hf": "MCI", "af": "TOT"}, {"n": 189, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Fulham", "hf": "NFO", "af": "FUL"}, {"n": 190, "gw": 19, "day": "Sat", "date": "Jan 2, 2027", "time": "20:00", "home": "Sunderland", "away": "Hull", "hf": "SUN", "af": "HUL"}, {"n": 191, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Arsenal", "away": "Brentford", "hf": "ARS", "af": "BRE"}, {"n": 192, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Brighton", "away": "Bournemouth", "hf": "BHA", "af": "BOU"}, {"n": 193, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Crystal Palace", "away": "Chelsea", "hf": "CRY", "af": "CHE"}, {"n": 194, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Everton", "away": "Aston Villa", "hf": "EVE", "af": "AVL"}, {"n": 195, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Fulham", "away": "Spurs", "hf": "FUL", "af": "TOT"}, {"n": 196, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Ipswich", "away": "Coventry", "hf": "IPS", "af": "COV"}, {"n": 197, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Leeds", "away": "Man City", "hf": "LEE", "af": "MCI"}, {"n": 198, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Man Utd", "away": "Newcastle", "hf": "MUN", "af": "NEW"}, {"n": 199, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Nott'm Forest", "away": "Hull", "hf": "NFO", "af": "HUL"}, {"n": 200, "gw": 20, "day": "Thu", "date": "Jan 7, 2027", "time": "01:00", "home": "Sunderland", "away": "Liverpool", "hf": "SUN", "af": "LIV"}, {"n": 201, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Bournemouth", "away": "Ipswich", "hf": "BOU", "af": "IPS"}, {"n": 202, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Aston Villa", "away": "Man Utd", "hf": "AVL", "af": "MUN"}, {"n": 203, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Brentford", "away": "Brighton", "hf": "BRE", "af": "BHA"}, {"n": 204, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Chelsea", "away": "Sunderland", "hf": "CHE", "af": "SUN"}, {"n": 205, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Coventry", "away": "Everton", "hf": "COV", "af": "EVE"}, {"n": 206, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Hull", "away": "Arsenal", "hf": "HUL", "af": "ARS"}, {"n": 207, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Liverpool", "away": "Crystal Palace", "hf": "LIV", "af": "CRY"}, {"n": 208, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Man City", "away": "Nott'm Forest", "hf": "MCI", "af": "NFO"}, {"n": 209, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Newcastle", "away": "Fulham", "hf": "NEW", "af": "FUL"}, {"n": 210, "gw": 21, "day": "Sat", "date": "Jan 16, 2027", "time": "20:00", "home": "Spurs", "away": "Leeds", "hf": "TOT", "af": "LEE"}, {"n": 211, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Arsenal", "away": "Newcastle", "hf": "ARS", "af": "NEW"}, {"n": 212, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Brighton", "away": "Man City", "hf": "BHA", "af": "MCI"}, {"n": 213, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Spurs", "hf": "CRY", "af": "TOT"}, {"n": 214, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Everton", "away": "Brentford", "hf": "EVE", "af": "BRE"}, {"n": 215, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Fulham", "away": "Aston Villa", "hf": "FUL", "af": "AVL"}, {"n": 216, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Ipswich", "away": "Hull", "hf": "IPS", "af": "HUL"}, {"n": 217, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Leeds", "away": "Chelsea", "hf": "LEE", "af": "CHE"}, {"n": 218, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Man Utd", "away": "Liverpool", "hf": "MUN", "af": "LIV"}, {"n": 219, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Bournemouth", "hf": "NFO", "af": "BOU"}, {"n": 220, "gw": 22, "day": "Sat", "date": "Jan 23, 2027", "time": "20:00", "home": "Sunderland", "away": "Coventry", "hf": "SUN", "af": "COV"}, {"n": 221, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Bournemouth", "away": "Fulham", "hf": "BOU", "af": "FUL"}, {"n": 222, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Aston Villa", "away": "Ipswich", "hf": "AVL", "af": "IPS"}, {"n": 223, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Brentford", "away": "Man Utd", "hf": "BRE", "af": "MUN"}, {"n": 224, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Chelsea", "away": "Nott'm Forest", "hf": "CHE", "af": "NFO"}, {"n": 225, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Coventry", "away": "Leeds", "hf": "COV", "af": "LEE"}, {"n": 226, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Hull", "away": "Crystal Palace", "hf": "HUL", "af": "CRY"}, {"n": 227, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Liverpool", "away": "Everton", "hf": "LIV", "af": "EVE"}, {"n": 228, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Man City", "away": "Arsenal", "hf": "MCI", "af": "ARS"}, {"n": 229, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Newcastle", "away": "Brighton", "hf": "NEW", "af": "BHA"}, {"n": 230, "gw": 23, "day": "Sat", "date": "Jan 30, 2027", "time": "20:00", "home": "Spurs", "away": "Sunderland", "hf": "TOT", "af": "SUN"}, {"n": 231, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Arsenal", "away": "Liverpool", "hf": "ARS", "af": "LIV"}, {"n": 232, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Brighton", "away": "Hull", "hf": "BHA", "af": "HUL"}, {"n": 233, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Coventry", "hf": "CRY", "af": "COV"}, {"n": 234, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Everton", "away": "Newcastle", "hf": "EVE", "af": "NEW"}, {"n": 235, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Fulham", "away": "Man City", "hf": "FUL", "af": "MCI"}, {"n": 236, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Ipswich", "away": "Spurs", "hf": "IPS", "af": "TOT"}, {"n": 237, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Leeds", "away": "Bournemouth", "hf": "LEE", "af": "BOU"}, {"n": 238, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Man Utd", "away": "Chelsea", "hf": "MUN", "af": "CHE"}, {"n": 239, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Brentford", "hf": "NFO", "af": "BRE"}, {"n": 240, "gw": 24, "day": "Sat", "date": "Feb 6, 2027", "time": "20:00", "home": "Sunderland", "away": "Aston Villa", "hf": "SUN", "af": "AVL"}, {"n": 241, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Aston Villa", "away": "Bournemouth", "hf": "AVL", "af": "BOU"}, {"n": 242, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Coventry", "away": "Liverpool", "hf": "COV", "af": "LIV"}, {"n": 243, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Crystal Palace", "away": "Brentford", "hf": "CRY", "af": "BRE"}, {"n": 244, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Everton", "away": "Leeds", "hf": "EVE", "af": "LEE"}, {"n": 245, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Fulham", "away": "Nott'm Forest", "hf": "FUL", "af": "NFO"}, {"n": 246, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Hull", "away": "Sunderland", "hf": "HUL", "af": "SUN"}, {"n": 247, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Ipswich", "away": "Arsenal", "hf": "IPS", "af": "ARS"}, {"n": 248, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Man Utd", "away": "Brighton", "hf": "MUN", "af": "BHA"}, {"n": 249, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Newcastle", "away": "Chelsea", "hf": "NEW", "af": "CHE"}, {"n": 250, "gw": 25, "day": "Thu", "date": "Feb 11, 2027", "time": "01:00", "home": "Spurs", "away": "Man City", "hf": "TOT", "af": "MCI"}, {"n": 251, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Bournemouth", "away": "Crystal Palace", "hf": "BOU", "af": "CRY"}, {"n": 252, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Arsenal", "away": "Fulham", "hf": "ARS", "af": "FUL"}, {"n": 253, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Brentford", "away": "Coventry", "hf": "BRE", "af": "COV"}, {"n": 254, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Brighton", "away": "Spurs", "hf": "BHA", "af": "TOT"}, {"n": 255, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Chelsea", "away": "Ipswich", "hf": "CHE", "af": "IPS"}, {"n": 256, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Leeds", "away": "Aston Villa", "hf": "LEE", "af": "AVL"}, {"n": 257, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Liverpool", "away": "Hull", "hf": "LIV", "af": "HUL"}, {"n": 258, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Man City", "away": "Newcastle", "hf": "MCI", "af": "NEW"}, {"n": 259, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Man Utd", "hf": "NFO", "af": "MUN"}, {"n": 260, "gw": 26, "day": "Sat", "date": "Feb 20, 2027", "time": "20:00", "home": "Sunderland", "away": "Everton", "hf": "SUN", "af": "EVE"}, {"n": 261, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Aston Villa", "away": "Chelsea", "hf": "AVL", "af": "CHE"}, {"n": 262, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Coventry", "away": "Bournemouth", "hf": "COV", "af": "BOU"}, {"n": 263, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Sunderland", "hf": "CRY", "af": "SUN"}, {"n": 264, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Everton", "away": "Nott'm Forest", "hf": "EVE", "af": "NFO"}, {"n": 265, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Fulham", "away": "Leeds", "hf": "FUL", "af": "LEE"}, {"n": 266, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Hull", "away": "Man City", "hf": "HUL", "af": "MCI"}, {"n": 267, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Ipswich", "away": "Brighton", "hf": "IPS", "af": "BHA"}, {"n": 268, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Man Utd", "away": "Arsenal", "hf": "MUN", "af": "ARS"}, {"n": 269, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Newcastle", "away": "Brentford", "hf": "NEW", "af": "BRE"}, {"n": 270, "gw": 27, "day": "Sat", "date": "Feb 27, 2027", "time": "20:00", "home": "Spurs", "away": "Liverpool", "hf": "TOT", "af": "LIV"}, {"n": 271, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Bournemouth", "away": "Spurs", "hf": "BOU", "af": "TOT"}, {"n": 272, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Arsenal", "away": "Crystal Palace", "hf": "ARS", "af": "CRY"}, {"n": 273, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Brentford", "away": "Ipswich", "hf": "BRE", "af": "IPS"}, {"n": 274, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Brighton", "away": "Fulham", "hf": "BHA", "af": "FUL"}, {"n": 275, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Chelsea", "away": "Coventry", "hf": "CHE", "af": "COV"}, {"n": 276, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Leeds", "away": "Hull", "hf": "LEE", "af": "HUL"}, {"n": 277, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Liverpool", "away": "Aston Villa", "hf": "LIV", "af": "AVL"}, {"n": 278, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Man City", "away": "Everton", "hf": "MCI", "af": "EVE"}, {"n": 279, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Nott'm Forest", "away": "Newcastle", "hf": "NFO", "af": "NEW"}, {"n": 280, "gw": 28, "day": "Thu", "date": "Mar 4, 2027", "time": "01:00", "home": "Sunderland", "away": "Man Utd", "hf": "SUN", "af": "MUN"}, {"n": 281, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Bournemouth", "away": "Newcastle", "hf": "BOU", "af": "NEW"}, {"n": 282, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Aston Villa", "away": "Hull", "hf": "AVL", "af": "HUL"}, {"n": 283, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Chelsea", "away": "Arsenal", "hf": "CHE", "af": "ARS"}, {"n": 284, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Coventry", "away": "Man City", "hf": "COV", "af": "MCI"}, {"n": 285, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Fulham", "hf": "CRY", "af": "FUL"}, {"n": 286, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Leeds", "away": "Brighton", "hf": "LEE", "af": "BHA"}, {"n": 287, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Liverpool", "away": "Ipswich", "hf": "LIV", "af": "IPS"}, {"n": 288, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Man Utd", "away": "Everton", "hf": "MUN", "af": "EVE"}, {"n": 289, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Sunderland", "away": "Brentford", "hf": "SUN", "af": "BRE"}, {"n": 290, "gw": 29, "day": "Sat", "date": "Mar 13, 2027", "time": "20:00", "home": "Spurs", "away": "Nott'm Forest", "hf": "TOT", "af": "NFO"}, {"n": 291, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Arsenal", "away": "Sunderland", "hf": "ARS", "af": "SUN"}, {"n": 292, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Brentford", "away": "Bournemouth", "hf": "BRE", "af": "BOU"}, {"n": 293, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Brighton", "away": "Coventry", "hf": "BHA", "af": "COV"}, {"n": 294, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Everton", "away": "Spurs", "hf": "EVE", "af": "TOT"}, {"n": 295, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Fulham", "away": "Liverpool", "hf": "FUL", "af": "LIV"}, {"n": 296, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Hull", "away": "Chelsea", "hf": "HUL", "af": "CHE"}, {"n": 297, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Ipswich", "away": "Crystal Palace", "hf": "IPS", "af": "CRY"}, {"n": 298, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Man City", "away": "Man Utd", "hf": "MCI", "af": "MUN"}, {"n": 299, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Newcastle", "away": "Leeds", "hf": "NEW", "af": "LEE"}, {"n": 300, "gw": 30, "day": "Sat", "date": "Mar 20, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Aston Villa", "hf": "NFO", "af": "AVL"}, {"n": 301, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Bournemouth", "away": "Man City", "hf": "BOU", "af": "MCI"}, {"n": 302, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Aston Villa", "away": "Brighton", "hf": "AVL", "af": "BHA"}, {"n": 303, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Chelsea", "away": "Fulham", "hf": "CHE", "af": "FUL"}, {"n": 304, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Coventry", "away": "Arsenal", "hf": "COV", "af": "ARS"}, {"n": 305, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Everton", "hf": "CRY", "af": "EVE"}, {"n": 306, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Leeds", "away": "Nott'm Forest", "hf": "LEE", "af": "NFO"}, {"n": 307, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Liverpool", "away": "Newcastle", "hf": "LIV", "af": "NEW"}, {"n": 308, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Man Utd", "away": "Hull", "hf": "MUN", "af": "HUL"}, {"n": 309, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Sunderland", "away": "Ipswich", "hf": "SUN", "af": "IPS"}, {"n": 310, "gw": 31, "day": "Sat", "date": "Apr 10, 2027", "time": "20:00", "home": "Spurs", "away": "Brentford", "hf": "TOT", "af": "BRE"}, {"n": 311, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Arsenal", "away": "Aston Villa", "hf": "ARS", "af": "AVL"}, {"n": 312, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Brentford", "away": "Leeds", "hf": "BRE", "af": "LEE"}, {"n": 313, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Brighton", "away": "Chelsea", "hf": "BHA", "af": "CHE"}, {"n": 314, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Everton", "away": "Bournemouth", "hf": "EVE", "af": "BOU"}, {"n": 315, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Fulham", "away": "Sunderland", "hf": "FUL", "af": "SUN"}, {"n": 316, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Hull", "away": "Coventry", "hf": "HUL", "af": "COV"}, {"n": 317, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Ipswich", "away": "Man Utd", "hf": "IPS", "af": "MUN"}, {"n": 318, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Man City", "away": "Crystal Palace", "hf": "MCI", "af": "CRY"}, {"n": 319, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Newcastle", "away": "Spurs", "hf": "NEW", "af": "TOT"}, {"n": 320, "gw": 32, "day": "Sat", "date": "Apr 17, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Liverpool", "hf": "NFO", "af": "LIV"}, {"n": 321, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Bournemouth", "away": "Arsenal", "hf": "BOU", "af": "ARS"}, {"n": 322, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Aston Villa", "away": "Coventry", "hf": "AVL", "af": "COV"}, {"n": 323, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Brentford", "away": "Fulham", "hf": "BRE", "af": "FUL"}, {"n": 324, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Chelsea", "away": "Man City", "hf": "CHE", "af": "MCI"}, {"n": 325, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Everton", "away": "Brighton", "hf": "EVE", "af": "BHA"}, {"n": 326, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Leeds", "away": "Liverpool", "hf": "LEE", "af": "LIV"}, {"n": 327, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Man Utd", "away": "Crystal Palace", "hf": "MUN", "af": "CRY"}, {"n": 328, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Newcastle", "away": "Ipswich", "hf": "NEW", "af": "IPS"}, {"n": 329, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Sunderland", "hf": "NFO", "af": "SUN"}, {"n": 330, "gw": 33, "day": "Sat", "date": "Apr 24, 2027", "time": "20:00", "home": "Spurs", "away": "Hull", "hf": "TOT", "af": "HUL"}, {"n": 331, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Arsenal", "away": "Spurs", "hf": "ARS", "af": "TOT"}, {"n": 332, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Brighton", "away": "Nott'm Forest", "hf": "BHA", "af": "NFO"}, {"n": 333, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Coventry", "away": "Man Utd", "hf": "COV", "af": "MUN"}, {"n": 334, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Aston Villa", "hf": "CRY", "af": "AVL"}, {"n": 335, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Fulham", "away": "Everton", "hf": "FUL", "af": "EVE"}, {"n": 336, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Hull", "away": "Bournemouth", "hf": "HUL", "af": "BOU"}, {"n": 337, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Ipswich", "away": "Leeds", "hf": "IPS", "af": "LEE"}, {"n": 338, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Liverpool", "away": "Chelsea", "hf": "LIV", "af": "CHE"}, {"n": 339, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Man City", "away": "Brentford", "hf": "MCI", "af": "BRE"}, {"n": 340, "gw": 34, "day": "Sat", "date": "May 1, 2027", "time": "20:00", "home": "Sunderland", "away": "Newcastle", "hf": "SUN", "af": "NEW"}, {"n": 341, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Bournemouth", "away": "Man Utd", "hf": "BOU", "af": "MUN"}, {"n": 342, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Brentford", "away": "Aston Villa", "hf": "BRE", "af": "AVL"}, {"n": 343, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Brighton", "away": "Sunderland", "hf": "BHA", "af": "SUN"}, {"n": 344, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Everton", "away": "Hull", "hf": "EVE", "af": "HUL"}, {"n": 345, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Fulham", "away": "Ipswich", "hf": "FUL", "af": "IPS"}, {"n": 346, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Leeds", "away": "Arsenal", "hf": "LEE", "af": "ARS"}, {"n": 347, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Man City", "away": "Liverpool", "hf": "MCI", "af": "LIV"}, {"n": 348, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Newcastle", "away": "Coventry", "hf": "NEW", "af": "COV"}, {"n": 349, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Crystal Palace", "hf": "NFO", "af": "CRY"}, {"n": 350, "gw": 35, "day": "Sat", "date": "May 8, 2027", "time": "20:00", "home": "Spurs", "away": "Chelsea", "hf": "TOT", "af": "CHE"}, {"n": 351, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Arsenal", "away": "Nott'm Forest", "hf": "ARS", "af": "NFO"}, {"n": 352, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Aston Villa", "away": "Newcastle", "hf": "AVL", "af": "NEW"}, {"n": 353, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Chelsea", "away": "Everton", "hf": "CHE", "af": "EVE"}, {"n": 354, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Coventry", "away": "Spurs", "hf": "COV", "af": "TOT"}, {"n": 355, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Crystal Palace", "away": "Brighton", "hf": "CRY", "af": "BHA"}, {"n": 356, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Hull", "away": "Fulham", "hf": "HUL", "af": "FUL"}, {"n": 357, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Ipswich", "away": "Man City", "hf": "IPS", "af": "MCI"}, {"n": 358, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Liverpool", "away": "Brentford", "hf": "LIV", "af": "BRE"}, {"n": 359, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Man Utd", "away": "Leeds", "hf": "MUN", "af": "LEE"}, {"n": 360, "gw": 36, "day": "Sat", "date": "May 15, 2027", "time": "20:00", "home": "Sunderland", "away": "Bournemouth", "hf": "SUN", "af": "BOU"}, {"n": 361, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Bournemouth", "away": "Chelsea", "hf": "BOU", "af": "CHE"}, {"n": 362, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Brentford", "away": "Hull", "hf": "BRE", "af": "HUL"}, {"n": 363, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Brighton", "away": "Liverpool", "hf": "BHA", "af": "LIV"}, {"n": 364, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Everton", "away": "Arsenal", "hf": "EVE", "af": "ARS"}, {"n": 365, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Fulham", "away": "Coventry", "hf": "FUL", "af": "COV"}, {"n": 366, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Leeds", "away": "Sunderland", "hf": "LEE", "af": "SUN"}, {"n": 367, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Man City", "away": "Aston Villa", "hf": "MCI", "af": "AVL"}, {"n": 368, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Newcastle", "away": "Crystal Palace", "hf": "NEW", "af": "CRY"}, {"n": 369, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Nott'm Forest", "away": "Ipswich", "hf": "NFO", "af": "IPS"}, {"n": 370, "gw": 37, "day": "Sun", "date": "May 23, 2027", "time": "20:00", "home": "Spurs", "away": "Man Utd", "hf": "TOT", "af": "MUN"}, {"n": 371, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Arsenal", "away": "Brighton", "hf": "ARS", "af": "BHA"}, {"n": 372, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Aston Villa", "away": "Spurs", "hf": "AVL", "af": "TOT"}, {"n": 373, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Chelsea", "away": "Brentford", "hf": "CHE", "af": "BRE"}, {"n": 374, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Coventry", "away": "Nott'm Forest", "hf": "COV", "af": "NFO"}, {"n": 375, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Crystal Palace", "away": "Leeds", "hf": "CRY", "af": "LEE"}, {"n": 376, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Hull", "away": "Newcastle", "hf": "HUL", "af": "NEW"}, {"n": 377, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Ipswich", "away": "Everton", "hf": "IPS", "af": "EVE"}, {"n": 378, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Liverpool", "away": "Bournemouth", "hf": "LIV", "af": "BOU"}, {"n": 379, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Man Utd", "away": "Fulham", "hf": "MUN", "af": "FUL"}, {"n": 380, "gw": 38, "day": "Sun", "date": "May 30, 2027", "time": "21:00", "home": "Sunderland", "away": "Man City", "hf": "SUN", "af": "MCI"}];

const RULES = { min: 200, max: 1000, minCategories: 2, currency: "Coins" };

/* ---------- match timing & lock (picks close 1 min before kickoff) ---------- */
const LOCK_MIN = 1;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
function kickoffMs(m) {
  // m.date "Jun 12, 2026", m.time "01:00" — fixtures are authored in GMT+6 (Dhaka)
  const [mon, day, year] = m.date.replace(",", "").split(/\s+/);
  const mm = String((MONTHS[mon] ?? 0) + 1).padStart(2, "0");
  const dd = String(parseInt(day, 10)).padStart(2, "0");
  return new Date(`${year}-${mm}-${dd}T${m.time}:00+06:00`).getTime();
}

/* ---------- gameweeks ---------- */
const GWS = [...new Set(FIXTURES.map((f) => f.gw))].sort((a, b) => a - b);
const gwOf = (n) => FIXTURES.find((f) => f.n === n)?.gw ?? 0;
// The gameweek a slip belongs to: the earliest gameweek it touches.
// Season-long markets (outrights, fantasy, boosts) are not tied to a week
// and use 0, matching the epl_bets.gw check constraint.
function gwForItems(items = []) {
  const gws = items.map((it) => gwOf(it.matchId)).filter((g) => g > 0);
  return gws.length ? Math.min(...gws) : 0;
}
// The gameweek in focus by default: the first with an unplayed fixture.
function currentGw(now = Date.now()) {
  for (const g of GWS) {
    if (FIXTURES.some((f) => f.gw === g && kickoffMs(f) > now)) return g;
  }
  return GWS[GWS.length - 1];
}

// Knockout team editor: team → flag lookup (auto-fills the flag when an admin picks a team),
// and resolvers that apply any per-match team override saved in that match's config (cfg.teams).
const TEAM_FLAGS = FIXTURES.reduce((m, f) => { m[f.home] = f.hf; m[f.away] = f.af; return m; }, {});
const TEAM_NAMES = Object.keys(TEAM_FLAGS).sort();
const effTeams = (m, cfg) => ({
  home: cfg?.teams?.home || m.home, away: cfg?.teams?.away || m.away,
  hf: cfg?.teams?.hf || m.hf, af: cfg?.teams?.af || m.af,
});
const withTeams = (m, cfg) => ({ ...m, ...effTeams(m, cfg) });

/* ---------- Outrights (tournament-long, separate wallet) ---------- */
const OUTRIGHT_RULES = { min: 200, max: 2000 };
// submission deadline: 13 June 2026, 11:30 PM (GMT+6)
// Outrights close 15 minutes before the first kickoff of gameweek 1.
const OUTRIGHT_DEADLINE_MS = Math.min(...FIXTURES.filter((f) => f.gw === 1).map(kickoffMs)) - 15 * 60 * 1000;
const outrightLocked = (now = Date.now()) => now >= OUTRIGHT_DEADLINE_MS;
const outrightDeadlineLocal = () => new Date(OUTRIGHT_DEADLINE_MS).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

// Seed set of 2026 odds — admin can adjust each via the Outrights editor.
const OG_CHAMPION = [["Liverpool","5/2"],["Arsenal","11/4"],["Man City","3/1"],["Chelsea","8/1"],["Newcastle","12/1"],["Man Utd","16/1"],["Spurs","22/1"],["Aston Villa","28/1"],["Brighton","50/1"],["Nott'm Forest","66/1"],["Crystal Palace","80/1"],["Everton","100/1"],["Fulham","150/1"],["Brentford","200/1"],["Bournemouth","200/1"],["Leeds","250/1"],["Sunderland","300/1"],["Ipswich","500/1"],["Hull","750/1"],["Coventry","750/1"]];
const OG_RUNNERUP = [["Arsenal","3/1"],["Liverpool","10/3"],["Man City","7/2"],["Chelsea","6/1"],["Newcastle","9/1"],["Man Utd","12/1"],["Spurs","16/1"],["Aston Villa","20/1"],["Brighton","33/1"],["Nott'm Forest","50/1"],["Crystal Palace","66/1"],["Everton","80/1"],["Fulham","100/1"],["Brentford","150/1"],["Bournemouth","150/1"],["Leeds","200/1"],["Sunderland","250/1"],["Ipswich","400/1"],["Hull","500/1"],["Coventry","500/1"]];
const OG_FINALISTS = [["Liverpool - Arsenal","5/1"],["Liverpool - Man City","11/2"],["Arsenal - Man City","6/1"],["Liverpool - Chelsea","10/1"],["Arsenal - Chelsea","11/1"],["Man City - Chelsea","12/1"],["Liverpool - Newcastle","14/1"],["Arsenal - Newcastle","16/1"],["Man City - Newcastle","16/1"],["Liverpool - Man Utd","18/1"],["Arsenal - Man Utd","20/1"],["Man City - Man Utd","20/1"],["Arsenal - Spurs","25/1"],["Liverpool - Spurs","25/1"],["Chelsea - Newcastle","28/1"],["Arsenal - Aston Villa","33/1"],["Liverpool - Aston Villa","33/1"],["Chelsea - Man Utd","40/1"]];
const OG_BOOT = [["Erling Haaland","5/2"],["Alexander Isak","7/1"],["Mohamed Salah","8/1"],["Viktor Gyokeres","10/1"],["Ollie Watkins","14/1"],["Bryan Mbeumo","16/1"],["Cole Palmer","16/1"],["Bukayo Saka","18/1"],["Chris Wood","20/1"],["Yoane Wissa","25/1"],["Jean-Philippe Mateta","25/1"],["Dominic Solanke","28/1"],["Nicolas Jackson","33/1"],["Matheus Cunha","33/1"],["Jarrod Bowen","40/1"],["Danny Welbeck","50/1"]];
const OG_BALL = [["Mohamed Salah","5/1"],["Erling Haaland","11/2"],["Cole Palmer","7/1"],["Bukayo Saka","8/1"],["Declan Rice","12/1"],["Alexander Isak","12/1"],["Bruno Fernandes","14/1"],["Virgil van Dijk","16/1"],["Rodri","16/1"],["Martin Odegaard","18/1"],["Morgan Rogers","20/1"],["Ryan Gravenberch","22/1"],["Alexis Mac Allister","25/1"],["Sandro Tonali","28/1"],["Eberechi Eze","33/1"],["Anthony Gordon","33/1"]];
const OG_GLOVES = [["Alisson","4/1"],["David Raya","9/2"],["Gianluigi Donnarumma","5/1"],["Robert Sanchez","7/1"],["Nick Pope","8/1"],["Jordan Pickford","9/1"],["Bart Verbruggen","10/1"],["Senne Lammens","12/1"],["Emiliano Martinez","14/1"],["Guglielmo Vicario","16/1"],["Matz Sels","18/1"],["Dean Henderson","20/1"]];
const OG_EMERGING = [["Myles Lewis-Skelly","4/1"],["Rio Ngumoha","11/2"],["Ethan Nwaneri","6/1"],["Archie Gray","8/1"],["Tyler Dibling","9/1"],["Kobbie Mainoo","10/1"],["Jobe Bellingham","12/1"],["Lewis Miley","14/1"],["Harvey Elliott","16/1"],["Jarell Quansah","20/1"],["Josh Acheampong","22/1"],["Chido Obi","25/1"]];
// totals: [line, Over odds, Under odds] — seeded for a 380-match league season; adjust in the odds editor
const OG_GOALS_LINES = [[1050.5,"4/6","11/10"],[1100.5,"10/11","10/11"],[1150.5,"11/10","4/6"],[1200.5,"6/4","1/2"]];
const OG_OWNGOALS_LINES = [[30.5,"5/6","10/11"],[38.5,"11/10","4/6"],[46.5,"6/4","1/2"]];
const OG_CARDS_LINES = [[1500.5,"4/6","11/10"],[1650.5,"10/11","10/11"],[1800.5,"6/4","1/2"]];
const OG_PENS_LINES = [[85.5,"4/6","11/10"],[100.5,"10/11","10/11"],[115.5,"6/4","1/2"]];

function buildOutrightMarkets(cfg = {}) {
  const toSel = (key, pairs, otherLabel, otherOdds) => {
    const sels = pairs.map(([label, o], i) => ({ id: `${key}_${i}`, label, oddsStr: o, odds: toDecimal(o), meta: { og: key } }));
    sels.push({ id: `${key}_other`, label: otherLabel, oddsStr: otherOdds, odds: toDecimal(otherOdds), meta: { og: key, other: true } });
    return sels;
  };
  const toTotals = (key, noun, lines) => {
    const sels = [];
    lines.forEach(([line, ov, un]) => {
      const tag = String(line).replace(".", "_");
      sels.push({ id: `${key}_o${tag}`, label: `Over ${line} ${noun}`, oddsStr: ov, odds: toDecimal(ov), meta: { og: key, ou: "over", line } });
      sels.push({ id: `${key}_u${tag}`, label: `Under ${line} ${noun}`, oddsStr: un, odds: toDecimal(un), meta: { og: key, ou: "under", line } });
    });
    return sels;
  };
  const markets = [
    { key: "og_champion", title: "Champion", icon: "🏆", mode: "multi", type: "winner", searchable: true, selections: toSel("og_champion", OG_CHAMPION, "Any other team", "100/1") },
    { key: "og_runnerup", title: "Runner-Up", icon: "🥈", mode: "multi", type: "winner", searchable: true, selections: toSel("og_runnerup", OG_RUNNERUP, "Any other team", "100/1") },
    { key: "og_finalists", title: "Top Two (both clubs)", icon: "🎟️", mode: "multi", type: "winner", searchable: true, selections: toSel("og_finalists", OG_FINALISTS, "Any other combination", "100/1") },
    { key: "og_boot", title: "Golden Boot (top scorer)", icon: "👟", mode: "multi", type: "winner", searchable: true, selections: toSel("og_boot", OG_BOOT, "Any other player", "100/1") },
    { key: "og_ball", title: "Player of the Season", icon: "⭐", mode: "multi", type: "winner", searchable: true, selections: toSel("og_ball", OG_BALL, "Any other player", "100/1") },
    { key: "og_gloves", title: "Golden Glove (best keeper)", icon: "🧤", mode: "multi", type: "winner", searchable: true, selections: toSel("og_gloves", OG_GLOVES, "Any other player", "66/1") },
    { key: "og_emerging", title: "Young Player of the Season", icon: "🌟", mode: "multi", type: "winner", searchable: true, selections: toSel("og_emerging", OG_EMERGING, "Any other player", "50/1") },
    { key: "og_goals", title: "Season Goals", icon: "🔢", mode: "multi", type: "total", selections: toTotals("og_goals", "goals", OG_GOALS_LINES) },
    { key: "og_owngoals", title: "Season Own Goals", icon: "🥅", mode: "multi", type: "total", selections: toTotals("og_owngoals", "own goals", OG_OWNGOALS_LINES) },
    { key: "og_cards", title: "Season Cards", icon: "🟨", mode: "multi", type: "total", selections: toTotals("og_cards", "cards", OG_CARDS_LINES) },
    { key: "og_pens", title: "Season Penalties Awarded", icon: "🎯", mode: "multi", type: "total", selections: toTotals("og_pens", "penalties", OG_PENS_LINES) },
  ];
  // admin-added / admin-removed selections (winner markets only): teams & players
  const removed = cfg?.removed || {}, added = cfg?.added || {};
  for (const mk of markets) {
    if (mk.type !== "winner") continue;
    if (removed[mk.key]?.length) mk.selections = mk.selections.filter((s) => s.meta.other || !removed[mk.key].includes(s.id));
    const add = (added[mk.key] || []).map((a) => ({ id: a.id, label: a.label, oddsStr: a.oddsStr, odds: toDecimal(a.oddsStr), meta: { og: mk.key } }));
    if (add.length) {
      const oi = mk.selections.findIndex((s) => s.meta.other); // keep the catch-all last
      if (oi >= 0) mk.selections.splice(oi, 0, ...add); else mk.selections.push(...add);
    }
  }
  if (cfg?.odds) for (const mk of markets) for (const s of mk.selections) {
    const o = cfg.odds[mk.key]?.[s.id];
    if (o) { s.oddsStr = o; s.odds = toDecimal(o); }
  }
  return markets;
}
const OG_WINNER_KEYS = ["og_champion", "og_runnerup", "og_finalists", "og_boot", "og_ball", "og_gloves", "og_emerging"];
const OG_TOTAL_KEYS = ["og_goals", "og_owngoals", "og_cards", "og_pens"];
const OUTRIGHT_MATCH = { n: -1, home: "Season", away: "Outrights" };

/* ---------- Fantasy Manager (manager-of-the-month; uses the MATCH wallet) ---------- */
const FANTASY_RULES = { min: 200, max: 1000 };
const BOOST_RULES = { min: 200, max: 1000 }; // special-boost accumulators (match wallet)
// lock time stored as a ms instant; admin enters/views it as GMT+6 (Dhaka) wall-clock
const toLocalInput = (ms) => { if (!ms) return ""; return new Date(ms + 6 * 3600e3).toISOString().slice(0, 16); };
const fromLocalInput = (val) => val ? new Date(val + ":00+06:00").getTime() : null;
function boostCountdown(ms, now = Date.now()) {
  if (!ms) return null;
  const diff = ms - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 8.64e7), h = Math.floor((diff % 8.64e7) / 3.6e6), mn = Math.floor((diff % 3.6e6) / 6e4);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${mn}m` : `${mn}m`;
}
const FM_CATS = [
  { key: "aug", label: "August", mid: -11 }, { key: "sep", label: "September", mid: -12 },
  { key: "oct", label: "October", mid: -13 }, { key: "nov", label: "November", mid: -14 },
  { key: "dec", label: "December", mid: -15 }, { key: "jan", label: "January", mid: -16 },
  { key: "feb", label: "February", mid: -17 }, { key: "mar", label: "March", mid: -18 },
  { key: "apr", label: "April", mid: -19 }, { key: "may", label: "May", mid: -20 },
  { key: "overall", label: "Manager of the Season", mid: -21 },
];
const FM_MID_BY_CAT = Object.fromEntries(FM_CATS.map((c) => [c.key, c.mid]));
// seed managers (from the group's list) — admin can add / delete / rename and set odds per matchday
const FM_DEFAULT_MANAGERS = [
  { id: "m1", name: "Shahed Fazal" }, { id: "m2", name: "Fahim Khan" }, { id: "m3", name: "Abdullah Al Mahmud" },
  { id: "m4", name: "Sayemuzzaman Sonet" }, { id: "m5", name: "Shamim Ahmed" }, { id: "m6", name: "Asif Hasan" },
  { id: "m7", name: "Ponir Ahmad Rigan" }, { id: "m8", name: "Md Golam Jakaria" }, { id: "m9", name: "Margub Ahmed" },
  { id: "m10", name: "Ahmed Saady Yaamin" }, { id: "m11", name: "Md Miljer Rahman" }, { id: "m12", name: "Kayesh S Rahman" },
  { id: "m13", name: "Mostafa Jamil" }, { id: "m14", name: "Safin Islam" }, { id: "m15", name: "Shaed Iqbal" },
  { id: "m16", name: "Mohammad Alauddin" }, { id: "m17", name: "Mohammad Arifur Rahman" }, { id: "m18", name: "Cristiano Messi" },
  { id: "m19", name: "Al Amin Kabir" }, { id: "m20", name: "Rezwan Ahamed Noor" }, { id: "m21", name: "Shayful Mamun" },
  { id: "m22", name: "Newaz Newaz" }, { id: "m23", name: "Amir Safin" }, { id: "m24", name: "Majharul Royhan" },
  { id: "m25", name: "Saurov Hassan" }, { id: "m26", name: "Javed Talukdar" }, { id: "m27", name: "Md. Moniruzzaman" },
  { id: "m28", name: "Hasan Al Banna" }, { id: "m29", name: "S M Sayed Rubel" }, { id: "m30", name: "M M Erfanul Karim" },
];
function buildFantasyMarkets(cfg = {}) {
  const managers = cfg?.managers?.length ? cfg.managers : FM_DEFAULT_MANAGERS;
  return FM_CATS.map((cat) => ({
    key: "fm_" + cat.key, catKey: cat.key, mid: cat.mid, title: cat.label, icon: "🧑‍💼",
    mode: "multi", searchable: managers.length > 8,
    selections: managers.map((m) => {
      const o = cfg?.odds?.[cat.key]?.[m.id] || "5/1";
      return { id: `${cat.key}__${m.id}`, label: m.name, oddsStr: o, odds: toDecimal(o), meta: { fm: cat.key, mid: cat.mid, mgrId: m.id } };
    }),
  }));
}

// Predicted XI (10 outfield starters) per team — used for scorer player dropdowns
// Squad lists are entered by the admin per match (Manage Odds -> players).
// Until a club's squad is entered the scorer markets fall back to generic
// role placeholders, so nothing breaks on an unentered fixture.
const SQUADS = {};

/* ---------- helpers ---------- */
const toDecimal = (frac) => {
  if (typeof frac === "number") return frac + 1;
  const [a, b] = String(frac).split("/").map(Number);
  return b ? 1 + a / b : 2;
};
const money = (n) => `${Math.round(n).toLocaleString()} Coins`;

/* ---------- wallet accounting ---------- */
// Bonus tiers applied to the Match-wallet deposit amount (Outright wallet gets no bonus):
//   up to 5,000        → 0%
//   5,001 – 15,000     → 10%
//   15,001 – 25,000    → 15%
//   25,001 & above     → 20%
function bonusPct(amount) {
  const a = Number(amount) || 0;
  if (a <= 5000) return 0;     // up to 5,000 → no bonus
  if (a <= 15000) return 10;   // 5,001–15,000 → 10%
  if (a <= 25000) return 15;   // 15,001–25,000 → 15%
  return 20;                   // 25,001 & above → 20%
}
// deposit + bonus credited by admin; every stake leaves the balance; won selections return their payout.
// Won/Lost are tallied per selection (singles), so a slip with both winning and losing legs
// reports each correctly. Net is unaffected: net = deposit + bonus − (all staked) + (winning returns).
function walletCalc(deposit, bonus, myBets) {
  deposit = Number(deposit || 0); bonus = Number(bonus || 0);
  let inBets = 0, won = 0, lost = 0, staked = 0;
  (myBets || []).forEach((b) => {
    staked += b.totalStake;
    (b.items || []).forEach((it) => {
      if (it.status === "won") won += it.stake * it.odds;       // full return on winning selections
      else if (it.status === "lost") lost += it.stake;          // stake lost on losing selections
      else if (it.status === "open") inBets += it.stake;        // still in play — stake tied up
      // void: excluded entirely
    });
  });
  return { deposit, bonus, inBets, won, lost, net: deposit + bonus - staked + won };
}
const walletOf = (profile, myBets) => walletCalc(profile?.deposit, profile?.bonus, myBets);
const walletOg = (profile, myBets) => walletCalc(profile?.og_deposit, profile?.og_bonus, myBets);
const uid = () => Math.random().toString(36).slice(2, 9);
const betCode = () => "EPL2627-" + Math.floor(100000 + Math.random() * 899999);

const lockMs = (m) => kickoffMs(m) - LOCK_MIN * 60 * 1000;
const isLocked = (m, now = Date.now()) => now >= lockMs(m);
// countdown shown as days / hours / minutes
function lockCountdown(m, now = Date.now()) {
  const diff = lockMs(m) - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 8.64e7);
  const h = Math.floor((diff % 8.64e7) / 3.6e6);
  const mn = Math.floor((diff % 3.6e6) / 6e4);
  if (d > 0) return `${d}d ${h}h ${mn}m`;
  if (h > 0) return `${h}h ${mn}m`;
  return `${mn}m`;
}
// the viewer's local timezone (dynamic)
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const TZ_ABBR = (() => {
  try { return new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || ""; }
  catch { return ""; }
})();
// kickoff shown in the viewer's local time, "Fri, Jun 12, 7:00 AM"
function kickoffLocal(m, opts = {}) {
  return new Date(kickoffMs(m)).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", ...opts });
}
const kickoffTimeLocal = (m) => new Date(kickoffMs(m)).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/* ---------- data access (Supabase; shared across all users) ---------- */
// Supabase caps a single select() at the project's "Max rows" limit (1,000 by default).
// Once the pool passes that many slips/transactions, a plain select silently drops the
// OLDEST rows — which corrupts wallet balances, My Picks and the settlement views.
// This pages through the whole table in fixed windows so the app always loads every row,
// regardless of the dashboard cap. Read-only; it never writes data.
async function fetchAllRows(table, orderCol, ascending = false) {
  const PAGE = 1000;
  let from = 0, all = [];
  for (;;) {
    const { data, error } = await supabase
      .from(table).select("*").order(orderCol, { ascending })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    all = all.concat(data || []);
    if (!data || data.length < PAGE) break; // last (short) page reached
    from += PAGE;
  }
  return all;
}

const db = {
  async fetchBets() {
    const data = await fetchAllRows("epl_bets", "placed_at", false);
    return (data || []).map((b) => ({
      id: b.id, code: b.code, user: b.nickname, userId: b.user_id, ts: b.placed_at,
      items: b.items, totalStake: Number(b.total_stake), potential: Number(b.potential),
      payout: Number(b.payout || 0), status: b.status, kind: b.kind || "match", gw: b.gw ?? 0,
    }));
  },
  async fetchResults() {
    const { data, error } = await supabase.from("epl_results").select("*");
    if (error) throw error;
    const map = {};
    (data || []).forEach((r) => { map[r.match_no] = r.payload; });
    return map;
  },
  async insertBet(bet, userId) {
    // gw is stored on the row so a gameweek's picks can be read without
    // pulling the whole season. Season-long markets use 0.
    const { error } = await supabase.from("epl_bets").insert({
      user_id: userId, nickname: bet.user, code: bet.code, items: bet.items,
      gw: bet.kind && bet.kind !== "match" ? 0 : gwForItems(bet.items),
      total_stake: bet.totalStake, potential: bet.potential, status: "open", kind: bet.kind || "match",
    });
    if (error) throw error;
  },
  async upsertResult(matchNo, payload, userId) {
    const { error } = await supabase.from("epl_results")
      .upsert({ match_no: matchNo, payload, settled_by: userId, settled_at: new Date().toISOString() });
    if (error) throw error;
  },
  async deleteResult(matchNo) {
    const { error } = await supabase.from("epl_results").delete().eq("match_no", matchNo);
    if (error) throw error;
  },
  async resetAll() {
    let e;
    ({ error: e } = await supabase.from("epl_bets").delete().not("id", "is", null)); if (e) throw e;
    ({ error: e } = await supabase.from("epl_transactions").delete().not("id", "is", null)); if (e) throw e;
    ({ error: e } = await supabase.from("epl_results").delete().not("match_no", "is", null)); if (e) throw e;
    // zeroes the EPL wallets only; the World Cup balances on profiles are left alone
    ({ error: e } = await supabase.from("epl_wallets")
      .update({ deposit: 0, bonus: 0, og_deposit: 0, og_bonus: 0 }).not("user_id", "is", null)); if (e) throw e;
  },
  async updateBet(id, patch) {
    const { error } = await supabase.from("epl_bets").update(patch).eq("id", id);
    if (error) throw error;
  },
  async fetchConfigs() {
    const { data, error } = await supabase.from("epl_match_config").select("*");
    if (error) throw error;
    const map = {};
    (data || []).forEach((c) => { map[c.match_no] = c.config; });
    return map;
  },
  async saveConfig(matchNo, config, userId) {
    const { error } = await supabase.from("epl_match_config")
      .upsert({ match_no: matchNo, config, updated_by: userId, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
  async saveConfigMany(rows, userId) {
    if (!rows.length) return;
    const payload = rows.map((r) => ({ match_no: r.matchNo, config: r.config, updated_by: userId, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("epl_match_config").upsert(payload);
    if (error) throw error;
  },
  async fetchProfiles() {
    const { data, error } = await supabase.from("profiles").select("id,nickname,full_name,is_admin");
    if (error) throw error;
    // Coin balances live in epl_wallets, NOT on profiles: the World Cup pool's
    // final settled balances are still in profiles.deposit/bonus and must not
    // be touched. Accounts are shared; money is per-pool.
    const { data: w, error: wErr } = await supabase.from("epl_wallets")
      .select("user_id,deposit,bonus,og_deposit,og_bonus");
    if (wErr) throw wErr;
    const byId = {};
    (w || []).forEach((r) => { byId[r.user_id] = r; });
    return (data || []).map((p) => ({
      ...p,
      deposit: Number(byId[p.id]?.deposit || 0),
      bonus: Number(byId[p.id]?.bonus || 0),
      og_deposit: Number(byId[p.id]?.og_deposit || 0),
      og_bonus: Number(byId[p.id]?.og_bonus || 0),
    }));
  },
  async creditPlayer(id, deposit, bonus) {
    const { error } = await supabase.from("epl_wallets")
      .upsert({ user_id: id, deposit, bonus, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
  },
  async creditPlayerOg(id, og_deposit, og_bonus) {
    const { error } = await supabase.from("epl_wallets")
      .upsert({ user_id: id, og_deposit, og_bonus, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
  },
  async fetchTransactions() {
    return await fetchAllRows("epl_transactions", "created_at", false);
  },
  async addTransaction(t, userId) {
    const { error } = await supabase.from("epl_transactions")
      .insert({ user_id: t.user_id, nickname: t.nickname, deposit: t.deposit, bonus: t.bonus, created_by: userId, kind: t.kind || "match", note: t.note || "" });
    if (error) throw error;
  },
};

/* ---------- Market template (the group's prediction sheet, generalized) ---------- */
// default first/anytime odds ladder by squad position (defenders longer, forwards shorter)
const FIRST_ODDS = ["12/1", "11/1", "10/1", "9/1", "8/1", "7/1", "6/1", "5/1", "9/2", "4/1"];
const ANY_ODDS = ["6/1", "11/2", "5/1", "9/2", "4/1", "7/2", "3/1", "5/2", "9/4", "2/1"];
// Resolve the canonical team key from a clean name OR a descriptive label containing one
// (e.g. "Winner of 89 (Morocco)" → "Morocco"). Used for squads and auto-flag.
function teamKeyFor(name) {
  if (!name) return null;
  if (SQUADS[name]) return name;
  const low = String(name).toLowerCase();
  return TEAM_NAMES.filter((t) => low.includes(t.toLowerCase())).sort((a, b) => b.length - a.length)[0] || null;
}
function squadFor(name) { const k = teamKeyFor(name); return k ? SQUADS[k] : null; }

function defaultPlayers(team, side) {
  const squad = squadFor(team);
  if (squad && squad.length) {
    // seed the scorer markets with the 10 outfield starters (listed first); admin can add the rest from the dropdown
    return squad.slice(0, 10).map((name, i) => ({ name, first: FIRST_ODDS[i] || "12/1", any: ANY_ODDS[i] || "6/1" }));
  }
  const base = side === "home"
    ? [["Striker", "3/1", "1/1"], ["Forward", "7/2", "6/4"], ["Midfielder", "5/1", "2/1"], ["Winger", "6/1", "3/1"]]
    : [["Striker", "4/1", "2/1"], ["Forward", "9/2", "5/2"], ["Midfielder", "6/1", "3/1"], ["Winger", "8/1", "4/1"]];
  return base.map(([role, f, a]) => ({ name: `${team} · ${role}`, first: f, any: a }));
}

// player → position (GK/DF/MD/FWD) from the predicted-XI list; admin can override per match
const POS_BY_NAME = {};

// Baked-in tuned default odds for the Round of 32 (matches 73-88). Any saved DB config
// for a match fully overrides this default (see configs loader), so it is non-destructive.
// No pre-seeded per-match odds for the league. The admin publishes each
// gameweek from Quick Odds / Manage Odds, which is what sets `live` and
// makes a fixture appear to players. Built-in ladders still apply as the
// starting point for every market.
const DEFAULT_CONFIGS = {};

function buildMarkets(m, cfg = {}) {
  const _t = effTeams(m, cfg);
  const H = _t.home, A = _t.away;
  const sel = (id, label, oddsStr, meta = {}) => ({ id, label, oddsStr, odds: toDecimal(oddsStr), meta });

  const homeP = cfg?.players?.home?.length ? cfg.players.home : defaultPlayers(H, "home");
  const awayP = cfg?.players?.away?.length ? cfg.players.away : defaultPlayers(A, "away");
  const plabel = (p) => { const pos = p.pos || POS_BY_NAME[(p.name || "").trim().toLowerCase()]; return pos ? `${p.name} (${pos})` : p.name; };
  const scorerSel = (kind) => [
    ...homeP.map((p, i) => sel("h" + kind[0] + i, plabel(p), kind === "first" ? (p.first || "10/1") : (p.any || "4/1"), { scorer: p.name, order: kind })),
    ...awayP.map((p, i) => sel("a" + kind[0] + i, plabel(p), kind === "first" ? (p.first || "10/1") : (p.any || "4/1"), { scorer: p.name, order: kind })),
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
        sel("csh", `${H} Clean Sheet`, "6/4", { sp: "cleanSheet", team: "H" }),
        sel("csa", `${A} Clean Sheet`, "5/2", { sp: "cleanSheet", team: "A" }),
        sel("wfbh", `${H} Win From Behind`, "5/1", { sp: "winFromBehind", team: "H" }),
        sel("wfba", `${A} Win From Behind`, "8/1", { sp: "winFromBehind", team: "A" }),
        sel("bhh", `${H} Score in Both Halves`, "3/1", { sp: "bothHalves", team: "H" }),
        sel("bha", `${A} Score in Both Halves`, "9/2", { sp: "bothHalves", team: "A" }),
        ...((cfg?.specials || []).filter((s) => (s.label || "").trim()).map((s) =>
          sel(s.id, s.label.trim(), s.odds || "2/1", { sp: "custom", cid: s.id }))),
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
    { key: "total_cards", title: "Total Cards", mode: "multi", icon: "🟨",
      selections: [
        sel("c0", "No Cards", "6/1", { c: { eq: 0 } }), sel("c1", "1 Card", "4/1", { c: { eq: 1 } }),
        sel("c2", "2 Cards", "3/1", { c: { eq: 2 } }), sel("c3", "3 Cards", "1/1", { c: { eq: 3 } }),
        sel("c4", "4 Cards", "2/1", { c: { eq: 4 } }), sel("c5", "5 Cards", "4/1", { c: { eq: 5 } }),
        sel("c6", "6 Cards", "6/1", { c: { eq: 6 } }), sel("c8", "More than 7", "10/1", { c: { gt: 7 } }),
      ] },
    { key: "own_goal", title: "Own Goal Market", mode: "multi", icon: "🥅",
      selections: [
        sel("ogh", `${H} concede Own Goal`, "10/1", { og: "H" }),
        sel("oga", `${A} concede Own Goal`, "10/1", { og: "A" }),
      ] },
  ];

  // admin-added extra options for HT/FT correct score & total goals — meta is set so the
  // EXISTING settlement engine grades them automatically (no settlement changes needed)
  const addLines = cfg?.addLines || {};
  for (const mk of markets) {
    const extra = addLines[mk.key];
    if (!extra?.length) continue;
    const sels = extra.map((a) => {
      const sc = a.meta?.ft || a.meta?.ht;
      const label = ((mk.key === "ft_score" || mk.key === "ht_score") && sc && sc !== "__OTHER__")
        ? `${H} ${sc} ${A}` : a.label; // follow the current team names instead of a frozen label
      return { id: a.id, label, oddsStr: a.oddsStr, odds: toDecimal(a.oddsStr), meta: a.meta };
    });
    const oi = mk.selections.findIndex((s) => s.meta?.ht === "__OTHER__" || s.meta?.ft === "__OTHER__"); // keep "Other Score" last
    if (oi >= 0) mk.selections.splice(oi, 0, ...sels); else mk.selections.push(...sels);
  }

  // apply admin odds overrides for the fixed markets
  if (cfg?.odds) for (const mk of markets) for (const s of mk.selections) {
    const o = cfg.odds[mk.key]?.[s.id];
    if (o) { s.oddsStr = o; s.odds = toDecimal(o); }
  }
  // admin-removed default options for THIS match — hidden from new pick slips only.
  // Already-placed bets keep their own meta and still settle exactly as before (no grading change).
  const off = new Set(cfg?.off || []);
  if (off.size) for (const mk of markets) mk.selections = mk.selections.filter((s) => !off.has(s.id));
  return markets;
}

// names the admin has listed for a match — used so "Other Player" settles correctly
function knownScorerNames(m, cfg = {}) {
  return buildMarkets(m, cfg)
    .find((x) => x.key === "anytime_scorer").selections
    .filter((s) => s.meta.scorer !== "__OTHER__")
    .map((s) => s.meta.scorer.trim().toLowerCase());
}

// explicitly listed correct-score lines for a match — used so "Any Other Score" settles correctly
// (a typed score that IS listed is not "other", so it must not win at the catch-all odds)
function knownScoreLines(m, cfg = {}) {
  const mk = buildMarkets(m, cfg);
  const grab = (key, field) => (mk.find((x) => x.key === key)?.selections || [])
    .map((s) => s.meta?.[field]).filter((v) => v && v !== "__OTHER__").map((v) => String(v).replace(/\s/g, ""));
  return { ht: grab("ht_score", "ht"), ft: grab("ft_score", "ft") };
}

// stop a player from entering an outcome in an "Other" box when it's already a listed option
// (that listed option has its own — usually shorter — odds). Returns a message, or null if fine.
function otherDuplicateMsg(s, configs) {
  const m = FIXTURES.find((f) => f.n === s.matchId);
  if (!m) return null;
  const mkts = buildMarkets(m, configs?.[s.matchId] || {});
  const mk = mkts.find((x) => x.key === s.marketKey);
  if (!mk) return null;
  if (s.meta?.scorer === "__OTHER__") {
    const cn = (s.customName || "").trim().toLowerCase();
    if (!cn) return null;
    const hit = mk.selections.find((x) => x.meta?.scorer && x.meta.scorer !== "__OTHER__" && x.meta.scorer.trim().toLowerCase() === cn);
    if (hit) return `${hit.meta.scorer} is already listed at ${hit.oddsStr} in ${mk.title} — pick that option instead of “Other Player”.`;
  }
  if (s.meta?.ht === "__OTHER__" || s.meta?.ft === "__OTHER__") {
    const field = s.meta?.ht === "__OTHER__" ? "ht" : "ft";
    const cn = (s.customName || "").replace(/\s/g, "");
    if (!cn) return null;
    const hit = mk.selections.find((x) => x.meta?.[field] && x.meta[field] !== "__OTHER__" && String(x.meta[field]).replace(/\s/g, "") === cn);
    if (hit) return `“${hit.label}” is already listed at ${hit.oddsStr} in ${mk.title} — pick that option instead of “Any Other Score”.`;
  }
  return null;
}

/* ---------- settlement engine ---------- */
function evaluateItem(item, R) {
  const { marketKey, meta } = item;
  if (marketKey && marketKey.startsWith("fm_")) return !!R?.fmWinner && item.selId === R.fmWinner;
  const ftH = R.ft?.h, ftA = R.ft?.a, htH = R.ht?.h, htA = R.ht?.a;
  const total = (ftH ?? 0) + (ftA ?? 0);
  switch (marketKey) {
    case "match_result": {
      const r = ftH > ftA ? "H" : ftH < ftA ? "A" : "D";
      return meta.res === r;
    }
    case "specials": {
      const t = meta.team;
      if (meta.sp === "cleanSheet") return t === "H" ? (ftA === 0) : (ftH === 0);
      if (meta.sp === "winFromBehind") return t === "H" ? !!R.wfbH : !!R.wfbA;
      if (meta.sp === "bothHalves") return t === "H" ? !!R.bhH : !!R.bhA;
      if (meta.sp === "custom") return !!R.customSpecials?.[meta.cid];
      return false;
    }
    case "first_scorer": {
      const first = (R.scorers?.[0] || "").trim().toLowerCase();
      const known = R.knownScorers || [];
      if (meta.scorer === "__OTHER__") {
        const cn = (item.customName || "").trim().toLowerCase();
        // "Other Player" only covers players NOT explicitly listed in this match
        return cn ? (first === cn && !known.includes(cn)) : (!!first && !known.includes(first));
      }
      return first === stripPlayer(meta.scorer);
    }
    case "anytime_scorer": {
      const all = (R.scorers || []).map((s) => s.trim().toLowerCase());
      const known = R.knownScorers || [];
      if (meta.scorer === "__OTHER__") {
        const cn = (item.customName || "").trim().toLowerCase();
        return cn ? (all.includes(cn) && !known.includes(cn)) : all.some((s) => s && !known.includes(s));
      }
      return all.includes(stripPlayer(meta.scorer));
    }
    case "ht_score": {
      const s = `${htH}-${htA}`;
      if (meta.ht === "__OTHER__") {
        const cn = (item.customName || "").replace(/\s/g, "");
        const knownHt = R.knownHtScores || [];
        if (cn) return cn === s && !knownHt.includes(cn); // typed score must match AND not be a listed line
        return ![ "1-0","2-0","2-1","0-0","1-1","0-1","0-2" ].includes(s); // legacy fallback
      }
      return meta.ht === s;
    }
    case "ft_score": {
      const s = `${ftH}-${ftA}`;
      if (meta.ft === "__OTHER__") {
        const cn = (item.customName || "").replace(/\s/g, "");
        const knownFt = R.knownFtScores || [];
        if (cn) return cn === s && !knownFt.includes(cn);
        return ![ "1-0","2-0","2-1","3-1","0-0","1-1","2-2","0-1","1-2" ].includes(s);
      }
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
      if (total === 0) return false; // no goal scored → there is no "first goal method", all picks lose
      return R.firstGoalMethod === meta.gm;
    case "total_cards": {
      const c = meta.c, cards = R.totalCards ?? 0;
      if (c.eq !== undefined) return cards === c.eq;
      if (c.gt !== undefined) return cards > c.gt;
      return false;
    }
    case "own_goal":
      return meta.og === "H" ? !!R.ownGoalH : !!R.ownGoalA;
    case "og_champion": case "og_runnerup": case "og_finalists": case "og_boot": case "og_ball": case "og_gloves": case "og_emerging": {
      const win = R[marketKey];
      if (!win || item.selId !== win) return false;
      if (item.meta?.other) {
        const wn = (R[marketKey + "_name"] || "").trim().toLowerCase();
        const cn = (item.customName || "").trim().toLowerCase();
        return !!wn && wn === cn; // "Any other" pays only if the typed name matches the declared winner
      }
      return true;
    }
    case "og_goals": case "og_owngoals": case "og_cards": case "og_pens": {
      const total = R[marketKey + "_total"];
      if (total === undefined || total === null || total === "") return false; // not settled yet
      const t = Number(total), line = Number(item.meta?.line);
      return item.meta?.ou === "over" ? t > line : t < line; // .5 lines → no push
    }
    default:
      return false;
  }
}
const stripPlayer = (p) => p.trim().toLowerCase();

// recompute a slip purely from the current results map (idempotent & reversible).
// an item is open until its match has a result; the slip pays out only if every item won.
// Each selection settles independently (singles). A slip stays open until all its
// selections are decided; then it pays the sum of the winning selections' returns.
function recomputeBet(bet, resultsMap) {
  const live = bet.items.filter((it) => it.status !== "void");
  // Fantasy slips settle leg-by-leg: a decided leg pays out even while other legs (e.g. Overall) are still pending.
  // Every other bet type finalizes as one slip — it stays fully open until all legs are decided.
  const perLeg = bet.kind === "fantasy";
  if (!perLeg) {
    const anyOpen = live.some((it) => !resultsMap[it.matchId]);
    if (anyOpen) return { items: bet.items.map((it) => it.status === "void" ? it : ({ ...it, status: "open" })), status: "open", payout: 0 };
  }
  let payout = 0, anyWon = false, anyOpenLeg = false;
  const items = bet.items.map((it) => {
    if (it.status === "void") return it; // voided picks are settled — excluded from grading & payout
    const R = resultsMap[it.matchId];
    if (perLeg && !R) { anyOpenLeg = true; return { ...it, status: "open" }; } // leg not settled yet
    const won = evaluateItem(it, R);
    if (won) { payout += it.stake * it.odds; anyWon = true; }
    return { ...it, status: won ? "won" : "lost" };
  });
  if (!live.length) return { items, status: "void", payout: 0 }; // whole slip voided
  const status = anyOpenLeg ? "open" : (anyWon ? "won" : "lost");
  return { items, status, payout: anyWon ? payout : 0 };
}

/* ---------- exports (CSV for Excel, print-to-PDF) ---------- */
const matchName = (id) => { if (id == null || Number.isNaN(Number(id))) return "Special Boosts"; if (+id === -1) return "Season Outrights"; const fc = FM_CATS.find((c) => c.mid === +id); if (fc) return `Fantasy Manager — ${fc.label}`; const m = FIXTURES.find((f) => f.n === id); return m ? `${m.home} v ${m.away}` : `Match ${id}`; };
const fmtN = (n) => Math.round(n).toLocaleString();
const signed = (n) => `${n >= 0 ? "+" : "−"}${fmtN(Math.abs(n))}`;
// realized profit/loss for one selection: won → stake×(odds−1); lost → −stake; open → 0 (pending)
const itemPL = (bet, it) => it.status === "won" ? it.stake * (it.odds - 1) : it.status === "lost" ? -it.stake : 0;

// One player's overall position across every wallet & bet kind. Used by the player's own
// wallet screen and the admin Profiles tab so the two always show identical numbers.
// `allMine` = every bet belonging to this player (all kinds).
function playerSummary(profile, allMine) {
  const bs = allMine || [];
  const nonOg = bs.filter((b) => b.kind !== "outright");
  const og = bs.filter((b) => b.kind === "outright");
  const stakeOf = (k) => bs.filter((b) => (b.kind || "match") === k).reduce((a, b) => a + (b.totalStake || 0), 0);
  let wl = 0, inb = 0;
  bs.forEach((b) => (b.items || []).forEach((it) => { wl += itemPL(b, it); if (it.status === "open") inb += it.stake; }));
  const w = walletOf(profile, nonOg), o = walletOg(profile, og);
  return {
    dep: Number(profile?.deposit || 0) + Number(profile?.og_deposit || 0),
    bon: Number(profile?.bonus || 0) + Number(profile?.og_bonus || 0),
    match: stakeOf("match"), out: stakeOf("outright"), boost: stakeOf("boost"), fan: stakeOf("fantasy"),
    wl, inb, net: w.net + o.net,
  };
}

// display text for a pick's selection — appends GK/DF/MD/FWD for scorer picks (even older ones
// whose stored label predates positions), and shows the chosen name for "Other …" picks
function selDisplay(it) {
  const isScorer = it.marketKey === "first_scorer" || it.marketKey === "anytime_scorer";
  let name = it.customName ? `${it.label} — ${it.customName}` : it.label;
  if (isScorer) {
    const who = (it.meta?.scorer && it.meta.scorer !== "__OTHER__") ? it.meta.scorer : (it.customName || "");
    const pos = who && POS_BY_NAME[who.trim().toLowerCase()];
    if (pos && !name.trim().endsWith(")")) name += ` (${pos})`;
  }
  return name;
}

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// rows grouped by (player →) match, with a subtotal per match and a grand total
function exportPicksCSV(bets, filename, byPlayer) {
  const head = ["Player", "Match", "Category", "Selection", "Odds", "Stake (Coins)", "Pick Result", "Slip ID", "Slip Status", "Coins +/−"];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(",")];
  const groups = {};
  if (byPlayer) bets.forEach((b) => (groups[b.user] ||= []).push(b));
  else groups._ = bets;
  let grand = 0, grandStake = 0;
  Object.entries(groups).forEach(([player, pbets]) => {
    const byMatch = {};
    pbets.forEach((b) => b.items.forEach((it) => (byMatch[it.matchId] ||= []).push({ it, b })));
    let playerTotal = 0, playerStake = 0;
    Object.keys(byMatch).sort((a, b) => a - b).forEach((mid) => {
      let sub = 0, subStake = 0;
      byMatch[mid].forEach(({ it, b }) => {
        const pl = itemPL(b, it); sub += pl; subStake += (it.status === "void" ? 0 : it.stake);
        lines.push([byPlayer ? player : "", matchName(+mid), it.marketTitle, selDisplay(it), it.oddsStr, it.stake, it.status, b.code, b.status, Math.round(pl)].map(esc).join(","));
      });
      lines.push(["", matchName(+mid), "", "", "", Math.round(subStake), "", "", "SUBTOTAL", Math.round(sub)].map(esc).join(","));
      playerTotal += sub; playerStake += subStake;
    });
    if (byPlayer) lines.push([player, "", "", "", "", Math.round(playerStake), "", "", "PLAYER TOTAL", Math.round(playerTotal)].map(esc).join(","));
    grand += playerTotal; grandStake += playerStake;
  });
  lines.push(["", "", "", "", "", Math.round(grandStake), "", "", "TOTAL (ALL MATCHES)", Math.round(grand)].map(esc).join(","));
  downloadFile(filename, "\ufeff" + lines.join("\n"), "text/csv;charset=utf-8");
}

function exportTransactionsCSV(txns, filename) {
  const head = ["Date", "Player", "Wallet", "Note", "Deposit (Coins)", "Bonus (Coins)", "Total (Coins)"];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(",")];
  let d = 0, bo = 0;
  txns.forEach((t) => {
    d += Number(t.deposit); bo += Number(t.bonus);
    lines.push([new Date(t.created_at).toLocaleString(), t.nickname, t.kind === "outright" ? "Outright" : "Match", t.note || "", Math.round(t.deposit), Math.round(t.bonus), Math.round(Number(t.deposit) + Number(t.bonus))].map(esc).join(","));
  });
  lines.push(["", "TOTAL", "", "", Math.round(d), Math.round(bo), Math.round(d + bo)].map(esc).join(","));
  downloadFile(filename, "\ufeff" + lines.join("\n"), "text/csv;charset=utf-8");
}

function picksHTML(bets, title, byPlayer) {
  const groups = {};
  if (byPlayer) bets.forEach((b) => (groups[b.user] ||= []).push(b));
  else groups._ = bets;
  const plCell = (n) => `<td class="pl ${n >= 0 ? "pos" : "neg"}">${signed(n)}</td>`;
  let body = "", grand = 0, grandStake = 0;
  Object.entries(groups).forEach(([player, pbets]) => {
    if (byPlayer) body += `<h2>${player}</h2>`;
    const byMatch = {};
    pbets.forEach((b) => b.items.forEach((it) => (byMatch[it.matchId] ||= []).push({ it, b })));
    const ids = Object.keys(byMatch).sort((a, b) => a - b);
    if (!ids.length) { body += `<p class="empty">No picks.</p>`; return; }
    let playerTotal = 0, playerStake = 0;
    ids.forEach((mid) => {
      body += `<h3>${matchName(+mid)}</h3><table><thead><tr><th>Category</th><th>Selection</th><th>Odds</th><th>Stake</th><th>Result</th><th>Coins +/−</th></tr></thead><tbody>`;
      let sub = 0, subStake = 0;
      // club identical picks (same category + selection + odds) placed across multiple slips
      const grouped = {};
      byMatch[mid].forEach(({ it, b }) => {
        const k = `${it.marketKey}|${it.selId}|${(it.customName || "")}|${it.oddsStr}|${it.status}`;
        if (!grouped[k]) { grouped[k] = { it, stake: 0, pl: 0, n: 0 }; }
        grouped[k].stake += (it.status === "void" ? 0 : it.stake); grouped[k].pl += itemPL(b, it); grouped[k].n++;
      });
      Object.values(grouped).forEach((g) => {
        const it = g.it; sub += g.pl; subStake += g.stake;
        const mult = g.n > 1 ? ` <span style="color:#6b7a74">×${g.n}</span>` : "";
        body += `<tr><td>${it.marketTitle}</td><td>${selDisplay(it)}${mult}</td><td>${it.oddsStr}</td><td>${fmtN(g.stake)}</td><td class="s-${it.status}">${it.status}</td>${plCell(g.pl)}</tr>`;
      });
      body += `<tr class="sub"><td colspan="3">Match subtotal</td><td>${fmtN(subStake)}</td><td></td>${plCell(sub)}</tr></tbody></table>`;
      playerTotal += sub; playerStake += subStake;
    });
    if (byPlayer) body += `<table><tbody><tr class="tot"><td colspan="3">${player} — total (all matches)</td><td>${fmtN(playerStake)}</td><td></td>${plCell(playerTotal)}</tr></tbody></table>`;
    grand += playerTotal; grandStake += playerStake;
  });
  body += `<table><tbody><tr class="grand"><td colspan="3">TOTAL — all matches</td><td>${fmtN(grandStake)}</td><td></td>${plCell(grand)}</tr></tbody></table>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#13211c;padding:22px;max-width:860px;margin:auto}
    h1{font-size:19px;margin:0 0 3px;color:#0b3d2e}
    .sub-h{color:#6b7a74;font-size:11px;margin-bottom:14px}
    h2{font-size:15px;margin:18px 0 6px;color:#0e7c5a;border-bottom:2px solid #0e7c5a;padding-bottom:3px}
    h3{font-size:12.5px;margin:11px 0 3px;color:#0b3d2e}
    table{width:100%;border-collapse:collapse;margin-bottom:6px;font-size:11px}
    th{background:#0b3d2e;color:#fff;text-align:left;padding:5px 7px}
    td{border-bottom:1px solid #e2e8e4;padding:4px 7px}
    .pl{text-align:right;font-weight:700}.pos{color:#0e7c5a}.neg{color:#c0392b}
    .s-won{color:#0e7c5a;font-weight:700}.s-lost{color:#c0392b}.empty{color:#6b7a74;font-size:11px}
    tr.sub td{background:#f1f8f4;font-weight:700}
    tr.tot td{background:#eef6ff;font-weight:700}
    tr.grand td{background:#0b3d2e;color:#fff;font-weight:700;font-size:12px}
    @media print{@page{margin:12mm}}
  </style></head><body>
    <h1>SGA · EPL 26-27 — ${title}</h1>
    <div class="sub-h">Generated ${new Date().toLocaleString()} · Coins +/− = net result per selection · Coins are virtual</div>
    ${body}
  </body></html>`;
}

function printPicks(bets, title, byPlayer) {
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups for this site to download the PDF, then try again."); return; }
  w.document.write(picksHTML(bets, title, byPlayer));
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 500);
}

// transaction-history PDF (ledger = [{date,label,sub,delta}])
function printLedger(rows, title) {
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups for this site to download the PDF, then try again."); return; }
  const plCell = (n) => `<td class="pl ${n >= 0 ? "pos" : "neg"}">${signed(n)}</td>`;
  let body = `<table><thead><tr><th>Date</th><th>Detail</th><th>Coins +/−</th></tr></thead><tbody>`;
  let net = 0;
  rows.forEach((r) => { net += r.delta; body += `<tr><td>${new Date(r.date).toLocaleString()}</td><td><b>${r.label}</b><br><span class="sub2">${r.sub}</span></td>${plCell(r.delta)}</tr>`; });
  body += `<tr class="grand"><td colspan="2">NET</td>${plCell(net)}</tr></tbody></table>`;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#13211c;padding:22px;max-width:760px;margin:auto}
    h1{font-size:18px;margin:0 0 3px;color:#0b3d2e}.sub-h{color:#6b7a74;font-size:11px;margin-bottom:14px}
    table{width:100%;border-collapse:collapse;font-size:11px}th{background:#0b3d2e;color:#fff;text-align:left;padding:5px 7px}
    td{border-bottom:1px solid #e2e8e4;padding:5px 7px;vertical-align:top}.sub2{color:#6b7a74;font-size:10px}
    .pl{text-align:right;font-weight:700;white-space:nowrap}.pos{color:#0e7c5a}.neg{color:#c0392b}
    tr.grand td{background:#0b3d2e;color:#fff;font-weight:700;font-size:12px}@media print{@page{margin:12mm}}
  </style></head><body><h1>SGA · EPL 26-27 — ${title}</h1>
  <div class="sub-h">Generated ${new Date().toLocaleString()} · Coins are virtual</div>${body}</body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 500);
}

/* ============================================================================
   UI
   ============================================================================ */
/* ---------- SGA crest ---------- */
// The artwork lives at public/logo.png (transparent PNG). Kept as a plain
// <img> rather than inlined so the file can be swapped without a code change.
const Crest = ({ className = "h-9 w-9" }) => (
  <img src="/logo.png" alt="SGA EPL 26-27" className={`${className} object-contain select-none`} draggable="false" />
);

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sora:wght@400;500;600;700;800&display=swap');
.font-display{font-family:'Bebas Neue',sans-serif;letter-spacing:.02em}
.font-body{font-family:'Sora',sans-serif}
`;

// Inject PWA manifest + icons/meta into <head> and register the service worker.
// Files live in /public (served at the site root): manifest.webmanifest, sw.js, icon-*.png.
// onUpdate(registration) fires when a newer version has been downloaded and is waiting.
function setupPWA(onUpdate) {
  if (typeof document === "undefined") return;
  const head = document.head;
  const ensure = (sel, make) => { if (!head.querySelector(sel)) head.appendChild(make()); };
  const linkEl = (rel, attrs) => { const l = document.createElement("link"); l.rel = rel; Object.assign(l, attrs); return l; };
  const metaEl = (name, content) => { const m = document.createElement("meta"); m.setAttribute("name", name); m.setAttribute("content", content); return m; };

  ensure('link[rel="manifest"]', () => linkEl("manifest", { href: "/manifest.webmanifest" }));
  ensure('link[rel="apple-touch-icon"]', () => linkEl("apple-touch-icon", { href: "/apple-touch-icon.png" }));
  ensure('link[rel="icon"]', () => linkEl("icon", { href: "/favicon-32.png", type: "image/png" }));
  ensure('meta[name="theme-color"]', () => metaEl("theme-color", "#4C1D95"));
  ensure('meta[name="apple-mobile-web-app-capable"]', () => metaEl("apple-mobile-web-app-capable", "yes"));
  ensure('meta[name="mobile-web-app-capable"]', () => metaEl("mobile-web-app-capable", "yes"));
  ensure('meta[name="apple-mobile-web-app-status-bar-style"]', () => metaEl("apple-mobile-web-app-status-bar-style", "black-translucent"));
  ensure('meta[name="apple-mobile-web-app-title"]', () => metaEl("apple-mobile-web-app-title", "SGA EPL 26-27"));

  if ("serviceWorker" in navigator) {
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return; reloading = true; window.location.reload();
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // a newer worker is already installed and waiting
        if (reg.waiting && navigator.serviceWorker.controller) onUpdate?.(reg);
        // a newer worker is downloading now
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) onUpdate?.(reg);
          });
        });
      }).catch((e) => console.warn("SW registration failed:", e));
    });
  }
}

// tell the waiting worker to take over, which triggers the controllerchange reload above
function applyPWAUpdate(reg) {
  if (reg && reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
  else window.location.reload();
}

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
  const [ogSlip, setOgSlip] = useState([]);
  const [fmSlip, setFmSlip] = useState([]);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [recovery, setRecovery] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  // Progressive Web App: make the app installable to the home screen.
  const [swUpdate, setSwUpdate] = useState(null);
  useEffect(() => { setupPWA((reg) => setSwUpdate(reg)); }, []);

  const showToast = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  // auth session
  useEffect(() => {
    if (!hasSupabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
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
      setBets(b); setResults(r); setConfigs({ ...DEFAULT_CONFIGS, ...c }); setPlayers(ps); setTxns(tx);
      const mine = ps.find((p) => p.id === session.user.id);
      if (mine) setProfile((prev) => ({ ...prev, ...mine }));
    } catch (e) { console.error(e); }
  }, [session]);

  // initial load + realtime sync of shared data
  useEffect(() => {
    if (!session) return;
    refresh();
    const ch = supabase.channel("pool")
      .on("postgres_changes", { event: "*", schema: "public", table: "epl_bets" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "epl_results" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "epl_match_config" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "epl_wallets" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "epl_transactions" }, refresh)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [session, refresh]);

  const placeBet = async (bet) => { await db.insertBet(bet, session.user.id); await refresh(); };

  // void a single pick (selection) within a slip: refund its stake, exclude it from settlement.
  // works whether the slip is open or already settled — re-grades the remaining picks from current results.
  const voidPick = async (betId, selId, matchId, reason) => {
    const b = bets.find((x) => x.id === betId);
    if (!b) throw new Error("Slip not found");
    const items = b.items.map((it) =>
      (it.selId === selId && it.matchId === matchId && it.status !== "void")
        ? { ...it, status: "void", voidReason: (reason || "").trim(), voidedAt: new Date().toISOString(), voidedBy: profile.nickname }
        : it);
    const live = items.filter((it) => it.status !== "void");
    const total_stake = live.reduce((a, it) => a + it.stake, 0);
    const potential = live.reduce((a, it) => a + it.stake * it.odds, 0);
    const graded = recomputeBet({ ...b, items }, results);
    await db.updateBet(betId, { items: graded.items, status: graded.status, payout: graded.payout, total_stake, potential });
    await refresh();
  };

  const saveConfig = async (matchNo, config) => { await db.saveConfig(matchNo, config, session.user.id); await refresh(); };
  const saveConfigMany = async (rows) => { await db.saveConfigMany(rows, session.user.id); await refresh(); };
  const creditPlayer = async (player, addDeposit, addBonus, note) => {
    await db.creditPlayer(player.id, Number(player.deposit || 0) + addDeposit, Number(player.bonus || 0) + addBonus);
    await db.addTransaction({ user_id: player.id, nickname: player.nickname, deposit: addDeposit, bonus: addBonus, kind: "match", note }, session.user.id);
    await refresh();
  };
  const creditPlayerOg = async (player, addDeposit, addBonus, note) => {
    await db.creditPlayerOg(player.id, Number(player.og_deposit || 0) + addDeposit, Number(player.og_bonus || 0) + addBonus);
    await db.addTransaction({ user_id: player.id, nickname: player.nickname, deposit: addDeposit, bonus: addBonus, kind: "outright", note }, session.user.id);
    await refresh();
  };

  const settleMatch = async (matchNo, R0) => {
    const match = FIXTURES.find((f) => f.n === matchNo);
    const lines = knownScoreLines(match, configs[matchNo]);
    const R = { ...R0, knownScorers: knownScorerNames(match, configs[matchNo]), knownHtScores: lines.ht, knownFtScores: lines.ft };
    await db.upsertResult(matchNo, R, session.user.id);
    const newResults = { ...results, [matchNo]: R };
    const affected = bets.filter((b) => b.kind !== "outright" && b.items.some((it) => it.matchId === matchNo));
    for (const b of affected) await db.updateBet(b.id, recomputeBet(b, newResults));
    await refresh();
  };

  const resetMatch = async (matchNo) => {
    await db.deleteResult(matchNo);
    const newResults = { ...results }; delete newResults[matchNo];
    const affected = bets.filter((b) => b.kind !== "outright" && b.items.some((it) => it.matchId === matchNo));
    for (const b of affected) await db.updateBet(b.id, recomputeBet(b, newResults));
    await refresh();
  };

  // settle outrights: R holds the winning selection id per market (og_champion, og_runnerup, ...)
  const settleOutright = async (R) => {
    await db.upsertResult(-1, R, session.user.id);
    const newResults = { ...results, [-1]: R };
    const affected = bets.filter((b) => b.kind === "outright");
    for (const b of affected) await db.updateBet(b.id, recomputeBet(b, newResults));
    await refresh();
  };

  const resetOutright = async () => {
    await db.deleteResult(-1);
    const newResults = { ...results }; delete newResults[-1];
    const affected = bets.filter((b) => b.kind === "outright");
    for (const b of affected) await db.updateBet(b.id, recomputeBet(b, newResults));
    await refresh();
  };

  // Fantasy Manager: each category settles independently at its own pseudo-match id (uses MATCH wallet)
  const settleFantasy = async (mid, selId) => {
    const R = { fmWinner: selId };
    await db.upsertResult(mid, R, session.user.id);
    const newResults = { ...results, [mid]: R };
    const affected = bets.filter((b) => b.kind === "fantasy" && b.items.some((it) => it.matchId === mid));
    for (const b of affected) await db.updateBet(b.id, recomputeBet(b, newResults));
    await refresh();
  };
  const resetFantasy = async (mid) => {
    await db.deleteResult(mid);
    const newResults = { ...results }; delete newResults[mid];
    const affected = bets.filter((b) => b.kind === "fantasy" && b.items.some((it) => it.matchId === mid));
    for (const b of affected) await db.updateBet(b.id, recomputeBet(b, newResults));
    await refresh();
  };

  const resetAll = async () => { await db.resetAll(); await refresh(); };

  // Special Boosts: manual Won/No per boost. Boost bets are single-pick slips (kind "boost") on the MATCH wallet.
  const settleBoost = async (boostId, result) => {
    const cfg = configs[-3] || { boosts: [] };
    const boosts = (cfg.boosts || []).map((bx) => bx.id === boostId ? { ...bx, result, settledAt: new Date().toISOString() } : bx);
    await db.saveConfig(-3, { ...cfg, boosts }, session.user.id);
    const affected = bets.filter((b) => b.kind === "boost" && b.items.some((it) => it.boostId === boostId));
    for (const b of affected) {
      const items = b.items.map((it) => it.boostId === boostId && it.status !== "void" ? { ...it, status: result === "won" ? "won" : "lost" } : it);
      const live = items.filter((it) => it.status !== "void");
      const status = live.some((it) => it.status === "open") ? "open" : live.some((it) => it.status === "lost") ? "lost" : "won";
      const payout = status === "won" ? items.reduce((a, it) => a + (it.status === "won" ? it.stake * it.odds : 0), 0) : 0;
      await db.updateBet(b.id, { items, status, payout });
    }
    await refresh();
  };
  const resetBoost = async (boostId) => {
    const cfg = configs[-3] || { boosts: [] };
    const boosts = (cfg.boosts || []).map((bx) => bx.id === boostId ? { ...bx, result: null, settledAt: null } : bx);
    await db.saveConfig(-3, { ...cfg, boosts }, session.user.id);
    const affected = bets.filter((b) => b.kind === "boost" && b.items.some((it) => it.boostId === boostId));
    for (const b of affected) {
      const items = b.items.map((it) => it.boostId === boostId && it.status !== "void" ? { ...it, status: "open" } : it);
      await db.updateBet(b.id, { items, status: items.some((it) => it.status === "void") && items.every((it) => it.status === "void") ? "void" : "open", payout: 0 });
    }
    await refresh();
  };

  // Void a whole boost: refund every backer's stake and cancel it (it leaves the leaderboard too).
  const voidBoost = async (boostId, reason) => {
    const cfg = configs[-3] || { boosts: [] };
    const boosts = (cfg.boosts || []).map((bx) => bx.id === boostId ? { ...bx, result: "void", live: false, settledAt: new Date().toISOString() } : bx);
    await db.saveConfig(-3, { ...cfg, boosts }, session.user.id);
    const affected = bets.filter((b) => b.kind === "boost" && b.items.some((it) => it.boostId === boostId && it.status !== "void"));
    for (const b of affected) {
      const items = b.items.map((it) => it.boostId === boostId && it.status !== "void"
        ? { ...it, status: "void", voidReason: (reason || "").trim(), voidedAt: new Date().toISOString(), voidedBy: profile.nickname } : it);
      const live = items.filter((it) => it.status !== "void");
      const total_stake = live.reduce((a, it) => a + it.stake, 0);
      const potential = live.reduce((a, it) => a + it.stake * it.odds, 0);
      const status = live.length === 0 ? "void" : live.some((it) => it.status === "open") ? "open" : live.some((it) => it.status === "lost") ? "lost" : "won";
      const payout = status === "won" ? items.reduce((a, it) => a + (it.status === "won" ? it.stake * it.odds : 0), 0) : 0;
      await db.updateBet(b.id, { items, status, payout, total_stake, potential });
    }
    await refresh();
  };

  if (!hasSupabase) return <ConfigNeeded />;
  if (!authReady) return <Splash msg="Loading…" />;
  if (recovery) return <ResetPassword showToast={showToast} onDone={() => setRecovery(false)} />;
  if (!session) return <Auth showToast={showToast} />;
  if (!profile) return <Splash msg="Setting up your profile…" />;

  const role = profile.is_admin ? "admin" : "player";
  const user = { nickname: profile.nickname, role };
  const allMine = bets.filter((b) => b.userId === session.user.id);
  const myWalletBets = allMine.filter((b) => b.kind !== "outright"); // match wallet = match + fantasy
  const myMatchBets = allMine.filter((b) => (b.kind || "match") === "match");
  const myFantasyBets = allMine.filter((b) => b.kind === "fantasy");
  const myBoostBets = allMine.filter((b) => b.kind === "boost");
  const myOgBets = allMine.filter((b) => b.kind === "outright");
  const wallet = walletOf(profile, myWalletBets);
  const ogWallet = walletOg(profile, myOgBets);
  const matchBets = bets.filter((b) => b.kind !== "outright");
  const ogConfig = configs[-1];
  const fmConfig = configs[-2];

  const summary = playerSummary(profile, allMine);

  return (
    <div className={dark ? "dark" : ""}>
      <style>{FONTS}</style>
      <div className="font-body min-h-screen bg-[#070b0a] dark:bg-[#070b0a] text-stone-100 selection:bg-amber-400/30">
        <div className="bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(139,92,246,0.20),transparent),radial-gradient(90%_50%_at_90%_0%,rgba(245,158,11,0.12),transparent)] min-h-screen">
          <Header user={user} dark={dark} setDark={setDark} onLogout={async () => { await supabase.auth.signOut(); setSlip([]); setTab("matches"); }} />

          <main className="mx-auto max-w-5xl overflow-x-hidden px-4 pb-32 pt-4">
            {role === "admin" ? (
              <AdminPanel bets={bets} results={results} configs={configs} players={players} txns={txns} settleMatch={settleMatch} resetMatch={resetMatch} settleOutright={settleOutright} resetOutright={resetOutright} settleFantasy={settleFantasy} resetFantasy={resetFantasy} settleBoost={settleBoost} resetBoost={resetBoost} voidBoost={voidBoost} resetAll={resetAll} saveConfig={saveConfig} saveConfigMany={saveConfigMany} voidPick={voidPick} creditPlayer={creditPlayer} creditPlayerOg={creditPlayerOg} showToast={showToast} />
            ) : (
              <>
                {tab === "matches" && !activeMatch && <MatchList onOpen={setActiveMatch} results={results} configs={configs} now={now} nickname={profile.nickname} myBets={myMatchBets} />}
                {tab === "matches" && activeMatch && (
                  <MatchDetail match={activeMatch} config={configs[activeMatch.n]} onBack={() => setActiveMatch(null)} slip={slip} setSlip={setSlip} results={results} showToast={showToast} now={now} />
                )}
                {tab === "outrights" && <Outrights config={ogConfig} wallet={ogWallet} slip={ogSlip} setSlip={setOgSlip} now={now} ogBets={myOgBets} nickname={profile.nickname} />}
                {tab === "fantasy" && <Fantasy config={fmConfig} wallet={wallet} results={results} slip={fmSlip} setSlip={setFmSlip} fmBets={myFantasyBets} nickname={profile.nickname} />}
                {tab === "boosts" && <Boosts config={configs[-3]} wallet={wallet} myBets={myBoostBets} now={now} nickname={profile.nickname} placeBet={placeBet} showToast={showToast} />}
                {tab === "mybets" && <MyBets bets={myMatchBets} wallet={wallet} nickname={profile.nickname} txns={txns} summary={summary} />}
                {tab === "board" && <Leaderboard bets={matchBets} me={profile.nickname} />}
              </>
            )}
          </main>

          {role === "player" && (
            <>
              <BetSlip slip={slip} setSlip={setSlip} user={user} placeBet={placeBet} available={wallet.net} myBets={myMatchBets} configs={configs} showToast={showToast} setTab={setTab} setActiveMatch={setActiveMatch} />
              {tab === "outrights" && <OutrightSlip slip={ogSlip} setSlip={setOgSlip} user={user} placeBet={placeBet} available={ogWallet.net} myBets={myOgBets} now={now} showToast={showToast} setTab={setTab} />}
              {tab === "fantasy" && <FantasySlip slip={fmSlip} setSlip={setFmSlip} user={user} placeBet={placeBet} available={wallet.net} myBets={myFantasyBets} showToast={showToast} setTab={setTab} />}
              <BottomNav tab={tab} setTab={(t) => { setTab(t); setActiveMatch(null); }} slipCount={slip.length} ogCount={ogSlip.length} fmCount={fmSlip.length} />
            </>
          )}

          {toast && (
            <div className={`fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-2xl backdrop-blur ${toast.kind === "err" ? "bg-rose-500/90" : "bg-emerald-500/90"} text-black`}>
              {toast.msg}
            </div>
          )}

          {swUpdate && (
            <div className="fixed inset-x-3 bottom-24 z-[80] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-violet-400/40 bg-[#0a1311]/95 px-4 py-3 shadow-2xl backdrop-blur sm:bottom-6">
              <span className="text-sm font-semibold text-violet-200">A new version is available.</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => applyPWAUpdate(swUpdate)}
                  className="rounded-lg bg-gradient-to-r from-amber-400 to-violet-400 px-3.5 py-1.5 text-sm font-bold text-black">Refresh</button>
                <button onClick={() => setSwUpdate(null)} className="rounded-lg bg-white/5 p-1.5 text-stone-400 hover:text-stone-200"><X className="h-4 w-4" /></button>
              </div>
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
    <div className="min-h-screen bg-[radial-gradient(120%_70%_at_50%_-10%,rgba(139,92,246,0.24),transparent)] flex items-center justify-center px-4">{children}</div>
  </div>
);
const Splash = ({ msg }) => <Shell><div className="text-sm text-violet-300/80">{msg}</div></Shell>;
const ConfigNeeded = () => (
  <Shell>
    <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
      <h2 className="font-display text-3xl text-white">Almost there</h2>
      <p className="mt-2 text-sm text-stone-400">Add your Supabase keys to a <code className="text-violet-300">.env</code> file, then redeploy:</p>
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

  const forgot = async () => {
    if (!email.trim()) { showToast("Enter your email first, then tap Forgot password", "err"); return; }
    setBusy(true); setNote("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
      if (error) throw error;
      setNote("Password reset link sent — check your email, then follow the link to set a new password.");
    } catch (e) { showToast(e.message || "Could not send reset email", "err"); }
    finally { setBusy(false); }
  };

  return (
    <Shell>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Crest className="mx-auto mb-3 h-28 w-28" />
          <h1 className="font-display text-5xl text-white">SGA · EPL 26-27</h1>
          <p className="mt-1 text-sm text-violet-300/80">Private Premier League Prediction Pool</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-black/30 p-1">
            {[["signin", "Sign In"], ["signup", "Create Account"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setMode(k); setNote(""); }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === k ? "bg-gradient-to-r from-amber-400 to-violet-400 text-black" : "text-stone-400"}`}>{lbl}</button>
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
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-violet-400 py-3 font-bold text-black transition enabled:hover:brightness-110 disabled:opacity-40">
            {busy ? "Please wait…" : mode === "signup" ? "Create Account & Enter" : "Sign In"}
          </button>
          {note && <p className="mt-3 text-center text-[11px] text-violet-300/80">{note}</p>}
          {mode === "signin" && (
            <button onClick={forgot} disabled={busy} className="mt-3 w-full text-center text-[11px] text-stone-400 hover:text-violet-300 disabled:opacity-50">
              Forgot password?
            </button>
          )}
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
      className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-600 focus:border-violet-400/60" />
  </label>
);

/* ---------- Reset password (after clicking the email link) ---------- */
function ResetPassword({ showToast, onDone }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (pw.length < 6) { showToast("Password must be at least 6 characters", "err"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      showToast("Password updated — you're signed in");
      onDone();
    } catch (e) { showToast(e.message || "Could not update password", "err"); }
    finally { setBusy(false); }
  };
  return (
    <Shell>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-violet-500"><Lock className="h-7 w-7 text-black" /></div>
          <h1 className="font-display text-4xl text-white">Set a New Password</h1>
          <p className="mt-1 text-sm text-violet-300/80">Choose a new password for your account</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <Field label="New Password" v={pw} set={setPw} ph="••••••••" type="password" />
          <button disabled={busy || !pw} onClick={save}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-violet-400 py-3 font-bold text-black disabled:opacity-40">
            {busy ? "Saving…" : "Update Password & Enter"}
          </button>
        </div>
      </div>
    </Shell>
  );
}
function Header({ user, dark, setDark, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Crest className="h-10 w-10" />
          <div className="leading-none">
            <div className="font-display text-2xl text-white">SGA EPL 26-27</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-violet-400/70">
              {user.role === "admin" ? "Admin Console" : "Prediction Pool"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-300">
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
function MatchList({ onOpen, results, configs, now, nickname, myBets = [] }) {
  const [q, setQ] = useState("");
  const liveFixtures = useMemo(() => FIXTURES.filter((m) => configs?.[m.n]?.live && !results[m.n]), [configs, results]);
  const stakeOn = (n) => myBets.reduce((a, b) => a + b.items.filter((it) => it.matchId === n).reduce((s, it) => s + it.stake, 0), 0);
  const dlPDF = (m) => {
    const mb = myBets.map((b) => ({ ...b, items: b.items.filter((it) => it.matchId === m.n) })).filter((b) => b.items.length);
    if (mb.length) printPicks(mb, `${m.home} v ${m.away} — My Picks`, false);
  };
  const grouped = useMemo(() => {
    const f = liveFixtures
      .filter((m) => (m.home + m.away).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => kickoffMs(b) - kickoffMs(a)); // latest kickoff first, then earlier
    const g = {};
    f.forEach((m) => { (g[m.date] ||= []).push(m); });
    return g;
  }, [q, liveFixtures]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/15 to-amber-500/5 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 font-display text-lg text-black">
          {(nickname || "?").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-violet-300/80">Welcome back</div>
          <div className="font-display text-2xl leading-none text-white">{nickname}</div>
        </div>
      </div>
      <SectionTitle icon={<Calendar className="h-5 w-5" />} title="Fixtures Open for Picks" sub={`${liveFixtures.length} live · times shown in your timezone (${TZ_ABBR})`} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a team…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>
      {liveFixtures.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-stone-400">
          No matches are open for picks yet. They'll appear here as soon as the admin publishes them.
        </div>
      )}
      <div className="space-y-5">
        {Object.entries(grouped).map(([date, ms]) => (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-400/70">
              <span className="h-px flex-1 bg-white/5" />{date}<span className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ms.map((m) => {
                const em = withTeams(m, configs?.[m.n]);
                const settled = results[m.n];
                const locked = !settled && isLocked(m, now);
                const closing = !settled && !locked ? lockCountdown(m, now) : null;
                const myStake = stakeOn(m.n);
                return (
                  <div key={m.n}
                    className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-emerald-400/40 hover:bg-white/[0.06]">
                    <button onClick={() => onOpen(em)} className="min-w-0 flex-1 text-left">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                        <Clock className="h-3 w-3" /> {m.day} · {m.time}
                        {m.ko && <span className="rounded bg-violet-500/20 px-1.5 py-0.5 font-semibold text-violet-300">{m.ko}</span>}
                        <Clock className="h-3 w-3" /> {kickoffLocal(m)} {TZ_ABBR}
                        {locked && <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300">🔒 LOCKED</span>}
                        {closing && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-semibold text-amber-300">closes in {closing}</span>}
                        {myStake > 0 && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">In bets: {money(myStake)}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ClubMark club={em.home} code={em.hf} /><span className="truncate">{em.home}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                        <ClubMark club={em.away} code={em.af} /><span className="truncate">{em.away}</span>
                      </div>
                    </button>
                    <span className="flex shrink-0 items-center gap-1">
                      {myStake > 0 && (
                        <button onClick={() => dlPDF(m)} title="Download my picks for this match (PDF)"
                          className="rounded-md bg-white/5 p-1.5 text-emerald-300 hover:bg-white/10"><Receipt className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => onOpen(m)} className="text-stone-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400"><ChevronRight className="h-5 w-5" /></button>
                    </span>
                  </div>
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
  // squad players NOT already listed (with odds) in the scorer markets — used for the "Other Player" dropdown
  const otherScorerOptions = useMemo(() => {
    const named = new Set(markets.find((m) => m.key === "anytime_scorer").selections
      .filter((s) => s.meta.scorer !== "__OTHER__").map((s) => s.meta.scorer));
    return [...(SQUADS[match.home] || []), ...(SQUADS[match.away] || [])].filter((n) => !named.has(n));
  }, [markets, match]);
  const settled = results[match.n];
  const locked = isLocked(match, now);
  const closing = !settled && !locked ? lockCountdown(match, now) : null;
  const inSlip = (selId) => slip.some((s) => s.matchId === match.n && s.selId === selId);

  const toggle = (mk, s) => {
    if (settled) { showToast("This match is already settled", "err"); return; }
    if (!config?.live) { showToast("This match isn't open for picks yet", "err"); return; }
    if (locked) { showToast("Picks are closed for this match", "err"); return; }
    setSlip((prev) => {
      const exists = prev.find((x) => x.matchId === match.n && x.selId === s.id);
      if (exists) return prev.filter((x) => !(x.matchId === match.n && x.selId === s.id));
      let next = prev;
      if (mk.mode === "single") next = prev.filter((x) => !(x.matchId === match.n && x.marketKey === mk.key));
      return [...next, {
        matchId: match.n, match: `${match.home} v ${match.away}`, marketKey: mk.key, marketTitle: mk.title,
        selId: s.id, label: s.label, odds: s.odds, oddsStr: s.oddsStr, meta: s.meta, stake: RULES.min,
        options: s.meta?.scorer === "__OTHER__" ? otherScorerOptions : undefined,
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
            <div className="mt-1 text-[11px] text-stone-400">{kickoffLocal(match, { year: undefined })}</div>
            <div className="text-[11px] text-stone-400">Kickoff {kickoffTimeLocal(match)} {TZ_ABBR} · picks close {LOCK_MIN} min before</div>
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
// Club crests, served from public/logos/. If a file is missing or fails to
// load, the <img> hides itself and the code badge underneath shows instead —
// so a lost file can never render as a broken-image icon.
const TEAM_LOGOS = {
  "Arsenal": "/logos/arsenal.png",
  "Aston Villa": "/logos/aston-villa.png",
  "Bournemouth": "/logos/bournemouth.png",
  "Brentford": "/logos/brentford.png",
  "Brighton": "/logos/brighton.png",
  "Chelsea": "/logos/chelsea.png",
  "Coventry": "/logos/coventry.png",
  "Crystal Palace": "/logos/crystal-palace.png",
  "Everton": "/logos/everton.png",
  "Fulham": "/logos/fulham.png",
  "Hull": "/logos/hull.png",
  "Ipswich": "/logos/ipswich.png",
  "Leeds": "/logos/leeds.png",
  "Liverpool": "/logos/liverpool.png",
  "Man City": "/logos/man-city.png",
  "Man Utd": "/logos/man-utd.png",
  "Newcastle": "/logos/newcastle.png",
  "Nott'm Forest": "/logos/nottm-forest.png",
  "Spurs": "/logos/spurs.png",
  "Sunderland": "/logos/sunderland.png"
};

const ClubMark = ({ club, code, size = "h-6 w-6" }) => {
  const src = TEAM_LOGOS[club];
  if (!src) return <ClubCode code={code} />;
  return (
    <span className={`relative inline-flex ${size} shrink-0 items-center justify-center`}>
      <span className="absolute inset-0 flex items-center justify-center rounded-md bg-violet-500/20 text-[9px] font-bold text-violet-300">{code}</span>
      <img src={src} alt={club} loading="lazy" draggable="false"
        className="relative h-full w-full object-contain"
        onError={(e) => { e.currentTarget.style.display = "none"; }} />
    </span>
  );
};

// Club code badge — used when no crest exists (e.g. admin-added teams).
const ClubCode = ({ code }) => (
  <span className="inline-flex w-11 shrink-0 items-center justify-center rounded-md bg-violet-500/20 px-1 py-0.5 text-[10px] font-bold tracking-wide text-violet-300">{code}</span>
);

const Team = ({ flag, name }) => (
  <div className="flex w-24 flex-col items-center gap-1.5 text-center">
    <ClubMark club={name} code={flag} size="h-14 w-14" />
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
                  <span className="min-w-0 flex-1 break-words font-medium leading-tight">{s.label}</span>
                  <span className={`shrink-0 self-start rounded-md px-1.5 py-0.5 font-bold tabular-nums ${on ? "bg-amber-400 text-black" : "bg-white/10 text-emerald-300"}`}>{s.oddsStr}</span>
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
function BetSlip({ slip, setSlip, user, placeBet, available, myBets = [], configs = {}, showToast, setTab, setActiveMatch }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [busy, setBusy] = useState(false);

  const setStake = (selId, matchId, v) =>
    setSlip((p) => p.map((x) => (x.selId === selId && x.matchId === matchId ? { ...x, stake: Math.max(0, +v || 0) } : x)));
  const setCustomName = (selId, matchId, v) =>
    setSlip((p) => p.map((x) => (x.selId === selId && x.matchId === matchId ? { ...x, customName: v } : x)));
  const remove = (selId, matchId) => setSlip((p) => p.filter((x) => !(x.selId === selId && x.matchId === matchId)));

  const totalStake = slip.reduce((a, s) => a + s.stake, 0);
  const potential = slip.reduce((a, s) => a + s.stake * s.odds, 0);
  // minimum-categories rule is per match, and counts the player's earlier picks for that match too
  const catsByMatch = {};
  (myBets || []).forEach((b) => b.items.forEach((it) => { (catsByMatch[it.matchId] ||= new Set()).add(it.marketKey); }));
  slip.forEach((s) => { (catsByMatch[s.matchId] ||= new Set()).add(s.marketKey); });
  const unmetMatches = [...new Set(slip.map((s) => s.matchId))].filter((mid) => (catsByMatch[mid]?.size || 0) < RULES.minCategories);

  const validate = () => {
    if (slip.length === 0) return "Your slip is empty";
    const draft = slip.find((s) => !configs?.[s.matchId]?.live);
    if (draft) {
      const f = FIXTURES.find((x) => x.n === draft.matchId);
      return `${f ? `${f.home} v ${f.away}` : "A match"} isn’t open for picks — remove it to continue`;
    }
    if (unmetMatches.length) {
      const f = FIXTURES.find((x) => x.n === unmetMatches[0]);
      return `Pick at least ${RULES.minCategories} categories for ${f ? `${f.home} v ${f.away}` : "this match"} (your earlier picks count too) to submit`;
    }
    for (const s of slip) {
      if (s.stake < RULES.min) return `Min stake is ${money(RULES.min)} per selection`;
      if (s.stake > RULES.max) return `Max stake is ${money(RULES.max)} per selection`;
      if (s.meta?.scorer === "__OTHER__" && !(s.customName || "").trim()) return "Choose the player for your “Other Player” pick";
      if ((s.meta?.ht === "__OTHER__" || s.meta?.ft === "__OTHER__") && !/^\d+-\d+$/.test((s.customName || "").replace(/\s/g, ""))) return "Enter both goal numbers for your “Other Score” pick";
      const dup = otherDuplicateMsg(s, configs);
      if (dup) return dup;
    }
    // cap: total stake per match + category (this slip + already-submitted slips) must not exceed the max.
    // Exception — CUSTOM match specials: each custom special is its own bucket, so a player may back
    // several of them at up to the max each (e.g. Player A to score 1000 AND Player B to score 1000).
    const capKey = (it) => it.matchId + "|" + it.marketKey + (it.meta?.sp === "custom" ? "|" + it.selId : "");
    const submitted = {};
    (myBets || []).forEach((b) => b.items.forEach((it) => {
      const k = capKey(it);
      submitted[k] = (submitted[k] || 0) + it.stake;
    }));
    const current = {};
    slip.forEach((s) => { const k = capKey(s); current[k] = (current[k] || 0) + s.stake; });
    for (const k of Object.keys(current)) {
      const total = current[k] + (submitted[k] || 0);
      if (total > RULES.max) {
        const s = slip.find((x) => capKey(x) === k);
        const where = s.meta?.sp === "custom" ? `“${s.label}” on ${s.match}` : `${s.marketTitle} on ${s.match}`;
        const scope = s.meta?.sp === "custom" ? "per special, per match" : "per category, per match";
        return `${where}: total stake across your slips is ${money(total)} — max is ${money(RULES.max)} ${scope}`;
      }
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
                  {s.meta?.scorer === "__OTHER__" && (
                    Array.isArray(s.options) && s.options.length ? (
                      <select value={s.customName || ""} onChange={(e) => setCustomName(s.selId, s.matchId, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400">
                        <option value="">Choose a player…</option>
                        {s.options.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    ) : (
                      <input value={s.customName || ""} onChange={(e) => setCustomName(s.selId, s.matchId, e.target.value)}
                        placeholder="Type the player's name"
                        className="mt-2 w-full rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs outline-none placeholder:text-stone-600 focus:border-amber-400" />
                    )
                  )}
                  {(s.meta?.ht === "__OTHER__" || s.meta?.ft === "__OTHER__") && (() => {
                    const [hm, aw] = (s.match || "Home v Away").split(" v ");
                    const parts = (s.customName || "").split("-");
                    const ch = /^\d+$/.test(parts[0]) ? parts[0] : "";
                    const ca = /^\d+$/.test(parts[1]) ? parts[1] : "";
                    const setPart = (h, a) => setCustomName(s.selId, s.matchId, `${h}-${a}`);
                    return (
                      <div className="mt-2">
                        <div className="mb-1 text-[10px] text-amber-300/80">Enter the exact score (goals for each team)</div>
                        <div className="flex items-end gap-2">
                          <label className="min-w-0 flex-1">
                            <span className="mb-0.5 block truncate text-[10px] text-stone-500">{hm}</span>
                            <input type="number" min="0" inputMode="numeric" value={ch} onChange={(e) => setPart(e.target.value.replace(/\D/g, ""), ca)}
                              className="w-full rounded-lg border border-amber-400/40 bg-black/30 px-2 py-1.5 text-center text-sm outline-none focus:border-amber-400" />
                          </label>
                          <span className="pb-1.5 font-display text-lg text-stone-600">–</span>
                          <label className="min-w-0 flex-1">
                            <span className="mb-0.5 block truncate text-[10px] text-stone-500">{aw}</span>
                            <input type="number" min="0" inputMode="numeric" value={ca} onChange={(e) => setPart(ch, e.target.value.replace(/\D/g, ""))}
                              className="w-full rounded-lg border border-amber-400/40 bg-black/30 px-2 py-1.5 text-center text-sm outline-none focus:border-amber-400" />
                          </label>
                        </div>
                      </div>
                    );
                  })()}
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
                <Row k="Per-match minimum" v={unmetMatches.length ? `Need ${RULES.minCategories} categories in ${unmetMatches.length} match${unmetMatches.length > 1 ? "es" : ""}` : `✓ ${RULES.minCategories}+ categories per match`} />
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

/* ---------- Outrights (player) ---------- */
function ogCountdown(now) {
  const diff = OUTRIGHT_DEADLINE_MS - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 8.64e7), h = Math.floor((diff % 8.64e7) / 3.6e6), mn = Math.floor((diff % 3.6e6) / 6e4);
  return d > 0 ? `${d}d ${h}h ${mn}m` : h > 0 ? `${h}h ${mn}m` : `${mn}m`;
}
function Outrights({ config, wallet, slip, setSlip, now, ogBets = [], nickname }) {
  const markets = useMemo(() => buildOutrightMarkets(config), [config]);
  // eligible names for each "Any other" pick: teams or players not already offered with odds
  const otherOpts = useMemo(() => {
    const map = {};
    markets.forEach((mk) => {
      if (mk.type !== "winner") return;
      const taken = new Set(mk.selections.filter((s) => !s.meta.other).map((s) => s.label.trim().toLowerCase()));
      const teams = Object.keys(SQUADS).sort();
      if (mk.key === "og_champion" || mk.key === "og_runnerup") {
        map[mk.key] = { grouped: false, list: teams.filter((t) => !taken.has(t.toLowerCase())) };
      } else if (mk.key === "og_finalists") {
        map[mk.key] = { combo: true, teams }; // two-team pairing
      } else {
        map[mk.key] = { grouped: true, groups: teams.map((t) => ({ team: t, players: (SQUADS[t] || []).filter((p) => !taken.has(p.toLowerCase())) })).filter((g) => g.players.length) };
      }
    });
    return map;
  }, [markets]);
  const locked = outrightLocked(now);
  const countdown = ogCountdown(now);
  const inSlip = (selId) => slip.some((s) => s.selId === selId);
  const toggle = (mk, s) => {
    if (locked) return;
    setSlip((prev) => {
      if (prev.find((x) => x.selId === s.id)) return prev.filter((x) => x.selId !== s.id);
      return [...prev, { matchId: -1, match: "Season Outrights", marketKey: mk.key, marketTitle: mk.title, selId: s.id, label: s.label, odds: s.odds, oddsStr: s.oddsStr, meta: s.meta, stake: OUTRIGHT_RULES.min, options: s.meta?.other ? otherOpts[mk.key] : undefined }];
    });
  };
  return (
    <div>
      <SectionTitle icon={<Trophy className="h-5 w-5" />} title="Outrights" sub="Season-long picks · separate Coins wallet" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label="Deposit" v={money(wallet.deposit)} />
        <Stat label="In Bets" v={money(wallet.inBets)} />
        <Stat label="Won" v={money(wallet.won)} good />
        <Stat label="Lost" v={money(wallet.lost)} />
        <Stat label="Net Balance" v={money(wallet.net)} good={wallet.net >= 0} />
      </div>
      <div className={`mb-4 rounded-xl p-3 text-center text-sm font-semibold ${locked ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-200"}`}>
        {locked ? "🔒 Outright entries are closed" : `Entries close ${outrightDeadlineLocal()} ${TZ_ABBR} · ${countdown} left`}
      </div>
      <p className="mb-3 text-xs text-stone-500">Stake {money(OUTRIGHT_RULES.min)}–{money(OUTRIGHT_RULES.max)} per pick · choose as many as you like. For an "Any other" option, pick the team/player from the dropdown on your slip.</p>
      <div className="space-y-3">
        {markets.map((mk) => <MarketCard key={mk.key} mk={mk} inSlip={inSlip} toggle={toggle} disabled={locked} />)}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle icon={<Receipt className="h-5 w-5" />} title="My Outright Picks" sub={`${ogBets.length} submitted`} />
          {ogBets.length > 0 && (
            <button onClick={() => printPicks(ogBets, `${nickname} — Outright Picks`, false)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
              <Receipt className="h-3.5 w-3.5" /> Download PDF
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {ogBets.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No outright picks yet.</p>}
          {ogBets.map((b) => <BetCard key={b.id} b={b} />)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Outright slip ---------- */
function OutrightSlip({ slip, setSlip, user, placeBet, available, myBets = [], now, showToast, setTab }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);
  const setStake = (id, v) => setSlip((p) => p.map((x) => x.selId === id ? { ...x, stake: Math.max(0, +v || 0) } : x));
  const setCustomName = (id, v) => setSlip((p) => p.map((x) => x.selId === id ? { ...x, customName: v } : x));
  // finalists "any other": pick two teams; combine into "A - B"
  const setFinalist = (id, which, value) => setSlip((p) => p.map((x) => {
    if (x.selId !== id) return x;
    const finA = which === "A" ? value : (x.finA || "");
    const finB = which === "B" ? value : (x.finB || "");
    return { ...x, finA, finB, customName: finA && finB ? `${finA} - ${finB}` : "" };
  }));
  const remove = (id) => setSlip((p) => p.filter((x) => x.selId !== id));
  const totalStake = slip.reduce((a, s) => a + s.stake, 0);
  const potential = slip.reduce((a, s) => a + s.stake * s.odds, 0);

  const validate = () => {
    if (slip.length === 0) return "Your outright slip is empty";
    if (outrightLocked(now)) return "Outright entries are closed";
    for (const s of slip) {
      if (s.stake < OUTRIGHT_RULES.min) return `Min stake is ${money(OUTRIGHT_RULES.min)} per pick`;
      if (s.stake > OUTRIGHT_RULES.max) return `Max stake is ${money(OUTRIGHT_RULES.max)} per pick`;
      if (s.meta?.other && !(s.customName || "").trim()) return "Pick the team/player for your “Any other” pick";
    }
    // cap: total stake on each specific outcome (selection, or the typed name for "Any other")
    // across this slip + already-submitted picks must not exceed the max
    const okey = (it) => it.selId + "|" + (it.meta?.other ? (it.customName || "").trim().toLowerCase() : "");
    const submitted = {};
    (myBets || []).forEach((b) => b.items.forEach((it) => { const k = okey(it); submitted[k] = (submitted[k] || 0) + it.stake; }));
    const current = {};
    slip.forEach((s) => { const k = okey(s); current[k] = (current[k] || 0) + s.stake; });
    for (const k of Object.keys(current)) {
      const total = current[k] + (submitted[k] || 0);
      if (total > OUTRIGHT_RULES.max) {
        const s = slip.find((x) => okey(x) === k);
        const outcome = (s.meta?.other && s.customName) ? s.customName : s.label;
        return `${s.marketTitle} · ${outcome}: total stake across your picks is ${money(total)} — max is ${money(OUTRIGHT_RULES.max)} per selection`;
      }
    }
    if (totalStake > available) return `Not enough outright Coins — you have ${money(available)}. Ask the admin to add more.`;
    return null;
  };
  const place = async () => {
    const err = validate(); if (err) { showToast(err, "err"); return; }
    const bet = { id: uid(), code: betCode(), user: user.nickname, ts: new Date().toISOString(),
      items: slip.map((s) => ({ ...s, status: "open" })), totalStake, potential, status: "open", kind: "outright" };
    setBusy(true);
    try { await placeBet(bet); setPlaced(bet); setSlip([]); }
    catch (e) { showToast(e.message || "Could not submit", "err"); }
    finally { setBusy(false); }
  };

  if (placed) return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={() => { setPlaced(null); setOpen(false); setTab("mybets"); }}>
      <div className="w-full max-w-sm rounded-3xl border border-emerald-400/30 bg-[#0a1311] p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"><Lock className="h-7 w-7 text-emerald-400" /></div>
        <h3 className="font-display text-3xl text-white">Outright Picks Locked</h3>
        <div className="mt-4 space-y-1 rounded-xl bg-black/30 p-4 text-left text-sm">
          <Row k="Slip ID" v={placed.code} mono /><Row k="Picks" v={placed.items.length} />
          <Row k="Total Stake" v={money(placed.totalStake)} /><Row k="Potential Return" v={money(placed.potential)} hi />
        </div>
        <button onClick={() => { setPlaced(null); setOpen(false); setTab("mybets"); }} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black">View My Picks</button>
      </div>
    </div>
  );

  return (
    <>
      {slip.length > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-5 py-3 font-bold text-black shadow-2xl">
          <Trophy className="h-4 w-4" /> Outright Slip · {slip.length} · {money(totalStake)}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a1311] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-2xl text-white"><Trophy className="h-5 w-5 text-amber-400" /> Outright Slip</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg bg-white/5 p-1.5"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[46vh] space-y-2 overflow-y-auto p-4">
              {slip.map((s) => (
                <div key={s.selId} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><div className="text-[10px] uppercase tracking-wide text-emerald-400/70">{s.marketTitle}</div>
                      <div className="text-sm font-semibold">{s.label}</div></div>
                    <button onClick={() => remove(s.selId)} className="rounded p-1 text-stone-500 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  {s.meta?.other && (
                    s.options && s.options.combo ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <select value={s.finA || ""} onChange={(e) => setFinalist(s.selId, "A", e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400">
                          <option value="">Team A…</option>
                          {s.options.teams.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-[11px] text-stone-500">vs</span>
                        <select value={s.finB || ""} onChange={(e) => setFinalist(s.selId, "B", e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400">
                          <option value="">Team B…</option>
                          {s.options.teams.filter((t) => t !== s.finA).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    ) : s.options && s.options.grouped === false ? (
                      <select value={s.customName || ""} onChange={(e) => setCustomName(s.selId, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400">
                        <option value="">Choose a team…</option>
                        {s.options.list.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : s.options && s.options.grouped === true ? (
                      <select value={s.customName || ""} onChange={(e) => setCustomName(s.selId, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400">
                        <option value="">Choose a player…</option>
                        {s.options.groups.map((g) => (
                          <optgroup key={g.team} label={g.team}>
                            {g.players.map((p) => <option key={p} value={p}>{p}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    ) : (
                      <input value={s.customName || ""} onChange={(e) => setCustomName(s.selId, e.target.value)} placeholder="Type the team / player name"
                        className="mt-2 w-full rounded-lg border border-amber-400/40 bg-black/30 px-2.5 py-1.5 text-xs outline-none placeholder:text-stone-600 focus:border-amber-400" />
                    )
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-emerald-300">@ {s.oddsStr}</span>
                    <div className="flex items-center gap-1.5"><span className="text-[11px] text-stone-500">Stake</span>
                      <input type="number" value={s.stake} onChange={(e) => setStake(s.selId, e.target.value)} className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-amber-400/60" /></div>
                  </div>
                  <div className="mt-1.5 text-right text-[11px] text-stone-500">Returns {money(s.stake * s.odds)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 bg-black/20 p-4">
              <div className="mb-3 space-y-1 text-sm">
                <Row k="Available" v={money(available)} /><Row k="Total Stake" v={money(totalStake)} /><Row k="Potential Return" v={money(potential)} hi />
              </div>
              <button disabled={busy} onClick={place} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-black disabled:opacity-50"><Lock className="h-4 w-4" /> {busy ? "Submitting…" : "Submit Outright Picks"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* ---------- Fantasy Manager (player) — uses the MATCH wallet ---------- */
function Fantasy({ config, wallet, results, slip, setSlip, fmBets = [], nickname }) {
  const markets = useMemo(() => buildFantasyMarkets(config), [config]);
  const live = config?.live || {};
  const locked = config?.locked || {};
  const liveMarkets = markets.filter((mk) => live[mk.catKey]);
  const inSlip = (selId) => slip.some((s) => s.selId === selId);
  const toggle = (mk, s) => {
    if (results[mk.mid] || locked[mk.catKey]) return; // settled or locked
    setSlip((prev) => {
      if (prev.find((x) => x.selId === s.id)) return prev.filter((x) => x.selId !== s.id);
      return [...prev, { matchId: mk.mid, match: `Fantasy — ${mk.title}`, marketKey: mk.key, marketTitle: mk.title, selId: s.id, label: s.label, odds: s.odds, oddsStr: s.oddsStr, meta: s.meta, stake: FANTASY_RULES.min }];
    });
  };
  return (
    <div>
      <SectionTitle icon={<Users className="h-5 w-5" />} title="Fantasy Manager" sub="Pick the best manager each matchday · uses your match wallet" />
      <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm">
        <span className="font-semibold text-emerald-300">Match wallet balance</span>
        <span className="font-bold text-white">{money(wallet.net)}</span>
      </div>
      <p className="mb-3 text-xs text-stone-500">Stake {money(FANTASY_RULES.min)}–{money(FANTASY_RULES.max)} per pick · paid from your match wallet. A matchday closes once it is locked or settled.</p>
      <div className="space-y-3">
        {liveMarkets.length === 0 && <p className="rounded-xl border border-white/10 bg-white/[0.02] py-8 text-center text-sm text-stone-500">No fantasy matchdays are open yet. Check back soon.</p>}
        {liveMarkets.map((mk) => {
          const settled = results[mk.mid];
          const isLocked = !!locked[mk.catKey];
          return (
            <div key={mk.key}>
              {(settled || isLocked) && <div className={`mb-1 ml-1 text-[10px] font-semibold uppercase tracking-wide ${settled ? "text-emerald-400/80" : "text-rose-400/80"}`}>{settled ? "Settled" : "Picks locked"}</div>}
              <MarketCard mk={mk} inSlip={inSlip} toggle={toggle} disabled={!!settled || isLocked} />
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <SectionTitle icon={<Receipt className="h-5 w-5" />} title="My Fantasy Picks" sub={`${fmBets.length} submitted`} />
        {fmBets.length > 0 && (
          <button onClick={() => printPicks(fmBets, `${nickname} — Fantasy Picks`, false)}
            className="mb-3 flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
            <Receipt className="h-3.5 w-3.5" /> Download PDF
          </button>
        )}
        <div className="space-y-2.5">
          {fmBets.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No fantasy picks yet.</p>}
          {fmBets.map((b) => <BetCard key={b.id} b={b} />)}
        </div>
      </div>
    </div>
  );
}

function FantasySlip({ slip, setSlip, user, placeBet, available, myBets = [], showToast, setTab }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);
  const setStake = (id, v) => setSlip((p) => p.map((x) => x.selId === id ? { ...x, stake: Math.max(0, +v || 0) } : x));
  const remove = (id) => setSlip((p) => p.filter((x) => x.selId !== id));
  const totalStake = slip.reduce((a, s) => a + s.stake, 0);
  const potential = slip.reduce((a, s) => a + s.stake * s.odds, 0);

  const validate = () => {
    if (slip.length === 0) return "Your fantasy slip is empty";
    for (const s of slip) {
      if (s.stake < FANTASY_RULES.min) return `Min stake is ${money(FANTASY_RULES.min)} per pick`;
      if (s.stake > FANTASY_RULES.max) return `Max stake is ${money(FANTASY_RULES.max)} per pick`;
    }
    // cap: total stake on each specific outcome (a manager in a matchday) across this slip
    // + already-submitted picks must not exceed the max
    const submitted = {};
    (myBets || []).forEach((b) => b.items.forEach((it) => { submitted[it.selId] = (submitted[it.selId] || 0) + it.stake; }));
    const current = {};
    slip.forEach((s) => { current[s.selId] = (current[s.selId] || 0) + s.stake; });
    for (const k of Object.keys(current)) {
      const total = current[k] + (submitted[k] || 0);
      if (total > FANTASY_RULES.max) {
        const s = slip.find((x) => x.selId === k);
        return `${s.marketTitle} · ${s.label}: total stake across your picks is ${money(total)} — max is ${money(FANTASY_RULES.max)} per selection`;
      }
    }
    if (totalStake > available) return `Not enough match Coins — you have ${money(available)}.`;
    return null;
  };
  const place = async () => {
    const err = validate(); if (err) { showToast(err, "err"); return; }
    const bet = { id: uid(), code: betCode(), user: user.nickname, ts: new Date().toISOString(),
      items: slip.map((s) => ({ ...s, status: "open" })), totalStake, potential, status: "open", kind: "fantasy" };
    setBusy(true);
    try { await placeBet(bet); setPlaced(bet); setSlip([]); }
    catch (e) { showToast(e.message || "Could not submit", "err"); }
    finally { setBusy(false); }
  };

  if (placed) return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={() => { setPlaced(null); setOpen(false); setTab("fantasy"); }}>
      <div className="w-full max-w-sm rounded-3xl border border-emerald-400/30 bg-[#0a1311] p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"><Lock className="h-7 w-7 text-emerald-400" /></div>
        <h3 className="font-display text-3xl text-white">Fantasy Picks Locked</h3>
        <div className="mt-4 space-y-1 rounded-xl bg-black/30 p-4 text-left text-sm">
          <Row k="Slip ID" v={placed.code} mono /><Row k="Picks" v={placed.items.length} />
          <Row k="Total Stake" v={money(placed.totalStake)} /><Row k="Potential Return" v={money(placed.potential)} hi />
        </div>
        <button onClick={() => { setPlaced(null); setOpen(false); setTab("fantasy"); }} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black">Done</button>
      </div>
    </div>
  );

  return (
    <>
      {slip.length > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-5 py-3 font-bold text-black shadow-2xl">
          <Users className="h-4 w-4" /> Fantasy Slip · {slip.length} · {money(totalStake)}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a1311] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-2xl text-white"><Users className="h-5 w-5 text-amber-400" /> Fantasy Slip</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg bg-white/5 p-1.5"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[46vh] space-y-2 overflow-y-auto p-4">
              {slip.map((s) => (
                <div key={s.selId} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><div className="text-[10px] uppercase tracking-wide text-emerald-400/70">{s.marketTitle}</div>
                      <div className="text-sm font-semibold">{s.label}</div></div>
                    <button onClick={() => remove(s.selId)} className="rounded p-1 text-stone-500 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-emerald-300">@ {s.oddsStr}</span>
                    <div className="flex items-center gap-1.5"><span className="text-[11px] text-stone-500">Stake</span>
                      <input type="number" value={s.stake} onChange={(e) => setStake(s.selId, e.target.value)} className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-amber-400/60" /></div>
                  </div>
                  <div className="mt-1.5 text-right text-[11px] text-stone-500">Returns {money(s.stake * s.odds)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 bg-black/20 p-4">
              <div className="mb-3 space-y-1 text-sm">
                <Row k="Match wallet" v={money(available)} /><Row k="Total Stake" v={money(totalStake)} /><Row k="Potential Return" v={money(potential)} hi />
              </div>
              <button disabled={busy} onClick={place} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-black disabled:opacity-50"><Lock className="h-4 w-4" /> {busy ? "Submitting…" : "Submit Fantasy Picks"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- My Picks + Wallet ---------- */
function BalanceBreakdown({ summary, title = "Overall balance · all wallets combined" }) {
  if (!summary) return null;
  const rows = [
    ["Total deposit", money(summary.dep), "text-white"],
    ["Bonus", money(summary.bon), "text-emerald-300"],
    ["Match bets", money(summary.match), "text-white"],
    ["Outright bets", money(summary.out), "text-white"],
    ["Boosts", money(summary.boost), "text-white"],
    ["Fantasy manager", money(summary.fan), "text-white"],
    ["Win / Loss", `${summary.wl >= 0 ? "+" : "−"}${money(Math.abs(summary.wl))}`, summary.wl >= 0 ? "text-emerald-300" : "text-rose-300"],
    ["Coins in bets", money(summary.inb), "text-amber-300"],
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-400/70">{title}</div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm">
        {rows.map(([k, v, cls]) => (
          <div key={k} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
            <span className="text-stone-400">{k}</span>
            <span className={`font-semibold tabular-nums ${cls}`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-semibold text-stone-300">Net balance</span>
        <span className={`font-display text-2xl ${summary.net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{money(summary.net)}</span>
      </div>
      <p className="mt-2 text-[10px] text-stone-500">Net = deposit + bonus + win/loss − coins in bets. Includes match, outright, boost &amp; fantasy wallets.</p>
    </div>
  );
}

function MyBets({ bets, wallet, nickname, txns, summary }) {
  const [f, setF] = useState("all");
  const [showHist, setShowHist] = useState(false);
  const filtered = bets.filter((b) => f === "all" || b.status === f);

  const ledger = useMemo(() => {
    const rows = [];
    (txns || []).filter((t) => (t.kind || "match") !== "outright").forEach((t) => {
      const total = Number(t.deposit) + Number(t.bonus);
      rows.push({
        date: t.created_at, kind: "credit",
        label: total >= 0 ? "Coins added by admin" : "Coins extracted by admin",
        sub: `${t.note ? t.note + " · " : ""}${total >= 0 ? `Deposit ${fmtN(t.deposit)}${Number(t.bonus) ? ` + ${fmtN(t.bonus)} bonus` : ""}` : `−${fmtN(Math.abs(t.deposit))}`}`,
        delta: total,
      });
    });
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

      {summary && <div className="mb-4"><BalanceBreakdown summary={summary} /></div>}

      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => setShowHist(!showHist)}
          className="flex flex-1 items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-stone-300">
          <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-300" /> Transaction History ({ledger.length})</span>
          <ChevronRight className={`h-4 w-4 transition ${showHist ? "rotate-90" : ""}`} />
        </button>
        {ledger.length > 0 && (
          <button onClick={() => printLedger(ledger, `${nickname} — Transaction History`)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-white/10">
            <Receipt className="h-3.5 w-3.5" /> PDF
          </button>
        )}
      </div>
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
                <span className={`font-medium ${it.status === "void" ? "text-stone-500 line-through" : ""}`}>{selDisplay(it)}</span>
                {it.status === "void" && <span className="ml-1 text-[10px] text-stone-500">— voided{it.voidReason ? `: ${it.voidReason}` : ""} (stake refunded)</span>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={it.status === "void" ? "text-stone-600 line-through" : "text-emerald-300"}>@{it.oddsStr}</span>
                {it.status === "won" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                {it.status === "lost" && <X className="h-3.5 w-3.5 text-rose-400" />}
                {it.status === "void" && <span className="rounded bg-stone-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-stone-300">void</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Leaderboard (privacy: others' overall earnings hidden) ---------- */
function Leaderboard({ bets, me }) {
  const { mine, active } = useMemo(() => {
    const map = {};
    bets.forEach((b) => {
      const u = (map[b.user] ||= { nick: b.user, points: 0, openCount: 0, openStake: 0, openPotential: 0 });
      // Tally per leg so a partially-settled fantasy slip still scores its decided legs while
      // its pending legs show as active. For whole-slip bets this equals the old per-bet maths.
      let pts = 0, openStake = 0, openPot = 0, hasOpen = false;
      (b.items || []).forEach((it) => {
        if (it.status === "won") pts += it.stake * it.odds - it.stake;
        else if (it.status === "lost") pts -= it.stake;
        else if (it.status === "open") { hasOpen = true; openStake += it.stake; openPot += it.stake * it.odds; }
      });
      u.points += Math.round(pts);
      if (hasOpen) { u.openCount++; u.openStake += openStake; u.openPotential += openPot; }
    });
    const all = Object.values(map);
    // active ranking by potential winnings from open picks
    const active = all.filter((u) => u.openCount > 0).sort((a, b) => (b.openPotential - b.openStake) - (a.openPotential - a.openStake));
    return { mine: map[me], active };
  }, [bets, me]);

  return (
    <div>
      <SectionTitle icon={<Crown className="h-5 w-5" />} title="Ranking" sub="Your overall earnings are private · everyone's active picks are shown" />

      <div className="mb-5 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 to-emerald-500/10 p-4">
        <div className="text-[11px] uppercase tracking-wide text-amber-300/80">Your overall earnings (settled)</div>
        <div className={`font-display text-4xl ${(mine?.points || 0) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {(mine?.points || 0) >= 0 ? "+" : ""}{mine?.points || 0} <span className="text-base text-stone-400">Coins</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">Only you can see your overall total. Other players see only your active picks.</div>
      </div>

      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-200"><Clock className="h-4 w-4 text-sky-300" /> Active Picks — all players</div>
      {active.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No active picks right now. They appear here while matches are in play.</p>}
      <div className="space-y-2">
        {active.map((u, i) => (
          <div key={u.nick} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${u.nick === me ? "border-amber-400/50 bg-amber-400/10" : "border-white/10 bg-white/[0.03]"}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-display text-xl ${i === 0 ? "bg-amber-400 text-black" : i === 1 ? "bg-stone-300 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-stone-300"}`}>{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{u.nick} {u.nick === me && <span className="text-[10px] text-amber-300">(you)</span>}</div>
              <div className="text-[11px] text-stone-500">⏳ {u.openCount} active {u.openCount === 1 ? "pick" : "picks"} · {money(u.openStake)} in play</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wide text-stone-500">Potential</div>
              <div className="font-display text-xl leading-none text-sky-300">+{fmtN(u.openPotential - u.openStake)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Admin ---------- */
function AdminPanel({ bets, results, configs, players, txns, settleMatch, resetMatch, settleOutright, resetOutright, settleFantasy, resetFantasy, settleBoost, resetBoost, voidBoost, resetAll, saveConfig, saveConfigMany, voidPick, creditPlayer, creditPlayerOg, showToast }) {
  const [mode, setMode] = useState("settle"); // settle | manage | outrights | players | void
  const [quick, setQuick] = useState(false);
  const [pick, setPick] = useState(null);
  const switchMode = (m) => { setMode(m); setPick(null); setQuick(false); };

  // ----- per-tab summary stats -----
  const nPlayers = players.filter((p) => !p.is_admin).length;
  const agg = (arr) => arr.reduce((a, b) => { a.n++; a.stake += b.totalStake; if (b.status === "won") a.payout += b.payout || 0; if (b.status === "open") a.open += b.totalStake; return a; }, { n: 0, stake: 0, payout: 0, open: 0 });
  const m = agg(bets.filter((b) => (b.kind || "match") === "match"));
  const f = agg(bets.filter((b) => b.kind === "fantasy"));
  const o = agg(bets.filter((b) => b.kind === "outright"));
  const all = agg(bets);
  const settledMatches = Object.keys(results).filter((k) => +k > 0).length;
  const totalMatches = FIXTURES.length;              // 380 for the league
  const totalFmCats = FM_CATS.length;                // 11 fantasy months
  const settledFmMd = Object.keys(results).filter((k) => FM_CATS.some((c) => c.mid === +k)).length;
  const liveMatches = FIXTURES.filter((mm) => configs?.[mm.n]?.live).length;
  const liveMatchStakes = bets.filter((b) => (b.kind || "match") === "match")
    .reduce((acc, b) => acc + b.items.reduce((s, it) => s + (configs?.[it.matchId]?.live && !results[it.matchId] ? it.stake : 0), 0), 0);
  const totalDeposit = players.reduce((a, p) => a + Number(p.deposit || 0) + Number(p.og_deposit || 0), 0);
  const totalBonus = players.reduce((a, p) => a + Number(p.bonus || 0) + Number(p.og_bonus || 0), 0);
  const pl = (x) => x.stake - x.payout;
  const STAT = {
    settle: [["Players", nPlayers], ["Match Entries", m.n], ["Match Stakes", money(m.stake)], ["Match Payouts", money(m.payout), true], ["Settled Matches", `${settledMatches}/${totalMatches}`], ["Match Pool P/L", money(pl(m)), pl(m) >= 0]],
    manage: [["Players", nPlayers], ["Live Matches", `${liveMatches}/${totalMatches}`], ["Draft (not live)", `${totalMatches - liveMatches}/${totalMatches}`], ["Settled Matches", `${settledMatches}/${totalMatches}`], ["Total Match Stakes", money(m.stake)], ["Live Match Stakes", money(liveMatchStakes)]],
    outrights: [["Players", nPlayers], ["Outright Entries", o.n], ["Outright Stakes", money(o.stake)], ["Outright Payouts", money(o.payout), true], ["Winners Declared", results[-1] ? "Yes" : "No"], ["Outright Pool P/L", money(pl(o)), pl(o) >= 0]],
    fantasy: [["Players", nPlayers], ["Fantasy Entries", f.n], ["Fantasy Stakes", money(f.stake)], ["Fantasy Payouts", money(f.payout), true], ["Settled Months", `${settledFmMd}/${totalFmCats}`], ["Fantasy Pool P/L", money(pl(f)), pl(f) >= 0]],
    players: [["Players", nPlayers], ["Total Deposit", money(totalDeposit)], ["Total Bonus", money(totalBonus)], ["In Bets", money(all.open)], ["Settled Matches", `${settledMatches}/${totalMatches}`], ["Settled Fantasy Months", `${settledFmMd}/${totalFmCats}`], ["Total Payouts", money(all.payout), true], ["Pool P/L", money(pl(all)), pl(all) >= 0]],
    void: [["Players", nPlayers], ["Total Slips", all.n], ["Open Slips", bets.filter((b) => b.status === "open").length], ["Voided Picks", bets.reduce((a, b) => a + b.items.filter((it) => it.status === "void").length, 0)]],
    profiles: [["Players", nPlayers], ["Total Deposit", money(totalDeposit)], ["Total Bonus", money(totalBonus)], ["In Bets", money(all.open)], ["Total Payouts", money(all.payout), true], ["Pool P/L", money(pl(all)), pl(all) >= 0]],
  };
  const stats = STAT[mode] || STAT.settle;
  const showMatchExport = mode === "settle" || mode === "manage";
  const showTxnExport = mode === "players";

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map(([label, v, good]) => <Stat key={label} label={label} v={v} good={good} />)}
      </div>

      {showMatchExport && (
        <div className="mb-4 flex gap-2">
          <button onClick={() => exportPicksCSV(bets.filter((b) => b.kind !== "outright"), "SGA_EPL2627_match_picks.csv", true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
            <BarChart3 className="h-3.5 w-3.5" /> Match Picks (Excel)
          </button>
          <button onClick={() => printPicks(bets.filter((b) => b.kind !== "outright"), "All Players — Match Picks", true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
            <Receipt className="h-3.5 w-3.5" /> Match Picks (PDF)
          </button>
        </div>
      )}
      {showTxnExport && (
        <div className="mb-4">
          <button onClick={() => exportTransactionsCSV(txns, "SGA_EPL2627_all_transactions.csv")}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-white/10">
            <Wallet className="h-3.5 w-3.5" /> Export All Transactions (Excel)
          </button>
        </div>
      )}

      <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-xl bg-black/30 p-1">
        {[["settle", "Settle", Settings], ["manage", "Odds", ListChecks], ["outrights", "Outrights", Trophy], ["fantasy", "Fantasy", Users], ["players", "Coins", Wallet], ["void", "Void", Ban], ["profiles", "Profiles", TrendingUp]].map(([k, lbl, Icon]) => (
          <button key={k} onClick={() => switchMode(k)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold transition ${mode === k ? "bg-gradient-to-r from-amber-400 to-emerald-400 text-black" : "text-stone-400"}`}>
            <Icon className="h-4 w-4" /> {lbl}
          </button>
        ))}
      </div>

      {mode === "settle" ? (
        <>
          <SectionTitle icon={<Settings className="h-5 w-5" />} title="Result Settlement" sub="Enter outcomes — the engine settles every prediction automatically" />
          {!pick ? (
            <>
              <BoostSettle config={configs[-3]} bets={bets} settleBoost={settleBoost} resetBoost={resetBoost} voidBoost={voidBoost} showToast={showToast} />
              <MatchPicker results={results} configs={configs} onPick={setPick} bets={bets} />
            </>
          ) : (
            <SettleForm match={pick} config={configs[pick.n]} onBack={() => setPick(null)} results={results} settleMatch={settleMatch} resetMatch={resetMatch} bets={bets} showToast={showToast} />
          )}
        </>
      ) : mode === "manage" ? (
        <>
          <SectionTitle icon={<ListChecks className="h-5 w-5" />} title="Odds & Players" sub="Set player names and adjust odds per match — saved for everyone" />
          {pick ? (
            <ManageForm match={pick} config={configs[pick.n]} onBack={() => setPick(null)} saveConfig={saveConfig} showToast={showToast} />
          ) : quick ? (
            <QuickOdds configs={configs} results={results} saveConfigMany={saveConfigMany} showToast={showToast}
              onClose={() => setQuick(false)} onOpenFull={(m) => { setQuick(false); setPick(m); }} />
          ) : (
            <>
              <BoostAdmin config={configs[-3]} bets={bets} saveConfig={saveConfig} showToast={showToast} />
              <button onClick={() => setQuick(true)}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 text-sm font-bold text-black">
                ⚡ Quick 1X2 + Live — publish a gameweek in one screen
              </button>
              <MatchPicker results={results} configs={configs} onPick={setPick} manage />
            </>
          )}
        </>
      ) : mode === "outrights" ? (
        <OutrightAdmin config={configs[-1]} result={results[-1]} bets={bets} txns={txns} saveConfig={saveConfig} settleOutright={settleOutright} resetOutright={resetOutright} showToast={showToast} />
      ) : mode === "fantasy" ? (
        <FantasyAdmin config={configs[-2]} results={results} bets={bets} saveConfig={saveConfig} settleFantasy={settleFantasy} resetFantasy={resetFantasy} showToast={showToast} />
      ) : mode === "void" ? (
        <VoidPanel bets={bets} results={results} configs={configs} voidPick={voidPick} showToast={showToast} />
      ) : mode === "profiles" ? (
        <ProfilesPanel players={players} bets={bets} />
      ) : (
        <PlayersPanel players={players} bets={bets} txns={txns} creditPlayer={creditPlayer} creditPlayerOg={creditPlayerOg} resetAll={resetAll} showToast={showToast} />
      )}
    </div>
  );
}

/* ---------- Admin: void a single pick (refund + exclude from settlement) ---------- */
function ProfileRow({ p, s }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-emerald-400/30">
        <span className="flex min-w-0 items-center gap-2">
          <ChevronRight className={`h-4 w-4 shrink-0 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
          <span className="truncate text-sm font-bold text-white">👤 {p.nickname}{p.full_name ? <span className="ml-1 text-[11px] font-normal text-stone-500">{p.full_name}</span> : null}</span>
        </span>
        <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-bold ${s.net >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>Net {money(s.net)}</span>
      </button>
      {open && <div className="mt-2"><BalanceBreakdown summary={s} /></div>}
    </div>
  );
}

function ProfilesPanel({ players, bets }) {
  const [q, setQ] = useState("");
  const list = players
    .filter((p) => !p.is_admin)
    .map((p) => ({ p, s: playerSummary(p, bets.filter((b) => b.userId === p.id)) }))
    .filter(({ p }) => (p.nickname + " " + (p.full_name || "")).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.s.net - a.s.net);
  return (
    <div>
      <SectionTitle icon={<TrendingUp className="h-5 w-5" />} title="Player Profiles" sub="Tap a player for their overall balance across all wallets — the same view the player sees" />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a player…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>
      {list.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No players found.</p>}
      <div className="space-y-2.5">
        {list.map(({ p, s }) => <ProfileRow key={p.id} p={p} s={s} />)}
      </div>
    </div>
  );
}

function VoidPanel({ bets, results, configs, voidPick, showToast }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState({}); // all status groups collapsed by default
  const [confirm, setConfirm] = useState(null); // { betId, selId, matchId, label, code, player }
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const doVoid = async () => {
    if (!confirm) return;
    if (!reason.trim()) { showToast("Enter a reason for the void", "err"); return; }
    setBusy(true);
    try {
      await voidPick(confirm.betId, confirm.selId, confirm.matchId, reason.trim());
      showToast(`Voided “${confirm.label}” — stake refunded`);
      setConfirm(null); setReason("");
    } catch (e) { showToast(e.message || "Void failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  const statusOf = (m) => {
    if (results[m.n]) return "settled";
    const cfg = configs?.[m.n];
    if (cfg?.live) return "live";
    if (Date.now() >= kickoffMs(m)) return "notoffered"; // kicked off but never went live
    if (cfg) return "draft";
    return "notset";
  };

  const ql = q.trim().toLowerCase();
  // every match pick, grouped by match
  const picksByMatch = {};
  (bets || []).filter((b) => (b.kind || "match") === "match")
    .forEach((b) => b.items.forEach((it) => { (picksByMatch[it.matchId] ||= []).push({ b, it }); }));
  const pickShown = (m, b) => !ql || (m.home + m.away).toLowerCase().includes(ql) || (b.user + " " + b.code).toLowerCase().includes(ql);

  const matchList = FIXTURES
    .filter((m) => (picksByMatch[m.n] || []).some(({ b }) => pickShown(m, b)))
    .sort((a, b) => kickoffMs(b) - kickoffMs(a)); // latest → oldest
  const groups = { live: [], draft: [], notset: [], notoffered: [], settled: [] };
  matchList.forEach((m) => groups[statusOf(m)].push(m));

  const SECTIONS = [
    ["live", "Live", "bg-sky-500/20 text-sky-300"],
    ["draft", "Draft", "bg-amber-500/20 text-amber-300"],
    ["notset", "Not set", "bg-white/10 text-stone-400"],
    ["notoffered", "Not offered", "bg-stone-600/40 text-stone-400"],
    ["settled", "Settled", "bg-emerald-500/20 text-emerald-300"],
  ];

  const MatchCard = (m) => {
    const rows = (picksByMatch[m.n] || []).filter(({ b }) => pickShown(m, b));
    return (
      <div key={m.n} className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 text-xs font-bold">
          {(() => { const e = effTeams(m, configs?.[m.n]); return `${e.home} v ${e.away}`; })()}
          <span className="ml-1.5 font-normal text-stone-500">{m.day} · {m.date.replace(/,?\s*20\d\d/, "")} · {m.time}</span>
        </div>
        <div className="space-y-1.5">
          {rows.map(({ b, it }) => (
            <div key={b.id + it.selId} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              <div className="min-w-0">
                <div className="text-[10px] text-stone-500">👤 {b.user} · <span className="font-mono">{b.code}</span> · {it.marketTitle}</div>
                <div className={`truncate font-medium ${it.status === "void" ? "text-stone-500 line-through" : ""}`}>{selDisplay(it)} <span className="text-emerald-300">@{it.oddsStr}</span> · {money(it.stake)}</div>
                {it.status === "void" && <div className="text-[10px] text-stone-500">voided{it.voidReason ? `: ${it.voidReason}` : ""}{it.voidedBy ? ` · by ${it.voidedBy}` : ""}</div>}
              </div>
              {it.status === "void" ? (
                <span className="shrink-0 rounded bg-stone-500/20 px-2 py-1 text-[9px] font-bold uppercase text-stone-300">void</span>
              ) : (
                <button onClick={() => { setConfirm({ betId: b.id, selId: it.selId, matchId: it.matchId, label: `${it.marketTitle}: ${selDisplay(it)}`, code: b.code, player: b.user }); setReason(""); }}
                  className="shrink-0 rounded-lg bg-rose-500/15 px-3 py-1.5 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/25">Void</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <SectionTitle icon={<Ban className="h-5 w-5" />} title="Void a Pick" sub="Cancel one selection — its stake is refunded and it's left out of settlement" />
      <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[12px] text-stone-300">
        Voiding refunds that pick's stake to the player's wallet and removes it from grading. The rest of the slip is unaffected. Works before or after a match is settled — the remaining picks are re-graded. This can't be undone, so add a clear reason.
      </div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by team, player, or slip code…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>

      <div className="space-y-2 pb-6">
        {matchList.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No match picks to void{ql ? " for your search" : " yet"}.</p>}
        {matchList.length > 0 && SECTIONS.map(([key, label, badgeCls]) => {
          const ms = groups[key];
          if (!ms.length) return null;
          const isOpen = ql ? true : open[key];
          return (
            <div key={key} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <button onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))} className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${badgeCls}`}>{label}</span>
                  <span className="text-stone-400">({ms.length} {ms.length === 1 ? "match" : "matches"})</span>
                </span>
                <ChevronRight className={`h-4 w-4 text-stone-500 transition ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && <div className="space-y-2 border-t border-white/5 p-3">{ms.map(MatchCard)}</div>}
            </div>
          );
        })}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={() => !busy && setConfirm(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-rose-400/30 bg-[#0a1311] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2 font-display text-2xl text-white"><Ban className="h-5 w-5 text-rose-300" /> Void this pick?</div>
            <div className="mb-3 rounded-xl bg-black/30 p-3 text-xs">
              <div className="text-stone-400">{confirm.player} · {confirm.code}</div>
              <div className="mt-1 font-semibold text-stone-100">{confirm.label}</div>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-400">Reason (required — shown in the player's slip &amp; records)</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="e.g. Entered a listed score in Any Other Score by mistake"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-rose-400/60" />
            </label>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirm(null)} disabled={busy} className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-stone-300">Cancel</button>
              <button onClick={doVoid} disabled={busy || !reason.trim()} className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Voiding…" : "Confirm void"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Admin: outrights (edit odds + settle winners) ---------- */
function OutrightAdmin({ config, result, bets, txns, saveConfig, settleOutright, resetOutright, showToast }) {
  const ogBets = useMemo(() => (bets || []).filter((b) => b.kind === "outright"), [bets]);
  const ogTxns = useMemo(() => (txns || []).filter((t) => t.kind === "outright"), [txns]);
  const [odds, setOdds] = useState(() => JSON.parse(JSON.stringify(config?.odds || {})));
  const [added, setAdded] = useState(() => JSON.parse(JSON.stringify(config?.added || {})));
  const [removed, setRemoved] = useState(() => JSON.parse(JSON.stringify(config?.removed || {})));
  // markets reflect live edits (odds + added/removed) so changes show immediately
  const markets = useMemo(() => buildOutrightMarkets({ odds, added, removed }), [odds, added, removed]);
  const [winners, setWinners] = useState(() => ({ ...(result || {}) }));
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false); // 'settle' | 'reset' | false
  const [sec, setSec] = useState({ settle: false, odds: false }); // collapsible sections
  const settled = !!result;
  const setOdd = (key, id, val) => setOdds((o) => ({ ...o, [key]: { ...(o[key] || {}), [id]: val } }));
  const addSel = (key, name, oddsStr) => setAdded((a) => ({ ...a, [key]: [...(a[key] || []), { id: `${key}_add_${uid()}`, label: name, oddsStr: oddsStr || "50/1" }] }));
  const delSel = (key, id) => {
    if (id.includes("_add_")) setAdded((a) => ({ ...a, [key]: (a[key] || []).filter((x) => x.id !== id) }));
    else setRemoved((r) => ({ ...r, [key]: [...new Set([...(r[key] || []), id])] }));
  };

  // distinct "Any other" names players actually typed, per market (with counts)
  const typedNames = useMemo(() => {
    const map = {};
    (bets || []).filter((b) => b.kind === "outright").forEach((b) => b.items.forEach((it) => {
      if (it.meta?.other && (it.customName || "").trim()) {
        const k = it.marketKey, nm = it.customName.trim();
        (map[k] ||= {});
        map[k][nm] = (map[k][nm] || 0) + 1;
      }
    }));
    return map;
  }, [bets]);

  const saveOdds = async () => {
    setBusy(true);
    try { await saveConfig(-1, { odds, added, removed }); showToast("Outright odds & selections saved"); }
    catch (e) { showToast(e.message || "Save failed", "err"); }
    finally { setBusy(false); }
  };
  const settle = async () => {
    // require a typed name when "Any other" is the declared winner
    for (const mk of markets) {
      const sel = winners[mk.key];
      if (sel && sel === `${mk.key}_other` && !(winners[`${mk.key}_name`] || "").trim()) {
        showToast(`Type the actual winner name for ${mk.title}`, "err"); return;
      }
    }
    setBusy(true);
    try { await settleOutright(winners); showToast("Outrights settled & paid out"); setConfirm(false); }
    catch (e) { showToast(e.message || "Settle failed", "err"); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    setBusy(true);
    try { await resetOutright(); showToast("Outrights reset — picks reopened"); setConfirm(false); }
    catch (e) { showToast(e.message || "Reset failed", "err"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <SectionTitle icon={<Trophy className="h-5 w-5" />} title="Outrights" sub={`Adjust odds & settle winners · entries close ${outrightDeadlineLocal()}`} />

      <div className="mb-2 flex gap-2">
        <button onClick={() => exportPicksCSV(ogBets, "SGA_EPL2627_outright_picks.csv", true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <BarChart3 className="h-3.5 w-3.5" /> Outright Picks (Excel)
        </button>
        <button onClick={() => printPicks(ogBets, "All Players — Outright Picks", true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <Receipt className="h-3.5 w-3.5" /> Outright Picks (PDF)
        </button>
      </div>
      <div className="mb-4">
        <button onClick={() => exportTransactionsCSV(ogTxns, "SGA_EPL2627_outright_transactions.csv")}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-white/10">
          <Wallet className="h-3.5 w-3.5" /> Outright Transactions (Excel)
        </button>
      </div>

      <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button onClick={() => setSec((s) => ({ ...s, settle: !s.settle }))} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
          <span>🏁 Declare winners {settled && <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">SETTLED</span>}</span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${sec.settle ? "rotate-90" : ""}`} />
        </button>
        {sec.settle && (<div className="border-t border-white/5 p-4">
        <div className="space-y-2">
          {markets.map((mk) => {
            if (mk.type === "total") {
              return (
                <div key={mk.key}>
                  <span className="mb-1 block text-xs text-stone-400">{mk.icon} {mk.title}</span>
                  <input type="number" value={winners[`${mk.key}_total`] ?? ""} onChange={(e) => setWinners((w) => ({ ...w, [`${mk.key}_total`]: e.target.value }))}
                    placeholder={`Actual total ${mk.title.replace("Season ", "").toLowerCase()} (leave blank = not settled)`} className={ipt} />
                </div>
              );
            }
            const isOther = winners[mk.key] === `${mk.key}_other`;
            return (
            <div key={mk.key}>
              <span className="mb-1 block text-xs text-stone-400">{mk.icon} {mk.title}</span>
              <select value={winners[mk.key] || ""} onChange={(e) => setWinners((w) => ({ ...w, [mk.key]: e.target.value }))} className={ipt}>
                <option value="">— not settled —</option>
                {mk.selections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              {isOther && (
                <>
                  <input value={winners[`${mk.key}_name`] || ""} onChange={(e) => setWinners((w) => ({ ...w, [`${mk.key}_name`]: e.target.value }))}
                    placeholder="Type the actual winner (team / combination / player)"
                    className={ipt + " mt-1 border-amber-400/40 focus:border-amber-400"} />
                  {typedNames[mk.key] && Object.keys(typedNames[mk.key]).length > 0 && (
                    <div className="mt-1.5">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-stone-500">Names players entered — tap to match exactly</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(typedNames[mk.key]).sort((a, b) => b[1] - a[1]).map(([nm, cnt]) => {
                          const active = (winners[`${mk.key}_name`] || "").trim().toLowerCase() === nm.toLowerCase();
                          return (
                            <button key={nm} onClick={() => setWinners((w) => ({ ...w, [`${mk.key}_name`]: nm }))}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-amber-400 text-black" : "bg-white/5 text-stone-300 hover:bg-white/10"}`}>
                              {nm} <span className="opacity-60">×{cnt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );})}
        </div>
        <p className="mt-2 text-[11px] text-stone-500">For “Any other”, type the real winner — players who chose “Any other” pay out only if their typed name matches. For totals, enter the actual count (e.g. total goals) — Over/Under settle automatically.</p>
        {!confirm ? (
          <div className="mt-3 space-y-2">
            <button onClick={() => setConfirm("settle")} disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black disabled:opacity-50">
              {settled ? "Review & Re-settle Outrights" : "Review & Settle Outrights"}
            </button>
            {settled && (
              <button onClick={() => setConfirm("reset")} disabled={busy} className="w-full rounded-xl bg-rose-500/15 py-3 font-bold text-rose-200 hover:bg-rose-500/25 disabled:opacity-50">
                Reset / Unsettle Outrights
              </button>
            )}
          </div>
        ) : confirm === "settle" ? (
          <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3">
            <div className="mb-1 font-bold text-amber-100">Confirm — settle {ogBets.length} outright slip{ogBets.length === 1 ? "" : "s"}?</div>
            <div className="text-[12px] text-stone-300">Winning picks pay out; everything not matching the declared winners is marked lost.</div>
            <div className="mt-2 flex gap-2">
              <button onClick={settle} disabled={busy} className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-2.5 font-bold text-black disabled:opacity-50">{busy ? "Working…" : "Confirm & Pay Out"}</button>
              <button onClick={() => setConfirm(false)} disabled={busy} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-300">Back</button>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3">
            <div className="mb-1 font-bold text-rose-100">Reset outrights?</div>
            <div className="text-[12px] text-stone-300">Removes the declared winners and reopens all {ogBets.length} outright slip{ogBets.length === 1 ? "" : "s"} (payouts undone).</div>
            <div className="mt-2 flex gap-2">
              <button onClick={reset} disabled={busy} className="flex-1 rounded-xl bg-rose-500 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "Resetting…" : "Confirm Reset"}</button>
              <button onClick={() => setConfirm(false)} disabled={busy} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-300">Back</button>
            </div>
          </div>
        )}
        </div>)}
      </div>

      <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button onClick={() => setSec((s) => ({ ...s, odds: !s.odds }))} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
          <span>🎲 Selections &amp; odds</span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${sec.odds ? "rotate-90" : ""}`} />
        </button>
        {sec.odds && (<div className="border-t border-white/5 p-4">
        <p className="mb-2 text-[11px] text-stone-500">Edit odds, or <b>add / remove</b> teams &amp; players in the winner markets. The “Any other” catch-all always stays. Tap <b>Save</b> below to publish your changes.</p>
        <div className="space-y-2">
        {markets.map((mk) => mk.type === "winner"
          ? <OutrightWinnerEditor key={mk.key} mk={mk} odds={odds} setOdd={setOdd} onAdd={addSel} onDelete={delSel} />
          : <OddsMarket key={mk.key} mk={mk} odds={odds} setOdd={setOdd} />)}
      </div>
      <button onClick={saveOdds} disabled={busy} className="mt-4 w-full rounded-xl bg-white/10 py-3 font-bold text-emerald-300 disabled:opacity-50">
        {busy ? "Saving…" : "Save Outright Odds & Selections"}
      </button>
        </div>)}
      </div>
    </div>
  );
}

/* ---------- Admin: Fantasy Manager (managers, odds, settle) ---------- */
function FantasyAdmin({ config, results, bets, saveConfig, settleFantasy, resetFantasy, showToast }) {
  const [managers, setManagers] = useState(() => (config?.managers?.length ? config.managers : FM_DEFAULT_MANAGERS).map((m) => ({ ...m })));
  const [odds, setOdds] = useState(() => JSON.parse(JSON.stringify(config?.odds || {})));
  const [live, setLive] = useState(() => ({ ...(config?.live || {}) }));
  const [locked, setLocked] = useState(() => ({ ...(config?.locked || {}) }));
  const [busy, setBusy] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [confirm, setConfirm] = useState(null); // { mid, label }
  const [winnerSel, setWinnerSel] = useState({}); // catKey -> selId chosen in dropdown
  const [sec, setSec] = useState({}); // collapsible admin sections

  const fmBets = useMemo(() => (bets || []).filter((b) => b.kind === "fantasy"), [bets]);

  const addManager = () => setManagers((m) => [...m, { id: "m_" + uid(), name: "" }]);
  const setMgr = (i, name) => setManagers((m) => m.map((x, j) => j === i ? { ...x, name } : x));
  const delMgr = (i) => setManagers((m) => m.filter((_, j) => j !== i));
  const setOdd = (catKey, mgrId, val) => setOdds((o) => ({ ...o, [catKey]: { ...(o[catKey] || {}), [mgrId]: val } }));

  const cleanManagers = () => managers.filter((m) => (m.name || "").trim()).map((m) => ({ id: m.id, name: m.name.trim() }));
  const persistFlags = async (nextLive, nextLocked) => {
    try { await saveConfig(-2, { managers: cleanManagers(), odds, live: nextLive, locked: nextLocked }); }
    catch (e) { showToast(e.message || "Save failed", "err"); }
  };
  const toggleLive = (k) => { const next = { ...live, [k]: !live[k] }; setLive(next); persistFlags(next, locked); };
  const toggleLock = (k) => { const next = { ...locked, [k]: !locked[k] }; setLocked(next); persistFlags(live, next); };

  const saveSetup = async () => {
    setBusy(true);
    try { await saveConfig(-2, { managers: cleanManagers(), odds, live, locked }); showToast("Fantasy managers & odds saved"); }
    catch (e) { showToast(e.message || "Save failed", "err"); }
    finally { setBusy(false); }
  };
  const doSettle = async (mid, selId) => {
    if (!selId) { showToast("Pick the winning manager first", "err"); return; }
    setBusy(true);
    try { await settleFantasy(mid, selId); showToast("Matchday settled & paid out"); setConfirm(null); }
    catch (e) { showToast(e.message || "Settle failed", "err"); }
    finally { setBusy(false); }
  };
  const doReset = async (mid) => {
    setBusy(true);
    try { await resetFantasy(mid); showToast("Matchday reset — picks reopened"); setConfirm(null); }
    catch (e) { showToast(e.message || "Reset failed", "err"); }
    finally { setBusy(false); }
  };

  const liveManagers = managers.filter((m) => (m.name || "").trim());

  return (
    <div>
      <SectionTitle icon={<Users className="h-5 w-5" />} title="Fantasy Manager" sub="Manage the manager list, set odds per matchday, and settle winners" />

      <div className="mb-2 flex gap-2">
        <button onClick={() => exportPicksCSV(fmBets, "SGA_EPL2627_fantasy_picks.csv", true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <BarChart3 className="h-3.5 w-3.5" /> Fantasy Picks (Excel)
        </button>
        <button onClick={() => printPicks(fmBets, "All Players — Fantasy Picks", true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10">
          <Receipt className="h-3.5 w-3.5" /> Fantasy Picks (PDF)
        </button>
      </div>

      {/* Managers */}
      <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button onClick={() => setSec((x) => ({ ...x, managers: !x.managers }))} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
          <span>👔 Managers <span className="text-[11px] font-normal text-stone-500">({liveManagers.length})</span></span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${sec.managers ? "rotate-90" : ""}`} />
        </button>
        {sec.managers && (<div className="border-t border-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">Add or remove managers. Odds set per matchday below.</p>
          <button onClick={addManager} className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {managers.map((m, i) => (
            <div key={m.id} className="flex items-center gap-2">
              <input value={m.name} onChange={(e) => setMgr(i, e.target.value)} placeholder="Manager name (e.g. Lionel Scaloni (Argentina))"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/50" />
              <button onClick={() => delMgr(i)} className="shrink-0 rounded-lg bg-white/5 p-2 text-stone-400 hover:text-rose-400"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        </div>)}
      </div>

      {/* Go live & locks */}
      <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button onClick={() => setSec((x) => ({ ...x, live: !x.live }))} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
          <span>📡 Go live &amp; picks lock</span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${sec.live ? "rotate-90" : ""}`} />
        </button>
        {sec.live && (<div className="border-t border-white/5 p-3">
        <p className="mb-2 text-[11px] text-stone-500">Players only see matchdays you set <b>Live</b>. Set <b>Locked</b> to stop new picks (e.g. at kickoff) without settling. Saved instantly.</p>
        <div className="space-y-1.5">
        {FM_CATS.map((cat) => {
          const settled = results[cat.mid];
          return (
            <div key={cat.key} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {cat.label}
                {settled && <span className="ml-1.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">SETTLED</span>}
              </span>
              <button onClick={() => toggleLive(cat.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${live[cat.key] ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-400"}`}>
                {live[cat.key] ? "Live" : "Draft"}
              </button>
              <button onClick={() => toggleLock(cat.key)} disabled={!live[cat.key]}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${locked[cat.key] ? "bg-rose-500 text-white" : "bg-white/5 text-stone-400"}`}>
                {locked[cat.key] ? "Locked" : "Open"}
              </button>
            </div>
          );
        })}
        </div>
        </div>)}
      </div>

      {/* Odds per matchday */}
      <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button onClick={() => setSec((x) => ({ ...x, odds: !x.odds }))} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
          <span>🎲 Odds per matchday</span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${sec.odds ? "rotate-90" : ""}`} />
        </button>
        {sec.odds && (<div className="border-t border-white/5 p-3">
        <div className="space-y-2">
        {FM_CATS.map((cat) => {
          const open = openCat === cat.key;
          return (
            <div key={cat.key} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <button onClick={() => setOpenCat(open ? null : cat.key)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold">
                <span>{cat.label} {results[cat.mid] && <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">SETTLED</span>}</span>
                <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
              </button>
              {open && (
                <div className="border-t border-white/5 p-3">
                  <div className="space-y-1.5">
                    {liveManagers.map((m) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs">{m.name}</span>
                        <input value={odds[cat.key]?.[m.id] || ""} onChange={(e) => setOdd(cat.key, m.id, e.target.value)} placeholder="5/1"
                          className="w-16 shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-center text-xs outline-none focus:border-emerald-400/50" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
        </div>)}
      </div>

      <button onClick={saveSetup} disabled={busy} className="mt-1 mb-2 w-full rounded-xl bg-white/10 py-3 font-bold text-emerald-300 disabled:opacity-50">
        {busy ? "Saving…" : "Save Managers & Odds"}
      </button>

      {/* Settle per matchday */}
      <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button onClick={() => setSec((x) => ({ ...x, settle: !x.settle }))} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
          <span>🏁 Settle winners</span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${sec.settle ? "rotate-90" : ""}`} />
        </button>
        {sec.settle && (<div className="border-t border-white/5 p-3">
        <p className="mb-2 text-[11px] text-stone-500">Settling pays out winning picks from the match wallet.</p>
        <div className="space-y-2">
        {FM_CATS.map((cat) => {
          const settled = results[cat.mid];
          const settledName = settled ? (liveManagers.find((m) => `${cat.key}__${m.id}` === settled.fmWinner)?.name || "set") : null;
          return (
            <div key={cat.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold">{cat.label}</span>
                {settled && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Winner: {settledName}</span>}
              </div>
              {confirm?.mid === cat.mid ? (
                <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3">
                  <div className="mb-2 text-[12px] text-stone-200">{confirm.kind === "reset" ? "Reset this matchday and reopen its picks?" : `Settle ${cat.label}? Winning picks pay out from the match wallet.`}</div>
                  <div className="flex gap-2">
                    {confirm.kind === "reset"
                      ? <button onClick={() => doReset(cat.mid)} disabled={busy} className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "…" : "Confirm Reset"}</button>
                      : <button onClick={() => doSettle(cat.mid, winnerSel[cat.key])} disabled={busy} className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-emerald-400 py-2 text-sm font-bold text-black disabled:opacity-50">{busy ? "…" : "Confirm & Pay Out"}</button>}
                    <button onClick={() => setConfirm(null)} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-stone-300">Back</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select value={winnerSel[cat.key] ?? (settled?.fmWinner || "")} onChange={(e) => setWinnerSel((w) => ({ ...w, [cat.key]: e.target.value }))}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/50">
                    <option value="">— winning manager —</option>
                    {liveManagers.map((m) => <option key={m.id} value={`${cat.key}__${m.id}`}>{m.name}</option>)}
                  </select>
                  <button onClick={() => setConfirm({ mid: cat.mid })} className="shrink-0 rounded-lg bg-gradient-to-r from-amber-400 to-emerald-400 px-3 py-2 text-sm font-bold text-black">{settled ? "Re-settle" : "Settle"}</button>
                  {settled && <button onClick={() => setConfirm({ mid: cat.mid, kind: "reset" })} className="shrink-0 rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200">Reset</button>}
                </div>
              )}
            </div>
          );
        })}
        </div>
        </div>)}
      </div>
    </div>
  );
}

/* ---------- Admin: give coins to players ---------- */
function PlayersPanel({ players, bets, txns, creditPlayer, creditPlayerOg, resetAll, showToast }) {
  const list = players.filter((p) => !p.is_admin);
  const [armed, setArmed] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const doReset = async () => {
    if (word.trim().toUpperCase() !== "RESET") { showToast('Type RESET to confirm', "err"); return; }
    setBusy(true);
    try { await resetAll(); showToast("Reset done — picks, results, transactions & balances cleared"); setArmed(false); setWord(""); }
    catch (e) { showToast(e.message || "Reset failed", "err"); }
    finally { setBusy(false); }
  };
  return (
    <div>
      <SectionTitle icon={<Wallet className="h-5 w-5" />} title="Players & Coins" sub="Credit each wallet — bonus is added automatically by deposit tier" />
      <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-stone-400 sm:grid-cols-4">
        <div><span className="font-bold text-stone-300">No bonus</span> · up to 5,000</div>
        <div><span className="font-bold text-emerald-300">10%</span> · 5,001–15,000</div>
        <div><span className="font-bold text-emerald-300">15%</span> · 15,001–25,000</div>
        <div><span className="font-bold text-emerald-300">20%</span> · 25,001 &amp; above</div>
      </div>
      {list.length > 0 && (() => {
        const kindStake = (mine, k) => mine.filter((b) => (b.kind || "match") === k).reduce((a, b) => a + (b.totalStake || 0), 0);
        const rows = list.map((p) => {
          const mine = bets.filter((b) => b.userId === p.id);
          const nonOg = mine.filter((b) => b.kind !== "outright");
          const og = mine.filter((b) => b.kind === "outright");
          let wl = 0, inb = 0;
          mine.forEach((b) => (b.items || []).forEach((it) => { wl += itemPL(b, it); if (it.status === "open") inb += it.stake; }));
          return {
            p,
            dep: Number(p.deposit || 0) + Number(p.og_deposit || 0),
            bon: Number(p.bonus || 0) + Number(p.og_bonus || 0),
            match: kindStake(mine, "match"), out: kindStake(mine, "outright"),
            boost: kindStake(mine, "boost"), fan: kindStake(mine, "fantasy"),
            wl, inb, net: walletOf(p, nonOg).net + walletOg(p, og).net,
          };
        }).sort((a, b) => b.net - a.net);
        const tot = rows.reduce((a, r) => { ["dep", "bon", "match", "out", "boost", "fan", "wl", "inb", "net"].forEach((k) => (a[k] += r[k])); return a; },
          { dep: 0, bon: 0, match: 0, out: 0, boost: 0, fan: 0, wl: 0, inb: 0, net: 0 });
        const cls = (n) => (n >= 0 ? "text-emerald-300" : "text-rose-300");
        const cols = [["dep", "Deposit"], ["bon", "Bonus"], ["match", "Match bets"], ["out", "Outright"], ["boost", "Boosts"], ["fan", "Fantasy"], ["wl", "Win/Loss"], ["inb", "In Bets"], ["net", "Net Bal"]];
        const cell = (k, v) => k === "wl" ? <span className={`font-semibold ${cls(v)}`}>{signed(v)}</span>
          : k === "net" ? <span className={`font-bold ${cls(v)}`}>{fmtN(v)}</span>
          : k === "inb" ? <span className="text-amber-300">{fmtN(v)}</span>
          : k === "bon" ? <span className="text-emerald-300/80">{fmtN(v)}</span>
          : <span className="text-stone-200">{fmtN(v)}</span>;
        return (
          <div className="mb-4">
            <button onClick={() => setTableOpen(!tableOpen)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-emerald-400/30">
              <span className="flex items-center gap-2 text-sm font-semibold text-stone-200">
                <BarChart3 className="h-4 w-4 text-emerald-300" /> Balance overview · {rows.length} players
              </span>
              <ChevronRight className={`h-4 w-4 text-stone-500 transition ${tableOpen ? "rotate-90" : ""}`} />
            </button>
            {tableOpen && (
              <div className="mt-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                <table className="w-full min-w-[720px] text-[11px]">
                  <thead>
                    <tr className="text-stone-400">
                      <th className="sticky left-0 z-10 bg-[#0b0f0d] px-3 py-2 text-left font-semibold">Player</th>
                      {cols.map(([k, lbl]) => <th key={k} className="whitespace-nowrap px-2.5 py-2 text-right font-semibold">{lbl}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.p.id} className="border-t border-white/5">
                        <td className="sticky left-0 z-10 bg-[#0b0f0d] px-3 py-2 text-left font-semibold text-white"><span className="whitespace-nowrap">{r.p.nickname}</span></td>
                        {cols.map(([k]) => <td key={k} className="px-2.5 py-2 text-right tabular-nums">{cell(k, r[k])}</td>)}
                      </tr>
                    ))}
                    <tr className="border-t border-white/10 bg-white/[0.04]">
                      <td className="sticky left-0 z-10 bg-[#0b0f0d] px-3 py-2 text-left font-bold text-stone-300">All players</td>
                      {cols.map(([k]) => <td key={k} className="px-2.5 py-2 text-right font-bold tabular-nums">{cell(k, tot[k])}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
      {list.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No players have signed up yet.</p>}
      <div className="space-y-2.5">
        {list.map((p) => (
          <PlayerCredit key={p.id} p={p}
            myBets={bets.filter((b) => b.userId === p.id && b.kind !== "outright")}
            myOgBets={bets.filter((b) => b.userId === p.id && b.kind === "outright")}
            myTxns={(txns || []).filter((t) => t.user_id === p.id)}
            creditPlayer={creditPlayer} creditPlayerOg={creditPlayerOg} showToast={showToast} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
        <div className="text-sm font-bold text-rose-200">⚠️ Danger zone — Reset everything except accounts</div>
        <p className="mt-1 text-[12px] text-stone-400">Permanently clears all picks (match, outright, fantasy), all settled results, the transaction history, and zeroes every player's wallets. Keeps logins, odds, players, managers, and Go-Live settings. No undo.</p>
        {!armed ? (
          <button onClick={() => setArmed(true)} className="mt-3 rounded-xl bg-rose-500/15 px-4 py-2.5 text-sm font-bold text-rose-200 hover:bg-rose-500/25">Reset everything…</button>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="text-[12px] text-stone-300">Type <b className="text-rose-200">RESET</b> to confirm:</div>
            <div className="flex gap-2">
              <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="RESET"
                className="min-w-0 flex-1 rounded-lg border border-rose-400/40 bg-black/30 px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-rose-400" />
              <button onClick={doReset} disabled={busy} className="shrink-0 rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Resetting…" : "Confirm Reset"}</button>
              <button onClick={() => { setArmed(false); setWord(""); }} disabled={busy} className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-stone-300">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditBlock({ title, color, wallet, onCredit, onExtract, showToast, bonusEnabled = true }) {
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const a = Math.max(0, parseFloat(amt) || 0), pct = bonusEnabled ? bonusPct(a) : 0, bonus = a * pct / 100;
  const run = async (fn, label) => {
    if (a <= 0) { showToast("Enter an amount", "err"); return; }
    setBusy(true);
    try { await fn(); setAmt(""); }
    catch (e) { showToast(e.message || "Failed", "err"); }
    finally { setBusy(false); }
  };
  const credit = () => run(() => onCredit(a, bonus, note || "Credit"));
  const extract = () => run(() => onExtract(a, note || "Withdrawal"));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className={`font-semibold ${color}`}>{title}</span>
        <span className="text-stone-400">Net <b className={wallet.net >= 0 ? "text-emerald-300" : "text-rose-300"}>{money(wallet.net)}</b></span>
      </div>
      <div className={`mb-2 grid gap-1.5 text-center text-[10px] ${bonusEnabled ? "grid-cols-5" : "grid-cols-4"}`}>
        {(bonusEnabled ? [["Dep", wallet.deposit], ["Bonus", wallet.bonus], ["In", wallet.inBets], ["Won", wallet.won], ["Lost", wallet.lost]]
                       : [["Dep", wallet.deposit], ["In", wallet.inBets], ["Won", wallet.won], ["Lost", wallet.lost]]).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-black/20 px-1 py-1.5"><div className="text-stone-500">{k}</div><div className="font-semibold text-white">{fmtN(v)}</div></div>
        ))}
      </div>
      <input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Amount" className={ipt} />
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {["Advance (R)", "Credit (C)", "Adjustment"].map((n) => (
          <button key={n} onClick={() => setNote(n)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${note === n ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-300"}`}>{n}</button>
        ))}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="note (optional)" className="min-w-[90px] flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] outline-none focus:border-emerald-400/50" />
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={credit} disabled={busy} className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-emerald-400 px-3 py-2 text-sm font-bold text-black disabled:opacity-50">{busy ? "…" : "Add / Credit"}</button>
        <button onClick={extract} disabled={busy} className="flex-1 rounded-lg bg-rose-500/20 px-3 py-2 text-sm font-bold text-rose-200 hover:bg-rose-500/30 disabled:opacity-50">Extract Coin</button>
      </div>
      {a > 0 && <p className="mt-1 text-[11px] text-stone-400">Add credits <span className="text-emerald-300">+{money(a + bonus)}</span>{!bonusEnabled ? " (no bonus on this wallet)" : pct ? ` (incl. ${pct}% bonus +${money(bonus)})` : " (no bonus up to 5,000)"} · Extract removes <span className="text-rose-300">−{money(a)}</span></p>}
    </div>
  );
}

function PlayerCredit({ p, myBets, myOgBets, myTxns, creditPlayer, creditPlayerOg, showToast }) {
  const w = walletOf(p, myBets);
  const og = walletOg(p, myOgBets);
  const [open, setOpen] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const compact = (n) => Math.round(n).toLocaleString();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex min-w-0 items-center gap-2">
          <ChevronRight className={`h-4 w-4 shrink-0 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
          <span className="truncate text-sm font-bold">👤 {p.nickname} <span className="text-[11px] font-normal text-stone-500">{p.full_name}</span></span>
        </span>
        <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 text-[11px]">
          <span className="rounded bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-300">Match {compact(w.net)}</span>
          <span className="rounded bg-amber-500/15 px-2 py-1 font-semibold text-amber-300">Out {compact(og.net)}</span>
        </span>
      </button>

      {open && (
        <div className="mt-3">
          <div className="mb-3 flex gap-2">
            {(() => {
              const all = [...(myBets || []), ...(myOgBets || [])];
              const safe = (p.nickname || "player").replace(/[^\w.-]+/g, "_");
              const guard = (fn) => () => { if (!all.length) { showToast("No picks to export for this player", "err"); return; } fn(); };
              return (
                <>
                  <button onClick={guard(() => printPicks(all, `${p.nickname} — All Picks (match-wise)`, true))}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-white/10">
                    <Receipt className="h-3.5 w-3.5 text-emerald-300" /> PDF
                  </button>
                  <button onClick={guard(() => exportPicksCSV(all, `SGA_EPL2627_${safe}_all_picks.csv`, true))}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-white/10">
                    <BarChart3 className="h-3.5 w-3.5 text-emerald-300" /> Excel (CSV)
                  </button>
                </>
              );
            })()}
          </div>
          <CreditBlock title="Match wallet" color="text-emerald-300" wallet={w} showToast={showToast}
            onCredit={(a, b, note) => creditPlayer(p, a, b, note).then(() => showToast(`Match +${money(a + b)} (${note}) → ${p.nickname}`))}
            onExtract={(a, note) => creditPlayer(p, -a, 0, note).then(() => showToast(`Match −${money(a)} extracted (${note}) ← ${p.nickname}`))} />

          <div className="my-3 border-t border-white/5" />

          <CreditBlock title="🏆 Outright wallet" color="text-amber-300" wallet={og} showToast={showToast} bonusEnabled={false}
            onCredit={(a, b, note) => creditPlayerOg(p, a, b, note).then(() => showToast(`Outright +${money(a + b)} (${note}) → ${p.nickname}`))}
            onExtract={(a, note) => creditPlayerOg(p, -a, 0, note).then(() => showToast(`Outright −${money(a)} extracted (${note}) ← ${p.nickname}`))} />

          <button onClick={() => setShowHist(!showHist)} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 hover:text-emerald-300">
            <ChevronRight className={`h-3.5 w-3.5 transition ${showHist ? "rotate-90" : ""}`} /> Transaction history ({(myTxns || []).length})
          </button>
          {showHist && (
            <div className="mt-2 space-y-1">
              {(myTxns || []).length === 0 && <p className="text-[11px] text-stone-600">No transactions yet.</p>}
              {(myTxns || []).map((t) => {
                const total = Number(t.deposit) + Number(t.bonus);
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-1.5 text-[11px]">
                    <span className="text-stone-400">{new Date(t.created_at).toLocaleString()} <span className={t.kind === "outright" ? "text-amber-300" : "text-emerald-300"}>· {t.kind === "outright" ? "outright" : "match"}</span>{t.note ? <span className="text-stone-500"> · {t.note}</span> : ""}</span>
                    <span className={`font-semibold ${total >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{total >= 0 ? "+" : "−"}{fmtN(Math.abs(total))}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchPicker({ results, configs, onPick, manage, bets }) {
  const [q, setQ] = useState("");
  const [gw, setGw] = useState(() => currentGw());
  const [open, setOpen] = useState({}); // all status groups collapsed by default
  const matchBetsFor = (n) => (bets || [])
    .map((b) => ({ ...b, items: b.items.filter((it) => it.matchId === n) }))
    .filter((b) => b.items.length);
  const dlPDF = (m) => { const mb = matchBetsFor(m.n); if (!mb.length) return; printPicks(mb, `${m.home} v ${m.away} — Match Picks`, true); };
  const dlCSV = (m) => { const mb = matchBetsFor(m.n); if (!mb.length) return; exportPicksCSV(mb, `SGA_${m.home}_v_${m.away}_picks.csv`.replace(/\s+/g, "_"), true); };

  const statusOf = (m) => {
    if (results[m.n]) return "settled";
    const cfg = configs?.[m.n];
    if (cfg?.live) return "live";
    if (Date.now() >= kickoffMs(m)) return "notoffered"; // kicked off but never went live
    if (cfg) return "draft";
    return "notset";
  };

  const ql = q.trim().toLowerCase();
  // A search term looks across the whole season; otherwise stay in the
  // selected gameweek so the list is 10 matches, not 380.
  const sorted = [...FIXTURES]
    .filter((m) => (ql ? (m.home + m.away).toLowerCase().includes(ql) : gw === "all" || m.gw === gw))
    .sort((a, b) => kickoffMs(b) - kickoffMs(a)); // latest → oldest
  const groups = { live: [], draft: [], notset: [], notoffered: [], settled: [] };
  sorted.forEach((m) => groups[statusOf(m)].push(m));
  // Odds tab only: list "Not set" and "Draft" matches soonest → furthest, so the most imminent upcoming matches are first.
  if (manage) {
    groups.notset.sort((a, b) => kickoffMs(a) - kickoffMs(b));
    groups.draft.sort((a, b) => kickoffMs(a) - kickoffMs(b));
  }

  const SECTIONS = [
    ["live", "Live", "bg-sky-500/20 text-sky-300"],
    ["draft", "Draft", "bg-amber-500/20 text-amber-300"],
    ["notset", "Not set", "bg-white/10 text-stone-400"],
    ["notoffered", "Not offered", "bg-stone-600/40 text-stone-400"],
    ["settled", "Settled", "bg-emerald-500/20 text-emerald-300"],
  ];

  const Row = (m) => {
    const settled = results[m.n];
    const picks = (bets || []).reduce((a, b) => a + b.items.filter((it) => it.matchId === m.n).length, 0);
    return (
      <div key={m.n} className="flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
        <button onClick={() => onPick(m)} className="min-w-0 flex-1 text-left hover:text-emerald-300">
          <div className="truncate">{(() => { const e = effTeams(m, configs?.[m.n]); return `${e.home} v ${e.away}`; })()}</div>
          <div className="text-[10px] text-stone-500">
            {m.day} · {m.date.replace(/,?\s*20\d\d/, "")} · {m.time}
            {settled && !manage ? ` · ${settled.ft.h}–${settled.ft.a}` : ""}
          </div>
        </button>
        <span className="flex shrink-0 items-center gap-1">
          {!manage && picks > 0 && (
            <>
              <button onClick={() => dlCSV(m)} title={`Excel — ${picks} picks`} className="rounded-md bg-white/5 p-1 text-emerald-300 hover:bg-white/10"><BarChart3 className="h-3.5 w-3.5" /></button>
              <button onClick={() => dlPDF(m)} title={`PDF — ${picks} picks`} className="rounded-md bg-white/5 p-1 text-emerald-300 hover:bg-white/10"><Receipt className="h-3.5 w-3.5" /></button>
            </>
          )}
          <button onClick={() => onPick(m)} className="text-stone-600 hover:text-emerald-400"><ChevronRight className="h-4 w-4" /></button>
        </span>
      </div>
    );
  };

  return (
    <div>
      <GwBar gw={gw} setGw={setGw} />
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a team…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>
      <div className="space-y-2">
        {SECTIONS.map(([key, label, badgeCls]) => {
          const ms = groups[key];
          const isOpen = ql ? ms.length > 0 : open[key]; // searching auto-expands non-empty groups
          return (
            <div key={key} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <button onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))} className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${badgeCls}`}>{label}</span>
                  <span className="text-stone-400">({ms.length})</span>
                </span>
                <ChevronRight className={`h-4 w-4 text-stone-500 transition ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-white/5 p-3">
                  {ms.length === 0
                    ? <p className="py-2 text-center text-xs text-stone-600">None</p>
                    : <div className="grid gap-2 sm:grid-cols-2">{ms.map(Row)}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettleForm({ match, config, onBack, results, settleMatch, resetMatch, bets, showToast }) {
  const et = effTeams(match, config);
  const prev = results[match.n];
  const customSpecials = (config?.specials || []).filter((s) => (s.label || "").trim());
  const cfgNames = (side) => (config?.players?.[side] || []).map((p) => p.name).filter(Boolean);
  const squadHome = [...new Set([...cfgNames("home"), ...(squadFor(et.home) || [])])];
  const squadAway = [...new Set([...cfgNames("away"), ...(squadFor(et.away) || [])])];
  const squadSet = useMemo(() => new Set([...squadHome, ...squadAway]), [config, et.home, et.away]);
  const prevFirst = prev?.scorers?.[0] || "";
  const [r, setR] = useState(prev
    ? {
        ...prev, customSpecials: prev.customSpecials || {},
        firstScorer: prevFirst ? (squadSet.has(prevFirst) ? prevFirst : "__other__") : "",
        firstOther: prevFirst && !squadSet.has(prevFirst) ? prevFirst : "",
        anytime: Array.isArray(prev.scorers) ? [...prev.scorers] : [],
      }
    : {
        ht: { h: 0, a: 0 }, ft: { h: 0, a: 0 }, firstGoalMinute: 10, firstGoalMethod: "rf",
        totalCards: 2, firstScorer: "", firstOther: "", anytime: [],
        wfbH: false, wfbA: false, bhH: false, bhA: false, ownGoalH: false, ownGoalA: false,
        customSpecials: {},
      });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false); // 'settle' | 'reset' | false
  const [anytimeText, setAnytimeText] = useState("");
  const num = (v) => Math.max(0, parseInt(v) || 0);
  const toggleSpecial = (cid) => setR((x) => ({ ...x, customSpecials: { ...(x.customSpecials || {}), [cid]: !x.customSpecials?.[cid] } }));
  const addAnytime = (name) => { name = (name || "").trim(); if (!name) return; setR((x) => x.anytime?.includes(name) ? x : { ...x, anytime: [...(x.anytime || []), name] }); };
  const removeAnytime = (name) => setR((x) => ({ ...x, anytime: (x.anytime || []).filter((n) => n !== name) }));

  // how many slips / players this match touches
  const affected = (bets || []).filter((b) => b.kind !== "outright" && b.items.some((it) => it.matchId === match.n));
  const affectedPlayers = new Set(affected.map((b) => b.user)).size;

  const buildScorers = () => {
    const first = (r.firstScorer === "__other__" ? r.firstOther : r.firstScorer || "").trim();
    let list = [...(r.anytime || [])];
    if (first) list = [first, ...list.filter((n) => n !== first)]; // first scorer leads the ordered list
    return list;
  };

  const settle = async () => {
    const R = { ...r, scorers: buildScorers() };
    setBusy(true);
    try {
      await settleMatch(match.n, R);
      showToast(`Settled ${match.home} ${R.ft.h}–${R.ft.a} ${match.away}`);
      onBack();
    } catch (e) { showToast(e.message || "Settlement failed (admin only)", "err"); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    setBusy(true);
    try {
      await resetMatch(match.n);
      showToast(`Reset ${match.home} v ${match.away} — picks reopened`);
      onBack();
    } catch (e) { showToast(e.message || "Reset failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  const Toggle = ({ k, lbl }) => (
    <button onClick={() => setR({ ...r, [k]: !r[k] })}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r[k] ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-400"}`}>{lbl}: {r[k] ? "Yes" : "No"}</button>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-emerald-300"><ChevronLeft className="h-4 w-4" /> All matches</button>
      <h3 className="mb-4 font-display text-2xl">{et.hf} {et.home} v {et.away} {et.af}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreRow label="Half-Time Score" h={r.ht.h} a={r.ht.a} setH={(v) => setR({ ...r, ht: { ...r.ht, h: num(v) } })} setA={(v) => setR({ ...r, ht: { ...r.ht, a: num(v) } })} home={et.home} away={et.away} />
        <ScoreRow label="Full-Time Score" h={r.ft.h} a={r.ft.a} setH={(v) => setR({ ...r, ft: { ...r.ft, h: num(v) } })} setA={(v) => setR({ ...r, ft: { ...r.ft, a: num(v) } })} home={et.home} away={et.away} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AdminField label="First Goal Minute (0 = no goal)">
          <input type="number" value={r.firstGoalMinute} onChange={(e) => setR({ ...r, firstGoalMinute: num(e.target.value) })} className={ipt} />
        </AdminField>
        <AdminField label="First Goal Method">
          <select value={r.firstGoalMethod} onChange={(e) => setR({ ...r, firstGoalMethod: e.target.value })} className={ipt}>
            <option value="rf">Right Foot</option><option value="lf">Left Foot</option><option value="head">Header</option><option value="og">Own Goal</option>
          </select>
          {(r.ft.h + r.ft.a) === 0 && <p className="mt-1 text-[10px] text-amber-300/80">Full-Time is 0–0 — Method &amp; Time of First Goal picks all lose automatically (no goal). This field is ignored.</p>}
        </AdminField>
        <AdminField label="Total Cards (Y+R)">
          <input type="number" value={r.totalCards} onChange={(e) => setR({ ...r, totalCards: num(e.target.value) })} className={ipt} />
        </AdminField>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AdminField label="First Goal Scorer">
          <select value={r.firstScorer} onChange={(e) => setR({ ...r, firstScorer: e.target.value })} className={ipt}>
            <option value="">— none / no goal —</option>
            <optgroup label={et.home}>{squadHome.map((n) => <option key={n} value={n}>{n}</option>)}</optgroup>
            <optgroup label={et.away}>{squadAway.map((n) => <option key={n} value={n}>{n}</option>)}</optgroup>
            <option value="__other__">Other (type a name)…</option>
          </select>
          {r.firstScorer === "__other__" && (
            <input value={r.firstOther || ""} onChange={(e) => setR({ ...r, firstOther: e.target.value })}
              placeholder="Type the first scorer's name" className={`${ipt} mt-2`} />
          )}
        </AdminField>
        <AdminField label="Add Anytime Goal Scorers">
          <select value="" onChange={(e) => { if (e.target.value) { addAnytime(e.target.value); e.target.value = ""; } }} className={ipt}>
            <option value="">Pick a player to add…</option>
            <optgroup label={et.home}>{squadHome.map((n) => <option key={n} value={n}>{n}</option>)}</optgroup>
            <optgroup label={et.away}>{squadAway.map((n) => <option key={n} value={n}>{n}</option>)}</optgroup>
          </select>
          <div className="mt-2 flex gap-2">
            <input value={anytimeText} onChange={(e) => setAnytimeText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { addAnytime(anytimeText); setAnytimeText(""); } }}
              placeholder="…or type another name" className={ipt} />
            <button type="button" onClick={() => { addAnytime(anytimeText); setAnytimeText(""); }}
              className="shrink-0 rounded-xl bg-emerald-400/90 px-3 text-sm font-bold text-black">Add</button>
          </div>
        </AdminField>
      </div>
      <div className="mt-2 rounded-xl bg-black/20 p-3">
        <div className="mb-1.5 text-[11px] text-stone-400">Goal scorers <span className="text-stone-600">(the First Scorer is added automatically and leads the list)</span></div>
        <div className="flex flex-wrap gap-2">
          {(() => {
            const first = (r.firstScorer === "__other__" ? r.firstOther : r.firstScorer || "").trim();
            const list = first ? [first, ...(r.anytime || []).filter((n) => n !== first)] : (r.anytime || []);
            if (!list.length) return <span className="text-xs text-stone-600">No scorers yet.</span>;
            return list.map((n, i) => (
              <span key={n + i} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${i === 0 && first ? "bg-amber-400/90 text-black" : "bg-white/10 text-stone-200"}`}>
                {i === 0 && first && <span className="text-[9px] uppercase">1st</span>}{n}
                {n !== first && <button type="button" onClick={() => removeAnytime(n)} className="text-stone-500 hover:text-rose-300"><X className="h-3 w-3" /></button>}
              </span>
            ));
          })()}
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-black/20 p-3">
        <div className="mb-2 text-xs font-semibold text-stone-400">Per-team outcomes <span className="text-stone-600">(clean sheet is auto-detected from the score)</span></div>
        <div className="mb-2"><div className="mb-1 text-[11px] text-emerald-300/80">{match.home}</div>
          <div className="flex flex-wrap gap-2"><Toggle k="wfbH" lbl="Win From Behind" /><Toggle k="bhH" lbl="Both Halves" /><Toggle k="ownGoalH" lbl="Own Goal" /></div></div>
        <div><div className="mb-1 text-[11px] text-amber-300/80">{match.away}</div>
          <div className="flex flex-wrap gap-2"><Toggle k="wfbA" lbl="Win From Behind" /><Toggle k="bhA" lbl="Both Halves" /><Toggle k="ownGoalA" lbl="Own Goal" /></div></div>
      </div>

      {customSpecials.length > 0 && (
        <div className="mt-3 rounded-xl bg-black/20 p-3">
          <div className="mb-2 text-xs font-semibold text-stone-400">Custom specials — mark each result</div>
          <div className="flex flex-wrap gap-2">
            {customSpecials.map((s) => {
              const on = !!r.customSpecials?.[s.id];
              return (
                <button key={s.id} onClick={() => toggleSpecial(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-400"}`}>
                  {s.label}: {on ? "Yes" : "No"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {prev && (
        <div className="mt-4 rounded-xl border border-sky-400/30 bg-sky-500/10 p-3 text-[11px] text-sky-200">
          Already settled {prev.ft.h}–{prev.ft.a}. Re-settling recalculates every affected pick from your new entries; Reset reopens them.
        </div>
      )}

      {!confirm ? (
        <div className="mt-5 space-y-2">
          <button onClick={() => setConfirm("settle")} disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black disabled:opacity-50">
            {prev ? "Review & Re-settle" : "Review & Settle"}
          </button>
          {prev && (
            <button onClick={() => setConfirm("reset")} disabled={busy} className="w-full rounded-xl bg-rose-500/15 py-3 font-bold text-rose-200 hover:bg-rose-500/25 disabled:opacity-50">
              Reset / Unsettle this match
            </button>
          )}
        </div>
      ) : confirm === "settle" ? (
        <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4">
          <div className="mb-1 font-bold text-amber-100">Confirm settlement</div>
          <div className="space-y-0.5 text-sm text-stone-200">
            <div>Full-time: <b>{match.home} {r.ft.h}–{r.ft.a} {match.away}</b> · HT {r.ht.h}–{r.ht.a}</div>
            <div>First goal: {r.firstGoalMinute === 0 ? "no goal" : `${r.firstGoalMinute}' (${r.firstGoalMethod})`} · Cards {r.totalCards}</div>
            <div className="text-[12px] text-stone-400">This will pay out / decide <b>{affected.length}</b> pick slip{affected.length === 1 ? "" : "s"} across <b>{affectedPlayers}</b> player{affectedPlayers === 1 ? "" : "s"}.</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={settle} disabled={busy} className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-2.5 font-bold text-black disabled:opacity-50">{busy ? "Settling…" : "Confirm & Pay Out"}</button>
            <button onClick={() => setConfirm(false)} disabled={busy} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-300">Back</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4">
          <div className="mb-1 font-bold text-rose-100">Reset this match?</div>
          <div className="text-sm text-stone-200">This removes the result and reopens <b>{affected.length}</b> pick slip{affected.length === 1 ? "" : "s"} (won/lost are reverted to open, payouts undone). You can settle again afterwards.</div>
          <div className="mt-3 flex gap-2">
            <button onClick={reset} disabled={busy} className="flex-1 rounded-xl bg-rose-500 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "Resetting…" : "Confirm Reset"}</button>
            <button onClick={() => setConfirm(false)} disabled={busy} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-300">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Manage odds & players (admin) ---------- */
/* ---------- Admin: one-screen 1X2 + Live for every match ---------- */
/* ---------- gameweek selector (admin screens) ---------- */
// A season lists 380 fixtures, so every admin screen that walks the fixture
// list is scoped to one gameweek at a time. "All" is still available but is
// never the default.
function GwBar({ gw, setGw, counts = {} }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="shrink-0 text-xs font-semibold text-stone-400">Gameweek</span>
      <select value={gw} onChange={(e) => setGw(e.target.value === "all" ? "all" : +e.target.value)}
        className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm font-semibold text-white outline-none focus:border-emerald-400/60">
        {GWS.map((g) => (
          <option key={g} value={g}>GW {g}{counts[g] ? ` · ${counts[g]} live` : ""}</option>
        ))}
        <option value="all">All 38 gameweeks</option>
      </select>
      <div className="flex gap-1">
        <button onClick={() => setGw(Math.max(GWS[0], (gw === "all" ? GWS[0] : gw) - 1))}
          className="rounded-lg bg-white/5 px-2 py-1.5 text-xs text-stone-300 hover:bg-white/10">Prev</button>
        <button onClick={() => setGw(Math.min(GWS[GWS.length - 1], (gw === "all" ? GWS[0] : gw) + 1))}
          className="rounded-lg bg-white/5 px-2 py-1.5 text-xs text-stone-300 hover:bg-white/10">Next</button>
      </div>
    </div>
  );
}

const QO_DEF = { h: "2/1", d: "9/4", a: "5/2" }; // built-in Match Result defaults
function QuickOdds({ configs, results, saveConfigMany, showToast, onClose, onOpenFull }) {
  const eff = (n) => {
    const o = configs?.[n]?.odds?.match_result || {};
    return { h: o.h || QO_DEF.h, d: o.d || QO_DEF.d, a: o.a || QO_DEF.a, live: !!configs?.[n]?.live };
  };
  const seed = useMemo(() => Object.fromEntries(FIXTURES.map((m) => [m.n, eff(m.n)])), []); // once
  const [rows, setRows] = useState(seed);
  const [saved, setSaved] = useState(seed); // last-saved snapshot
  const [q, setQ] = useState("");
  const [gw, setGw] = useState(() => currentGw());
  const [busy, setBusy] = useState(false);

  // The fixtures currently in scope. Publishing acts on these only, so
  // "Set all live" can never publish the whole season by accident.
  const scoped = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (ql) return FIXTURES.filter((m) => (m.home + m.away).toLowerCase().includes(ql));
    return gw === "all" ? FIXTURES : FIXTURES.filter((m) => m.gw === gw);
  }, [q, gw]);

  const liveByGw = useMemo(() => {
    const c = {};
    FIXTURES.forEach((m) => { if (configs?.[m.n]?.live && !results[m.n]) c[m.gw] = (c[m.gw] || 0) + 1; });
    return c;
  }, [configs, results]);

  const set = (n, field, val) => setRows((r) => ({ ...r, [n]: { ...r[n], [field]: val } }));
  const changed = (n) => {
    const a = saved[n], b = rows[n];
    return a.h !== b.h || a.d !== b.d || a.a !== b.a || a.live !== b.live;
  };
  const changedMatches = FIXTURES.filter((m) => changed(m.n));
  const liveCount = FIXTURES.filter((m) => rows[m.n].live && !results[m.n]).length;

  // Scoped deliberately: applies to the selected gameweek, not the season.
  const setAllLive = (val) => setRows((r) => {
    const next = { ...r };
    scoped.forEach((m) => { if (!results[m.n]) next[m.n] = { ...next[m.n], live: val }; });
    return next;
  });

  const saveAll = async () => {
    if (!changedMatches.length) return;
    setBusy(true);
    try {
      const payload = changedMatches.map((m) => {
        const c = rows[m.n];
        const base = configs?.[m.n] || {};
        return {
          matchNo: m.n,
          config: {
            ...base,
            odds: { ...(base.odds || {}), match_result: { h: c.h || QO_DEF.h, d: c.d || QO_DEF.d, a: c.a || QO_DEF.a } },
            live: c.live,
          },
        };
      });
      await saveConfigMany(payload);
      setSaved(JSON.parse(JSON.stringify(rows)));
      showToast(`Saved ${payload.length} match${payload.length === 1 ? "" : "es"}`);
    } catch (e) { showToast(e.message || "Save failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  // scoped = selected gameweek (or the whole season when searching)
  const list = scoped;
  const grouped = {};
  list.forEach((m) => { (grouped[m.date] ||= []).push(m); });

  return (
    <div>
      <button onClick={onClose} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-emerald-300">
        <ChevronLeft className="h-4 w-4" /> Back to per-match editor
      </button>

      <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[12px] text-stone-300">
        Set <b>Home / Draw / Away</b> odds (e.g. <span className="text-emerald-300">2/1</span>) and flip each match <b>Live</b> for players. The other 10 markets use their built-in defaults automatically — you only need to touch these. Nothing is saved until you tap <b>Save changes</b>. Publishing applies to the selected gameweek only.
      </div>

      <GwBar gw={gw} setGw={setGw} counts={liveByGw} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setAllLive(true)} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30">
          Go live: {gw === "all" ? "whole season" : `GW ${gw}`} ({scoped.length})
        </button>
        <button onClick={() => setAllLive(false)} className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-white/10">
          {gw === "all" ? "Season" : `GW ${gw}`} to draft
        </button>
        <span className="ml-auto rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-stone-300">{liveCount} live · {changedMatches.length} unsaved</span>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a team…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-stone-600 focus:border-emerald-400/50" />
      </div>

      <div className="space-y-4 pb-24">
        {Object.entries(grouped).map(([date, ms]) => (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-400/70">
              <span className="h-px flex-1 bg-white/5" />{date}<span className="h-px flex-1 bg-white/5" />
            </div>
            <div className="space-y-2">
              {ms.map((m) => {
                const c = rows[m.n];
                const settled = results[m.n];
                const isCh = changed(m.n);
                return (
                  <div key={m.n} className={`rounded-xl border p-2.5 ${isCh ? "border-amber-400/60 bg-amber-400/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <button onClick={() => onOpenFull(m)} className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                          <Clock className="h-3 w-3" /> {m.day} · {m.time}
                          {settled && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">SETTLED {settled.ft.h}–{settled.ft.a}</span>}
                          {isCh && !settled && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-semibold text-amber-300">unsaved</span>}
                        </div>
                        <div className="truncate text-sm font-semibold">
                          {effTeams(m, configs?.[m.n]).hf} {effTeams(m, configs?.[m.n]).home} <span className="text-stone-600">v</span> {effTeams(m, configs?.[m.n]).af} {effTeams(m, configs?.[m.n]).away}
                        </div>
                      </button>
                      <button onClick={() => set(m.n, "live", !c.live)} disabled={!!settled}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${c.live ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-400"}`}>
                        {c.live ? "Live" : "Draft"}
                      </button>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <QOCell label="Home" v={c.h} onChange={(x) => set(m.n, "h", x)} disabled={!!settled} />
                      <QOCell label="Draw" v={c.d} onChange={(x) => set(m.n, "d", x)} disabled={!!settled} />
                      <QOCell label="Away" v={c.a} onChange={(x) => set(m.n, "a", x)} disabled={!!settled} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No matches match “{q}”.</p>}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-5xl px-4">
        <button onClick={saveAll} disabled={busy || !changedMatches.length}
          className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black shadow-2xl disabled:opacity-40">
          {busy ? "Saving…" : changedMatches.length ? `Save changes (${changedMatches.length})` : "No unsaved changes"}
        </button>
      </div>
    </div>
  );
}
function QOCell({ label, v, onChange, disabled }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      <input value={v} onChange={(e) => onChange(e.target.value)} placeholder="2/1" disabled={disabled} inputMode="text"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-center text-sm font-semibold tabular-nums outline-none focus:border-emerald-400/50 disabled:opacity-40" />
    </label>
  );
}

function ManageForm({ match, config, onBack, saveConfig, showToast }) {
  const [teams, setTeams] = useState(() => ({
    home: config?.teams?.home || match.home, away: config?.teams?.away || match.away,
    hf: config?.teams?.hf || match.hf, af: config?.teams?.af || match.af,
  }));
  const M = { ...match, ...teams };
  const seedPlayers = (side, team) =>
    (config?.players?.[side]?.length ? config.players[side] : defaultPlayers(team, side)).map((p) => ({ ...p }));
  const [home, setHome] = useState(() => seedPlayers("home", teams.home));
  const [away, setAway] = useState(() => seedPlayers("away", teams.away));
  const changeTeam = (side, name) => {
    const key = teamKeyFor(name);
    const flag = TEAM_FLAGS[name] || (key ? TEAM_FLAGS[key] : "") || (side === "home" ? teams.hf : teams.af);
    setTeams((t) => ({ ...t, [side]: name, [side === "home" ? "hf" : "af"]: flag }));
    if (key) { side === "home" ? setHome(defaultPlayers(name, "home")) : setAway(defaultPlayers(name, "away")); }
  };
  const [odds, setOdds] = useState(() => JSON.parse(JSON.stringify(config?.odds || {})));
  const [specials, setSpecials] = useState(() => (config?.specials || []).map((s) => ({ ...s })));
  const [addLines, setAddLines] = useState(() => JSON.parse(JSON.stringify(config?.addLines || {})));
  const [off, setOff] = useState(() => [...(config?.off || [])]); // removed default option ids
  const [live, setLive] = useState(!!config?.live);
  const [busy, setBusy] = useState(false);
  const offSet = useMemo(() => new Set(off), [off]);
  const toggleOff = (id) => setOff((o) => o.includes(id) ? o.filter((x) => x !== id) : [...o, id]);

  // full market map (unfiltered by "off", so the editor can show & restore removed lines)
  const byKey = useMemo(() => Object.fromEntries(buildMarkets(M, { players: { home, away }, odds, specials, addLines }).map((mk) => [mk.key, mk])), [match, teams, home, away, odds, specials, addLines]);

  const addLine = (key, label, meta, oddsStr) => {
    const sig = (m) => key === "total_goals" ? JSON.stringify(m.tg) : key === "total_cards" ? JSON.stringify(m.c) : (m.ht || m.ft);
    const mkt = buildMarkets(M, { players: { home, away }, odds, specials, addLines }).find((x) => x.key === key);
    const existing = new Set((mkt?.selections || [])
      .map((s) => key === "total_goals" ? JSON.stringify(s.meta?.tg) : key === "total_cards" ? JSON.stringify(s.meta?.c) : (s.meta?.ht || s.meta?.ft))
      .filter((x) => x && x !== "__OTHER__"));
    if (existing.has(sig(meta))) { showToast(`“${label}” is already in this market`, "err"); return; }
    setAddLines((a) => ({ ...a, [key]: [...(a[key] || []), { id: `${key}_x_${uid()}`, label, meta, oddsStr: oddsStr || "10/1" }] }));
  };
  const [preview, setPreview] = useState(false);
  const [scOpen, setScOpen] = useState(false); // Goal Scorers section collapsed by default
  const previewMarkets = useMemo(() => buildMarkets(M, { players: { home, away }, odds, specials, addLines, off }), [match, teams, home, away, odds, specials, addLines, off]);
  const delLine = (key, id) => setAddLines((a) => ({ ...a, [key]: (a[key] || []).filter((x) => x.id !== id) }));

  const setPlayer = (side, i, field, val) => {
    const list = side === "home" ? [...home] : [...away];
    list[i] = { ...list[i], [field]: val };
    side === "home" ? setHome(list) : setAway(list);
  };
  const addPlayer = (side) => {
    const row = { name: "", pos: "", first: "10/1", any: "4/1" };
    side === "home" ? setHome([...home, row]) : setAway([...away, row]);
  };
  const delPlayer = (side, i) => {
    side === "home" ? setHome(home.filter((_, j) => j !== i)) : setAway(away.filter((_, j) => j !== i));
  };
  const setOdd = (key, id, val) => setOdds((o) => ({ ...o, [key]: { ...(o[key] || {}), [id]: val } }));

  const addSpecial = () => setSpecials((s) => [...s, { id: "sp_" + uid(), label: "", odds: "2/1" }]);
  const setSpecial = (i, field, val) => setSpecials((s) => s.map((x, j) => j === i ? { ...x, [field]: val } : x));
  const delSpecial = (i) => setSpecials((s) => s.filter((_, j) => j !== i));

  const cleanCfg = (liveVal) => {
    const clean = (arr) => arr.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), pos: p.pos || "", first: p.first || "10/1", any: p.any || "4/1" }));
    const cleanSp = specials.filter((s) => (s.label || "").trim()).map((s) => ({ id: s.id, label: s.label.trim(), odds: s.odds || "2/1" }));
    const teamsChanged = teams.home !== match.home || teams.away !== match.away || teams.hf !== match.hf || teams.af !== match.af;
    return { players: { home: clean(home), away: clean(away) }, odds, specials: cleanSp, addLines, off, live: liveVal, ...(teamsChanged ? { teams: { ...teams } } : {}) };
  };
  // block saving when a player or special is listed more than once
  const dupError = () => {
    const dn = (arr, team) => {
      const seen = new Set();
      for (const p of arr) { const n = (p.name || "").trim().toLowerCase(); if (!n) continue; if (seen.has(n)) return `${p.name.trim()} is listed twice for ${team} — remove the duplicate`; seen.add(n); }
      return null;
    };
    const e1 = dn(home, teams.home); if (e1) return e1;
    const e2 = dn(away, teams.away); if (e2) return e2;
    const sp = new Set();
    for (const s of specials) { const l = (s.label || "").trim().toLowerCase(); if (!l) continue; if (sp.has(l)) return `Match Special “${s.label.trim()}” is added twice — remove the duplicate`; sp.add(l); }
    return null;
  };
  const save = async () => {
    const de = dupError(); if (de) { showToast(de, "err"); return; }
    setBusy(true);
    try {
      await saveConfig(match.n, cleanCfg(live));
      showToast(live ? "Saved — live for players" : "Saved (not yet live)");
      onBack();
    } catch (e) { showToast(e.message || "Save failed (admin only)", "err"); }
    finally { setBusy(false); }
  };
  const toggleLive = async () => {
    const de = dupError(); if (de) { showToast(de, "err"); return; }
    const next = !live;
    setBusy(true);
    try {
      await saveConfig(match.n, cleanCfg(next));
      setLive(next);
      showToast(next ? "Match is now LIVE for players" : "Match taken offline — hidden from players");
    } catch (e) { showToast(e.message || "Failed (admin only)", "err"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-emerald-300"><ChevronLeft className="h-4 w-4" /> All matches</button>
      <h3 className="mb-1 font-display text-2xl">{teams.hf} {teams.home} v {teams.away} {teams.af}</h3>
      <p className="mb-3 text-xs text-stone-500">Add the real squad names and set odds. Scorer odds (first / anytime) are set per player below.</p>

      <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-200"><Flag className="h-3.5 w-3.5" /> Teams{match.ko ? ` · ${match.ko}` : ""}</div>
        <datalist id={`teams-${match.n}`}>{TEAM_NAMES.map((t) => <option key={t} value={t} />)}</datalist>
        {[["home", "Home"], ["away", "Away"]].map(([side, lbl]) => (
          <div key={side} className="mb-2 flex items-center gap-2">
            <span className="w-12 shrink-0 text-[11px] text-stone-400">{lbl}</span>
            <span className="w-7 shrink-0 text-center text-lg">{side === "home" ? teams.hf : teams.af}</span>
            <input list={`teams-${match.n}`} value={teams[side]} onChange={(e) => changeTeam(side, e.target.value)}
              placeholder="Type or pick a team" className={ipt} />
          </div>
        ))}
        <p className="mt-1 text-[10px] text-stone-500">Pick the two teams — the flag fills in automatically and the scorer board below reloads from that team's squad. Leave as-is for group-stage matches.</p>
      </div>

      <div className={`mb-4 flex items-center justify-between rounded-xl border p-3 ${live ? "border-emerald-400/40 bg-emerald-500/10" : "border-amber-400/30 bg-amber-500/10"}`}>
        <div className="text-sm">
          <div className="font-bold">{live ? "🟢 Live — visible to players" : "🟡 Not live — hidden from players"}</div>
          <div className="text-[11px] text-stone-400">{live ? "Players can see this match and place picks." : "Set odds, then publish so players can see it."}</div>
        </div>
        <button onClick={toggleLive} disabled={busy}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50 ${live ? "bg-white/10 text-rose-300" : "bg-gradient-to-r from-amber-400 to-emerald-400 text-black"}`}>
          {busy ? "…" : live ? "Take Offline" : "Go Live"}
        </button>
      </div>

      {/* Markets & odds — in serial order */}
      <div className="mt-1 mb-2 text-sm font-bold">Markets &amp; odds</div>
      <div className="space-y-2">
        <OddsMarket mk={byKey.match_result} odds={odds} setOdd={setOdd} />
        <MatchSpecialEditor mk={byKey.specials} odds={odds} setOdd={setOdd} offSet={offSet} toggleOff={toggleOff}
          specials={specials} addSpecial={addSpecial} setSpecial={setSpecial} delSpecial={delSpecial} />
        <OddsMarket mk={byKey.ht_score} odds={odds} setOdd={setOdd}
          extra={<ScoreLineAdder label="Half-Time score" H={teams.home} A={teams.away} field="ht" mkey="ht_score" lines={addLines.ht_score} onAdd={addLine} onDel={delLine} />} />
        <OddsMarket mk={byKey.ft_score} odds={odds} setOdd={setOdd}
          extra={<ScoreLineAdder label="Full-Time score" H={teams.home} A={teams.away} field="ft" mkey="ft_score" lines={addLines.ft_score} onAdd={addLine} onDel={delLine} />} />
        <OddsMarket mk={byKey.total_goals} odds={odds} setOdd={setOdd} offSet={offSet} onToggleOff={toggleOff}
          extra={<GoalsLineAdder lines={addLines.total_goals} onAdd={addLine} onDel={delLine} />} />
        <OddsMarket mk={byKey.first_goal_time} odds={odds} setOdd={setOdd} />
        <OddsMarket mk={byKey.first_goal_method} odds={odds} setOdd={setOdd} />
        <OddsMarket mk={byKey.total_cards} odds={odds} setOdd={setOdd} offSet={offSet} onToggleOff={toggleOff}
          extra={<CardsLineAdder lines={addLines.total_cards} onAdd={addLine} onDel={delLine} />} />
        <OddsMarket mk={byKey.own_goal} odds={odds} setOdd={setOdd} />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <button onClick={() => setScOpen((v) => !v)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold">
          <span>⚽ Goal Scorers</span>
          <ChevronRight className={`h-4 w-4 text-stone-500 transition ${scOpen ? "rotate-90" : ""}`} />
        </button>
        {scOpen && (
        <div className="border-t border-white/5 p-3">
        <p className="mb-2 text-[11px] text-stone-500">Add the squad names and set First / Anytime odds per player. The “Other Player” catch-all covers anyone not listed.</p>
      {[["home", teams.home, home], ["away", teams.away, away]].map(([side, team, list]) => {
        const squad = squadFor(team) || [];
        return (
        <div key={side} className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold">{team} — Players</span>
            <button onClick={() => addPlayer(side)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300"><Plus className="h-3 w-3" /> Add</button>
          </div>
          <div className="mb-1 grid grid-cols-[1fr_52px_52px_52px_24px] gap-2 px-1 text-[10px] uppercase tracking-wide text-stone-500">
            <span>Player (pick or type)</span><span>Pos</span><span>1st</span><span>Any</span><span></span>
          </div>
          <div className="space-y-1.5">
            {list.map((p, i) => {
              const custom = !squad.includes(p.name);
              return (
              <div key={i} className="grid grid-cols-[1fr_52px_52px_52px_24px] items-start gap-2">
                <div>
                  <select value={custom ? "__CUSTOM__" : p.name}
                    onChange={(e) => setPlayer(side, i, "name", e.target.value === "__CUSTOM__" ? "" : e.target.value)}
                    className={ipt}>
                    <option value="">— select —</option>
                    {squad.map((n) => <option key={n} value={n}>{n}</option>)}
                    <option value="__CUSTOM__">✏️ Custom name…</option>
                  </select>
                  {custom && <input value={p.name} onChange={(e) => setPlayer(side, i, "name", e.target.value)} placeholder="Type player name" className={ipt + " mt-1"} />}
                </div>
                <select value={p.pos || POS_BY_NAME[(p.name || "").trim().toLowerCase()] || ""} onChange={(e) => setPlayer(side, i, "pos", e.target.value)} className={ipt + " px-1 text-center"}>
                  <option value="">—</option><option value="GK">GK</option><option value="DF">DF</option><option value="MD">MD</option><option value="FWD">FWD</option>
                </select>
                <input value={p.first} onChange={(e) => setPlayer(side, i, "first", e.target.value)} placeholder="5/1" className={ipt + " text-center"} />
                <input value={p.any} onChange={(e) => setPlayer(side, i, "any", e.target.value)} placeholder="2/1" className={ipt + " text-center"} />
                <button onClick={() => delPlayer(side, i)} className="flex h-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300"><X className="h-3.5 w-3.5" /></button>
              </div>
            );})}
            {list.length === 0 && <p className="py-2 text-center text-xs text-stone-600">No players yet — tap Add.</p>}
          </div>
        </div>
      );})}

      <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
        <div className="mb-1 text-sm font-bold">⚽ “Other Player” odds (catch-all)</div>
        <p className="mb-2 text-[11px] text-stone-400">Applies when a scorer isn't listed above — shown to players as the “Other Player” option in First &amp; Anytime Scorer.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-[11px] text-stone-500">First Scorer — Other</span>
            <input value={odds.first_scorer?.fo ?? "12/1"} onChange={(e) => setOdd("first_scorer", "fo", e.target.value)} className={ipt + " text-center"} /></label>
          <label className="block"><span className="mb-1 block text-[11px] text-stone-500">Anytime Scorer — Other</span>
            <input value={odds.anytime_scorer?.ao ?? "8/1"} onChange={(e) => setOdd("anytime_scorer", "ao", e.target.value)} className={ipt + " text-center"} /></label>
        </div>
      </div>
        </div>
        )}
      </div>

      <button onClick={() => setPreview((p) => !p)}
        className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-semibold text-emerald-300 hover:bg-white/[0.06]">
        {preview ? "Hide preview" : "👁  Preview what players will see"}
      </button>
      {preview && (
        <div className="mt-2 space-y-2.5 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] text-stone-400">Exactly what players see for this match with the current settings — review before saving.</p>
          {previewMarkets.map((mk) => (
            <div key={mk.key}>
              <div className="mb-1 text-xs font-bold text-stone-300">{mk.icon} {mk.title}</div>
              <div className="flex flex-wrap gap-1.5">
                {mk.selections.map((s) => (
                  <span key={s.id} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-stone-300">
                    {s.label} <span className="font-bold text-emerald-300">{s.oddsStr}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={save} disabled={busy} className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-3 font-bold text-black disabled:opacity-50">
        {busy ? "Saving…" : "Save Odds & Players"}
      </button>
    </div>
  );
}

// Outright winner-market editor: edit odds + add / delete teams & players (catch-all stays)
function OutrightWinnerEditor({ mk, odds, setOdd, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");     // chosen player/team
  const [finA, setFinA] = useState("");      // finalists: team A
  const [finB, setFinB] = useState("");      // finalists: team B
  const [od, setOd] = useState("");
  const named = mk.selections.filter((s) => !s.meta?.other);
  const other = mk.selections.find((s) => s.meta?.other);

  const isPlayer = ["og_boot", "og_ball", "og_gloves", "og_emerging"].includes(mk.key);
  const isTeam = mk.key === "og_champion" || mk.key === "og_runnerup";
  const isFinal = mk.key === "og_finalists";
  const teams = useMemo(() => Object.keys(SQUADS).sort(), []);
  const taken = useMemo(() => new Set(named.map((s) => s.label.trim().toLowerCase())), [named]);
  const teamOptions = teams.filter((t) => !taken.has(t.toLowerCase()));
  const playerGroups = useMemo(() => teams.map((t) => ({ team: t, players: (SQUADS[t] || []).filter((p) => !taken.has(p.toLowerCase())) })).filter((g) => g.players.length), [teams, taken]);

  const add = () => {
    let label = "";
    if (isFinal) { if (!finA || !finB || finA === finB) return; label = `${finA} - ${finB}`; }
    else { if (!name) return; label = name; }
    onAdd(mk.key, label, (od || "").trim() || "50/1");
    setName(""); setFinA(""); setFinB(""); setOd("");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold">
        <span>{mk.icon} {mk.title} <span className="ml-1 text-[10px] font-normal text-stone-500">({named.length})</span></span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-white/5 p-3">
          {named.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              <span className="min-w-0 flex-1 text-stone-300">{s.label}</span>
              <input value={odds[mk.key]?.[s.id] ?? s.oddsStr} onChange={(e) => setOdd(mk.key, s.id, e.target.value)}
                className="w-20 shrink-0 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-emerald-300 outline-none focus:border-amber-400/60" />
              <button onClick={() => onDelete(mk.key, s.id)} title="Remove"
                className="shrink-0 rounded-md bg-white/5 p-1.5 text-stone-400 hover:bg-rose-500/20 hover:text-rose-300"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {other && (
            <div className="flex items-center gap-2 text-xs">
              <span className="min-w-0 flex-1 text-stone-400">{other.label} <span className="text-[10px] text-stone-600">(catch-all — kept)</span></span>
              <input value={odds[mk.key]?.[other.id] ?? other.oddsStr} onChange={(e) => setOdd(mk.key, other.id, e.target.value)}
                className="w-20 shrink-0 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-emerald-300 outline-none focus:border-amber-400/60" />
              <span className="w-7 shrink-0" />
            </div>
          )}

          <div className="border-t border-white/5 pt-2">
            <div className="mb-1.5 text-[10px] uppercase tracking-wide text-stone-500">Add {isTeam ? "a team" : isFinal ? "a finalist pairing" : "a player"}</div>
            {isFinal ? (
              <div className="flex flex-wrap items-center gap-2">
                <select value={finA} onChange={(e) => setFinA(e.target.value)} className={ogSelCls}>
                  <option value="">Team A…</option>
                  {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-stone-500">vs</span>
                <select value={finB} onChange={(e) => setFinB(e.target.value)} className={ogSelCls}>
                  <option value="">Team B…</option>
                  {teams.filter((t) => t !== finA).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={od} onChange={(e) => setOd(e.target.value)} placeholder="50/1"
                  className="w-16 shrink-0 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-xs text-emerald-300 outline-none focus:border-emerald-400/50" />
                <button onClick={add} className="shrink-0 rounded-md bg-emerald-400/90 px-3 py-1.5 text-xs font-bold text-black">Add</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select value={name} onChange={(e) => setName(e.target.value)} className={`min-w-0 flex-1 ${ogSelCls}`}>
                  <option value="">{isTeam ? "Choose a team…" : "Choose a player…"}</option>
                  {isTeam
                    ? teamOptions.map((t) => <option key={t} value={t}>{t}</option>)
                    : playerGroups.map((g) => (
                        <optgroup key={g.team} label={g.team}>
                          {g.players.map((p) => <option key={p} value={p}>{p}</option>)}
                        </optgroup>
                      ))}
                </select>
                <input value={od} onChange={(e) => setOd(e.target.value)} placeholder="50/1"
                  className="w-16 shrink-0 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-xs text-emerald-300 outline-none focus:border-emerald-400/50" />
                <button onClick={add} className="shrink-0 rounded-md bg-emerald-400/90 px-3 py-1.5 text-xs font-bold text-black">Add</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
const ogSelCls = "rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-400/60";

// add custom HT/FT correct-score lines (home & away goals). meta.{ht|ft}="h-a" → graded by the engine.
function ScoreLineAdder({ label, H, A, field, mkey, lines = [], onAdd, onDel }) {
  const [h, setH] = useState(""); const [a, setA] = useState(""); const [od, setOd] = useState("");
  const add = () => {
    const hh = parseInt(h), aa = parseInt(a);
    if (isNaN(hh) || isNaN(aa)) return;
    onAdd(mkey, `${H} ${hh}-${aa} ${A}`, { [field]: `${hh}-${aa}` }, (od || "").trim() || "20/1");
    setH(""); setA(""); setOd("");
  };
  return (
    <div className="mb-2 rounded-lg border border-white/10 bg-black/20 p-2.5">
      <div className="mb-1.5 text-xs font-semibold text-stone-300">{label}</div>
      {lines.map((l) => (
        <div key={l.id} className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="min-w-0 flex-1 text-stone-300">{l.label} <span className="text-stone-500">@ {l.oddsStr}</span></span>
          <button onClick={() => onDel(mkey, l.id)} className="shrink-0 rounded-md bg-white/5 p-1 text-stone-400 hover:text-rose-300"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <input value={h} onChange={(e) => setH(e.target.value)} type="number" placeholder={H.slice(0, 3)} className={ipt + " w-14 text-center"} />
        <span className="text-stone-500">-</span>
        <input value={a} onChange={(e) => setA(e.target.value)} type="number" placeholder={A.slice(0, 3)} className={ipt + " w-14 text-center"} />
        <input value={od} onChange={(e) => setOd(e.target.value)} placeholder="20/1" className={ipt + " w-16 text-center"} />
        <button onClick={add} className="shrink-0 rounded-md bg-emerald-400/90 px-2.5 py-1.5 text-xs font-bold text-black">Add</button>
      </div>
    </div>
  );
}

// add custom Total Goals lines (Exactly / Over / Under N). meta.tg → graded by the engine.
function GoalsLineAdder({ lines = [], onAdd, onDel }) {
  const [kind, setKind] = useState("eq"); const [n, setN] = useState(""); const [od, setOd] = useState("");
  const add = () => {
    const num = parseFloat(n); if (isNaN(num)) return;
    const meta = { tg: kind === "eq" ? { eq: num } : kind === "gt" ? { gt: num } : { lt: num } };
    const label = kind === "eq" ? `Exactly ${num}` : kind === "gt" ? `Over ${num}` : `Under ${num}`;
    onAdd("total_goals", label, meta, (od || "").trim() || "10/1");
    setN(""); setOd("");
  };
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
      <div className="mb-1.5 text-xs font-semibold text-stone-300">Total Goals</div>
      {lines.map((l) => (
        <div key={l.id} className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="min-w-0 flex-1 text-stone-300">{l.label} <span className="text-stone-500">@ {l.oddsStr}</span></span>
          <button onClick={() => onDel("total_goals", l.id)} className="shrink-0 rounded-md bg-white/5 p-1 text-stone-400 hover:text-rose-300"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={ipt + " w-24"}>
          <option value="eq">Exactly</option><option value="gt">Over</option><option value="lt">Under</option>
        </select>
        <input value={n} onChange={(e) => setN(e.target.value)} type="number" step="0.5" placeholder={kind === "eq" ? "5" : "3.5"} className={ipt + " w-16 text-center"} />
        <input value={od} onChange={(e) => setOd(e.target.value)} placeholder="10/1" className={ipt + " w-16 text-center"} />
        <button onClick={add} className="shrink-0 rounded-md bg-emerald-400/90 px-2.5 py-1.5 text-xs font-bold text-black">Add</button>
      </div>
    </div>
  );
}

function OddsMarket({ mk, odds, setOdd, offSet, onToggleOff, extra }) {
  const [open, setOpen] = useState(false);
  const deletable = !!onToggleOff;
  if (!mk) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold">
        <span>{mk.icon} {mk.title}</span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-white/5 p-3">
          {mk.selections.map((s) => {
            const isOff = offSet?.has(s.id);
            return (
              <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                <span className={`min-w-0 flex-1 ${isOff ? "text-stone-600 line-through" : "text-stone-300"}`}>{s.label}</span>
                <input value={odds[mk.key]?.[s.id] ?? s.oddsStr} onChange={(e) => setOdd(mk.key, s.id, e.target.value)} disabled={isOff}
                  className="w-20 shrink-0 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-emerald-300 outline-none focus:border-amber-400/60 disabled:opacity-40" />
                {deletable && (isOff
                  ? <button onClick={() => onToggleOff(s.id)} className="shrink-0 rounded-md bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-emerald-300">Add back</button>
                  : <button onClick={() => onToggleOff(s.id)} title="Remove from this match" className="shrink-0 rounded-md bg-white/5 p-1.5 text-stone-400 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>)}
              </div>
            );
          })}
          {extra}
        </div>
      )}
    </div>
  );
}

// Match Special editor: built-in specials (odds + remove/restore) + custom specials (add / edit / delete)
function MatchSpecialEditor({ mk, odds, setOdd, offSet, toggleOff, specials, addSpecial, setSpecial, delSpecial }) {
  const [open, setOpen] = useState(false);
  if (!mk) return null;
  const builtins = mk.selections.filter((s) => s.meta?.sp !== "custom");
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold">
        <span>{mk.icon} {mk.title}</span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-white/5 p-3">
          <div className="space-y-2">
            {builtins.map((s) => {
              const isOff = offSet?.has(s.id);
              return (
                <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className={`min-w-0 flex-1 ${isOff ? "text-stone-600 line-through" : "text-stone-300"}`}>{s.label}</span>
                  <input value={odds.specials?.[s.id] ?? s.oddsStr} onChange={(e) => setOdd("specials", s.id, e.target.value)} disabled={isOff}
                    className="w-20 shrink-0 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-emerald-300 outline-none focus:border-amber-400/60 disabled:opacity-40" />
                  {isOff
                    ? <button onClick={() => toggleOff(s.id)} className="shrink-0 rounded-md bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-emerald-300">Add back</button>
                    : <button onClick={() => toggleOff(s.id)} title="Remove from this match" className="shrink-0 rounded-md bg-white/5 p-1.5 text-stone-400 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>}
                </div>
              );
            })}
          </div>
          <div className="border-t border-white/5 pt-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-400">Custom specials (you grade these Won/No at settlement)</span>
              <button onClick={addSpecial} className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30"><Plus className="h-3 w-3" /> Add</button>
            </div>
            {specials.length === 0 && <p className="py-1 text-center text-[11px] text-stone-600">No custom specials.</p>}
            <div className="space-y-2">
              {specials.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input value={s.label} onChange={(e) => setSpecial(i, "label", e.target.value)} placeholder="Special label (e.g. Penalty awarded)"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none focus:border-emerald-400/50" />
                  <input value={s.odds} onChange={(e) => setSpecial(i, "odds", e.target.value)} placeholder="2/1"
                    className="w-16 shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-xs outline-none focus:border-emerald-400/50" />
                  <button onClick={() => delSpecial(i)} className="shrink-0 rounded-lg bg-white/5 p-2 text-stone-400 hover:text-rose-400"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// add a custom Total Cards line (Exactly N / More than N)
function CardsLineAdder({ lines = [], onAdd, onDel }) {
  const [kind, setKind] = useState("eq");
  const [n, setN] = useState("");
  const [od, setOd] = useState("");
  const add = () => {
    const num = parseInt(n, 10);
    if (isNaN(num) || num < 0) return;
    const meta = kind === "eq" ? { c: { eq: num } } : { c: { gt: num } };
    const label = kind === "eq" ? `Exactly ${num} Card${num === 1 ? "" : "s"}` : `More than ${num} Cards`;
    onAdd("total_cards", label, meta, od || "10/1");
    setN(""); setOd("");
  };
  return (
    <div className="mt-1 rounded-lg border border-white/10 bg-black/20 p-2">
      <div className="mb-1.5 text-[11px] font-semibold text-stone-400">Add a cards line</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs outline-none">
          <option value="eq">Exactly</option><option value="gt">More than</option>
        </select>
        <input value={n} onChange={(e) => setN(e.target.value)} inputMode="numeric" placeholder="#" className="w-14 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-xs outline-none" />
        <span className="text-[11px] text-stone-500">cards @</span>
        <input value={od} onChange={(e) => setOd(e.target.value)} placeholder="10/1" className="w-16 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center text-xs outline-none" />
        <button onClick={add} className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30">Add</button>
      </div>
      {lines.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {lines.map((l) => (
            <span key={l.id} className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-stone-300">
              {l.label} <span className="font-bold text-emerald-300">{l.oddsStr}</span>
              <button onClick={() => onDel("total_cards", l.id)} className="text-stone-500 hover:text-rose-400"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
const ipt = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-400/60";
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
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">{icon}</div>
    <div><h2 className="font-display text-3xl leading-none text-white">{title}</h2>{sub && <p className="text-xs text-stone-500">{sub}</p>}</div>
  </div>
);
const Stat = ({ label, v, good }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
    <div className="text-[10px] uppercase tracking-wide text-stone-500">{label}</div>
    <div className={`font-display text-2xl leading-tight ${good ? "text-emerald-400" : "text-white"}`}>{v}</div>
  </div>
);

/* ---------- Player: Special Boosts (accumulators on the match wallet) ---------- */
function Boosts({ config, wallet, myBets = [], now, nickname, placeBet, showToast }) {
  const live = (config?.boosts || []).filter((b) => b.live && !b.result);
  const [stakes, setStakes] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const setStake = (id, v) => setStakes((s) => ({ ...s, [id]: v }));
  const stakedOn = (id) => myBets.filter((b) => b.status !== "void")
    .reduce((a, b) => a + b.items.filter((it) => it.boostId === id && it.status !== "void").reduce((s, it) => s + it.stake, 0), 0);

  const start = (boost) => {
    const stake = Math.round(+stakes[boost.id] || 0);
    if (now >= (boost.lockMs || Infinity)) return showToast("This boost is locked", "err");
    if (stake < BOOST_RULES.min) return showToast(`Min stake is ${money(BOOST_RULES.min)}`, "err");
    if (stake > BOOST_RULES.max) return showToast(`Max stake is ${money(BOOST_RULES.max)}`, "err");
    if (stakedOn(boost.id) + stake > BOOST_RULES.max) return showToast(`Max ${money(BOOST_RULES.max)} total on one boost`, "err");
    if (stake > wallet.net) return showToast("Not enough coins in your match wallet", "err");
    setConfirm({ boost, stake });
  };
  const place = async () => {
    const { boost, stake } = confirm; const odds = toDecimal(boost.oddsStr);
    const bet = { id: uid(), code: betCode(), user: nickname, ts: new Date().toISOString(),
      items: [{ boostId: boost.id, matchId: null, marketKey: "boost", marketTitle: "Special Boost", selId: boost.id, label: boost.label, oddsStr: boost.oddsStr, odds, stake, status: "open" }],
      totalStake: stake, potential: stake * odds, status: "open", kind: "boost" };
    setBusy(true);
    try { await placeBet(bet); showToast("Boost backed — good luck!"); setConfirm(null); setStake(boost.id, ""); }
    catch (e) { showToast(e.message || "Could not place this boost", "err"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <SectionTitle icon={<Zap className="h-5 w-5" />} title="Special Boosts" sub="Pre-built accumulators at boosted odds · uses your match wallet" />
      <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm">
        <span className="font-semibold text-emerald-300">Match wallet balance</span>
        <span className="font-bold text-white">{money(wallet.net)}</span>
      </div>
      <p className="mb-3 text-xs text-stone-500">Stake {money(BOOST_RULES.min)}–{money(BOOST_RULES.max)} per boost · paid from your match wallet · settled Won / No.</p>

      <div className="space-y-3">
        {live.length === 0 && <p className="rounded-xl border border-white/10 bg-white/[0.02] py-8 text-center text-sm text-stone-500">No special boosts are open right now. Check back soon.</p>}
        {live.map((b) => {
          const locked = now >= (b.lockMs || Infinity);
          const cd = boostCountdown(b.lockMs, now);
          const stake = Math.round(+stakes[b.id] || 0);
          const already = stakedOn(b.id);
          return (
            <div key={b.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-emerald-500/5 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">⚡ Special Boost</div>
                  <div className="text-sm font-bold">{b.label}</div>
                </div>
                <span className="shrink-0 rounded-lg bg-amber-400 px-2.5 py-1 text-sm font-bold text-black">{b.oddsStr}</span>
              </div>
              <div className="mb-2 text-[11px]">
                {locked ? <span className="text-rose-300">🔒 Locked</span> : cd ? <span className="text-amber-300">Closes in {cd}</span> : <span className="text-stone-500">Open</span>}
                {already > 0 && <span className="ml-2 text-stone-500">You've staked {money(already)}</span>}
              </div>
              {!locked && already < BOOST_RULES.max ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={stakes[b.id] ?? ""} onChange={(e) => setStake(b.id, e.target.value)} placeholder={`${BOOST_RULES.min}–${BOOST_RULES.max}`}
                    className="w-28 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-400/60" />
                  <span className="text-[11px] text-stone-500">{stake > 0 ? `Returns ${money(stake * toDecimal(b.oddsStr))}` : ""}</span>
                  <button onClick={() => start(b)} className="ml-auto shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 px-4 py-2 text-sm font-bold text-black">Back boost</button>
                </div>
              ) : already >= BOOST_RULES.max ? (
                <p className="text-[11px] text-emerald-300/80">You've reached the {money(BOOST_RULES.max)} max on this boost.</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <SectionTitle icon={<Receipt className="h-5 w-5" />} title="My Boosts" sub={`${myBets.length} placed`} />
        {myBets.length > 0 && (
          <button onClick={() => printPicks(myBets, `${nickname} — Special Boosts`, false)}
            className="mb-3 flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/10"><Receipt className="h-3.5 w-3.5" /> Download PDF</button>
        )}
        <div className="space-y-2.5">
          {myBets.length === 0 && <p className="py-8 text-center text-sm text-stone-500">No boosts backed yet.</p>}
          {myBets.map((b) => <BetCard key={b.id} b={b} />)}
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={() => !busy && setConfirm(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-amber-400/30 bg-[#0a1311] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2 font-display text-2xl text-white"><Zap className="h-5 w-5 text-amber-300" /> Back this boost?</div>
            <div className="mb-3 rounded-xl bg-black/30 p-3 text-sm">
              <div className="font-semibold text-stone-100">{confirm.boost.label}</div>
              <div className="mt-1 text-xs text-stone-400">Odds {confirm.boost.oddsStr} · Stake {money(confirm.stake)} · Returns {money(confirm.stake * toDecimal(confirm.boost.oddsStr))}</div>
            </div>
            <p className="mb-3 text-[11px] text-stone-500">Paid from your match wallet. Picks can't be edited after placing.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)} disabled={busy} className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-stone-300">Cancel</button>
              <button onClick={place} disabled={busy} className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-2.5 text-sm font-bold text-black disabled:opacity-50">{busy ? "Placing…" : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Admin: Special Boosts — add / odds / lock / go-live / download (Odds tab) ---------- */
const BoostBadge = ({ result }) => {
  if (!result) return null;
  const map = { won: ["WON", "bg-emerald-500/20 text-emerald-300"], no: ["NO", "bg-rose-500/20 text-rose-200"], void: ["VOID", "bg-stone-500/25 text-stone-300"] };
  const [t, c] = map[result] || ["", ""];
  return <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${c}`}>{t}</span>;
};

function BoostAdmin({ config, bets, saveConfig, showToast }) {
  const [open, setOpen] = useState(false);
  const [settledOpen, setSettledOpen] = useState(false);
  const [list, setList] = useState(() => (config?.boosts || []).map((b) => ({ ...b })));
  const [busy, setBusy] = useState(false);
  const add = () => setList((l) => [...l, { id: "bo_" + uid(), label: "", oddsStr: "5/1", lockMs: null, live: false, result: null }]);
  const setF = (id, k, v) => setList((l) => l.map((x) => x.id === id ? { ...x, [k]: v } : x));
  const del = (id) => setList((l) => l.filter((x) => x.id !== id));
  const backersFor = (id) => bets.filter((b) => b.kind === "boost" && b.items.some((it) => it.boostId === id));
  const dl = (b, pdf) => {
    const mb = backersFor(b.id); if (!mb.length) { showToast("No picks on this boost yet", "err"); return; }
    pdf ? printPicks(mb, `${b.label} — Boost Picks`, true) : exportPicksCSV(mb, `SGA_boost_${b.label}.csv`.replace(/[^\w.]+/g, "_"), true);
  };
  const buildPayload = (l) => ({ ...(config || {}), boosts: l.map((b) => ({ id: b.id, label: (b.label || "").trim(), oddsStr: b.oddsStr || "5/1", lockMs: b.lockMs || null, live: !!b.live, result: b.result || null, settledAt: b.settledAt || null })) });
  const persist = async (l, msg) => {
    setBusy(true);
    try { await saveConfig(-3, buildPayload(l)); showToast(msg); }
    catch (e) { showToast(e.message || "Save failed (admin only)", "err"); }
    finally { setBusy(false); }
  };
  const toggleLive = async (id) => {
    const b = list.find((x) => x.id === id);
    if (!(b.label || "").trim()) return showToast("Add a label before going live", "err");
    const next = list.map((x) => x.id === id ? { ...x, live: !x.live } : x);
    setList(next);
    await persist(next, next.find((x) => x.id === id).live ? "Boost is now LIVE for players" : "Boost set to draft");
  };
  const save = async () => {
    for (const b of list) if (!(b.label || "").trim()) return showToast("Every boost needs a label", "err");
    await persist(list, "Special boosts saved");
  };

  const active = list.filter((b) => !b.result);
  const settled = list.filter((b) => b.result);

  const editCard = (b, idx) => {
    const backers = backersFor(b.id);
    const stake = backers.reduce((a, x) => a + x.totalStake, 0);
    return (
      <div key={b.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-stone-400">Boost {idx + 1}</span>
          <button onClick={() => del(b.id)} className="rounded-md bg-white/5 p-1.5 text-stone-400 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>
        </div>
        <input value={b.label} onChange={(e) => setF(b.id, "label", e.target.value)} placeholder="England, Portugal & Ghana All To Win"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-400/50" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wide text-stone-500">Boosted odds</span>
            <input value={b.oddsStr} onChange={(e) => setF(b.id, "oddsStr", e.target.value)} placeholder="6/1" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center text-sm outline-none focus:border-emerald-400/50" /></label>
          <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wide text-stone-500">Lock time (GMT+6)</span>
            <input type="datetime-local" value={toLocalInput(b.lockMs)} onChange={(e) => setF(b.id, "lockMs", fromLocalInput(e.target.value))} className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-xs outline-none focus:border-emerald-400/50" /></label>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => toggleLive(b.id)} disabled={busy} className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${b.live ? "bg-emerald-400 text-black" : "bg-white/5 text-stone-400"}`}>{b.live ? "Live" : "Draft"}</button>
          <span className="text-[11px] text-stone-500">{backers.length} picks · {money(stake)}</span>
          <span className="ml-auto flex gap-1">
            <button onClick={() => dl(b, false)} title="Excel" className="rounded-md bg-white/5 p-1.5 text-emerald-300 hover:bg-white/10"><BarChart3 className="h-3.5 w-3.5" /></button>
            <button onClick={() => dl(b, true)} title="PDF" className="rounded-md bg-white/5 p-1.5 text-emerald-300 hover:bg-white/10"><Receipt className="h-3.5 w-3.5" /></button>
          </span>
        </div>
      </div>
    );
  };

  const settledCard = (b) => {
    const backers = backersFor(b.id);
    const stake = backers.reduce((a, x) => a + x.totalStake, 0);
    return (
      <div key={b.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{b.label}</span><BoostBadge result={b.result} /></div>
            <div className="text-[11px] text-stone-500">{b.oddsStr} · {backers.length} picks · {money(stake)}</div>
          </div>
          <span className="flex shrink-0 gap-1">
            <button onClick={() => dl(b, false)} title="Excel" className="rounded-md bg-white/5 p-1.5 text-emerald-300 hover:bg-white/10"><BarChart3 className="h-3.5 w-3.5" /></button>
            <button onClick={() => dl(b, true)} title="PDF" className="rounded-md bg-white/5 p-1.5 text-emerald-300 hover:bg-white/10"><Receipt className="h-3.5 w-3.5" /></button>
            <button onClick={() => del(b.id)} title="Remove" className="rounded-md bg-white/5 p-1.5 text-stone-400 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
        <span>⚡ Special Boosts <span className="text-[11px] font-normal text-stone-500">({active.length} active)</span></span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/5 p-3">
          <p className="mb-2 text-[11px] text-stone-500">Build accumulators (e.g. “England, Portugal &amp; Ghana All To Win”). Set boosted odds + a lock time (GMT+6), then flip <b>Live</b> to publish it instantly to players. <b>Save Boosts</b> keeps edits to drafts. Settle Won/No in the Settle tab — settled boosts move to the Settled folder below.</p>
          <div className="space-y-3">
            {active.map((b, i) => editCard(b, i))}
          </div>
          <button onClick={add} className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-500/20 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"><Plus className="h-3.5 w-3.5" /> Add a boost</button>
          <button onClick={save} disabled={busy} className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 py-2.5 text-sm font-bold text-black disabled:opacity-50">{busy ? "Saving…" : "Save Boosts"}</button>

          {settled.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <button onClick={() => setSettledOpen(!settledOpen)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-bold text-stone-300">
                <span>✅ Settled <span className="font-normal text-stone-500">({settled.length})</span></span>
                <ChevronRight className={`h-3.5 w-3.5 transition ${settledOpen ? "rotate-90" : ""}`} />
              </button>
              {settledOpen && <div className="space-y-2 border-t border-white/5 p-2">{settled.map(settledCard)}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Admin: settle Special Boosts Won / No (Settle tab) ---------- */
function BoostSettle({ config, bets, settleBoost, resetBoost, voidBoost, showToast }) {
  const [open, setOpen] = useState(false);
  const [settledOpen, setSettledOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [voiding, setVoiding] = useState(null); // { id, label } pending void
  const [reason, setReason] = useState("");
  const all = config?.boosts || [];
  const pending = all.filter((b) => b.live && !b.result);
  const settled = all.filter((b) => b.result);
  const backers = (id) => bets.filter((b) => b.kind === "boost" && b.items.some((it) => it.boostId === id));
  const act = async (fn) => { setBusy(true); try { await fn(); } catch (e) { showToast(e.message || "Failed", "err"); } finally { setBusy(false); } };
  const confirmVoid = async () => {
    if (!reason.trim()) return showToast("Add a short reason for the void", "err");
    await act(() => voidBoost(voiding.id, reason.trim()));
    setVoiding(null); setReason("");
  };
  if (!pending.length && !settled.length) return null;

  const meta = (b) => { const l = backers(b.id); return { n: l.length, stake: l.reduce((a, x) => a + x.totalStake, 0) }; };

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold">
        <span>⚡ Special Boosts <span className="text-[11px] font-normal text-stone-500">({pending.length} to settle)</span></span>
        <ChevronRight className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-white/5 p-3">
          {pending.length === 0 && <p className="py-3 text-center text-[11px] text-stone-500">Nothing to settle right now.</p>}
          {pending.map((b) => {
            const { n, stake } = meta(b);
            return (
              <div key={b.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-sm font-semibold">{b.label}</div>
                <div className="text-[11px] text-stone-500">{b.oddsStr} · {n} picks · {money(stake)}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button disabled={busy} onClick={() => act(() => settleBoost(b.id, "won"))} className="flex-1 rounded-lg bg-emerald-500/20 py-2 text-xs font-bold text-emerald-300 disabled:opacity-50">Won (pay out)</button>
                  <button disabled={busy} onClick={() => act(() => settleBoost(b.id, "no"))} className="flex-1 rounded-lg bg-rose-500/15 py-2 text-xs font-bold text-rose-200 disabled:opacity-50">No</button>
                  <button disabled={busy} onClick={() => { setVoiding({ id: b.id, label: b.label }); setReason(""); }} className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-stone-400 hover:text-rose-300 disabled:opacity-50">Void</button>
                </div>
              </div>
            );
          })}

          {settled.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <button onClick={() => setSettledOpen(!settledOpen)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-bold text-stone-300">
                <span>✅ Settled <span className="font-normal text-stone-500">({settled.length})</span></span>
                <ChevronRight className={`h-3.5 w-3.5 transition ${settledOpen ? "rotate-90" : ""}`} />
              </button>
              {settledOpen && (
                <div className="space-y-2 border-t border-white/5 p-2">
                  {settled.map((b) => {
                    const { n, stake } = meta(b);
                    return (
                      <div key={b.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{b.label}</span><BoostBadge result={b.result} /></div>
                        <div className="text-[11px] text-stone-500">{b.oddsStr} · {n} picks · {money(stake)}{b.result === "void" ? " · stakes refunded" : ""}</div>
                        {b.result === "void" ? (
                          <div className="mt-2 rounded-lg bg-stone-500/15 px-3 py-1.5 text-[11px] font-semibold text-stone-300">🚫 Voided — refunded, off the leaderboard</div>
                        ) : (
                          <button disabled={busy} onClick={() => act(() => resetBoost(b.id))} className="mt-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-300 disabled:opacity-50">Reset to unsettled</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {voiding && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={() => !busy && setVoiding(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-rose-400/30 bg-[#0a1311] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center gap-2 font-display text-2xl text-white"><Ban className="h-5 w-5 text-rose-300" /> Void this boost?</div>
            <p className="mb-3 text-xs text-stone-400">“{voiding.label}” — every backer's stake is refunded and the boost is removed from the leaderboard. This can't be undone.</p>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. match postponed)"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-rose-400/50" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setVoiding(null)} disabled={busy} className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-stone-300">Cancel</button>
              <button onClick={confirmVoid} disabled={busy} className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Voiding…" : "Void & refund"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BottomNav({ tab, setTab, slipCount, ogCount, fmCount }) {
  const items = [
    { k: "matches", label: "Matches", icon: Calendar },
    { k: "boosts", label: "Boosts", icon: Zap },
    { k: "outrights", label: "Outrights", icon: Trophy, badge: ogCount },
    { k: "fantasy", label: "Fantasy", icon: Users, badge: fmCount },
    { k: "mybets", label: "My Picks", icon: Receipt },
    { k: "board", label: "Ranking", icon: Crown },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070b0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-4 py-2">
        {items.map(({ k, label, icon: Icon, badge }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-semibold ${tab === k ? "text-amber-400" : "text-stone-500"}`}>
            <Icon className="h-5 w-5" />{label}
            {badge > 0 && <span className="absolute right-1/4 top-0 rounded-full bg-amber-400 px-1.5 text-[9px] font-bold text-black">{badge}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}
