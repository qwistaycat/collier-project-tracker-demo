"use client";

// ================================================================
//  Reports › Search — cross-project full-text search over projects,
//  comments/DMs, and poll results, with category/type filters and
//  AI-only summary + related-projects panels.
// ================================================================

import { useState, type CSSProperties, type ReactNode } from "react";
import { SearchIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import { catFull, CAT_META, type StaffProject } from "../../data";
import {
  AiBadge,
  CARD,
  ExportButton,
  HoverRow,
  SentDot,
  SparkleIcon,
  flattenComments,
  isLive,
  pillStyle,
  useOpenProject,
  whoOf,
  type CorpusComment,
} from "./shared";

const CATEGORY_CHIPS = ["All", "Roads", "Parks", "Infrastructure", "Plan/Dev", "Public Safety"];
const TYPE_CHIPS = ["All", "Projects", "Comments", "Poll results"];

const labelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#9ca3af" };

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        margin: "18px 0 8px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: "#64748b",
      }}
    >
      {label} <span style={{ color: "#9ca3af", fontWeight: 600 }}>· {count}</span>
    </div>
  );
}

function GroupCard({ children }: { children: ReactNode }) {
  return <div style={{ ...CARD, overflow: "hidden" }}>{children}</div>;
}

function HighlightedText({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#FEF08A", color: "inherit", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function RelatedCard({ p, onClick }: { p: StaffProject; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#FAFAFF",
        border: `1px solid ${hover ? "#C4B5FD" : "#EDE9FE"}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "border-color 0.15s ease",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>{p.title}</div>
      <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 3 }}>
        {catFull(p.cat)} · {p.public.length + p.privateMsgs.length} comments
      </div>
    </div>
  );
}

export default function SearchTab() {
  const { projects, aiMode } = useTownship();
  const openProject = useOpenProject();

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [type, setType] = useState("All");

  const live = projects.filter(isLive);
  const corpus = flattenComments(projects);

  const q = query.trim().toLowerCase();
  const M = (t: string) => !q || t.toLowerCase().includes(q);
  const catOk = (c: string) => cat === "All" || c === cat;

  const projHits = live.filter((p) => catOk(p.cat) && (M(p.title) || M(p.desc)));
  const commentHits = corpus.filter((c) => catOk(c.cat) && M(c.text));
  const pollHits = live.filter(
    (p) =>
      p.poll &&
      catOk(p.cat) &&
      (M(p.title) || M("poll do you support") || p.themes.some((t) => M(t.name)))
  );

  const showP = type === "All" || type === "Projects";
  const showC = type === "All" || type === "Comments";
  const showV = type === "All" || type === "Poll results";
  const totalRes =
    (showP ? projHits.length : 0) +
    (showC ? commentHits.length : 0) +
    (showV ? pollHits.length : 0);

  const np = projHits.length;
  const nc = commentHits.length;
  const aiSummary = q
    ? `Across ${np} ${np === 1 ? "project" : "projects"} and ${nc} ${
        nc === 1 ? "comment" : "comments"
      } mentioning “${query.trim()}”, residents most often raise three concerns: traffic volume, safety, and clear communication of timelines. Sentiment skews mixed, with the strongest support tied to visible progress updates.`
    : `Across ${live.length} active and completed projects, residents have left ${corpus.length} tracked comments. Engagement concentrates in Roads and Parks, and the recurring themes are traffic safety, project timelines, and property-tax impact.`;

  const projIds = new Set(projHits.map((p) => p.id));
  const related = live.filter((p) => !projIds.has(p.id)).slice(0, 3);

  const clearFilters = () => {
    setQuery("");
    setCat("All");
    setType("All");
  };

  const commentRow = (c: CorpusComment, i: number) => (
    <HoverRow
      key={`${c.projId}-${i}`}
      onClick={() => openProject(c.projId, "feedback")}
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        borderTop: i ? "1px solid #F1F5F9" : "none",
        alignItems: "flex-start",
      }}
    >
      <SentDot word={c.sentW} style={{ marginTop: 7 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.5 }}>
          <HighlightedText text={c.text} q={q} />
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          <span style={{ fontWeight: 600, color: "#64748b" }}>{whoOf(c)}</span> · {c.project} ·{" "}
          {c.time}
        </div>
      </div>
    </HoverRow>
  );

  return (
    <div>
      {/* Search input */}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            color: "#9ca3af",
          }}
        >
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all projects, comments, and stages..."
          className="focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: "100%",
            height: 46,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "0 14px 0 44px",
            fontSize: 15,
            background: "#fff",
          }}
        />
      </div>

      {/* Filter row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 14,
        }}
      >
        <span style={labelStyle}>Category</span>
        {CATEGORY_CHIPS.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={pillStyle(cat === c)}>
            {c}
          </button>
        ))}
        <span style={{ width: 1, alignSelf: "stretch", background: "#e5e7eb", margin: "0 4px" }} />
        <span style={labelStyle}>Type</span>
        {TYPE_CHIPS.map((t) => (
          <button key={t} onClick={() => setType(t)} style={pillStyle(type === t, true)}>
            {t}
          </button>
        ))}
      </div>

      {/* AI summary (AI ON only) */}
      {aiMode && (
        <div
          style={{
            background: "#FAFAFF",
            border: "1px solid #DDD6FE",
            borderRadius: 12,
            padding: "15px 17px",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <SparkleIcon size={14} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>
              AI summary of results
            </span>
            <AiBadge />
          </div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{aiSummary}</div>
        </div>
      )}

      {/* Results header */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#9ca3af" }}>Results</span>
        <span style={{ flex: 1 }} />
        <ExportButton />
      </div>

      {totalRes === 0 ? (
        <div
          style={{
            marginTop: 16,
            background: "#fff",
            border: "1px dashed #CBD5E1",
            borderRadius: 12,
            padding: "52px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
            No results for the selected range and filters.
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 5 }}>
            Try a wider range or check your filters.
          </div>
          <button
            onClick={clearFilters}
            style={{
              marginTop: 16,
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#0d2240",
              cursor: "pointer",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Projects */}
          {showP && projHits.length > 0 && (
            <div>
              <GroupHeader label="Projects" count={projHits.length} />
              <GroupCard>
                {projHits.map((p, i) => (
                  <HoverRow
                    key={p.id}
                    onClick={() => openProject(p.id, "feedback")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      borderTop: i ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        {p.public.length + p.privateMsgs.length} comments · {p.followers} follows
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 6,
                        color: CAT_META[p.cat].color,
                        background: CAT_META[p.cat].bg,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {catFull(p.cat)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        minWidth: 64,
                        textAlign: "right",
                      }}
                    >
                      {p.completedDate || p.duration || "2026"}
                    </span>
                  </HoverRow>
                ))}
              </GroupCard>
            </div>
          )}

          {/* Comments */}
          {showC && commentHits.length > 0 && (
            <div>
              <GroupHeader label="Comments" count={commentHits.length} />
              <GroupCard>{commentHits.slice(0, 40).map(commentRow)}</GroupCard>
            </div>
          )}

          {/* Poll results */}
          {showV && pollHits.length > 0 && (
            <div>
              <GroupHeader label="Poll results" count={pollHits.length} />
              <GroupCard>
                {pollHits.map((p, i) => {
                  const total = p.poll.support + p.poll.oppose + p.poll.neutral;
                  const t = total || 1;
                  const s = Math.round((p.poll.support / t) * 100);
                  const o = Math.round((p.poll.oppose / t) * 100);
                  const n = Math.round((p.poll.neutral / t) * 100);
                  return (
                    <HoverRow
                      key={p.id}
                      onClick={() => openProject(p.id, "polls")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 16px",
                        borderTop: i ? "1px solid #F1F5F9" : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>
                          Do you support {p.title}?
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {s}% support · {o}% oppose · {n}% neutral
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
                        {total} votes
                      </span>
                    </HoverRow>
                  );
                })}
              </GroupCard>
            </div>
          )}

          {/* You might also look at… (AI ON only) */}
          {aiMode && related.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 9,
                }}
              >
                <SparkleIcon size={14} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>
                  You might also look at…
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                  gap: 10,
                }}
              >
                {related.map((p) => (
                  <RelatedCard key={p.id} p={p} onClick={() => openProject(p.id, "feedback")} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
