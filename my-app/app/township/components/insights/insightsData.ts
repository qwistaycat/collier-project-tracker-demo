// ================================================================
//  Insights — pure derivation module. Reproduces the prototype's
//  sentiment-table pipeline exactly (djb2-xor hash, comment/uniq/
//  response derivation, dominant-sentiment classification, canned
//  theme sentences) plus the engagement chart series from the
//  prototype's Trends export. No React in this file.
// ================================================================

import type { Lifecycle, StaffProject, StaffTheme } from "../../data";

// ── Filter option tables ─────────────────────────────────────────

export type SentTime = "all" | "7d" | "30d" | "90d" | "custom";
export type SentScope = "all" | "dept";
export type SentStatus = "all" | "published" | "completed";
export type SentSortKey = "project" | "comments" | "sentiment";
export type SortDir = "asc" | "desc";

export const TIME_OPTIONS: { value: SentTime; label: string }[] = [
  { value: "all", label: "All" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export const SCOPE_OPTIONS: { value: SentScope; label: string }[] = [
  { value: "all", label: "All departments" },
  { value: "dept", label: "This department" },
];

export const STATUS_OPTIONS: { value: SentStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "completed", label: "Completed" },
];

// ── Derivation pipeline ──────────────────────────────────────────

/** djb2-xor hash — must match the prototype bit-for-bit. */
export function insHash(s: string): number {
  let h = 5381;
  for (const ch of s) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Response-rate threshold color. */
export function rColor(pct: number): string {
  return pct >= 80 ? "#16A34A" : pct >= 50 ? "#FFAA55" : "#CD481B";
}

/** Dominant-sentiment verdict for a project. */
export function domOf(sent: { supportive: number; mixed: number; concerns: number }): {
  word: string;
  color: string;
} {
  if (sent.supportive > 60) return { word: "Supportive", color: "#16A34A" };
  if (sent.concerns > 60) return { word: "Concerns", color: "#CD481B" };
  if (Math.abs(sent.supportive - sent.concerns) <= 10) return { word: "Split", color: "#64748B" };
  return { word: "Mixed", color: "#B45309" };
}

/** Canned AI theme sentences (verbatim from the prototype). */
export const THEME_MAP: Record<string, string> = {
  "road-paving":
    "Residents are frustrated by confusing detour signage near the elementary school, though many appreciate the clear stage-by-stage schedule updates.",
  hilltop:
    "Enthusiasm for the new playground runs high, but neighbors on adjacent streets stay worried about parking capacity and weekend traffic spillover.",
  "digital-services":
    "Residents welcome the more accessible, mobile-friendly site, though several report trouble logging in and want the older meeting-minutes archive preserved.",
  nevillewood:
    "Opinion is split on the proposed speed bumps — some welcome slower cut-through traffic while others worry about vehicle damage and slower emergency response.",
  "fire-station":
    "Support for modernizing the station is broad, but residents keep asking how much the pending bond issue will add to their property taxes.",
  "mixed-use":
    "Opposition centers on the density of 24 units and its traffic impact on the village intersection, though some residents welcome more walkable local retail.",
};

/** Fallback theme sentence for projects without a THEME_MAP entry. */
export function genTheme(themes: StaffTheme[]): string {
  if (!themes.length) return "—";
  const t = themes[0];
  const verb =
    t.sent === "concerns"
      ? "raised concerns about"
      : t.sent === "supportive"
        ? "voiced support around"
        : "shared mixed views on";
  return `${t.count} resident${t.count === 1 ? "" : "s"} ${verb} ${t.name.toLowerCase()}${
    themes.length > 1 ? ", among other themes." : "."
  }`;
}

export interface SentRow {
  id: string;
  title: string;
  deptShort: string;
  lc: Lifecycle;
  comments: number;
  uniq: number;
  respPct: number;
  responded: number;
  sentiment: { supportive: number; mixed: number; concerns: number };
  dom: { word: string; color: string };
  themeText: string;
  /** Names of themes beyond the first (feeds the "+N" badge tooltip). */
  moreThemes: string[];
}

/** Curly/straight apostrophes differ between seed dept strings — normalize. */
const normApos = (s: string) => s.replace(/’/g, "'");

export function buildSentRows(
  projects: StaffProject[],
  opts: { scope: SentScope; status: SentStatus; dept: string }
): SentRow[] {
  return projects
    .filter((p) => p.lc === "published" || p.lc === "completed")
    .filter((p) => (opts.scope === "dept" ? normApos(p.dept) === normApos(opts.dept) : true))
    .filter((p) => (opts.status === "all" ? true : p.lc === opts.status))
    .filter((p) => p.public.length + p.privateMsgs.length > 0)
    .map((p) => {
      const themeSum = p.themes.reduce((a, t) => a + t.count, 0);
      const comments = Math.max(p.public.length + p.privateMsgs.length, themeSum);
      const h = insHash(p.id);
      const uniq = Math.max(1, Math.min(comments, Math.round(comments * (0.55 + (h % 26) / 100))));
      const respPct = 42 + (h % 55);
      const responded = Math.min(comments, Math.round((comments * respPct) / 100));
      return {
        id: p.id,
        title: p.title,
        deptShort: p.deptShort,
        lc: p.lc,
        comments,
        uniq,
        respPct,
        responded,
        sentiment: p.sentiment,
        dom: domOf(p.sentiment),
        themeText: THEME_MAP[p.id] || genTheme(p.themes),
        moreThemes: p.themes.slice(1).map((t) => t.name),
      };
    });
}

export function sortSentRows(rows: SentRow[], sort: SentSortKey, dir: SortDir): SentRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (sort === "project") return a.title.localeCompare(b.title);
    if (sort === "sentiment") return a.sentiment.supportive - b.sentiment.supportive;
    return a.comments - b.comments;
  });
  // "desc" is the default presentation for every column.
  if (dir === "desc") sorted.reverse();
  return sorted;
}

export interface SentSummary {
  projects: number;
  comments: number;
  residents: number;
  sup: number;
  mixed: number;
  conc: number;
  respPct: number;
}

export function buildSummary(rows: SentRow[]): SentSummary {
  const comments = rows.reduce((a, r) => a + r.comments, 0);
  const residents = rows.reduce((a, r) => a + r.uniq, 0);
  const responded = rows.reduce((a, r) => a + r.responded, 0);
  const sup = comments
    ? Math.round(rows.reduce((a, r) => a + r.sentiment.supportive * r.comments, 0) / comments)
    : 0;
  const mixed = comments
    ? Math.round(rows.reduce((a, r) => a + r.sentiment.mixed * r.comments, 0) / comments)
    : 0;
  return {
    projects: rows.length,
    comments,
    residents,
    sup,
    mixed,
    conc: Math.max(0, 100 - sup - mixed),
    respPct: comments ? Math.round((responded / comments) * 100) : 0,
  };
}

// ── AI insight strings (verbatim from the prototype) ─────────────

export const AI_INSIGHTS = [
  "Comment volume on Hilltop Park is up 40% this week, driven by parking concerns.",
  "Sentiment on Road Paving 2026 shifted positive (+12 pts) after Stage 6 update.",
  "43% of Mixed-Use Development feedback expresses density concerns — consider a public FAQ.",
  "Response rate this week is 91% within 7 days, above your 85% target.",
];

// ── Engagement chart series (verbatim from the prototype Trends) ─

const QL_ALL = ["Q1 24", "Q2 24", "Q3 24", "Q4 24", "Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26"];

// Default range in the prototype is "3y" → the last 8 quarters.
const SLICE = 8;
export const QUARTERS = QL_ALL.slice(-SLICE);

export interface EngagementSeries {
  key: string;
  name: string;
  color: string;
  pts: number[];
}

const cD = {
  comments: [120, 140, 165, 185, 205, 235, 268, 305, 352, 405],
  follows: [80, 92, 108, 128, 150, 172, 196, 222, 251, 286],
  votes: [210, 235, 262, 298, 338, 378, 416, 458, 502, 560],
  dms: [10, 13, 17, 21, 25, 30, 35, 41, 47, 54],
};

export const ENGAGEMENT_SERIES: EngagementSeries[] = [
  { key: "comments", name: "Comments", color: "#2563EB", pts: cD.comments.slice(-SLICE) },
  { key: "follows", name: "Follows", color: "#16A34A", pts: cD.follows.slice(-SLICE) },
  { key: "votes", name: "Poll votes", color: "#FFAA55", pts: cD.votes.slice(-SLICE) },
  { key: "dms", name: "DMs", color: "#7C3AED", pts: cD.dms.slice(-SLICE) },
];

export const CHART_CATS = ["Roads", "Parks", "Infrastructure", "Plan/Dev", "Public Safety"] as const;

const catBaseAll = [
  [40, 30, 18, 14, 10],
  [46, 34, 20, 16, 12],
  [54, 40, 24, 20, 14],
  [62, 46, 28, 22, 16],
  [72, 54, 33, 26, 19],
  [84, 62, 38, 30, 22],
  [98, 72, 45, 34, 26],
  [112, 84, 52, 40, 30],
  [128, 96, 60, 46, 34],
  [146, 110, 70, 52, 40],
];
/** Comments per category per quarter (last 8 quarters). */
export const CAT_BASE = catBaseAll.slice(-SLICE);

const sentBaseAll = [
  { s: 52, m: 30, c: 18 },
  { s: 54, m: 29, c: 17 },
  { s: 50, m: 30, c: 20 },
  { s: 48, m: 31, c: 21 },
  { s: 53, m: 28, c: 19 },
  { s: 55, m: 27, c: 18 },
  { s: 51, m: 29, c: 20 },
  { s: 57, m: 26, c: 17 },
  { s: 59, m: 25, c: 16 },
  { s: 61, m: 24, c: 15 },
];
/** Sentiment mix per quarter (last 8 quarters). */
export const SENT_BASE = sentBaseAll.slice(-SLICE);
