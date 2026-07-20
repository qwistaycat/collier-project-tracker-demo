"use client";

// ================================================================
//  Reports › Templates — 4 report templates: gallery, config form,
//  and a live document preview. Generate PDF/DOCX is simulated
//  (toast only). Narrative sections switch on AI Assistance.
// ================================================================

import { useState, type CSSProperties, type ReactNode } from "react";
import { useTownship } from "../../TownshipContext";
import { citAttr, STAFF_NAME, type StaffProject } from "../../data";
import { CARD, isLive } from "./shared";

// ── Template metadata (verbatim, incl. SVG icon path data) ───────

const TEMPLATES = [
  {
    id: "grant",
    name: "Grant Application Support Package",
    purpose:
      "Gather community-engagement data supporting a grant application for a project or category.",
    icon: "M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21 8 14 2 9.6h7.6z",
  },
  {
    id: "compplan",
    name: "Comprehensive Plan Data Package",
    purpose: "Aggregate multi-year community data for a section of the comprehensive plan.",
    icon: "M3 3h18v18H3zM3 9h18M9 21V9",
  },
  {
    id: "board",
    name: "Board Meeting Brief",
    purpose: "A one-page brief for an upcoming board vote on a specific project.",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    id: "annual",
    name: "Annual Community Report",
    purpose: "Public-facing yearly summary of engagement and outcomes.",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  },
];

type Section =
  | { kind: "text"; heading: string; body: string }
  | { kind: "stats"; heading: string }
  | { kind: "quotes"; heading: string; count: number }
  | { kind: "narrative"; heading: string; hint: string; ai: string };

function sectionsFor(
  id: string,
  proj: StaffProject,
  focus: string,
  live: StaffProject[]
): Section[] {
  const comments = proj.public.length + proj.privateMsgs.length;
  switch (id) {
    case "grant":
      return [
        { kind: "text", heading: "Project Overview", body: `${proj.title} — ${proj.desc}` },
        { kind: "stats", heading: "Community Engagement Statistics" },
        {
          kind: "narrative",
          heading: "Engagement Summary",
          hint: "Insert narrative describing the depth of community involvement",
          ai: `Over the life of ${proj.title}, the Township engaged ${proj.followers || 120} residents who submitted ${comments || 18} comments and cast hundreds of poll votes. This sustained participation demonstrates strong community investment and a transparent, accountable public process — exactly the civic engagement this grant program seeks to support.`,
        },
        { kind: "quotes", heading: "Notable Resident Quotes", count: 3 },
        {
          kind: "narrative",
          heading: "Township Accountability",
          hint: "Describe response rate and follow-through",
          ai: "The Township maintained an 85% response rate to resident comments, typically replying within three days — evidence of the responsive governance this funding will reinforce.",
        },
      ];
    case "compplan":
      return [
        {
          kind: "text",
          heading: "Multi-Year Sentiment Trends",
          body: `Sentiment on ${focus || "this topic"} has trended more supportive over the selected period, moving from 52% to 61% supportive.`,
        },
        { kind: "stats", heading: "Engagement Statistics" },
        {
          kind: "narrative",
          heading: "Cross-Project Themes",
          hint: "Summarize recurring themes across projects",
          ai: "Across roads, parks, and development projects, three themes recur: demand for safer streets, strong support for expanded green space, and consistent concern about property-tax impact. These themes should anchor the plan's goals.",
        },
        { kind: "quotes", heading: "Representative Resident Voices", count: 3 },
        {
          kind: "narrative",
          heading: "Neighborhood Engagement Equity",
          hint: "Note participation balance across neighborhoods",
          ai: "Participation is broadening: while Nevillewood remains the most active neighborhood, Rennerdale and Beechmont engagement has more than doubled, indicating the outreach strategy is reaching more of the community.",
        },
      ];
    case "board":
      return [
        {
          kind: "text",
          heading: "Current Sentiment Snapshot",
          body: `As of today, sentiment on ${proj.title} is 58% supportive, 27% mixed, and 15% concerns.`,
        },
        { kind: "stats", heading: "Engagement Statistics" },
        {
          kind: "narrative",
          heading: "Recent Comments Summary",
          hint: "Summarize the last two weeks of comments",
          ai: "In the past two weeks, comments have focused on detour timing and driveway access. Most residents support the work while asking for clearer advance notice — a straightforward operational fix.",
        },
        { kind: "quotes", heading: "Key Resident Quotes", count: 2 },
      ];
    default: {
      // annual
      const completed = live
        .filter((p) => p.lc === "completed")
        .map((p) => p.title)
        .join(", ");
      return [
        {
          kind: "text",
          heading: "Projects Completed This Year",
          body: completed || "Playground Resurfacing 2024, Wayfinding Signage Refresh",
        },
        { kind: "stats", heading: "Engagement Statistics" },
        {
          kind: "narrative",
          heading: "Year in Review",
          hint: "Write a public-friendly summary of the year",
          ai: "This year Collier Township deepened how it works with residents. Thousands of comments, follows, and poll votes shaped decisions on roads, parks, and public safety — and an 85% response rate meant residents heard back. Thank you for making local government a two-way conversation.",
        },
        { kind: "quotes", heading: "Notable Resident Voices", count: 3 },
      ];
    }
  }
}

// ── Small pieces ─────────────────────────────────────────────────

function TemplateIcon({ path, size = 20 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0d2240"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function GalleryCard({
  t,
  onClick,
}: {
  t: (typeof TEMPLATES)[number];
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hover ? "#0d2240" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: 22,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        boxShadow: hover ? "0 8px 24px rgba(2,12,27,.06)" : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#EFF3F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <TemplateIcon path={t.icon} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>{t.name}</div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginTop: 6, flex: 1 }}>
        {t.purpose}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0d2240", marginTop: 16 }}>
        Configure →
      </div>
    </div>
  );
}

const fieldLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
  display: "block",
};

const fieldInput: CSSProperties = {
  width: "100%",
  height: 38,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "0 11px",
  fontSize: 13.5,
  background: "#fff",
};

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: "#0d2240", marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export default function TemplatesTab() {
  const { projects, citations, aiMode, toast } = useTownship();

  const [template, setTemplate] = useState<string | null>(null);
  const [tmplProject, setTmplProject] = useState("road-paving");
  const [tmplRange, setTmplRange] = useState("Last year");
  const [tmplFocus, setTmplFocus] = useState("Traffic & safety");

  const live = projects.filter(isLive);

  // ── Gallery ──
  if (template === null) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {TEMPLATES.map((t) => (
          <GalleryCard
            key={t.id}
            t={t}
            onClick={() => {
              setTemplate(t.id);
              window.scrollTo(0, 0);
            }}
          />
        ))}
      </div>
    );
  }

  // ── Configure view ──
  const tmpl = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];
  const proj = live.find((p) => p.id === tmplProject) || live[0];
  if (!proj) return null;

  const sections = sectionsFor(tmpl.id, proj, tmplFocus, live);
  const votes = proj.poll ? proj.poll.support + proj.poll.oppose + proj.poll.neutral : 0;
  const stats = [
    { label: "Residents engaged", value: String(proj.followers || 120) },
    { label: "Comments received", value: String(proj.public.length + proj.privateMsgs.length || 18) },
    { label: "Poll votes", value: String(votes) },
    { label: "Response rate", value: "85%" },
  ];

  return (
    <div>
      <button
        onClick={() => setTemplate(null)}
        style={{
          fontSize: 13,
          color: "#64748b",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        ← All templates
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 22,
          alignItems: "start",
        }}
      >
        {/* Config card */}
        <div style={{ ...CARD, padding: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>{tmpl.name}</div>
          <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 4, lineHeight: 1.5 }}>
            {tmpl.purpose}
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={fieldLabel}>Project</label>
            <select
              value={proj.id}
              onChange={(e) => setTmplProject(e.target.value)}
              style={{ ...fieldInput, cursor: "pointer" }}
            >
              {live.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={fieldLabel}>Date range</label>
            <input
              type="text"
              value={tmplRange}
              onChange={(e) => setTmplRange(e.target.value)}
              style={fieldInput}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={fieldLabel}>Focus topics</label>
            <input
              type="text"
              value={tmplFocus}
              onChange={(e) => setTmplFocus(e.target.value)}
              style={fieldInput}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 20 }}>
            <button
              onClick={() => toast("Generating PDF — pulling live data from your projects…")}
              style={{
                height: 42,
                borderRadius: 8,
                border: "none",
                background: "#0d2240",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Generate PDF
            </button>
            <button
              onClick={() => toast("Generating DOCX — pulling live data from your projects…")}
              style={{
                height: 42,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Generate DOCX
            </button>
          </div>
        </div>

        {/* Preview card */}
        <div
          style={{
            ...CARD,
            padding: "32px 36px",
            boxShadow: "0 6px 24px rgba(2,12,27,.05)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: "#9ca3af",
            }}
          >
            Live preview
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 6 }}>
            {tmpl.name}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "#9ca3af",
              marginTop: 4,
              paddingBottom: 20,
              marginBottom: 24,
              borderBottom: "2px solid #0d2240",
            }}
          >
            Collier Township, PA · Prepared by {STAFF_NAME}
          </div>

          {sections.map((s) => (
            <div key={s.heading} style={{ marginBottom: 24 }}>
              <SectionHeading>{s.heading}</SectionHeading>

              {s.kind === "text" && (
                <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>{s.body}</div>
              )}

              {s.kind === "stats" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {stats.map((st) => (
                    <div
                      key={st.label}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
                        {st.value}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginTop: 2 }}>
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.kind === "quotes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {citations.slice(0, s.count).map((c) => (
                    <div
                      key={c.id}
                      style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: 14 }}
                    >
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "#374151",
                          fontStyle: "italic",
                          lineHeight: 1.55,
                        }}
                      >
                        “{c.quote}”
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                        — {citAttr(c)}
                      </div>
                    </div>
                  ))}
                  {citations.length === 0 && (
                    <div style={{ fontSize: 12.5, color: "#9ca3af", fontStyle: "italic" }}>
                      [No saved citations — add quotes on the Citations tab]
                    </div>
                  )}
                </div>
              )}

              {s.kind === "narrative" &&
                (aiMode ? (
                  <div
                    style={{
                      background: "#F5F3FF",
                      border: "1px solid #EDE9FE",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        background: "#7C3AED",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 9999,
                        display: "inline-block",
                        marginBottom: 8,
                      }}
                    >
                      AI-suggested
                    </span>
                    <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>{s.ai}</div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#FAFBFC",
                      border: "1px dashed #CBD5E1",
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 13,
                      color: "#9ca3af",
                      fontStyle: "italic",
                      lineHeight: 1.55,
                    }}
                  >
                    [{s.heading}: {s.hint}]
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
