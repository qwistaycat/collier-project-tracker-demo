"use client";

// ================================================================
//  StagePreviewDrawer — right-side "what residents see" preview of
//  the stage currently being edited. Live: re-renders from the
//  draft as the user types.
// ================================================================

import { useEffect } from "react";
import { useTownship } from "../../TownshipContext";
import { ghostBtn, type StageDraft } from "./shared";

interface Props {
  draft: StageDraft;
  isCurrent: boolean;
  dirty: boolean;
  onClose: () => void;
}

export default function StagePreviewDrawer({ draft, isCurrent, dirty, onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const { toast } = useTownship();
  const bullets = draft.bullets.filter((b) => b.trim());

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(15,23,42,.35)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "40%",
          minWidth: 380,
          maxWidth: 560,
          background: "#F8FAFC",
          boxShadow: "-12px 0 40px rgba(2,12,27,.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            Resident preview: {draft.title || "Untitled stage"}
          </div>
          <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 3 }}>
            This is what residents see when they open this stage in the project timeline.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => toast("Opening full resident view…")}
              style={ghostBtn(30)}
            >
              Open in full view ↗
            </button>
            <button onClick={onClose} style={ghostBtn(30)}>
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflow: "auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#111827" }}>
                {draft.title || "Untitled stage"}
              </div>
              {isCurrent && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#1D4ED8",
                    background: "#DBEAFE",
                    borderRadius: 5,
                    padding: "2px 7px",
                  }}
                >
                  Current
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 4 }}>
              {draft.dates && draft.dates !== "—" ? draft.dates : "Dates to be determined"}
            </div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginTop: 12 }}>
              {draft.desc || "No summary provided yet."}
            </div>
            {bullets.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                {bullets.map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#334155" }}>
                    <span style={{ color: "#16A34A", fontWeight: 700 }}>✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {dirty && (
            <div
              style={{
                marginTop: 14,
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 10,
                padding: "10px 13px",
                fontSize: 12,
                color: "#92400E",
              }}
            >
              Showing unsaved changes. Save the stage to publish these updates to residents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
