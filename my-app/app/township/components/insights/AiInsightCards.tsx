"use client";

// ================================================================
//  Insights — dismissible AI insight cards (AI mode only). Canned
//  strings from the prototype's aiInsights array; dismissing a
//  card removes it for the session. No toasts on this screen.
// ================================================================

import { useState } from "react";
import { CloseIcon } from "@/app/components/icons";
import { AI_INSIGHTS } from "./insightsData";

/** Sparkle glyph — the AI signifier (local to insights). */
function SparkleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={1.8}>
      <path strokeLinejoin="round" d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path strokeLinejoin="round" d="M19 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9z" />
    </svg>
  );
}

function InsightCard({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: "#EDE9FE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <SparkleIcon />
      </div>
      <div style={{ flex: 1, fontSize: 12.5, color: "#374151", lineHeight: 1.5 }}>{text}</div>
      <button
        onClick={onDismiss}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="Dismiss insight"
        style={{
          width: 24,
          height: 24,
          border: "none",
          background: hover ? "#f1f5f9" : "none",
          borderRadius: 6,
          color: hover ? "#64748b" : "#94a3b8",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s ease, color 0.15s ease",
        }}
      >
        <CloseIcon size={11} />
      </button>
    </div>
  );
}

export default function AiInsightCards() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = AI_INSIGHTS.map((text, i) => ({ text, i })).filter((x) => !dismissed.includes(x.i));

  if (!visible.length) return null;

  return (
    <div style={{ margin: "22px 0 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
          marginBottom: 10,
        }}
      >
        <SparkleIcon size={14} /> AI Insights
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 10,
        }}
      >
        {visible.map(({ text, i }) => (
          <InsightCard key={i} text={text} onDismiss={() => setDismissed((d) => [...d, i])} />
        ))}
      </div>
    </div>
  );
}
