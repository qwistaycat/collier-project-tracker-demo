"use client";

// ================================================================
//  PollCard — one poll: question/meta head row with status pill,
//  results grid (donut + support/oppose/neutral stat blocks +
//  verified-resident split), vote trend chart, and the action row
//  (Edit / Close / Reopen / Export).
// ================================================================

import { useState, type CSSProperties, type ReactNode } from "react";
import { statusStyleColors } from "@/app/township/data";
import PollDonut from "./PollDonut";
import PollTrendChart from "./PollTrendChart";
import { pctOf, type PollRecord } from "./pollData";

export function SmallBtn({
  children,
  onClick,
  danger = false,
  style,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 30,
        padding: "0 12px",
        background: hover ? "#f9fafb" : "#fff",
        border: `1px solid ${danger ? "#F2C6B3" : "#e5e7eb"}`,
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 600,
        color: danger ? "#CD481B" : "#374151",
        cursor: "pointer",
        transition: "background 0.15s ease, border-color 0.15s ease",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function StatBlock({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function PollCard({
  poll,
  onEdit,
  onSetStatus,
  onExport,
}: {
  poll: PollRecord;
  onEdit: () => void;
  onSetStatus: (status: "Active" | "Closed") => void;
  onExport: () => void;
}) {
  const { support, oppose, neutral, verified } = poll.poll;
  const total = support + oppose + neutral;
  const [pillColor, pillBg] = statusStyleColors(
    poll.status === "Closed" ? "Completed" : poll.status
  );

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
      }}
    >
      {/* Head row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            {poll.question}
          </div>
          {poll.desc ? (
            <div
              style={{ fontSize: 13, color: "#374151", marginTop: 4, lineHeight: 1.45 }}
            >
              {poll.desc}
            </div>
          ) : null}
          <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4 }}>
            {poll.opened}
            {poll.end ? ` · Closes ${poll.end}` : ""}
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 20,
              color: pillColor,
              background: pillBg,
              whiteSpace: "nowrap",
            }}
          >
            {poll.status}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
            {total} votes
          </span>
        </div>
      </div>

      {/* Results grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "160px 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PollDonut
            segments={[
              { value: support, color: "#16A34A" },
              { value: oppose, color: "#CD481B" },
              { value: neutral, color: "#94A3B8" },
            ]}
            size={150}
          />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <StatBlock
              value={support}
              color="#16A34A"
              label={`Support · ${pctOf(support, total)}`}
            />
            <StatBlock
              value={oppose}
              color="#CD481B"
              label={`Oppose · ${pctOf(oppose, total)}`}
            />
            <StatBlock
              value={neutral}
              color="#94A3B8"
              label={`Neutral · ${pctOf(neutral, total)}`}
            />
          </div>
          {/* Verified-voter split */}
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Verified residents: {verified.s} / {verified.o} / {verified.n}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div style={{ fontSize: 12, color: "#94a3b8", margin: "16px 0 6px" }}>
        Vote trend over time
      </div>
      <PollTrendChart points={poll.poll.trend} />

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <SmallBtn onClick={onEdit}>Edit Poll</SmallBtn>
        {poll.status === "Active" && (
          <SmallBtn onClick={() => onSetStatus("Closed")}>Close Poll</SmallBtn>
        )}
        {poll.status === "Closed" && (
          <SmallBtn onClick={() => onSetStatus("Active")}>Reopen Poll</SmallBtn>
        )}
        <SmallBtn onClick={onExport}>Export Results</SmallBtn>
      </div>
    </div>
  );
}
