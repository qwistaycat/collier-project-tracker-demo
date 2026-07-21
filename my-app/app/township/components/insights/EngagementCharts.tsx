"use client";

// ================================================================
//  Insights — engagement section: four metric cards (which toggle
//  their series on the multi-line chart) plus three inline-SVG
//  charts built from the prototype's exact Trends series data:
//  multi-line engagement, stacked columns by category, and a
//  normalized stacked sentiment area (AI mode only).
//  No chart libraries — plain SVG, Poppins labels.
// ================================================================

import { useState } from "react";
import { CAT_META, type StaffCategory } from "../../data";
import { InfoCircleIcon } from "./bars";
import {
  CAT_BASE,
  CHART_CATS,
  ENGAGEMENT_SERIES,
  QUARTERS,
  SENT_BASE,
} from "./insightsData";

// ── Shared bits ──────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "16px 18px",
        flex: 1,
        minWidth: 320,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{subtitle}</div>}
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 10 }}>
      {items.map((it) => (
        <span
          key={it.name}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#64748b" }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  );
}

function XLabels({ labels }: { labels: string[] }) {
  return (
    <div style={{ display: "flex", marginTop: 6 }}>
      {labels.map((l) => (
        <span key={l} style={{ flex: 1, textAlign: "center", fontSize: 10.5, color: "#94A3B8" }}>
          {l}
        </span>
      ))}
    </div>
  );
}

// ── Multi-line engagement chart ──────────────────────────────────

function MultiLineChart({ on }: { on: Record<string, boolean> }) {
  const w = 620;
  const h = 190;
  const visible = ENGAGEMENT_SERIES.filter((s) => on[s.key]);
  const yMax = Math.max(1, ...visible.flatMap((s) => s.pts)) * 1.1;
  const n = QUARTERS.length;
  const x = (i: number) => (i / (n - 1)) * w;
  const y = (v: number) => h - (v / yMax) * h;

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 190, display: "block" }}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={w} y1={h - h * f} y2={h - h * f} stroke="#F1F5F9" strokeWidth={1} />
        ))}
        {visible.map((s) => (
          <polyline
            key={s.key}
            points={s.pts.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* hover columns → native tooltips */}
        {QUARTERS.map((q, i) => {
          const left = i === 0 ? 0 : (x(i - 1) + x(i)) / 2;
          const right = i === n - 1 ? w : (x(i) + x(i + 1)) / 2;
          return (
            <rect key={q} x={left} y={0} width={right - left} height={h} fill="transparent">
              <title>{[q, ...visible.map((s) => `${s.name} ${s.pts[i]}`)].join(" · ")}</title>
            </rect>
          );
        })}
      </svg>
      <XLabels labels={QUARTERS} />
      <Legend items={ENGAGEMENT_SERIES.map((s) => ({ name: s.name, color: s.color }))} />
    </div>
  );
}

// ── Stacked columns by category ──────────────────────────────────

function StackedColumns() {
  const w = 640;
  const h = 180;
  const n = CAT_BASE.length;
  const gap = Math.min(16, 240 / n);
  const barW = (w - gap * (n - 1)) / n;
  const yMax = Math.max(...CAT_BASE.map((col) => col.reduce((a, v) => a + v, 0))) * 1.05;

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 180, display: "block" }}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={w} y1={h - h * f} y2={h - h * f} stroke="#F1F5F9" strokeWidth={1} />
        ))}
        {CAT_BASE.map((col, i) => {
          let cum = 0;
          return col.map((v, j) => {
            const segH = (v / yMax) * h;
            const rectY = h - cum - segH;
            cum += segH;
            const cat = CHART_CATS[j] as StaffCategory;
            return (
              <rect
                key={`${i}-${j}`}
                x={i * (barW + gap)}
                y={rectY}
                width={barW}
                height={Math.max(0.5, segH - 1.5)}
                fill={CAT_META[cat].color}
              >
                <title>{`${QUARTERS[i]} · ${cat}: ${v} comments`}</title>
              </rect>
            );
          });
        })}
      </svg>
      <XLabels labels={QUARTERS} />
      <Legend
        items={CHART_CATS.map((c) => ({ name: c, color: CAT_META[c as StaffCategory].color }))}
      />
    </div>
  );
}

// ── Normalized stacked sentiment area (AI mode only) ─────────────

const SENT_BANDS = [
  { key: "s", name: "Supportive", color: "#567A67" },
  { key: "m", name: "Mixed", color: "#FFAA55" },
  { key: "c", name: "Concerns", color: "#CD481B" },
] as const;

function SentimentArea({ aiMode }: { aiMode: boolean }) {
  const w = 560;
  const h = 160;
  const n = SENT_BASE.length;
  const x = (i: number) => (i / (n - 1)) * w;

  if (!aiMode) {
    return (
      <div
        style={{
          height: 190,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 12.5,
          color: "#94a3b8",
          background: "#f8fafc",
          border: "1px dashed #CBD5E1",
          borderRadius: 10,
        }}
      >
        <InfoCircleIcon /> Turn on AI Assistance to see sentiment trends.
      </div>
    );
  }

  // cumulative fractions per point: [0, s, s+m, 1]
  const bounds = SENT_BASE.map((p) => {
    const total = p.s + p.m + p.c;
    return [0, p.s / total, (p.s + p.m) / total, 1];
  });
  const y = (frac: number) => h - frac * h;

  const bandPath = (lower: number, upper: number) => {
    const top = bounds.map((b, i) => `${x(i)},${y(b[upper])}`);
    const bottom = bounds.map((b, i) => `${x(i)},${y(b[lower])}`).reverse();
    return `M${top.join(" L")} L${bottom.join(" L")} Z`;
  };

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 160, display: "block", borderRadius: 6, overflow: "hidden" }}
      >
        {SENT_BANDS.map((b, k) => (
          <path key={b.key} d={bandPath(k, k + 1)} fill={b.color} fillOpacity={0.85} />
        ))}
        {QUARTERS.map((q, i) => {
          const left = i === 0 ? 0 : (x(i - 1) + x(i)) / 2;
          const right = i === n - 1 ? w : (x(i) + x(i + 1)) / 2;
          const p = SENT_BASE[i];
          return (
            <rect key={q} x={left} y={0} width={right - left} height={h} fill="transparent">
              <title>{`${q} · Supportive ${p.s}% · Mixed ${p.m}% · Concerns ${p.c}%`}</title>
            </rect>
          );
        })}
      </svg>
      <XLabels labels={QUARTERS} />
      <Legend items={SENT_BANDS.map((b) => ({ name: b.name, color: b.color }))} />
    </div>
  );
}

// ── Metric cards ─────────────────────────────────────────────────

function MetricCard({
  name,
  color,
  pts,
  on,
  onToggle,
}: {
  name: string;
  color: string;
  pts: number[];
  on: boolean;
  onToggle: () => void;
}) {
  const [hover, setHover] = useState(false);
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const delta = Math.round(((last - prev) / prev) * 100);

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={on ? "Hide this series on the chart" : "Show this series on the chart"}
      style={{
        textAlign: "left",
        background: "#fff",
        border: `1px solid ${hover ? "#cbd5e1" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: "13px 16px",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "border-color 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: on ? color : "#CBD5E1",
            transition: "background 0.15s ease",
          }}
        />
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {name}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: on ? "#111827" : "#94a3b8",
          marginTop: 4,
          transition: "color 0.15s ease",
        }}
      >
        {last.toLocaleString()}
      </div>
      <div style={{ fontSize: 11.5, color: on ? "#567A67" : "#94a3b8", marginTop: 1 }}>
        +{delta}% vs prior quarter
      </div>
    </button>
  );
}

// ── Section ──────────────────────────────────────────────────────

export default function EngagementCharts({ aiMode }: { aiMode: boolean }) {
  const [on, setOn] = useState<Record<string, boolean>>({
    comments: true,
    follows: true,
    votes: true,
    dms: true,
  });

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Engagement</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
        Township-wide resident activity over the last 8 quarters.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          margin: "14px 0 10px",
        }}
      >
        {ENGAGEMENT_SERIES.map((s) => (
          <MetricCard
            key={s.key}
            name={s.name}
            color={s.color}
            pts={s.pts}
            on={on[s.key]}
            onToggle={() => setOn((o) => ({ ...o, [s.key]: !o[s.key] }))}
          />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ChartCard title="Engagement over time" subtitle="Comments, follows, poll votes, and DMs per quarter">
          <MultiLineChart on={on} />
        </ChartCard>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ChartCard title="Feedback by category" subtitle="Comments per quarter by project category">
            <StackedColumns />
          </ChartCard>
          <ChartCard title="Sentiment over time" subtitle="Share of classified comments per quarter">
            <SentimentArea aiMode={aiMode} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
