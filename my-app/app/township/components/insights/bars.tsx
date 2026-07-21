"use client";

// ================================================================
//  Insights — tiny presentational primitives shared by the summary
//  strip and the sentiment table: the tri-segment sentiment bar,
//  the manual-mode volume bar, and the info-circle glyph.
// ================================================================

/** Tri-segment stacked sentiment bar with a native title tooltip. */
export function SentimentBar({
  supportive,
  mixed,
  concerns,
  maxWidth = 150,
}: {
  supportive: number;
  mixed: number;
  concerns: number;
  maxWidth?: number;
}) {
  return (
    <div
      title={`Supportive ${supportive}% · Mixed ${mixed}% · Concerns ${concerns}%`}
      style={{
        display: "flex",
        height: 9,
        maxWidth,
        borderRadius: 5,
        overflow: "hidden",
        background: "#EEF2F6",
      }}
    >
      <div style={{ width: `${supportive}%`, background: "#567A67" }} />
      <div style={{ width: `${mixed}%`, background: "#FFAA55" }} />
      <div style={{ width: `${concerns}%`, background: "#CD481B" }} />
    </div>
  );
}

/** Manual-mode gray relative-volume bar. */
export function VolumeBar({ pct, maxWidth = 150 }: { pct: number; maxWidth?: number }) {
  return (
    <div
      title="Comment volume relative to other projects"
      style={{
        height: 9,
        maxWidth,
        borderRadius: 5,
        overflow: "hidden",
        background: "#EEF2F6",
      }}
    >
      <div style={{ width: `${pct}%`, height: "100%", background: "#94A3B8", borderRadius: 5 }} />
    </div>
  );
}

/** Info-circle glyph (not in the shared icon set — local to insights). */
export function InfoCircleIcon({ size = 13, color = "#CBD5E1" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5" />
      <path strokeLinecap="round" d="M12 8h.01" />
    </svg>
  );
}
