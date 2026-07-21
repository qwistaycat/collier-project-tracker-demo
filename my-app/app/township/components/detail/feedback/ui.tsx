"use client";

// ================================================================
//  Shared primitives for the project-detail Feedback tab.
//  Local to the detail/feedback namespace — icons that icons.tsx
//  lacks are defined here to avoid cross-screen merge conflicts.
// ================================================================

import React from "react";
import { ChevronDownIcon } from "@/app/components/icons";
import {
  avatarColor,
  initialsOf,
  sentColor,
  STAFF_NAME,
  type SentimentCode,
  type StaffReply,
} from "@/app/township/data";

// ── Local icons ──────────────────────────────────────────────────

export function SparkleIcon({ size = 14, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2l1.9 5.8L20 9l-5.8 1.9L12 17l-1.9-5.8L4 9l5.8-1.2z" />
    </svg>
  );
}

export function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// ── Avatars & badges ─────────────────────────────────────────────

/** Resident avatar circle — click opens the resident profile. */
export function ResidentAvatar({
  name,
  size = 30,
  onClick,
}: {
  name: string;
  size?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title="View resident profile"
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: avatarColor(name),
        color: "white",
        fontSize: Math.round(size * 0.36),
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontFamily: "inherit",
        transition: "opacity 0.15s ease",
      }}
    >
      {initialsOf(name)}
    </button>
  );
}

/** Staff avatar — navy "CT" seal for official attribution, blue initials otherwise. */
export function StaffAvatar({
  seal,
  name = STAFF_NAME,
  size = 28,
}: {
  seal: boolean;
  name?: string;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: seal ? "#0d2240" : "#2563EB",
        color: "white",
        fontSize: Math.round(size * 0.35),
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {seal ? "CT" : initialsOf(name)}
    </span>
  );
}

export function OfficialBadge() {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        color: "#1D4ED8",
        background: "#DBEAFE",
        padding: "1px 6px",
        borderRadius: 5,
        whiteSpace: "nowrap",
      }}
    >
      Official
    </span>
  );
}

export function SentPill({ sent }: { sent: SentimentCode }) {
  const [c, bg, label] = sentColor(sent);
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: c,
        background: bg,
        padding: "1px 7px",
        borderRadius: 5,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ── Reply display mapping ────────────────────────────────────────
// Seeded replies store only {dept, text, time}; attr defaults to
// "name" (Amy Medway) with the reply's dept as the sub-line. attr
// "dept" renders as the official Township seal.

export interface ReplyDisplay {
  seal: boolean;
  name: string;
  sub?: string;
  tooltip: string;
}

export function replyDisplay(r: StaffReply): ReplyDisplay {
  if (r.attr === "dept") {
    return { seal: true, name: "Township Staff (Official)", tooltip: "" };
  }
  const name = r.name || STAFF_NAME;
  return {
    seal: false,
    name,
    sub: r.dept,
    tooltip: `This response is from ${name}, Collier Township ${r.dept || "staff"}, an authorized Collier Township staff member.`,
  };
}

/** Official staff reply bubble — used in threads and the reply-modal preview. */
export function OfficialReplyBubble({
  r,
  actions,
}: {
  r: StaffReply;
  actions?: React.ReactNode;
}) {
  const d = replyDisplay(r);
  return (
    <div
      style={{
        background: "#F0F7FF",
        border: "1px solid #DBEAFE",
        borderRadius: 10,
        padding: "11px 13px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <StaffAvatar seal={d.seal} name={d.name} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              title={d.tooltip || undefined}
              style={{ fontSize: 12.5, fontWeight: 600, color: "#0d2240" }}
            >
              {d.name}
            </span>
            <OfficialBadge />
            {r.edited && <span style={{ fontSize: 10.5, color: "#94A3B8" }}>(edited)</span>}
          </div>
          {d.sub && <div style={{ fontSize: 11, color: "#64748B" }}>{d.sub}</div>}
        </div>
        <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{r.time}</span>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#334155",
          lineHeight: 1.5,
          marginTop: 7,
          whiteSpace: "pre-line",
        }}
      >
        {r.text}
      </div>
      {actions}
    </div>
  );
}

// ── Button / pill styles ─────────────────────────────────────────

export const btnNavy = (h = 30): React.CSSProperties => ({
  height: h,
  padding: "0 14px",
  borderRadius: 7,
  background: "#0d2240",
  color: "white",
  fontSize: h >= 32 ? 12.5 : 12,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s ease",
});

export const btnDanger = (h = 30): React.CSSProperties => ({
  height: h,
  padding: "0 12px",
  borderRadius: 7,
  background: "white",
  color: "#CD481B",
  fontSize: h <= 27 ? 11.5 : 12,
  fontWeight: 600,
  border: "1px solid #F2C6B3",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s ease",
});

export const btnNeutral = (h = 27): React.CSSProperties => ({
  height: h,
  padding: "0 12px",
  borderRadius: h <= 27 ? 6 : 7,
  background: "white",
  color: "#475569",
  fontSize: h <= 27 ? 11.5 : 12,
  fontWeight: 600,
  border: "1px solid #e5e7eb",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s ease",
});

export const btnGreen = (h = 30): React.CSSProperties => ({
  height: h,
  padding: "0 14px",
  borderRadius: 7,
  background: "#567A67",
  color: "white",
  fontSize: 12,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s ease",
});

/** Small filter pill — active = navy fill, per the design system. */
export function pillStyle(active: boolean): React.CSSProperties {
  return {
    height: 30,
    padding: "0 12px",
    borderRadius: 9999,
    fontSize: 12.5,
    fontWeight: 500,
    fontFamily: "inherit",
    background: active ? "#0d2240" : "white",
    color: active ? "white" : "#475569",
    border: active ? "1px solid #0d2240" : "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

// ── Sort dropdown ────────────────────────────────────────────────

export function SortMenu({
  label,
  open,
  onToggle,
  options,
  value,
  onPick,
  width = 160,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  options: { key: string; label: string }[];
  value: string;
  onPick: (key: string) => void;
  width?: number;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          height: 32,
          padding: "0 14px",
          borderRadius: 9999,
          background: "white",
          border: "1px solid #e5e7eb",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#475569",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "border-color 0.15s ease",
        }}
      >
        Sort: {label}
        <ChevronDownIcon size={14} />
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={onToggle} />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              width,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              boxShadow: "0 14px 34px rgba(2,12,27,.16)",
              padding: 6,
              zIndex: 41,
            }}
          >
            {options.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => onPick(o.key)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 7,
                  border: "none",
                  background: o.key === value ? "#F1F5F9" : "transparent",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#0F172A",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s ease",
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Modal overlay ────────────────────────────────────────────────

export function Overlay({
  z,
  onClose,
  children,
  align = "center",
  dim = "rgba(15,23,42,.5)",
}: {
  z: number;
  onClose: () => void;
  children: React.ReactNode;
  align?: "center" | "top";
  dim?: string;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: dim,
        zIndex: z,
        display: "flex",
        alignItems: align === "top" ? "flex-start" : "center",
        justifyContent: "center",
        padding: align === "top" ? "80px 16px 16px" : 16,
      }}
    >
      {children}
    </div>
  );
}
