"use client";

// ================================================================
//  /township/insights — cross-project sentiment triage. Page
//  header, dismissible AI insight cards (AI mode), engagement
//  metric cards + charts, then the filterable/sortable project
//  sentiment table. Rows deep-link to the project detail's
//  Feedback tab. No modals and no toasts of its own.
// ================================================================

import { useMemo, useState } from "react";
import { useTownship } from "../../TownshipContext";
import AiInsightCards from "../../components/insights/AiInsightCards";
import EngagementCharts from "../../components/insights/EngagementCharts";
import FilterDropdown from "../../components/insights/FilterDropdown";
import SentimentTable from "../../components/insights/SentimentTable";
import SummaryStrip from "../../components/insights/SummaryStrip";
import {
  buildSentRows,
  buildSummary,
  sortSentRows,
  SCOPE_OPTIONS,
  STATUS_OPTIONS,
  TIME_OPTIONS,
  type SentScope,
  type SentSortKey,
  type SentStatus,
  type SentTime,
  type SortDir,
} from "../../components/insights/insightsData";

type OpenKey = "time" | "scope" | "status" | null;

export default function InsightsPage() {
  const { projects, aiMode, dept } = useTownship();

  // Note: the Time filter is label-only in the source prototype
  // (it never participates in row filtering) — kept as-is.
  const [time, setTime] = useState<SentTime>("all");
  const [scope, setScope] = useState<SentScope>("all");
  const [status, setStatus] = useState<SentStatus>("all");
  const [openDropdown, setOpenDropdown] = useState<OpenKey>(null);
  const [sort, setSort] = useState<SentSortKey>("comments");
  const [dir, setDir] = useState<SortDir>("desc");

  const rows = useMemo(
    () => sortSentRows(buildSentRows(projects, { scope, status, dept }), sort, dir),
    [projects, scope, status, dept, sort, dir]
  );
  const summary = useMemo(() => buildSummary(rows), [rows]);

  const onSort = (k: SentSortKey) => {
    if (sort === k && dir === "desc") {
      setDir("asc");
    } else {
      setSort(k);
      setDir("desc");
    }
  };

  const clearFilters = () => {
    setTime("all");
    setScope("all");
    setStatus("all");
  };

  const toggle = (k: Exclude<OpenKey, null>) => setOpenDropdown((o) => (o === k ? null : k));

  return (
    <div
      style={{
        maxWidth: 1220,
        margin: "0 auto",
        padding: "26px 28px 70px",
        animation: "townshipToastIn 0.32s ease both",
      }}
    >
      {/* Header */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Insights</h1>
      <p style={{ fontSize: 13.5, color: "#64748b", marginTop: 3, maxWidth: 620 }}>
        Which projects need your attention, and what residents are saying about them.
      </p>

      {/* AI insight cards (AI mode only, dismissible) */}
      {aiMode && <AiInsightCards />}

      {/* Engagement metric cards + charts */}
      <EngagementCharts aiMode={aiMode} />

      {/* Project sentiment */}
      <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 30 }}>
        Project sentiment
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          margin: "14px 0 16px",
        }}
      >
        <FilterDropdown
          options={TIME_OPTIONS}
          value={time}
          open={openDropdown === "time"}
          width={190}
          onToggle={() => toggle("time")}
          onClose={() => setOpenDropdown(null)}
          onPick={(v) => {
            setTime(v);
            setOpenDropdown(null);
          }}
        />
        <FilterDropdown
          options={SCOPE_OPTIONS}
          value={scope}
          open={openDropdown === "scope"}
          width={200}
          onToggle={() => toggle("scope")}
          onClose={() => setOpenDropdown(null)}
          onPick={(v) => {
            setScope(v);
            setOpenDropdown(null);
          }}
        />
        <FilterDropdown
          options={STATUS_OPTIONS}
          value={status}
          open={openDropdown === "status"}
          width={170}
          onToggle={() => toggle("status")}
          onClose={() => setOpenDropdown(null)}
          onPick={(v) => {
            setStatus(v);
            setOpenDropdown(null);
          }}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{rows.length} projects</span>
      </div>

      {rows.length > 0 ? (
        <>
          <SummaryStrip summary={summary} aiMode={aiMode} />
          <SentimentTable rows={rows} sort={sort} dir={dir} aiMode={aiMode} onSort={onSort} />
        </>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #CBD5E1",
            borderRadius: 12,
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
            No projects match your filters.
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
            Adjust your filters or clear them to see all projects.
          </div>
          <button
            onClick={clearFilters}
            style={{
              height: 36,
              padding: "0 16px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#0d2240",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
