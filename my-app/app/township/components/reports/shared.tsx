"use client";

// ================================================================
//  Reports — shared helpers, local icons, and small primitives
//  used by the four Reports sub-tabs. Owned by the reports screen;
//  nothing here is imported outside app/township/components/reports.
// ================================================================

import { useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTownship } from "../../TownshipContext";
import {
  type SentimentCode,
  type SentimentWord,
  type StaffCategory,
  type StaffProject,
} from "../../data";

// ── Local icons (not in icons.tsx — defined here per foundation) ──

interface RIconProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function SparkleIcon({ size = 14, color = "#7C3AED", style }: RIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...style }}>
      <path d="M12 2.5l2.1 5.9 5.9 2.1-5.9 2.1L12 18.5l-2.1-5.9-5.9-2.1 5.9-2.1z" />
      <path d="M19 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
    </svg>
  );
}

export function DownloadIcon({ size = 14, color = "currentColor", style }: RIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

export function InfoCircleIcon({ size = 18, color = "#0d2240", style }: RIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

export function CopyIcon({ size = 13, color = "currentColor", style }: RIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function ChartLineIcon({ size = 14, color = "currentColor", style }: RIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />
    </svg>
  );
}

export function QuoteIcon({ size = 34, color = "#CBD5E1", style }: RIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      <path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2-1 3.5-3 4" />
      <path d="M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2-1 3.5-3 4" />
    </svg>
  );
}

// ── Shared style helpers ─────────────────────────────────────────

/** Filter-pill chip: navy fill when active, white/hairline otherwise. */
export function pillStyle(on: boolean, small = false): CSSProperties {
  return {
    height: small ? 30 : 34,
    padding: "0 13px",
    borderRadius: 20,
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    background: on ? "#0d2240" : "#fff",
    color: on ? "#fff" : "#374151",
    border: `1px solid ${on ? "#0d2240" : "#e5e7eb"}`,
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
  };
}

export const CARD: CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
};

/** "AI" pill badge. */
export function AiBadge() {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        background: "#EDE9FE",
        color: "#7C3AED",
        padding: "1px 6px",
        borderRadius: 5,
      }}
    >
      AI
    </span>
  );
}

/** Purple AI note strip shown under trend cards / summaries. */
export function AiNote({ bold, text, style }: { bold?: string; text: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        marginTop: 12,
        background: "#F5F3FF",
        borderRadius: 9,
        padding: "11px 13px",
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        ...style,
      }}
    >
      <SparkleIcon size={14} style={{ marginTop: 2 }} />
      <span style={{ fontSize: 12.5, color: "#5B21B6", lineHeight: 1.55 }}>
        {bold && <strong>{bold} </strong>}
        {text}
      </span>
    </div>
  );
}

/** Shared Export button — simulation-only, toasts. */
export function ExportButton() {
  const { toast } = useTownship();
  return (
    <button
      onClick={() => toast("Preparing export — choose CSV, PDF, or DOCX…")}
      style={{
        height: 34,
        padding: "0 13px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
        fontSize: 12.5,
        fontWeight: 600,
        color: "#374151",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        transition: "background 0.15s ease",
      }}
    >
      <DownloadIcon size={14} />
      Export
    </button>
  );
}

/** List row with #f8fafc hover background. */
export function HoverRow({
  onClick,
  children,
  style,
}: {
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: "pointer",
        background: hover ? "#f8fafc" : "#fff",
        transition: "background 0.15s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** 6px sentiment dot. */
export function SentDot({ word, style }: { word: SentimentWord; style?: CSSProperties }) {
  const color =
    word === "supportive" ? "#16A34A" : word === "concerns" ? "#CD481B" : "#B45309";
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "inline-block",
        ...style,
      }}
    />
  );
}

// ── Corpus derivation ────────────────────────────────────────────

export const NEIGHBORHOODS = [
  "Nevillewood",
  "Ewingsville",
  "Rennerdale",
  "Beechmont",
  "Presto",
];

function idHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function nbOf(p: StaffProject): string {
  return p.id === "road-paving"
    ? "Nevillewood"
    : NEIGHBORHOODS[idHash(p.id) % NEIGHBORHOODS.length];
}

export const isLive = (p: StaffProject) => p.lc === "published" || p.lc === "completed";

const CODE_TO_WORD: Record<SentimentCode, SentimentWord> = {
  green: "supportive",
  amber: "mixed",
  red: "concerns",
};

const WORD_TO_CODE: Record<SentimentWord, SentimentCode> = {
  supportive: "green",
  mixed: "amber",
  concerns: "red",
};

export interface CorpusComment {
  text: string;
  name: string;
  anon: boolean;
  sent: SentimentCode;
  sentW: SentimentWord;
  time: string;
  project: string;
  projId: string;
  cat: StaffCategory;
  nb: string;
}

/**
 * Flattened comment corpus over live projects: public comments, DMs,
 * and every theme quote as a synthetic anonymous comment. Hidden /
 * moderated comments are excluded.
 */
export function flattenComments(projects: StaffProject[]): CorpusComment[] {
  const out: CorpusComment[] = [];
  for (const p of projects.filter(isLive)) {
    const nb = nbOf(p);
    const push = (
      text: string,
      name: string,
      anon: boolean,
      sent: SentimentCode,
      time: string
    ) =>
      out.push({
        text,
        name,
        anon,
        sent,
        sentW: CODE_TO_WORD[sent] || "mixed",
        time,
        project: p.title,
        projId: p.id,
        cat: p.cat,
        nb,
      });
    for (const c of p.public) push(c.text, c.name, c.anon, c.sent, c.time);
    for (const c of p.privateMsgs) push(c.text, c.name, c.anon, c.sent, c.time);
    for (const t of p.themes)
      push(t.quote, "Anonymous", true, WORD_TO_CODE[t.sent] || "amber", "earlier");
  }
  return out;
}

export function whoOf(c: { anon: boolean; name: string }): string {
  return c.anon ? "Anonymous resident" : c.name || "Resident";
}

/** Navigate to a project's staff detail, or toast when it doesn't exist. */
export function useOpenProject() {
  const router = useRouter();
  const { getProject, toast } = useTownship();
  return (id: string, tab: "details" | "feedback" | "polls" = "feedback") => {
    if (getProject(id)) router.push(`/township/project/${id}?tab=${tab}`);
    else toast("Opening source…");
  };
}
