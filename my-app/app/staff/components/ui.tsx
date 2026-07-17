"use client";

// ================================================================
//  Small shared UI atoms for the staff portal — modals, pills,
//  chips, segmented controls, avatars, sentiment bars, toasts.
//  Styling follows the project design system (Poppins via layout,
//  #E2E8F0 hairlines, 12px cards, 0.15s transitions).
// ================================================================

import React, { type ReactNode } from "react";
import type { Lifecycle, Sentiment } from "../lib/types";
import { avatarColor, initialsOf, lcMeta, sentMeta } from "../lib/utils";
import { useStaff } from "../lib/StaffContext";

export function Toasts() {
  const { toasts } = useStaff();
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DCFCE7] text-[10px] font-bold text-[#16A34A]">
            ✓
          </span>
          <span className="text-xs font-medium text-[#1E3A5F]">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  onClose,
  width = 480,
  children,
}: {
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0F172A]/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width, maxWidth: "100%" }}
        className="max-h-[88vh] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  body?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal onClose={onCancel} width={440}>
      <h3 className="mb-2 text-base font-bold text-[#111827]">{title}</h3>
      {body && <p className="mb-4 text-xs leading-relaxed text-[#64748B]">{body}</p>}
      {children}
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onCancel}
          className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`h-9 cursor-pointer rounded-lg border-none px-4 text-xs font-semibold text-white ${
            danger ? "bg-[#DC2626] hover:bg-[#B91C1C]" : "bg-[#1E3A5F] hover:bg-[#152a45]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function LcPill({ lc }: { lc: Lifecycle }) {
  const m = lcMeta(lc);
  return (
    <span
      style={{ color: m.color, backgroundColor: m.bg }}
      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
    >
      {m.label}
    </span>
  );
}

export function SentChip({ sent }: { sent: Sentiment }) {
  const m = sentMeta(sent);
  return (
    <span
      style={{ color: m.color, backgroundColor: m.bg }}
      className="rounded px-2 py-0.5 text-[10px] font-bold"
    >
      {m.label}
    </span>
  );
}

export function AiChip({ label = "AI-suggested" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 text-[9px] font-bold text-[#7C3AED]">
      ✦ {label}
    </span>
  );
}

export function Avatar({
  name,
  size = 32,
  bg,
  onClick,
}: {
  name: string;
  size?: number;
  bg?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        backgroundColor: bg ?? avatarColor(name),
        fontSize: size * 0.36,
      }}
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {initialsOf(name)}
    </div>
  );
}

/** Township seal avatar used for Official replies */
export function SealAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1E3A5F] font-bold text-white"
    >
      CT
    </div>
  );
}

export function SentimentBar({
  supportive,
  mixed,
  concerns,
  width = 140,
  height = 10,
  title,
}: {
  supportive: number;
  mixed: number;
  concerns: number;
  width?: number | string;
  height?: number;
  title?: string;
}) {
  return (
    <div
      title={title ?? `${supportive}% supportive · ${mixed}% mixed · ${concerns}% concerns`}
      style={{ width, height }}
      className="flex overflow-hidden rounded-full bg-slate-100"
    >
      <div style={{ width: `${supportive}%` }} className="bg-[#16A34A]" />
      <div style={{ width: `${mixed}%` }} className="bg-[#D97706]" />
      <div style={{ width: `${concerns}%` }} className="bg-[#DC2626]" />
    </div>
  );
}

export function FilterPill({
  label,
  active,
  onClick,
  activeColor = "#1E3A5F",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : undefined
      }
      className={`h-8 cursor-pointer rounded-full border px-3.5 text-xs font-semibold transition-colors ${
        active
          ? "text-white"
          : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: Array<{ key: T; label: string }>;
  value: T;
  onChange: (key: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex gap-1 rounded-lg bg-[#F1F5F9] p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`cursor-pointer rounded-md border-none font-semibold transition-colors ${
            size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
          } ${
            value === o.key
              ? "bg-white text-[#0f2d59] shadow-xs"
              : "bg-transparent text-[#64748B]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DropdownPill({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#0F172A]"
      >
        {label}
        <span className="text-[9px] text-[#94A3B8]">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-[60] min-w-[180px] rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full cursor-pointer rounded-lg border-none px-2.5 py-2 text-left text-xs ${
        active
          ? "bg-[#EFF6FF] font-semibold text-[#2563EB]"
          : "bg-transparent text-[#475569] hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[#E2E8F0] bg-white shadow-xs ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
      <div className="text-sm font-semibold text-[#475569]">{title}</div>
      {body && <p className="mx-auto mt-1 max-w-md text-xs text-[#94A3B8]">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function InfoTip({ tip }: { tip: string }) {
  return (
    <span className="custom-tooltip-wrap inline-flex">
      <span className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-[#CBD5E1] text-[9px] font-bold text-[#94A3B8]">
        i
      </span>
      <span className="custom-tooltip-text" style={{ whiteSpace: "normal", width: 220 }}>
        {tip}
      </span>
    </span>
  );
}
