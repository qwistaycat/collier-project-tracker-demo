"use client";

// ================================================================
//  Insights — the project sentiment table. One row per live
//  project with feedback; entire row clicks through to the
//  project detail's Feedback tab. Three columns swap content
//  between AI mode and manual mode.
// ================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InfoCircleIcon, SentimentBar, VolumeBar } from "./bars";
import type { SentRow, SentSortKey, SortDir } from "./insightsData";

const GRID = "2.1fr 1.1fr 1.4fr 1.1fr 3fr";

/** Insights-local lifecycle pill (deliberate blue/gray pair from the source). */
function StatusPill({ lc }: { lc: SentRow["lc"] }) {
  const completed = lc === "completed";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.3,
        padding: "2px 7px",
        borderRadius: 5,
        background: completed ? "#F1F5F9" : "#DBEAFE",
        color: completed ? "#64748B" : "#1D4ED8",
        whiteSpace: "nowrap",
      }}
    >
      {completed ? "Completed" : "Published"}
    </span>
  );
}

function HeaderCell({
  label,
  sortKey,
  sort,
  dir,
  onSort,
}: {
  label: string;
  sortKey?: SentSortKey;
  sort: SentSortKey;
  dir: SortDir;
  onSort: (k: SentSortKey) => void;
}) {
  const active = sortKey && sort === sortKey;
  return (
    <div
      onClick={sortKey ? () => onSort(sortKey) : undefined}
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: active ? "#64748b" : "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 0.3,
        cursor: sortKey ? "pointer" : "default",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        gap: 4,
        transition: "color 0.15s ease",
      }}
    >
      {label}
      {active && <span style={{ fontSize: 8, lineHeight: 1 }}>{dir === "desc" ? "▼" : "▲"}</span>}
    </div>
  );
}

function Row({ row, maxComments, aiMode }: { row: SentRow; maxComments: number; aiMode: boolean }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const volPct = maxComments ? Math.round((row.comments / maxComments) * 100) : 0;

  return (
    <div
      onClick={() => router.push(`/township/project/${row.id}?tab=feedback`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 14,
        padding: "15px 18px",
        borderBottom: "1px solid #f1f5f9",
        fontSize: 13,
        alignItems: "start",
        cursor: "pointer",
        background: hover ? "#f8fafc" : "#fff",
        transition: "background 0.15s ease",
      }}
    >
      {/* Project */}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
          {row.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
          <StatusPill lc={row.lc} />
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{row.deptShort}</span>
        </div>
      </div>

      {/* Volume */}
      <div>
        <div style={{ fontSize: 13.5 }}>
          <span style={{ fontWeight: 700, color: "#111827" }}>{row.comments}</span>{" "}
          <span style={{ color: "#64748b" }}>comments</span>
        </div>
        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
          from {row.uniq} residents
        </div>
      </div>

      {/* Sentiment bar */}
      <div style={{ paddingTop: 5 }}>
        {aiMode ? (
          <SentimentBar
            supportive={row.sentiment.supportive}
            mixed={row.sentiment.mixed}
            concerns={row.sentiment.concerns}
          />
        ) : (
          <VolumeBar pct={volPct} />
        )}
      </div>

      {/* Overall sentiment */}
      <div>
        {aiMode ? (
          <span style={{ fontSize: 13, fontWeight: 700, color: row.dom.color }}>{row.dom.word}</span>
        ) : (
          <span
            title="Turn on AI Assistance to see sentiment classification."
            style={{ fontSize: 12, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            Not classified <InfoCircleIcon />
          </span>
        )}
      </div>

      {/* Top theme */}
      <div>
        {aiMode ? (
          <span style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
            {row.themeText}
            {row.moreThemes.length > 0 && (
              <span
                title={`Also raised: ${row.moreThemes.join(", ")}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 22,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 5,
                  background: "#F1F5F9",
                  color: "#64748B",
                  fontSize: 11,
                  fontWeight: 700,
                  marginLeft: 6,
                  verticalAlign: "middle",
                }}
              >
                +{row.moreThemes.length}
              </span>
            )}
          </span>
        ) : (
          <span
            title="Turn on AI Assistance to see themes."
            style={{ fontSize: 11.5, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            AI Assistance required <InfoCircleIcon />
          </span>
        )}
      </div>
    </div>
  );
}

export default function SentimentTable({
  rows,
  sort,
  dir,
  aiMode,
  onSort,
}: {
  rows: SentRow[];
  sort: SentSortKey;
  dir: SortDir;
  aiMode: boolean;
  onSort: (k: SentSortKey) => void;
}) {
  const maxComments = rows.reduce((a, r) => Math.max(a, r.comments), 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          minWidth: 900,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 14,
            padding: "12px 18px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <HeaderCell label="Project" sortKey="project" sort={sort} dir={dir} onSort={onSort} />
          <HeaderCell label="Volume" sortKey="comments" sort={sort} dir={dir} onSort={onSort} />
          <HeaderCell label="Sentiment" sortKey="sentiment" sort={sort} dir={dir} onSort={onSort} />
          <HeaderCell label="Overall sentiment" sort={sort} dir={dir} onSort={onSort} />
          <HeaderCell label="Top theme" sort={sort} dir={dir} onSort={onSort} />
        </div>
        {rows.map((r) => (
          <Row key={r.id} row={r} maxComments={maxComments} aiMode={aiMode} />
        ))}
      </div>
    </div>
  );
}
