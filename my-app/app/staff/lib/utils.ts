// ================================================================
//  Staff portal shared constants + pure helpers (styling maps,
//  lifecycle metadata, deterministic pseudo-data generators).
// ================================================================

import type {
  Comment,
  Lifecycle,
  ModMode,
  Project,
  Sentiment,
  StaffCategory,
} from "./types";

export const STAFF_NAME = "Amy Medway";
export const TODAY_LABEL = "Tuesday, July 7, 2026";

// Category accent colors (badges + hero fallbacks)
export const CAT: Record<StaffCategory, { color: string; bg: string }> = {
  Roads: { color: "#D97706", bg: "#FEF3C7" },
  Parks: { color: "#16A34A", bg: "#DCFCE7" },
  Infrastructure: { color: "#2563EB", bg: "#DBEAFE" },
  "Plan/Dev": { color: "#7C3AED", bg: "#EDE9FE" },
  "Public Safety": { color: "#DC2626", bg: "#FEE2E2" },
};

export const CATEGORIES: StaffCategory[] = [
  "Roads",
  "Parks",
  "Infrastructure",
  "Plan/Dev",
  "Public Safety",
];

export const CAT_FULL: Record<string, string> = {
  All: "All",
  Roads: "Roads & Transportation",
  Parks: "Parks & Green Spaces",
  Infrastructure: "Infrastructure & Facilities",
  "Plan/Dev": "Plan, Development & Sustainability",
  "Public Safety": "Public Safety",
};

export function lcMeta(lc: Lifecycle): { label: string; color: string; bg: string } {
  switch (lc) {
    case "draft":
      return { label: "Draft", color: "#475569", bg: "#F1F5F9" };
    case "pending":
      return { label: "Pending Review", color: "#B45309", bg: "#FEF3C7" };
    case "published":
      return { label: "Published", color: "#16A34A", bg: "#DCFCE7" };
    case "completed":
      return { label: "Completed", color: "#2563EB", bg: "#DBEAFE" };
    case "archived":
      return { label: "Archived", color: "#64748B", bg: "#EEF2F6" };
    case "trash":
      return { label: "In Trash", color: "#DC2626", bg: "#FEE2E2" };
  }
}

export function sentMeta(s: Sentiment): { color: string; bg: string; label: string } {
  if (s === "green") return { color: "#16A34A", bg: "#DCFCE7", label: "Supportive" };
  if (s === "red") return { color: "#DC2626", bg: "#FEE2E2", label: "Concerns" };
  return { color: "#D97706", bg: "#FEF3C7", label: "Mixed" };
}

export const DEPARTMENTS = [
  "Manager's Office",
  "Township Secretary",
  "Public Works",
  "Sewer Department",
  "Building and Codes",
  "Police Department",
  "Planning, Zoning, and Land Development",
  "Garbage and Recycling",
  "Parks and Recreation",
  "Finance Department",
];

export const REVIEWERS = ["Amy Medway", "George Macino"];
export const URGENCIES = ["Low", "Standard", "High"] as const;
export const SPOTLIGHT_REASONS = [
  "Upcoming meeting",
  "Public feedback needed",
  "Time-sensitive",
  "Important announcement",
  "Other",
];
export const SPOTLIGHT_PRIORITIES = ["Standard", "High"] as const;
export const MAX_SPOTLIGHTS = 5;

export const MOD_MODES: Array<{ key: ModMode; label: string; desc: string }> = [
  {
    key: "post",
    label: "Post-moderation",
    desc: "Comments post immediately. AI flags concerning ones for review.",
  },
  {
    key: "selective",
    label: "Selective pre-moderation",
    desc: "Clean comments post immediately; AI-flagged comments need approval.",
  },
  {
    key: "full",
    label: "Full pre-moderation",
    desc: "Every comment needs staff approval before it appears publicly.",
  },
];

// ── Deterministic pseudo-randomness (ported from the prototype) ──

/** djb2-xor hash — keeps the Insights numbers stable per project */
export function insHash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

function charSum(str: string): number {
  let s = 0;
  for (let i = 0; i < str.length; i++) s += str.charCodeAt(i);
  return s;
}

const AVATAR_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#16A34A",
  "#D97706",
  "#DB2777",
  "#0891B2",
  "#4F46E5",
];

export function avatarColor(name: string): string {
  return AVATAR_COLORS[charSum(name) % AVATAR_COLORS.length];
}

export function initialsOf(name: string): string {
  if (!name || name.toLowerCase() === "anonymous") return "A";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ZIPS = ["15106", "15142", "15017", "15057", "15071"];

export function residentContact(name: string): { zip: string; email: string; phone: string } {
  const h = charSum(name);
  return {
    zip: ZIPS[h % ZIPS.length],
    email: name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "") + "@email.com",
    phone: `412-555-${1000 + (h % 9000)}`,
  };
}

// ── Comment / poll helpers ───────────────────────────────────────

export function pollTotal(p: { support: number; oppose: number; neutral: number }): number {
  return p.support + p.oppose + p.neutral;
}

export function pollPct(v: number, total: number): number {
  return total ? Math.round((v / total) * 100) : 0;
}

export function awaitingResponse(list: Comment[]): Comment[] {
  return list.filter((c) => !c.replies.length);
}

/** parse "2h" / "1d" / "1 week ago" style strings into hours for sorting */
export function agoHours(t: string): number {
  const m = t.match(/(\d+)\s*(h|d|w|m)/i);
  if (!m) return 9999;
  const v = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === "h") return v;
  if (unit === "d") return v * 24;
  if (unit === "w") return v * 168;
  return v * 720;
}

export function fmtAgo(hours: number): string {
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"} ago`;
  if (hours < 168) return `${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 168)} week${Math.round(hours / 168) === 1 ? "" : "s"} ago`;
}

/** most-recent activity (in hours) across a project's comments + replies */
export function lastActivityHours(p: Project): number {
  let min = Infinity;
  const scan = (c: Comment) => {
    min = Math.min(min, agoHours(c.time));
    c.replies.forEach((r) => (min = Math.min(min, agoHours(r.time))));
  };
  p.public.forEach(scan);
  p.privateMsgs.forEach(scan);
  if (!isFinite(min)) min = (insHash(p.id) % 120) + 2;
  return min;
}

// ── Insights row computation (ported formulas) ───────────────────

export interface InsightsRow {
  p: Project;
  comments: number;
  uniq: number;
  respPct: number;
  responded: number;
  dom: string;
  domColor: string;
  lastHours: number;
  lastLabel: string;
  themeText: string;
  moreThemes: string[];
}

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

export function insightsRow(p: Project): InsightsRow {
  const h = insHash(p.id);
  const themeSum = p.themes.reduce((s, t) => s + t.count, 0);
  const comments = Math.max(p.public.length + p.privateMsgs.length, themeSum);
  const uniq = Math.min(
    comments,
    Math.max(1, Math.round(comments * (0.55 + (h % 26) / 100)))
  );
  const respPct = 42 + (h % 55);
  const responded = Math.min(comments, Math.round((comments * respPct) / 100));

  // Dominant sentiment: clear majorities read as Supportive/Concerns,
  // near-ties as Split, everything else as Mixed (matches the prototype).
  const se = p.sentiment;
  let dom = "Mixed";
  let domColor = "#D97706";
  if (se.supportive > 60) {
    dom = "Supportive";
    domColor = "#16A34A";
  } else if (se.concerns > 60) {
    dom = "Concerns";
    domColor = "#DC2626";
  } else if (Math.abs(se.supportive - se.concerns) <= 10) {
    dom = "Split";
    domColor = "#64748B";
  }

  const lastHours = lastActivityHours(p);
  const sortedThemes = [...p.themes].sort((a, b) => b.count - a.count);
  const themeText =
    THEME_MAP[p.id] ||
    (sortedThemes[0]
      ? genTheme(sortedThemes[0], p.themes.length > 1)
      : "No major themes identified yet.");

  return {
    p,
    comments,
    uniq,
    respPct,
    responded,
    dom,
    domColor,
    lastHours,
    lastLabel: fmtAgo(lastHours),
    themeText,
    moreThemes: sortedThemes.slice(1).map((t) => t.name),
  };
}

function genTheme(
  t: { name: string; count: number; sent: string },
  hasMore: boolean
): string {
  const verb =
    t.sent === "concerns"
      ? "raised concerns about"
      : t.sent === "supportive"
      ? "voiced support around"
      : "shared mixed views on";
  return `${t.count} resident${t.count === 1 ? "" : "s"} ${verb} ${t.name.toLowerCase()}${
    hasMore ? ", among other themes." : "."
  }`;
}

export function respColor(pct: number): string {
  if (pct >= 80) return "#16A34A";
  if (pct >= 50) return "#D97706";
  return "#DC2626";
}

// ── AI text simulation ───────────────────────────────────────────

export function plainRewrite(text: string): string {
  return (
    text
      .replace(/Liquid Fuels|PennDOT/gi, "state road funding")
      .replace(/RFP/g, "request for proposals")
      .replace(/punchlist/gi, "list of final fixes") +
    (text.trim().endsWith(".") ? "" : ".") +
    " (Rewritten in plain language.)"
  );
}

export const AI_FIELD_SUGGEST: Record<string, string> = {
  desc: "Annual resurfacing of township roads across several neighborhoods, in plain terms so any resident can follow the schedule.",
  funding: "Township capital budget with a state grant match — no tax increase this year.",
  sponsor: "Public Works Department",
  duration: "Spring 2026 – Fall 2026",
  cost: "To be finalized at bid award",
};

export function detectDocType(name: string): string {
  const n = name.toLowerCase();
  if (/minute/.test(n)) return "Meeting minutes";
  if (/budget|cost|estimate/.test(n)) return "Budget document";
  if (/rfp|bid/.test(n)) return "RFP";
  if (/grant/.test(n)) return "Grant application";
  if (/assessment|study|feasib/.test(n)) return "Assessment";
  if (/proposal/.test(n)) return "Proposal";
  return "Document";
}

export function projectImage(id: string): string {
  const seed = id.replace("-2026", "").replace("-presto", "").replace("-rennerdale", "");
  return `https://picsum.photos/seed/${seed}/600/340`;
}
