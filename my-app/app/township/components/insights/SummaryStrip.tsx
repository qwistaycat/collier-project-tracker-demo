"use client";

// ================================================================
//  Insights — summary strip: one horizontal stat band above the
//  sentiment table. The "Overall sentiment" segment only renders
//  in AI mode.
// ================================================================

import { SentimentBar } from "./bars";
import { rColor, type SentSummary } from "./insightsData";

const LABEL: React.CSSProperties = {
  fontSize: 10.5,
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginTop: 3,
};

const NUM: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: "#111827" };

function Divider() {
  return <div style={{ width: 1, height: 34, background: "#e2e8f0" }} />;
}

export default function SummaryStrip({ summary, aiMode }: { summary: SentSummary; aiMode: boolean }) {
  const cell: React.CSSProperties = { padding: "0 24px" };
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        rowGap: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ ...cell, paddingLeft: 0 }}>
        <div style={NUM}>{summary.projects}</div>
        <div style={LABEL}>Projects</div>
      </div>
      <Divider />
      <div style={cell}>
        <div style={NUM}>{summary.comments}</div>
        <div style={LABEL}>Comments</div>
      </div>
      <Divider />
      <div style={cell}>
        <div style={NUM}>{summary.residents}</div>
        <div style={LABEL}>Residents</div>
      </div>
      {aiMode && (
        <>
          <Divider />
          <div style={{ ...cell, minWidth: 150 + 48 }}>
            <div style={{ paddingTop: 6 }}>
              <SentimentBar supportive={summary.sup} mixed={summary.mixed} concerns={summary.conc} />
            </div>
            <div style={{ ...LABEL, marginTop: 8 }}>Overall sentiment</div>
          </div>
        </>
      )}
      <Divider />
      <div style={cell}>
        <div style={{ ...NUM, color: rColor(summary.respPct) }}>{summary.respPct}%</div>
        <div style={LABEL}>Response rate</div>
      </div>
    </div>
  );
}
