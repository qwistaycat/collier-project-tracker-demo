"use client";

// ================================================================
//  Reports — "Turn resident engagement into support for grants,
//  comprehensive plans, board briefings, and annual reports."
//  Four sub-tabs:
//    Search    — query across projects / comments / poll results
//    Trends    — multi-year engagement charts with AI annotations
//    Citations — saved resident quotes, AI suggestions, drafting
//    Templates — report generators with a live preview
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../lib/StaffContext";
import type { Citation, Project } from "../lib/types";
import {
  CAT_BASE,
  CAT_TREND_COLORS,
  CAT_TREND_LABELS,
  ENG_SERIES,
  NB_BASE,
  NB_COLORS,
  NEIGHBORHOODS,
  QUARTER_LABELS,
  REPORT_TEMPLATES,
  RESP_RATE,
  RESP_TIME_DAYS,
  SENT_BASE,
  TREND_NOTES,
  TREND_RANGES,
  citAttr,
  type ReportTemplate,
} from "../lib/data";
import { CAT, CAT_FULL, STAFF_NAME, insHash, pollPct, pollTotal } from "../lib/utils";
import {
  AiChip,
  Card,
  DropdownItem,
  DropdownPill,
  EmptyState,
  FilterPill,
  Modal,
  SectionLabel,
} from "../components/ui";
import { AreaStack, MultiLine, StackCols } from "../components/charts";

type RptTab = "search" | "trends" | "citations" | "templates";

export default function ReportsScreen() {
  const { toast } = useStaff();
  const [tab, setTab] = useState<RptTab>("search");
  const [welcome, setWelcome] = useState(true);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827]">Reports</h1>
      <p className="mb-5 mt-0.5 text-xs text-[#64748B]">
        Turn resident engagement into support for grants, comprehensive plans, board
        briefings, and annual reports.
      </p>

      {welcome && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="flex-1 text-xs leading-relaxed text-[#475569]">
            Reports helps you turn resident engagement data into support for grants,
            comprehensive plans, and board briefings. Start with <strong>Search</strong> to
            find what you need, or <strong>Templates</strong> to generate a formatted report.
          </p>
          <button
            onClick={() => setWelcome(false)}
            className="cursor-pointer border-none bg-transparent font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-6 flex gap-1.5 border-b border-[#E2E8F0]">
        {(
          [
            ["search", "Search"],
            ["trends", "Trends"],
            ["citations", "Citations"],
            ["templates", "Templates"],
          ] as Array<[RptTab, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px cursor-pointer border-x-0 border-b-2 border-t-0 bg-transparent px-4 py-2.5 text-xs font-semibold transition-colors ${
              tab === key
                ? "border-b-[#1E3A5F] text-[#1E3A5F]"
                : "border-b-transparent text-[#64748B] hover:text-[#1E3A5F]"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => toast("Preparing export — choose CSV, PDF, or DOCX…")}
          className="mb-2 h-8 cursor-pointer self-center rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
        >
          ⤓ Export
        </button>
      </div>

      {tab === "search" && <SearchTab />}
      {tab === "trends" && <TrendsTab />}
      {tab === "citations" && <CitationsTab />}
      {tab === "templates" && <TemplatesTab />}
    </main>
  );
}

// ── Search ───────────────────────────────────────────────────────

function SearchTab() {
  const { projects, aiMode, openProj } = useStaff();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [type, setType] = useState("All");

  const q = query.trim().toLowerCase();
  const pool = projects.filter((p) => p.lc !== "trash");

  const projResults = pool
    .filter((p) => cat === "All" || p.cat === cat)
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

  const commentResults = pool
    .filter((p) => cat === "All" || p.cat === cat)
    .flatMap((p) =>
      [...p.public, ...p.privateMsgs].map((c) => ({ c, p }))
    )
    .filter(({ c }) => !q || c.text.toLowerCase().includes(q))
    .slice(0, 40);

  const pollResults = pool
    .filter((p) => cat === "All" || p.cat === cat)
    .flatMap((p) => p.polls.map((poll) => ({ poll, p })))
    .filter(({ poll }) => !q || poll.question.toLowerCase().includes(q));

  const showProj = type === "All" || type === "Projects";
  const showComments = type === "All" || type === "Comments";
  const showPolls = type === "All" || type === "Poll results";
  const hasResults =
    (showProj && projResults.length > 0) ||
    (showComments && commentResults.length > 0) ||
    (showPolls && pollResults.length > 0);

  const related = q
    ? pool.filter((p) => !projResults.includes(p)).slice(0, 3)
    : [];

  const highlight = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded bg-[#FEF08A] px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search across all projects, comments, and stages..."
        className="h-11 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-[#94A3B8]">Category</span>
        {["All", "Roads", "Parks", "Infrastructure", "Plan/Dev", "Public Safety"].map((c) => (
          <FilterPill key={c} label={c === "All" ? "All" : CAT_FULL[c]} active={cat === c} onClick={() => setCat(c)} />
        ))}
        <span className="mx-2 h-6 w-px bg-[#E2E8F0]" />
        <span className="text-[11px] font-semibold text-[#94A3B8]">Type</span>
        {["All", "Projects", "Comments", "Poll results"].map((t) => (
          <FilterPill key={t} label={t} active={type === t} onClick={() => setType(t)} />
        ))}
      </div>

      {aiMode && (
        <div className="rounded-xl border border-[#DDD6FE] bg-gradient-to-r from-[#F5F3FF] to-[#FAF9FF] p-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-bold text-[#5B21B6]">✦ AI summary of results</span>
            <AiChip label="AI" />
          </div>
          <p className="text-xs leading-relaxed text-[#5B21B6]">
            {q
              ? `Across ${projResults.length} matching project${projResults.length === 1 ? "" : "s"} and ${commentResults.length} comment${commentResults.length === 1 ? "" : "s"}, "${query.trim()}" comes up mostly in the context of construction timing and communication. Supportive comments emphasize schedule transparency; concerns center on short-term disruption.`
              : `Your ${pool.length} projects have drawn ${pool.reduce((s, p) => s + p.public.length + p.privateMsgs.length, 0)} comments this cycle. Engagement is strongest on Parks and Roads projects, and sentiment is broadly supportive with localized concerns about traffic and parking.`}
          </p>
        </div>
      )}

      {!hasResults ? (
        <EmptyState
          title="No results for the selected range and filters."
          body="Try a wider range or check your filters."
          action={
            <button
              onClick={() => {
                setQuery("");
                setCat("All");
                setType("All");
              }}
              className="cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          {showProj && projResults.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Projects · {projResults.length}
              </div>
              {projResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProj(p.id)}
                  className="flex w-full cursor-pointer items-center gap-4 border-none border-b border-[#F1F5F9] bg-transparent px-5 py-3 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#0F172A]">
                      {highlight(p.title)}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {p.followers} following · {p.public.length + p.privateMsgs.length} comments ·{" "}
                      {pollTotal(p.polls[0]?.poll ?? { support: 0, oppose: 0, neutral: 0 })} poll votes
                    </div>
                  </div>
                  <span
                    style={{ color: CAT[p.cat].color, backgroundColor: CAT[p.cat].bg }}
                    className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold"
                  >
                    {p.cat}
                  </span>
                  <span className="shrink-0 text-[11px] text-[#94A3B8]">2026</span>
                </button>
              ))}
            </Card>
          )}

          {showComments && commentResults.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Comments · {commentResults.length}
              </div>
              {commentResults.map(({ c, p }) => (
                <div
                  key={`${p.id}-${c.id}`}
                  className="flex items-start gap-3 border-b border-[#F1F5F9] px-5 py-3 last:border-b-0"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        c.sent === "green" ? "#16A34A" : c.sent === "red" ? "#DC2626" : "#D97706",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-[#374151]">{highlight(c.text)}</p>
                    <div className="mt-1 text-[10px] text-[#94A3B8]">
                      {c.anon ? "Anonymous" : c.name} · {p.title} · {c.time}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {showPolls && pollResults.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Poll results · {pollResults.length}
              </div>
              {pollResults.map(({ poll, p }) => {
                const total = pollTotal(poll.poll);
                return (
                  <div
                    key={`${p.id}-${poll.id}`}
                    className="border-b border-[#F1F5F9] px-5 py-3 last:border-b-0"
                  >
                    <div className="text-xs font-semibold text-[#0F172A]">{poll.question}</div>
                    <div className="mt-0.5 text-[11px] text-[#64748B]">
                      {pollPct(poll.poll.support, total)}% support ·{" "}
                      {pollPct(poll.poll.oppose, total)}% oppose ·{" "}
                      {pollPct(poll.poll.neutral, total)}% neutral · {total} votes
                    </div>
                  </div>
                );
              })}
            </Card>
          )}

          {aiMode && related.length > 0 && (
            <div>
              <SectionLabel>You might also look at…</SectionLabel>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {related.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProj(p.id)}
                    className="cursor-pointer rounded-xl border border-[#DDD6FE] bg-[#FAF9FF] p-3.5 text-left hover:border-[#C4B5FD]"
                  >
                    <div className="text-xs font-bold text-[#111827]">{p.title}</div>
                    <div className="mt-0.5 text-[10px] text-[#7C6FA6]">
                      Related {CAT_FULL[p.cat]} engagement
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Trends ───────────────────────────────────────────────────────

function TrendsTab() {
  const { aiMode } = useStaff();
  const [rangeKey, setRangeKey] = useState("3y");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const [engMode, setEngMode] = useState<"total" | "unique">("total");
  const [engOn, setEngOn] = useState<Record<string, boolean>>({
    comments: true,
    follows: true,
    votes: true,
    dms: true,
  });

  const range = TREND_RANGES.find((r) => r.key === rangeKey) ?? TREND_RANGES[2];
  const n = range.points;
  const labels = QUARTER_LABELS.slice(-n);
  const slice = (arr: number[]) => arr.slice(-n);
  const factor = engMode === "unique" ? 0.62 : 1;

  const engSeries = ENG_SERIES.filter((s) => engOn[s.key]).flatMap((s) => {
    const data = slice(s.data).map((v) => Math.round(v * factor));
    const out = [{ label: s.label, color: s.color, data }];
    if (compare)
      out.push({
        label: `${s.label} (prev)`,
        color: s.color,
        data: data.map((v) => Math.round(v * 0.78)),
        dashed: true,
      } as (typeof out)[number]);
    return out;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <DropdownPill
          label={range.label}
          open={rangeOpen}
          onToggle={() => setRangeOpen((v) => !v)}
        >
          {TREND_RANGES.map((r) => (
            <DropdownItem
              key={r.key}
              label={r.label}
              active={rangeKey === r.key}
              onClick={() => {
                setRangeKey(r.key);
                setRangeOpen(false);
              }}
            />
          ))}
        </DropdownPill>
        <button
          onClick={() => setCompare((v) => !v)}
          className={`h-9 cursor-pointer rounded-lg border px-3 text-xs font-semibold transition-colors ${
            compare
              ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
              : "border-[#E2E8F0] bg-white text-[#475569]"
          }`}
        >
          Compare to previous period
        </button>
      </div>

      {/* Engagement over time */}
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#111827]">Engagement over time</h3>
          <div className="flex gap-1 rounded-lg bg-[#F1F5F9] p-1">
            {(
              [
                ["total", "Total volume"],
                ["unique", "Unique residents"],
              ] as Array<["total" | "unique", string]>
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setEngMode(k)}
                className={`cursor-pointer rounded-md border-none px-3 py-1.5 text-xs font-semibold ${
                  engMode === k ? "bg-white text-[#0f2d59] shadow-xs" : "bg-transparent text-[#64748B]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {ENG_SERIES.map((s) => (
            <button
              key={s.key}
              onClick={() => setEngOn((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
              className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-opacity ${
                engOn[s.key]
                  ? "border-[#E2E8F0] bg-white text-[#475569]"
                  : "border-[#E2E8F0] bg-slate-50 text-[#94A3B8] opacity-60"
              }`}
            >
              <span style={{ backgroundColor: s.color }} className="h-2 w-2 rounded-full" />
              {s.label}
            </button>
          ))}
        </div>
        <MultiLine series={engSeries} labels={labels} />
        {aiMode && (
          <AiNote>
            <strong>{TREND_NOTES.engAnno}</strong> {TREND_NOTES.eng}
          </AiNote>
        )}
      </Card>

      {/* Response performance */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[#111827]">Response performance over time</h3>
        <div className="mb-3 flex gap-4 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-[#475569]">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> Response rate (%)
          </span>
          <span className="flex items-center gap-1.5 text-[#475569]">
            <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> Avg response time (days ×14)
          </span>
        </div>
        <MultiLine
          labels={labels}
          series={[
            { label: "Response rate", color: "#16A34A", data: slice(RESP_RATE) },
            {
              label: "Avg response time",
              color: "#2563EB",
              data: slice(RESP_TIME_DAYS).map((v) => Math.round(v * 14)),
            },
          ]}
        />
        {aiMode && <AiNote>{TREND_NOTES.resp}</AiNote>}
      </Card>

      {/* Neighborhoods */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[#111827]">
          Engagement by neighborhood over time
        </h3>
        <Legend items={NEIGHBORHOODS.map((nb, i) => [nb, NB_COLORS[i]])} />
        <StackCols cols={NB_BASE.slice(-n)} colors={NB_COLORS} labels={labels} />
        {aiMode && <AiNote>{TREND_NOTES.nbhd}</AiNote>}
      </Card>

      {/* Categories */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[#111827]">Category volume over time</h3>
        <Legend items={CAT_TREND_LABELS.map((c, i) => [c, CAT_TREND_COLORS[i]])} />
        <StackCols cols={CAT_BASE.slice(-n)} colors={CAT_TREND_COLORS} labels={labels} />
        {aiMode && <AiNote>{TREND_NOTES.cat}</AiNote>}
      </Card>

      {/* Sentiment over time */}
      {aiMode ? (
        <Card className="border-[#DDD6FE] p-5">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#111827]">Sentiment over time</h3>
            <AiChip label="AI" />
          </div>
          <Legend
            items={[
              ["Supportive", "#16A34A"],
              ["Mixed", "#D97706"],
              ["Concerns", "#DC2626"],
            ]}
          />
          <AreaStack points={SENT_BASE.slice(-n)} labels={labels} />
          <AiNote>{TREND_NOTES.sent}</AiNote>
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-xs text-[#64748B]">
          Sentiment-over-time requires AI classification of comments. Turn on AI Assistance to
          add the sentiment trend chart.
        </div>
      )}
    </div>
  );
}

function Legend({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="mb-3 flex flex-wrap gap-3 text-[11px] font-semibold text-[#475569]">
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span style={{ backgroundColor: color }} className="h-2 w-2 rounded-full" />
          {label}
        </span>
      ))}
    </div>
  );
}

function AiNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] p-3 text-[11px] leading-relaxed text-[#5B21B6]">
      ✦ {children}
    </div>
  );
}

// ── Citations ────────────────────────────────────────────────────

function CitationsTab() {
  const { citations, setCitations, projects, aiMode, toast } = useStaff();
  const [query, setQuery] = useState("");
  const [sentFilter, setSentFilter] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftPara, setDraftPara] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = citations
    .filter(
      (c) =>
        !q || c.quote.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
    )
    .filter((c) => sentFilter === "All" || c.sentW === sentFilter.toLowerCase());

  const savedQuotes = new Set(citations.map((c) => c.quote));
  const suggested = aiMode
    ? projects
        .filter((p) => p.lc !== "trash")
        .flatMap((p) => p.public.map((c) => ({ c, p })))
        .filter(
          ({ c }) =>
            (c.sent === "green" || c.sent === "red") &&
            !savedQuotes.has(c.text) &&
            !dismissed.includes(c.id + c.text)
        )
        .slice(0, 3)
    : [];

  const addCitation = (text: string, name: string, anon: boolean, project: Project, sent: string) => {
    const cit: Citation = {
      id: `ct-${insHash(text + project.id)}`,
      quote: text,
      attrLevel: anon ? "anon" : "first",
      name: anon ? "" : name,
      nb: NEIGHBORHOODS[insHash(project.id) % NEIGHBORHOODS.length],
      tags: [project.cat],
      project: project.title,
      projId: project.id,
      date: "Jul 2026",
      sentW: sent === "green" ? "supportive" : sent === "red" ? "concerns" : "mixed",
    };
    setCitations((prev) => [cit, ...prev]);
    toast("Citation saved");
  };

  const draftParagraph = () => {
    const chosen = citations.filter((c) => selected.includes(c.id));
    if (!chosen.length) {
      toast("Select at least one citation first");
      return;
    }
    setDrafting(true);
    setTimeout(() => {
      const quotes = chosen.map((c) => `"${c.quote}" (${citAttr(c)})`).join(" ");
      setDraftPara(
        `Resident voices collected through Collier Connect speak directly to this effort. ${quotes} Together, these comments show a community that is engaged, informed, and invested in the outcome.`
      );
      setDrafting(false);
    }, 1200);
  };

  const sentColorOf = (s: Citation["sentW"]) =>
    s === "supportive" ? "#16A34A" : s === "concerns" ? "#DC2626" : "#D97706";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search within saved quotes…"
          className="h-9 w-64 rounded-lg border border-[#E2E8F0] px-3 text-xs outline-none"
        />
        {["All", "Supportive", "Mixed", "Concerns"].map((s) => (
          <FilterPill key={s} label={s} active={sentFilter === s} onClick={() => setSentFilter(s)} />
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setModalOpen(true)}
          className="h-9 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3.5 text-xs font-semibold text-white hover:bg-[#152a45]"
        >
          + Add citation from comments
        </button>
      </div>

      {/* AI-suggested citations */}
      {aiMode && suggested.length > 0 && (
        <Card className="border-[#DDD6FE] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-bold text-[#5B21B6]">✦ AI-suggested citations</span>
            <AiChip label="AI" />
          </div>
          <div className="flex flex-col gap-2.5">
            {suggested.map(({ c, p }) => (
              <div key={c.id + p.id} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: c.sent === "green" ? "#16A34A" : "#DC2626" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs italic text-[#374151]">&ldquo;{c.text}&rdquo;</p>
                  <div className="text-[10px] text-[#94A3B8]">
                    {c.anon ? "Anonymous" : c.name} · {p.title}
                  </div>
                </div>
                <button
                  onClick={() => addCitation(c.text, c.name, c.anon, p, c.sent)}
                  className="h-7 shrink-0 cursor-pointer rounded-lg border-none bg-[#7C3AED] px-3 text-[11px] font-semibold text-white hover:bg-[#6b21a8]"
                >
                  Add
                </button>
                <button
                  onClick={() => setDismissed((d) => [...d, c.id + c.text])}
                  className="h-7 shrink-0 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-[11px] font-semibold text-[#475569]"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-[#64748B]">
          {visible.length} citation{visible.length === 1 ? "" : "s"}
        </span>
        {aiMode && selected.length > 0 && (
          <button
            onClick={draftParagraph}
            className="h-8 cursor-pointer rounded-lg border-none bg-[#7C3AED] px-3 text-xs font-semibold text-white hover:bg-[#6b21a8]"
          >
            {drafting ? "Drafting…" : `✦ Draft paragraph with these quotes (${selected.length})`}
          </button>
        )}
      </div>

      {draftPara && (
        <Card className="border-[#DDD6FE] p-4">
          <div className="mb-2 flex items-center justify-between">
            <AiChip label="AI-drafted" />
            <button
              onClick={() => setDraftPara(null)}
              className="cursor-pointer border-none bg-transparent text-[11px] font-semibold text-[#94A3B8] hover:text-[#475569]"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[#374151]">{draftPara}</p>
        </Card>
      )}

      {visible.length === 0 ? (
        <EmptyState
          title="No citations saved yet."
          body="Save memorable resident quotes from any comment so they're ready when you need them."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Browse recent comments
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 cursor-pointer accent-[#7C3AED]"
                  checked={selected.includes(c.id)}
                  onChange={(e) =>
                    setSelected((sel) =>
                      e.target.checked ? [...sel, c.id] : sel.filter((x) => x !== c.id)
                    )
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-relaxed text-[#111827]">
                    <span
                      style={{ backgroundColor: sentColorOf(c.sentW) }}
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    />
                    &ldquo;{c.quote}&rdquo;
                  </p>
                  <div className="mt-1 text-[11px] text-[#64748B]">— {citAttr(c)}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 border-t border-[#F1F5F9] pt-2.5 text-[11px] text-[#94A3B8]">
                    <span className="truncate">{c.project}</span>
                    <span>·</span>
                    <span>{c.date}</span>
                    <div className="flex-1" />
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard?.writeText(
                            `"${c.quote}" — ${citAttr(c)} (${c.project}, ${c.date})`
                          );
                        } catch {
                          // ignore clipboard failures in the demo
                        }
                        toast("Citation copied");
                      }}
                      className="cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold text-[#2563EB] hover:underline"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        setCitations((prev) => prev.filter((x) => x.id !== c.id));
                        setSelected((sel) => sel.filter((x) => x !== c.id));
                        toast("Citation removed");
                      }}
                      className="cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold text-[#DC2626] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add-citation modal */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} width={560}>
          <h3 className="mb-1 text-base font-bold text-[#111827]">Add citation from comments</h3>
          <p className="mb-4 text-xs text-[#64748B]">
            Attribution follows each resident&apos;s original public/anonymous setting.
          </p>
          <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
            {projects
              .filter((p) => p.lc !== "trash")
              .flatMap((p) => p.public.map((c) => ({ c, p })))
              .filter(({ c }) => !savedQuotes.has(c.text))
              .slice(0, 14)
              .map(({ c, p }) => (
                <div
                  key={p.id + c.id}
                  className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] p-3"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        c.sent === "green" ? "#16A34A" : c.sent === "red" ? "#DC2626" : "#D97706",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#374151]">{c.text}</p>
                    <div className="mt-0.5 text-[10px] text-[#94A3B8]">
                      {c.anon ? "Anonymous" : c.name} · {p.title}
                    </div>
                  </div>
                  <button
                    onClick={() => addCitation(c.text, c.name, c.anon, p, c.sent)}
                    className="h-7 shrink-0 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3 text-[11px] font-semibold text-white hover:bg-[#152a45]"
                  >
                    Save
                  </button>
                </div>
              ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setModalOpen(false)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Templates ────────────────────────────────────────────────────

function TemplatesTab() {
  const { projects, citations, aiMode, toast } = useStaff();
  const [tmpl, setTmpl] = useState<ReportTemplate | null>(null);
  const [projId, setProjId] = useState("road-paving");
  const [range, setRange] = useState("Last year");
  const [focus, setFocus] = useState("Traffic & safety");

  const projOpts = projects.filter((p) => p.lc === "published" || p.lc === "completed");
  const proj = projects.find((p) => p.id === projId) ?? projOpts[0];

  if (!tmpl) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORT_TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTmpl(t)}
            className="cursor-pointer rounded-xl border border-[#E2E8F0] bg-white p-5 text-left shadow-xs transition-colors hover:border-[#2563EB]"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF3F8] text-base">
              📄
            </div>
            <div className="text-sm font-bold text-[#1E3A5F]">{t.name}</div>
            <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{t.purpose}</p>
            <div className="mt-3 text-xs font-semibold text-[#2563EB]">Configure →</div>
          </button>
        ))}
      </div>
    );
  }

  const stats: Array<[string, string]> = [
    ["Residents engaged", String(proj?.followers ?? 0)],
    ["Comments received", String((proj?.public.length ?? 0) + (proj?.privateMsgs.length ?? 0))],
    ["Poll votes", String(pollTotal(proj?.polls[0]?.poll ?? { support: 0, oppose: 0, neutral: 0 }))],
    ["Response rate", "85%"],
  ];

  return (
    <div>
      <button
        onClick={() => setTmpl(null)}
        className="mb-4 cursor-pointer border-none bg-transparent text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F]"
      >
        ← All templates
      </button>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_1fr]">
        {/* Config */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-[#1E3A5F]">{tmpl.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{tmpl.purpose}</p>
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <SectionLabel>Project</SectionLabel>
              <select
                value={projId}
                onChange={(e) => setProjId(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs outline-none"
              >
                {projOpts.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <SectionLabel>Date range</SectionLabel>
              <input
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
              />
            </div>
            <div>
              <SectionLabel>Focus topics</SectionLabel>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => toast("Generating PDF — pulling live data from your projects…")}
              className="h-9 flex-1 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3 text-xs font-semibold text-white hover:bg-[#152a45]"
            >
              Generate PDF
            </button>
            <button
              onClick={() => toast("Generating DOCX — pulling live data from your projects…")}
              className="h-9 flex-1 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
            >
              Generate DOCX
            </button>
          </div>
        </Card>

        {/* Live preview */}
        <Card className="p-7">
          <div className="mb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
            Live preview
          </div>
          <h2 className="text-xl font-bold text-[#111827]">{tmpl.name}</h2>
          <div className="mt-1 border-b-2 border-[#1E3A5F] pb-3 text-xs text-[#64748B]">
            Collier Township, PA · Prepared by {STAFF_NAME} · {proj?.title} · {range}
          </div>

          {tmpl.sections.map((sec) => (
            <div key={sec.heading} className="mt-6">
              <h4 className="mb-2 text-sm font-bold text-[#1E3A5F]">{sec.heading}</h4>
              {sec.kind === "text" && (
                <p className="text-xs leading-relaxed text-[#374151]">
                  {sec.body} {proj ? `This report covers ${proj.title} (${CAT_FULL[proj.cat]}), ${proj.duration}.` : ""}
                </p>
              )}
              {sec.kind === "stats" && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {stats.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center"
                    >
                      <div className="text-lg font-bold text-[#0F172A]">{value}</div>
                      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sec.kind === "quotes" && (
                <div className="flex flex-col gap-2.5">
                  {citations.slice(0, 3).map((c) => (
                    <div key={c.id} className="border-l-2 border-[#1E3A5F] pl-3">
                      <p className="text-xs italic leading-relaxed text-[#374151]">
                        &ldquo;{c.quote}&rdquo;
                      </p>
                      <div className="mt-0.5 text-[10px] text-[#94A3B8]">— {citAttr(c)}</div>
                    </div>
                  ))}
                </div>
              )}
              {sec.kind === "narrative" &&
                (aiMode ? (
                  <div className="rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] p-3.5">
                    <AiChip />
                    <p className="mt-2 text-xs leading-relaxed text-[#374151]">{sec.aiBody}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#CBD5E1] p-3.5 text-xs italic text-[#94A3B8]">
                    {sec.manualHint}
                  </div>
                ))}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
