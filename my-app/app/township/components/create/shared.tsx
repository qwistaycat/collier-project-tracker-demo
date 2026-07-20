"use client";

// ================================================================
//  Create-wizard shared bits — local types, icons, chips, style
//  tokens, and the synthetic AI-extraction builder. Everything in
//  app/township/components/create/ is namespaced to this screen.
// ================================================================

import React from "react";
import {
  type CreateSample,
  type SampleFields,
  type SampleStage,
  type StaffCategory,
} from "../../data";

// ── Types ────────────────────────────────────────────────────────

export interface WizardFields {
  title: string;
  category: StaffCategory;
  desc: string;
  funding: string;
  cost: string;
  sponsor: string;
  duration: string;
}

export type StageStatus = "draft" | "published" | "hidden";

export interface StageDoc {
  name: string;
  size: string;
}

export interface WizardStage {
  title: string;
  start: string;
  end: string;
  singleDate: boolean;
  summary: string;
  bullets: string[];
  status: StageStatus;
  docs: StageDoc[];
  docsOpen: boolean;
  ai: boolean;
}

export type Conf = "high" | "med" | "low";

export type FieldKey =
  | "title"
  | "category"
  | "department"
  | "desc"
  | "funding"
  | "cost"
  | "sponsor"
  | "duration";

export const FIELD_ORDER: FieldKey[] = [
  "title",
  "category",
  "department",
  "desc",
  "funding",
  "cost",
  "sponsor",
  "duration",
];

export const FIELD_LABELS: Record<FieldKey, string> = {
  title: "Project title",
  category: "Category",
  department: "Department",
  desc: "Description",
  funding: "Funding",
  cost: "Total cost",
  sponsor: "Project sponsor",
  duration: "Duration",
};

export interface ExtractPara {
  id: number;
  kind: "h1" | "h2" | "p";
  text: string;
  page: number;
}

export interface ExtractFieldMeta {
  value: string;
  conf: Conf;
  section: string;
  passage: string;
  reasoning: string;
  paraId: number;
}

export interface ExtractStageMeta {
  title: string;
  start: string;
  end: string;
  summary: string;
  bullets: string[];
  conf: Conf;
  section: string;
  passage: string;
  reasoning: string;
  paraId: number;
}

export interface ExtractMeta {
  /** [filename, docType] pairs */
  docs: [string, string][];
  paras: ExtractPara[];
  pageCount: number;
  fields: Record<FieldKey, ExtractFieldMeta>;
  stages: ExtractStageMeta[];
}

/** Payload for the view-source modal. */
export interface SourceView {
  label: string;
  doc: string;
  page: number;
  section: string;
  conf: Conf;
  reasoning: string;
  passage: string;
  /** wizard field this source can clear on reject (null for stages / non-clearable fields) */
  fieldKey: "title" | "desc" | "funding" | "cost" | "sponsor" | "duration" | null;
}

// ── Helpers ──────────────────────────────────────────────────────

export function emptyFields(): WizardFields {
  return {
    title: "",
    category: "Roads",
    desc: "",
    funding: "",
    cost: "",
    sponsor: "",
    duration: "",
  };
}

export function mkStage(o: Partial<WizardStage> = {}): WizardStage {
  return {
    title: "",
    start: "",
    end: "",
    singleDate: false,
    summary: "",
    bullets: [],
    status: "draft",
    docs: [],
    docsOpen: false,
    ai: false,
    ...o,
  };
}

export function detectType(n: string): string {
  const s = n.toLowerCase();
  if (s.includes("minute")) return "Meeting minutes";
  if (/budget|cost|estimate/.test(s)) return "Budget document";
  if (/rfp|bid/.test(s)) return "RFP";
  if (s.includes("grant")) return "Grant application";
  if (/assessment|study|feasib/.test(s)) return "Assessment";
  if (s.includes("proposal")) return "Proposal";
  return "Document";
}

export function deptShortOf(dept: string): string {
  const m: Record<string, string> = {
    "Planning, Zoning, and Land Development": "Planning",
    "Parks and Recreation": "Parks & Rec",
    "Police Department": "Police Dept",
    "Sewer Department": "Sewer Dept",
    "Building and Codes": "Building & Codes",
    "Finance Department": "Finance",
    "Garbage and Recycling": "Garbage & Recycling",
    "Township Secretary": "Secretary",
  };
  return m[dept] || dept;
}

export const UPLOAD_SHORTCUT_FILES = [
  "Board_Minutes_Jun2026.pdf",
  "Cook_School_Rd_RFP.docx",
  "Culvert_Budget.pdf",
];

export const DOC_FIXTURES: StageDoc[] = [
  { name: "Board_Resolution.pdf", size: "240 KB" },
  { name: "Site_Plan.pdf", size: "1.2 MB" },
  { name: "Cost_Estimate.xlsx", size: "88 KB" },
];

// ── Synthetic extraction (default = Cook School Road culvert) ────

const CULVERT_FIELDS: SampleFields = {
  title: "Cook School Road Culvert Replacement",
  category: "Infrastructure",
  desc: "Replacement of the aging Cook School Road culvert to prevent flooding and restore two-lane traffic.",
  funding: "PennDOT + Capital Reserve",
  cost: "$310,000",
  sponsor: "Public Works Dept",
  duration: "May 2026 – Sep 2026",
};

const CULVERT_STAGES: SampleStage[] = [
  { title: "Engineering & Permits", start: "May 2026", end: "Jun 2026", summary: "Design is completed and DEP stream permits are secured.", bullets: ["Survey complete", "DEP permit applied"] },
  { title: "Bid & Award", start: "Jun 2026", end: "Jul 2026", summary: "A contractor is selected through competitive bidding.", bullets: ["RFP issued"] },
  { title: "Construction", start: "Jul 2026", end: "Sep 2026", summary: "The culvert is replaced and the road restored.", bullets: ["Not started"] },
];

/**
 * Builds an ExtractMeta from a sample document set (or the default
 * culvert project) — the document paragraphs on the left of step 2
 * are synthesized from the fields/stages, per the prototype's
 * synthExtract().
 */
export function synthExtract(sample: CreateSample | null, dept: string): ExtractMeta {
  const f = sample ? sample.fields : CULVERT_FIELDS;
  const sst = sample ? sample.stages : CULVERT_STAGES;
  const docs: [string, string][] = sample
    ? sample.files.map((x) => [x[0], x[1]] as [string, string])
    : UPLOAD_SHORTCUT_FILES.map((n) => [n, detectType(n)] as [string, string]);

  const paras: ExtractPara[] = [];
  let pid = 0;
  const push = (kind: "h1" | "h2" | "p", text: string, page: number) => {
    paras.push({ id: pid++, kind, text, page });
  };

  const fundingPara = `Funding: ${f.funding}. Estimated total project cost: ${f.cost}. Sponsored by the ${f.sponsor}.`;
  push("h1", f.title, 1);
  push("p", f.desc, 1);
  push("h2", "Funding", 1);
  push("p", fundingPara, 1);
  push("h2", "Process & Timeline", 1);

  const stages: ExtractStageMeta[] = sst.map((s, i) => {
    const page = 2 + Math.floor(i / 4);
    const dates = s.end && s.end !== s.start ? `${s.start} – ${s.end}` : s.start;
    const text = `Step ${i + 1} — ${s.title} (${dates}). ${s.summary}`;
    const paraId = pid;
    push("p", text, page);
    return {
      title: s.title,
      start: s.start,
      end: s.end === s.start ? "" : s.end,
      summary: s.summary,
      bullets: [...s.bullets],
      conf: "high",
      section: `Step ${i + 1}`,
      passage: text,
      reasoning: `Mapped from process step ${i + 1}.`,
      paraId,
    };
  });

  const F = (
    value: string,
    conf: Conf,
    section: string,
    passage: string,
    reasoning: string,
    paraId: number
  ): ExtractFieldMeta => ({ value, conf, section, passage, reasoning, paraId });

  return {
    docs,
    paras,
    pageCount: paras[paras.length - 1]?.page ?? 1,
    fields: {
      title: F(f.title, "high", "Document title", f.title, "Extracted directly from the document title.", 0),
      category: F(f.category, "high", "Overview", f.desc, "Classified from the document overview.", 1),
      department: F(dept, "high", "Overview", f.desc, "Matched to the department authoring this project.", 1),
      desc: F(f.desc, "high", "Overview", f.desc, "Synthesized from the document overview.", 1),
      funding: F(f.funding, "high", "Funding", fundingPara, "Extracted from the Funding section.", 3),
      cost: F(f.cost, "med", "Funding", `Estimated total project cost: ${f.cost}.`, "Read from the estimate in the funding section.", 3),
      sponsor: F(f.sponsor, "high", "Funding", `Sponsored by the ${f.sponsor}.`, "Identified as the sponsoring department.", 3),
      duration: F(f.duration, "low", "Process timeline", "Derived from the process step dates", "Estimated from the earliest and latest dates across the process steps.", 4),
    },
    stages,
  };
}

// ── Style tokens ─────────────────────────────────────────────────

export const btnSecondary: React.CSSProperties = {
  height: 38,
  padding: "0 18px",
  borderRadius: 9999,
  background: "#fff",
  border: "1px solid #e5e7eb",
  color: "#475569",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

export const btnPrimary: React.CSSProperties = {
  ...btnSecondary,
  background: "#0d2240",
  border: "1px solid #0d2240",
  color: "#fff",
};

export const btnPurple: React.CSSProperties = {
  ...btnSecondary,
  background: "#0d2240",
  border: "1px solid #0d2240",
  color: "#fff",
  height: 42,
};

export const btnDangerOutline: React.CSSProperties = {
  ...btnSecondary,
  border: "1px solid #F2C6B3",
  color: "#CD481B",
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontSize: 13.5,
  color: "#111827",
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: "auto",
  minHeight: 74,
  padding: "10px 12px",
  resize: "vertical",
  lineHeight: 1.55,
};

export const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
};

export const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.5)",
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

export const fieldLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
};

export const stickyFooterStyle: React.CSSProperties = {
  position: "sticky",
  bottom: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0 18px",
  background: "#f9fafb",
  marginTop: 18,
  zIndex: 5,
};

/** Small "View source" control (step 3 field rows / step 4 stage cards). */
export const ctrlSrcStyle: React.CSSProperties = {
  height: 24,
  padding: "0 9px",
  borderRadius: 6,
  background: "#fff",
  border: "1px solid #e5e7eb",
  color: "#475569",
  fontSize: 10.5,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  transition: "all 0.15s ease",
};

// ── Local icons (create-screen namespace) ────────────────────────

interface LIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function SparkleIcon({ size = 14, color = "#2563eb" }: LIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2l1.9 5.8L20 9l-5.8 1.9L12 17l-1.9-5.8L4 9l5.8-1.2z" />
    </svg>
  );
}

export function FileTextIcon({ size = 15, color = "#2563eb", strokeWidth = 2 }: LIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function UploadTrayIcon({ size = 26, color = "#2563eb", strokeWidth = 2 }: LIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function InfoCircleIcon({ size = 15, color = "#64748B", strokeWidth = 2 }: LIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function WarnTriangleIcon({ size = 16, color = "#B45309", strokeWidth = 2 }: LIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CopyDocIcon({ size = 22, color = "#64748B", strokeWidth = 2 }: LIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function SpinnerRing({ size = 14, color = "#2563eb" }: LIconProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}33`,
        borderTopColor: color,
        borderRadius: "50%",
        display: "inline-block",
        animation: "twCreateSpin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ── Shared chips ─────────────────────────────────────────────────

export function AiChip({ label = "AI-suggested", fontSize = 9.5 }: { label?: string; fontSize?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize,
        fontWeight: 700,
        background: "#DBEAFE",
        color: "#2563eb",
        padding: "2px 8px",
        borderRadius: 9999,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <SparkleIcon size={9} color="#2563eb" />
      {label}
    </span>
  );
}

export function ConfidenceDot({ conf, fieldTip }: { conf?: Conf; fieldTip?: boolean }) {
  if (conf !== "high" && conf !== "low") return null;
  const high = conf === "high";
  const tip = high
    ? fieldTip
      ? "AI is confident about this field. Review at your discretion."
      : "AI is confident about this field"
    : fieldTip
      ? "AI is less certain. Review carefully."
      : "AI is less certain — review carefully";
  return (
    <span
      title={tip}
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: high ? "#DCFCE7" : "#FFEEDD",
        color: high ? "#16A34A" : "#B45309",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 700,
        flexShrink: 0,
        cursor: "help",
      }}
    >
      {high ? (
        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        "!"
      )}
    </span>
  );
}

/** Keyframes used across the wizard (inline so shared css stays untouched). */
export function WizardKeyframes() {
  return (
    <style>{`
      @keyframes twCreateSpin { to { transform: rotate(360deg); } }
      @keyframes twCreatePulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
      @keyframes twCreateGlow { 0%,100% { background-color: #F3EEFF; } 50% { background-color: #EAE2FF; } }
      @keyframes twCreateShimmer { 0% { background-position: -160px 0; } 100% { background-position: 160px 0; } }
      @keyframes twCreateFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      @keyframes twCreateFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(108vh) rotate(340deg); opacity: 0; } }
    `}</style>
  );
}
