"use client";

// ================================================================
//  detail/shared — types, style tokens, local icons, and modal
//  primitives for the staff project-detail screen. Owned by the
//  detail-shell-details screen; FeedbackTab/PollsTab may import
//  freely but must not edit.
// ================================================================

import React from "react";
import type { Lifecycle, StaffProject, StaffStage } from "../../data";
import { STAFF_NAME } from "../../data";

// ── Extended runtime types ───────────────────────────────────────
// data.ts owns the seed shape; the detail screen tracks a few extra
// runtime-only fields (review feedback, docs, neighborhoods…). They
// ride along on the project object via casts — StaffProject stays
// the single source of truth for the seeded fields.

export interface ReviewFeedback {
  type: "changes" | "reject";
  by: string;
  note: string;
  when: string;
}

export interface ProjectExtras {
  docs?: string[];
  neighborhoods?: string;
  reviewFeedback?: ReviewFeedback | null;
  rejectedSub?: boolean;
  prevPublishedDate?: string;
  prevPublishedBy?: string;
  reopenedDate?: string;
  reopenedBy?: string;
}

export type XProject = StaffProject & ProjectExtras;

export type StageState = "Published" | "Draft" | "Hidden";
export type XStage = Omit<StaffStage, "state"> & { state: StageState };

/** Working copy of a stage inside the editor. */
export interface StageDraft {
  title: string;
  dates: string;
  desc: string;
  bullets: string[];
  state: StageState;
  ai?: boolean;
  aiFilled?: string[];
}

export const NEIGHBORHOOD_DEFAULT = "several neighborhoods across the township";

export function cleanDraft(s: XStage): StageDraft {
  return { title: s.title, dates: s.dates, desc: s.desc, bullets: [...s.bullets], state: s.state };
}

export function draftEq(a: StageDraft, b: StageDraft): boolean {
  return (
    a.title === b.title &&
    a.dates === b.dates &&
    a.desc === b.desc &&
    a.state === b.state &&
    a.bullets.join("\u0001") === b.bullets.join("\u0001")
  );
}

/** Patch a project immutably, optionally prepending a log entry. */
export function patchProject(
  updateProject: (id: string, u: (p: StaffProject) => StaffProject) => void,
  id: string,
  fields: Partial<XProject>,
  logText?: string
) {
  updateProject(id, (p) =>
    ({
      ...p,
      ...fields,
      ...(logText
        ? { log: [{ text: logText, time: "just now", by: STAFF_NAME }, ...p.log] }
        : {}),
    }) as StaffProject
  );
}

// ── Style tokens ─────────────────────────────────────────────────

export const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 18,
  marginBottom: 16,
};

export const labelCaps: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#94A3B8",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 6,
};

export function ghostBtn(h = 34): React.CSSProperties {
  return {
    height: h,
    padding: "0 14px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 600,
    color: "#475569",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    whiteSpace: "nowrap",
    transition: "background 0.15s ease, border-color 0.15s ease",
  };
}

export function primaryBtn(h = 36): React.CSSProperties {
  return { ...ghostBtn(h), background: "#0d2240", border: "1px solid #0d2240", color: "#fff" };
}

export function dangerBtn(h = 36): React.CSSProperties {
  return { ...ghostBtn(h), background: "#DC2626", border: "1px solid #DC2626", color: "#fff" };
}

export function dangerOutlineBtn(h = 34): React.CSSProperties {
  return { ...ghostBtn(h), border: "1px solid #FECACA", color: "#DC2626" };
}

export function amberOutlineBtn(h = 34): React.CSSProperties {
  return { ...ghostBtn(h), border: "1px solid #FDE68A", color: "#B45309" };
}

export function aiChipBtn(h = 32): React.CSSProperties {
  return {
    ...ghostBtn(h),
    background: "#F5F3FF",
    border: "1px solid #DDD6FE",
    color: "#7C3AED",
    fontSize: 12,
  };
}

export function fieldInput(editing: boolean, h = 38): React.CSSProperties {
  return editing
    ? {
        width: "100%",
        background: "#fff",
        border: "1px solid #CBD5E1",
        borderRadius: 8,
        padding: "0 10px",
        height: h,
        fontSize: 13.5,
        color: "#334155",
        fontFamily: "inherit",
      }
    : {
        width: "100%",
        background: "transparent",
        border: "1px solid transparent",
        padding: 0,
        height: 24,
        fontSize: 13.5,
        color: "#334155",
        fontFamily: "inherit",
        outline: "none",
      };
}

// ── Local icons (icons.tsx lacks these; defined here per rules) ──

interface LIP {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function S(p: LIP, children: React.ReactNode) {
  return (
    <svg
      width={p.size ?? 14}
      height={p.size ?? 14}
      viewBox="0 0 24 24"
      fill="none"
      stroke={p.color ?? "currentColor"}
      strokeWidth={p.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export const PencilIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ));

export const HourglassIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M6 2h12M6 22h12" />
      <path d="M8 2v4l4 4 4-4V2M8 22v-4l4-4 4 4v4" />
    </>
  ));

export const GlobeIcon = (p: LIP) =>
  S(p, (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
    </>
  ));

export const EyeOffIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </>
  ));

export const CheckCircleIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ));

export const ArchiveIcon = (p: LIP) =>
  S(p, (
    <>
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </>
  ));

export const TrashIcon = (p: LIP) =>
  S(p, (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ));

export const StarIcon = (p: LIP & { filled?: boolean }) => (
  <svg
    width={p.size ?? 12}
    height={p.size ?? 12}
    viewBox="0 0 24 24"
    fill={p.filled ? (p.color ?? "currentColor") : "none"}
    stroke={p.color ?? "currentColor"}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
  </svg>
);

export const SparkleIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15z" />
    </>
  ));

export const UploadIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ));

export const PeopleIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ));

export const ChatIcon = (p: LIP) =>
  S(p, <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);

export const BarsIcon = (p: LIP) =>
  S(p, (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ));

export const FileIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ));

export const LinkIcon = (p: LIP) =>
  S(p, (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ));

export function LcIcon({ lc, size = 12, color }: { lc: Lifecycle; size?: number; color?: string }) {
  const p = { size, color };
  switch (lc) {
    case "draft":
      return <PencilIcon {...p} />;
    case "pending":
      return <HourglassIcon {...p} />;
    case "published":
      return <GlobeIcon {...p} />;
    case "unpublished":
      return <EyeOffIcon {...p} />;
    case "completed":
      return <CheckCircleIcon {...p} />;
    case "archived":
      return <ArchiveIcon {...p} />;
    case "trash":
      return <TrashIcon {...p} />;
    default:
      return <GlobeIcon {...p} />;
  }
}

/** White spinner for busy buttons (uses the repo's Tailwind animate-spin). */
export function Spinner({ size = 13, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ── Modal primitives ─────────────────────────────────────────────

export function ModalShell({
  width,
  onClose,
  children,
  z = 60,
}: {
  width: number;
  onClose: () => void;
  children: React.ReactNode;
  z?: number;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: z,
        background: "rgba(15,23,42,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "88vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  width = 440,
  title,
  body,
  children,
  onClose,
  actions,
}: {
  width?: number;
  title: string;
  body?: React.ReactNode;
  children?: React.ReactNode;
  onClose: () => void;
  actions: React.ReactNode;
}) {
  return (
    <ModalShell width={width} onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{title}</div>
      {body && <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{body}</div>}
      {children}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        {actions}
      </div>
    </ModalShell>
  );
}
