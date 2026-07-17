"use client";

// ================================================================
//  Insights — "Which projects need your attention, and what
//  residents are saying about them." Filter dropdowns, a summary
//  strip, and a sortable projects table. The Sentiment / Overall
//  Sentiment / Top Theme columns require AI Assistance; with it
//  off they fall back to volume bars and "AI Assistance required".
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../lib/StaffContext";
import {
  insightsRow,
  respColor,
  type InsightsRow,
} from "../lib/utils";
import {
  Card,
  DropdownItem,
  DropdownPill,
  EmptyState,
  InfoTip,
  LcPill,
  SentimentBar,
} from "../components/ui";

type SortCol = "project" | "comments" | "sentiment" | "response" | "activity";

const TIME_OPTS = [
  { key: "all", label: "All time" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];
const SCOPE_OPTS = [
  { key: "all", label: "All departments" },
  { key: "dept", label: "This department" },
];
const STATUS_OPTS = [
  { key: "all", label: "All statuses" },
  { key: "published", label: "Published" },
  { key: "completed", label: "Completed" },
];

export default function InsightsScreen() {
  const { projects, aiMode, dept, openProj } = useStaff();
  const [time, setTime] = useState("all");
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [openMenu, setOpenMenu] = useState<"time" | "scope" | "status" | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>("comments");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows: InsightsRow[] = projects
    .filter((p) => p.lc === "published" || p.lc === "completed")
    .filter((p) => p.public.length + p.privateMsgs.length > 0 || p.themes.length > 0)
    .filter((p) => scope === "all" || p.dept === dept)
    .filter((p) => status === "all" || p.lc === status)
    .map(insightsRow);

  const sorted = [...rows].sort((a, b) => {
    let d = 0;
    if (sortCol === "project") d = a.p.title.localeCompare(b.p.title);
    if (sortCol === "comments") d = a.comments - b.comments;
    if (sortCol === "sentiment") d = a.p.sentiment.supportive - b.p.sentiment.supportive;
    if (sortCol === "response") d = a.respPct - b.respPct;
    if (sortCol === "activity") d = b.lastHours - a.lastHours;
    return sortDir === "asc" ? d : -d;
  });

  const maxComments = Math.max(1, ...rows.map((r) => r.comments));
  const sumComments = rows.reduce((s, r) => s + r.comments, 0);
  const sumUniq = rows.reduce((s, r) => s + r.uniq, 0);
  const wSup = weighted(rows, (r) => r.p.sentiment.supportive);
  const wMixed = weighted(rows, (r) => r.p.sentiment.mixed);
  const wConc = 100 - wSup - wMixed;
  const wResp = weighted(rows, (r) => r.respPct);

  const clickSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir(col === "project" ? "asc" : "desc");
    }
  };

  const clearFilters = () => {
    setTime("all");
    setScope("all");
    setStatus("all");
  };

  return (
    <main className="mx-auto w-full max-w-[1240px] px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827]">Insights</h1>
      <p className="mb-6 mt-0.5 text-xs text-[#64748B]">
        Which projects need your attention, and what residents are saying about them.
      </p>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <DropdownPill
          label={TIME_OPTS.find((o) => o.key === time)?.label ?? "All time"}
          open={openMenu === "time"}
          onToggle={() => setOpenMenu(openMenu === "time" ? null : "time")}
        >
          {TIME_OPTS.map((o) => (
            <DropdownItem
              key={o.key}
              label={o.label}
              active={time === o.key}
              onClick={() => {
                setTime(o.key);
                setOpenMenu(null);
              }}
            />
          ))}
        </DropdownPill>
        <DropdownPill
          label={SCOPE_OPTS.find((o) => o.key === scope)?.label ?? "All departments"}
          open={openMenu === "scope"}
          onToggle={() => setOpenMenu(openMenu === "scope" ? null : "scope")}
        >
          {SCOPE_OPTS.map((o) => (
            <DropdownItem
              key={o.key}
              label={o.label}
              active={scope === o.key}
              onClick={() => {
                setScope(o.key);
                setOpenMenu(null);
              }}
            />
          ))}
        </DropdownPill>
        <DropdownPill
          label={STATUS_OPTS.find((o) => o.key === status)?.label ?? "All statuses"}
          open={openMenu === "status"}
          onToggle={() => setOpenMenu(openMenu === "status" ? null : "status")}
        >
          {STATUS_OPTS.map((o) => (
            <DropdownItem
              key={o.key}
              label={o.label}
              active={status === o.key}
              onClick={() => {
                setStatus(o.key);
                setOpenMenu(null);
              }}
            />
          ))}
        </DropdownPill>
        <div className="flex-1" />
        <span className="text-xs text-[#94A3B8]">
          {rows.length} project{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No projects match your filters."
          action={
            <button
              onClick={clearFilters}
              className="cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          {/* Summary strip */}
          <Card className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-4">
            <SummaryStat value={String(rows.length)} label="Projects" />
            <Divider />
            <SummaryStat value={String(sumComments)} label="Comments" />
            <Divider />
            <SummaryStat value={String(sumUniq)} label="Residents" />
            {aiMode && (
              <>
                <Divider />
                <div>
                  <SentimentBar
                    supportive={wSup}
                    mixed={wMixed}
                    concerns={wConc}
                    width={160}
                    height={10}
                    title={`${wSup}% supportive · ${wMixed}% mixed · ${wConc}% concerns`}
                  />
                  <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Overall Sentiment
                  </div>
                </div>
              </>
            )}
            <Divider />
            <SummaryStat
              value={`${wResp}%`}
              label="Response Rate"
              valueColor={respColor(wResp)}
            />
          </Card>

          {/* Projects table */}
          <Card className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[2.1fr_1fr_1.2fr_1fr_2.4fr_1fr_1fr] gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                <HeaderCell label="Project" onClick={() => clickSort("project")} active={sortCol === "project"} dir={sortDir} />
                <HeaderCell label="Volume" onClick={() => clickSort("comments")} active={sortCol === "comments"} dir={sortDir} />
                <HeaderCell label="Sentiment" onClick={() => clickSort("sentiment")} active={sortCol === "sentiment"} dir={sortDir} />
                <div>Overall Sentiment</div>
                <div>Top Theme</div>
                <HeaderCell label="Response Rate" onClick={() => clickSort("response")} active={sortCol === "response"} dir={sortDir} />
                <HeaderCell label="Last Activity" onClick={() => clickSort("activity")} active={sortCol === "activity"} dir={sortDir} />
              </div>

              {sorted.map((r) => (
                <div
                  key={r.p.id}
                  onClick={() => openProj(r.p.id, { tab: "feedback" })}
                  className="grid cursor-pointer grid-cols-[2.1fr_1fr_1.2fr_1fr_2.4fr_1fr_1fr] items-center gap-4 border-b border-[#F1F5F9] px-5 py-4 text-xs transition-colors last:border-b-0 hover:bg-slate-50"
                >
                  {/* Project */}
                  <div>
                    <div className="text-sm font-semibold text-[#0F172A]">{r.p.title}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <LcPill lc={r.p.lc} />
                      <span className="text-[10px] text-[#94A3B8]">{r.p.deptShort}</span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div>
                    <span className="text-sm font-bold text-[#0F172A]">{r.comments}</span>{" "}
                    <span className="text-[11px] text-[#64748B]">comments</span>
                    <div className="text-[10px] text-[#94A3B8]">from {r.uniq} residents</div>
                  </div>

                  {/* Sentiment */}
                  <div>
                    {aiMode ? (
                      <SentimentBar
                        supportive={r.p.sentiment.supportive}
                        mixed={r.p.sentiment.mixed}
                        concerns={r.p.sentiment.concerns}
                        width={130}
                        height={10}
                      />
                    ) : (
                      <div
                        title="Comment volume relative to other projects"
                        className="h-2.5 w-[130px] overflow-hidden rounded-full bg-[#F1F5F9]"
                      >
                        <div
                          style={{ width: `${Math.round((r.comments / maxComments) * 100)}%` }}
                          className="h-full rounded-full bg-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Overall sentiment */}
                  <div>
                    {aiMode ? (
                      <span style={{ color: r.domColor }} className="text-xs font-bold">
                        {r.dom}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#94A3B8]">
                        Not classified{" "}
                        <InfoTip tip="Turn on AI Assistance to see sentiment classification." />
                      </span>
                    )}
                  </div>

                  {/* Top theme */}
                  <div className="pr-2">
                    {aiMode ? (
                      <span className="text-[11px] leading-relaxed text-[#475569]">
                        <span className="line-clamp-3">{r.themeText}</span>
                        {r.moreThemes.length > 0 && (
                          <span
                            title={r.moreThemes.join(", ")}
                            className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600"
                          >
                            +{r.moreThemes.length}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 italic text-[#94A3B8]">
                        AI Assistance required{" "}
                        <InfoTip tip="Turn on AI Assistance to see themes." />
                      </span>
                    )}
                  </div>

                  {/* Response rate */}
                  <div>
                    <span style={{ color: respColor(r.respPct) }} className="text-sm font-bold">
                      {r.respPct}%
                    </span>
                    <div className="text-[10px] text-[#94A3B8]">
                      {r.responded} of {r.comments} responded
                    </div>
                  </div>

                  {/* Last activity */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <CommentGlyph /> {r.lastLabel}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </main>
  );
}

function weighted(rows: InsightsRow[], pick: (r: InsightsRow) => number): number {
  const totalC = rows.reduce((s, r) => s + r.comments, 0) || 1;
  return Math.round(rows.reduce((s, r) => s + pick(r) * r.comments, 0) / totalC);
}

function SummaryStat({
  value,
  label,
  valueColor,
}: {
  value: string;
  label: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div style={{ color: valueColor }} className="text-xl font-bold text-[#0F172A]">
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-9 w-px bg-[#E2E8F0]" />;
}

function HeaderCell({
  label,
  onClick,
  active,
  dir,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer border-none bg-transparent p-0 text-left text-[10px] font-bold uppercase tracking-wider ${
        active ? "text-[#1E3A5F]" : "text-[#94A3B8] hover:text-[#475569]"
      }`}
    >
      {label} {active ? (dir === "asc" ? "↑" : "↓") : ""}
    </button>
  );
}

function CommentGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
