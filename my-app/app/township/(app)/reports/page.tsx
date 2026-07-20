"use client";

// ================================================================
//  /township/reports — Reports screen. Turns resident engagement
//  into material for grants, comprehensive plans, board briefings,
//  and annual reports. Four sub-tabs: Search / Trends / Citations /
//  Templates. Each tab component owns its local state (so switching
//  tabs resets the open template, matching the prototype).
// ================================================================

import { useState } from "react";
import SearchTab from "@/app/township/components/reports/SearchTab";
import TrendsTab from "@/app/township/components/reports/TrendsTab";
import CitationsTab from "@/app/township/components/reports/CitationsTab";
import TemplatesTab from "@/app/township/components/reports/TemplatesTab";
import { InfoCircleIcon } from "@/app/township/components/reports/shared";

type TabKey = "search" | "trends" | "citations" | "templates";

const TABS: { key: TabKey; label: string }[] = [
  { key: "search", label: "Search" },
  { key: "trends", label: "Trends" },
  { key: "citations", label: "Citations" },
  { key: "templates", label: "Templates" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabKey>("search");
  const [welcome, setWelcome] = useState(true);

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 28px 80px" }}>
      {/* Page header */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Reports</h1>
      <p style={{ fontSize: 13.5, color: "#64748b", maxWidth: 660, marginTop: 5, lineHeight: 1.5 }}>
        Turn resident engagement into support for grants, comprehensive plans, board briefings,
        and annual reports.
      </p>

      {/* Welcome banner (dismissible) */}
      {welcome && (
        <div
          style={{
            marginTop: 18,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <InfoCircleIcon size={18} style={{ marginTop: 2 }} />
          <div style={{ flex: 1, fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
            Reports helps you turn resident engagement data into support for grants, comprehensive
            plans, and board briefings. Start with <strong>Search</strong> to find what you need, or{" "}
            <strong>Templates</strong> to generate a formatted report.
          </div>
          <button
            onClick={() => setWelcome(false)}
            aria-label="Dismiss"
            style={{
              fontSize: 20,
              lineHeight: 1,
              color: "#94A3B8",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          margin: "20px 0 24px",
        }}
      >
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                height: 38,
                padding: "0 4px",
                marginRight: 24,
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${on ? "#0d2240" : "transparent"}`,
                fontSize: 14,
                fontWeight: 600,
                color: on ? "#111827" : "#64748b",
                cursor: "pointer",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "search" && <SearchTab />}
      {tab === "trends" && <TrendsTab />}
      {tab === "citations" && <CitationsTab />}
      {tab === "templates" && <TemplatesTab />}
    </main>
  );
}
