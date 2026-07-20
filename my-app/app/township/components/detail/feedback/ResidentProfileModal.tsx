"use client";

// Resident profile popover — opened by clicking any commenter avatar.
// Contact details are deterministically fabricated from the name;
// engagement rows scan every project's comment lists.

import React, { useEffect, useMemo } from "react";
import { ChevronRightIcon, MapPinIcon } from "@/app/components/icons";
import { avatarColor, initialsOf, type StaffProject } from "@/app/township/data";
import { CopyIcon, Overlay } from "./ui";

const ZIPS = ["15106", "15142", "15017", "15057", "15071"];

function hashOf(name: string): number {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function MailIcon({ size = 15 }: { size?: number }) {
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
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  );
}

function PhoneIcon({ size = 15 }: { size?: number }) {
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
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

export default function ResidentProfileModal({
  name,
  projects,
  onClose,
  onOpenProject,
  onCopy,
}: {
  name: string;
  projects: StaffProject[];
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onCopy: (val: string) => void;
}) {
  // Escape closes (this modal has priority over others).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const h = hashOf(name);
  const zip = ZIPS[h % ZIPS.length];
  const email =
    String(name || "resident")
      .toLowerCase()
      .replace(/[^a-z]+/g, ".")
      .replace(/^\.+|\.+$/g, "") + "@email.com";
  const phone = `412-555-${1000 + (h % 9000)}`;

  const engagement = useMemo(
    () =>
      projects
        .map((p) => ({
          p,
          count: [...p.public, ...p.privateMsgs, ...p.hidden].filter((c) => c.name === name)
            .length,
        }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count),
    [projects, name]
  );

  const row = (icon: React.ReactNode, value: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#334155" }}>
      <span style={{ color: "#94A3B8", display: "inline-flex", flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        title="Copy"
        onClick={() => onCopy(value)}
        style={{
          background: "none",
          border: "none",
          color: "#94A3B8",
          cursor: "pointer",
          padding: 4,
          display: "inline-flex",
          transition: "color 0.15s ease",
        }}
      >
        <CopyIcon size={14} />
      </button>
    </div>
  );

  return (
    <Overlay z={78} onClose={onClose} align="top" dim="rgba(15,23,42,.35)">
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 320,
          maxWidth: "100%",
          background: "white",
          borderRadius: 14,
          padding: 18,
          boxShadow: "0 14px 34px rgba(2,12,27,.16)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              flexShrink: 0,
              background: avatarColor(name),
              color: "white",
              fontSize: 17,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {initialsOf(name)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{name}</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Collier Township resident</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 7,
              background: "white",
              border: "1px solid #e5e7eb",
              color: "#475569",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              alignSelf: "flex-start",
              transition: "all 0.15s ease",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {row(<MapPinIcon size={15} />, `ZIP: ${zip}`)}
          {row(<MailIcon size={15} />, email)}
          {row(<PhoneIcon size={15} />, phone)}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: "#94A3B8",
            margin: "16px 0 6px",
          }}
        >
          Engagement across projects
        </div>
        {engagement.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "#94A3B8", padding: "6px 0" }}>
            This resident has not commented on any projects yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 2 }}>
            {engagement.map(({ p, count }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenProject(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 6px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#0F172A",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.title}
                </span>
                <span style={{ fontSize: 12, color: "#94A3B8", flexShrink: 0 }}>{count}</span>
                <span style={{ color: "#94A3B8", display: "inline-flex", flexShrink: 0 }}>
                  <ChevronRightIcon size={14} />
                </span>
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            background: "#F8FAFC",
            margin: "16px -18px -18px",
            padding: "10px 18px",
            borderRadius: "0 0 14px 14px",
            fontSize: 11,
            color: "#94A3B8",
            lineHeight: 1.5,
          }}
        >
          This information is only visible to authorized township staff. Do not share resident
          contact information externally.
        </div>
      </div>
    </Overlay>
  );
}
