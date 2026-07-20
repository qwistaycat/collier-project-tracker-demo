"use client";

// Generic confirm dialog — covers delete-reply, bulk moderation,
// and single moderation-action confirms on the Feedback tab.

import React from "react";
import { Overlay } from "./ui";

export default function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  variant = "navy",
  width = 420,
  z = 78,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  variant?: "navy" | "danger";
  width?: number;
  z?: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Overlay z={z} onClose={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width, maxWidth: "100%", background: "white", borderRadius: 14, padding: 24 }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{title}</div>
        <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.55, marginTop: 10 }}>
          {body}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 8,
              background: "white",
              border: "1px solid #e5e7eb",
              color: "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 8,
              background: variant === "danger" ? "#CD481B" : "#0d2240",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.15s ease",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
