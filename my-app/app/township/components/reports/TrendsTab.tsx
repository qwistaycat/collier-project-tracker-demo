"use client";

// ================================================================
//  Reports › Trends — longitudinal engagement charts. All series
//  data verbatim from the prototype; AI mode adds per-chart note
//  strips and the sentiment-over-time card.
// ================================================================

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDownIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import { AiBadge, AiNote, CARD, ChartLineIcon, ExportButton, InfoCircleIcon, SparkleIcon } from "./shared";
import { AreaStackChart, MultiLineChart, StackedColumnChart } from "./charts";

// ── Quarterly data (verbatim) ────────────────────────────────────

const QLABELS = ["Q1 24", "Q2 24", "Q3 24", "Q4 24", "Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26"];

const ENG_SERIES = [
  { key: "comments", label: "Comments", color: "#2563EB", pts: [120, 140, 165, 185, 205, 235, 268, 305, 352, 405] },
  { key: "follows", label: "Follows", color: "#0891B2", pts: [80, 92, 108, 128, 150, 172, 196, 222, 251, 286] },
  { key: "votes", label: "Poll votes", color: "#B45309", pts: [210, 235, 262, 298, 338, 378, 416, 458, 502, 560] },
  { key: "dms", label: "DMs", color: "#0d2240", pts: [10, 13, 17, 21, 25, 30, 35, 41, 47, 54] },
] as const;

type EngKey = (typeof ENG_SERIES)[number]["key"];

const RESP_RATE = [64, 66, 68, 70, 72, 75, 77, 80, 82, 85];
const RESP_TIME = [5.4, 5.0, 4.6, 4.2, 3.9, 3.5, 3.2, 2.9, 2.6, 2.3];

const NB_SERIES = [
  { name: "Nevillewood", color: "#0d2240" },
  { name: "Ewingsville", color: "#2563EB" },
  { name: "Rennerdale", color: "#0891B2" },
  { name: "Beechmont", color: "#0D9488" },
  { name: "Presto", color: "#B45309" },
];
const NB_ROWS = [
  [30, 22, 18, 12, 8], [34, 26, 20, 14, 10], [40, 30, 22, 16, 12], [46, 34, 26, 18, 14], [52, 40, 30, 22, 17],
  [60, 46, 34, 26, 20], [70, 52, 40, 30, 24], [82, 60, 46, 34, 28], [95, 70, 54, 40, 33], [110, 82, 63, 47, 39],
];

const CAT_SERIES = [
  { name: "Roads", color: "#B45309" },
  { name: "Parks", color: "#567A67" },
  { name: "Infrastructure", color: "#2563EB" },
  { name: "Plan/Dev", color: "#0891B2" },
  { name: "Public Safety", color: "#CD481B" },
];
const CAT_ROWS = [
  [40, 30, 18, 14, 10], [46, 34, 20, 16, 12], [54, 40, 24, 20, 14], [62, 46, 28, 22, 16], [72, 54, 33, 26, 19],
  [84, 62, 38, 30, 22], [98, 72, 45, 34, 26], [112, 84, 52, 40, 30], [128, 96, 60, 46, 34], [146, 110, 70, 52, 40],
];

const SENT_ROWS = [
  { s: 52, m: 30, c: 18 }, { s: 54, m: 29, c: 17 }, { s: 50, m: 30, c: 20 }, { s: 48, m: 31, c: 21 }, { s: 53, m: 28, c: 19 },
  { s: 55, m: 27, c: 18 }, { s: 51, m: 29, c: 20 }, { s: 57, m: 26, c: 17 }, { s: 59, m: 25, c: 16 }, { s: 61, m: 24, c: 15 },
];

const RANGES = [
  { key: "6m", label: "Last 6 months", n: 3 },
  { key: "1y", label: "Last year", n: 5 },
  { key: "3y", label: "Last 3 years", n: 8 },
  { key: "5y", label: "Last 5 years", n: 10 },
  { key: "all", label: "All time", n: 10 },
];

const AI_NOTES = {
  engBold: "Comment volume spiked in Q4 2024 after the property-tax announcement.",
  eng: "Engagement has grown steadily by roughly 40% year over year, with the largest jumps in Q3 of each year.",
  resp: "Response rate climbed from 64% to 85% while average response time fell from 5.4 to 2.3 days — the Township is answering more residents, faster.",
  nb: "Engagement is broadening across neighborhoods rather than concentrating; Rennerdale and Beechmont more than doubled their share.",
  cat: "Roads and Parks remain the dominant topics, but Infrastructure engagement is rising as facility projects move forward.",
  sent: "Overall sentiment has warmed from 52% to 61% supportive over the period, tracking the Township's faster response times.",
};

const MANUAL_SENT_TEXT =
  "Sentiment-over-time requires AI classification of comments. Turn on AI Assistance to add the sentiment trend chart.";

const cardStyle: CSSProperties = { ...CARD, padding: "18px 20px", marginBottom: 16 };
const titleStyle: CSSProperties = { fontSize: 15, fontWeight: 600, color: "#111827" };

function SquareLegend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {items.map((it) => (
        <span
          key={it.name}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 2, background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  );
}

export default function TrendsTab() {
  const { aiMode } = useTownship();

  const [rangeKey, setRangeKey] = useState("3y");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [cmp, setCmp] = useState(false);
  const [engMode, setEngMode] = useState<"total" | "unique">("total");
  const [seriesOn, setSeriesOn] = useState<Record<EngKey, boolean>>({
    comments: true,
    follows: true,
    votes: true,
    dms: true,
  });

  const rangeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!rangeOpen) return;
    const handler = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [rangeOpen]);

  const range = RANGES.find((r) => r.key === rangeKey) || RANGES[2];
  const cut = <T,>(arr: T[]): T[] => arr.slice(-range.n);
  const labels = cut(QLABELS);

  const engVisible = ENG_SERIES.filter((s) => seriesOn[s.key]).map((s) => ({
    color: s.color,
    pts: cut([...s.pts]).map((v) => (engMode === "unique" ? Math.round(v * 0.62) : v)),
  }));

  return (
    <div>
      {/* Controls row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
        <div ref={rangeRef} style={{ position: "relative" }}>
          <button
            onClick={() => setRangeOpen((v) => !v)}
            style={{
              height: 36,
              padding: "0 13px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            {range.label}
            <ChevronDownIcon size={14} />
          </button>
          {rangeOpen && (
            <div
              style={{
                position: "absolute",
                top: 42,
                left: 0,
                width: 190,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                boxShadow: "0 16px 40px rgba(2,12,27,.16)",
                padding: 6,
                zIndex: 20,
              }}
            >
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setRangeKey(r.key);
                    setRangeOpen(false);
                  }}
                  className="township-menu-item"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 11px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: r.key === rangeKey ? "#0d2240" : "#374151",
                    background: "none",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setCmp((v) => !v)}
          style={{
            height: 36,
            padding: "0 13px",
            borderRadius: 8,
            border: `1px solid ${cmp ? "#0d2240" : "#e5e7eb"}`,
            background: cmp ? "#0d2240" : "#fff",
            color: cmp ? "#fff" : "#374151",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
          }}
        >
          <ChartLineIcon size={14} />
          Compare to previous period
        </button>

        <span style={{ flex: 1 }} />
        <ExportButton />
      </div>

      {/* Card 1 — Engagement over time */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={titleStyle}>Engagement over time</span>
          <span style={{ flex: 1 }} />
          <div style={{ background: "#F1F5F9", borderRadius: 8, padding: 3, display: "flex", gap: 2 }}>
            {(
              [
                { k: "total", l: "Total volume" },
                { k: "unique", l: "Unique residents" },
              ] as const
            ).map((o) => (
              <button
                key={o.k}
                onClick={() => setEngMode(o.k)}
                style={{
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: engMode === o.k ? "#fff" : "transparent",
                  color: engMode === o.k ? "#111827" : "#9ca3af",
                  boxShadow: engMode === o.k ? "0 1px 3px rgba(0,0,0,.12)" : "none",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Toggleable series legend */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 14px" }}>
          {ENG_SERIES.map((s) => {
            const on = seriesOn[s.key];
            return (
              <button
                key={s.key}
                onClick={() => setSeriesOn((v) => ({ ...v, [s.key]: !v[s.key] }))}
                style={{
                  height: 28,
                  padding: "0 11px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: "pointer",
                  border: `1px solid ${on ? s.color : "#e5e7eb"}`,
                  background: on ? s.color + "14" : "#fff",
                  color: on ? "#111827" : "#9ca3af",
                  transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: s.color,
                    opacity: on ? 1 : 0.35,
                  }}
                />
                {s.label}
              </button>
            );
          })}
        </div>

        <MultiLineChart series={engVisible} height={200} compare={cmp} />

        {aiMode && <AiNote bold={AI_NOTES.engBold} text={AI_NOTES.eng} />}
      </div>

      {/* Card 2 — Response performance over time */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <span style={titleStyle}>Response performance over time</span>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { name: "Response rate (%)", color: "#567A67" },
              { name: "Avg response time (days)", color: "#2563EB" },
            ].map((it) => (
              <span
                key={it.name}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}
              >
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: it.color }} />
                {it.name}
              </span>
            ))}
          </div>
        </div>
        <MultiLineChart
          series={[
            { color: "#567A67", pts: cut([...RESP_RATE]) },
            { color: "#2563EB", pts: cut([...RESP_TIME]).map((v) => v * 14) },
          ]}
          height={170}
        />
        {aiMode && <AiNote text={AI_NOTES.resp} />}
      </div>

      {/* Card 3 — Engagement by neighborhood over time */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <span style={titleStyle}>Engagement by neighborhood over time</span>
          <span style={{ flex: 1 }} />
          <SquareLegend items={NB_SERIES} />
        </div>
        <StackedColumnChart
          rows={cut([...NB_ROWS])}
          colors={NB_SERIES.map((s) => s.color)}
          labels={labels}
          height={190}
        />
        {aiMode && <AiNote text={AI_NOTES.nb} />}
      </div>

      {/* Card 4 — Category volume over time */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <span style={titleStyle}>Category volume over time</span>
          <span style={{ flex: 1 }} />
          <SquareLegend items={CAT_SERIES} />
        </div>
        <StackedColumnChart
          rows={cut([...CAT_ROWS])}
          colors={CAT_SERIES.map((s) => s.color)}
          labels={labels}
          height={190}
        />
        {aiMode && <AiNote text={AI_NOTES.cat} />}
      </div>

      {/* Card 5 — Sentiment over time (AI ON) / dashed placeholder (AI OFF) */}
      {aiMode ? (
        <div
          style={{
            background: "#FAFAFF",
            border: "1px solid #DDD6FE",
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <SparkleIcon size={15} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#5B21B6" }}>Sentiment over time</span>
            <AiBadge />
            <span style={{ flex: 1 }} />
            <SquareLegend
              items={[
                { name: "Supportive", color: "#567A67" },
                { name: "Mixed", color: "#FFAA55" },
                { name: "Concerns", color: "#CD481B" },
              ]}
            />
          </div>
          <AreaStackChart data={cut([...SENT_ROWS])} height={170} />
          <div style={{ fontSize: 12.5, color: "#5B21B6", marginTop: 12, lineHeight: 1.55 }}>
            {AI_NOTES.sent}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#f8fafc",
            border: "1px dashed #e5e7eb",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 12.5,
            color: "#9ca3af",
            display: "flex",
            gap: 9,
            alignItems: "center",
          }}
        >
          <InfoCircleIcon size={16} color="#9ca3af" />
          {MANUAL_SENT_TEXT}
        </div>
      )}
    </div>
  );
}
