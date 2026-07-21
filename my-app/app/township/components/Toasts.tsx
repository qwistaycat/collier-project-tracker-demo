"use client";

// ================================================================
//  Toasts — fixed bottom-right confirmation stack for staff
//  actions. Dark navy pills with a green check, auto-dismissed by
//  the context after 2600ms.
// ================================================================

import { useTownship } from "../TownshipContext";
import { CheckIcon } from "@/app/components/icons";

export default function Toasts() {
  const { toasts } = useTownship();
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 22,
        right: 22,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="township-toast"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "#0d2240",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 16px",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
            maxWidth: 380,
          }}
        >
          <span style={{ color: "#567A67", display: "flex", flexShrink: 0 }}>
            <CheckIcon size={14} />
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
