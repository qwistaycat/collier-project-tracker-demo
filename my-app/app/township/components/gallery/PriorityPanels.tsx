"use client";

// ================================================================
//  PriorityPanels — the staff-home dashboard strip rendered at the
//  top of the Projects gallery (the prototype's home screen was
//  collapsed into Projects). Two rows:
//    1. Needs Response · Upcoming Stage Changes · This Week's
//       Engagement (3-up priority panels)
//    2. Recent Activity · (AI Insights when AI Assistance is ON,
//       Reminders otherwise)
//  The Needs Response "Draft reply" action always runs the canned
//  AI draft (the prototype's draftReply does not check aiMode).
// ================================================================

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PieChartIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import {
  sentColor,
  simulateAi,
  type StaffComment,
  type StaffProject,
} from "../../data";
import {
  CommentBubbleIcon,
  SparkleIcon,
  SpinnerIcon,
  StageArrowIcon,
  TrendIcon,
  UserPlusIcon,
} from "./galleryIcons";

// ── Shared panel shell ───────────────────────────────────────────

function Panel({
  title,
  badge,
  accent,
  flex = 1,
  children,
  footer,
}: {
  title: string;
  badge?: string;
  accent?: string;
  flex?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <section
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex,
        minWidth: 280,
        background: "#fff",
        border: `1px solid ${hover ? "#0d2240" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: 16,
        transition: "border-color 0.15s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {accent && <SparkleIcon size={14} style={{ color: accent }} />}
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{title}</span>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: accent ?? "#475569",
              background: accent ? "#EDE9FE" : "#F1F5F9",
              borderRadius: 20,
              padding: "1px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        )}
      </header>
      <div style={{ flex: 1 }}>{children}</div>
      {footer}
    </section>
  );
}

function FooterLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        color: "#2563eb",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

const footerRow: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginTop: 12,
  paddingTop: 10,
  borderTop: "1px solid #f1f5f9",
};

// ── Needs Response builder (prototype semantics) ─────────────────

const DAY_POOL = [8, 6, 5, 4, 3, 2, 1, 7];

interface NeedsRow {
  p: StaffProject;
  c: StaffComment;
  days: number;
  key: string;
}

function buildNeedsRows(projects: StaffProject[]): NeedsRow[] {
  const rows: NeedsRow[] = [];
  let i = 0;
  for (const p of projects) {
    for (const c of [...p.public, ...p.privateMsgs]) {
      if (!c.replies || c.replies.length === 0) {
        rows.push({ p, c, days: DAY_POOL[i % DAY_POOL.length], key: `${p.id}:${c.id}` });
        i++;
      }
    }
  }
  // Stable sort — ties keep collection order (matches prototype).
  return rows.sort((a, b) => b.days - a.days);
}

// ── Upcoming stage changes builder ───────────────────────────────

const UP_DAYS = [1, 3, 5, 6];

// ── This Week's Engagement seed (verbatim) ───────────────────────

const ENG_SEED = [
  { id: "hilltop", now: 23, prev: 8 },
  { id: "road-paving", now: 15, prev: 11 },
  { id: "mixed-use", now: 12, prev: 14 },
  { id: "nevillewood", now: 6, prev: 5 },
];

// ── Activity feed (verbatim) ─────────────────────────────────────

type ActivityType = "comment" | "update" | "poll" | "follow";

const ACTIVITY: { text: string; type: ActivityType; pid: string; time: string }[] = [
  { text: "NevillewoodMom commented on Road Paving 2026", type: "comment", pid: "road-paving", time: "12m" },
  { text: "Ellen Brooks sent a private message on Hilltop Park Expansion", type: "comment", pid: "hilltop", time: "34m" },
  { text: "Road Paving 2026 moved to Stage 6 — Paving Phase 1", type: "update", pid: "road-paving", time: "2h" },
  { text: "Poll on Hilltop Park Expansion passed 289 votes", type: "poll", pid: "hilltop", time: "3h" },
  { text: "QuietStreetDad commented on Hilltop Park Expansion", type: "comment", pid: "hilltop", time: "4h" },
  { text: "14 new followers on Fire Station Upgrades — Presto", type: "follow", pid: "fire-station", time: "6h" },
  { text: "Harold Simms sent a private message on Mixed-Use Development", type: "comment", pid: "mixed-use", time: "8h" },
  { text: "Mixed-Use Development stage hearing scheduled Jun 18", type: "update", pid: "mixed-use", time: "1d" },
];

const ACTIVITY_COLORS: Record<ActivityType, [string, string]> = {
  comment: ["#2563EB", "#DBEAFE"],
  update: ["#16A34A", "#DCFCE7"],
  poll: ["#7C3AED", "#EDE9FE"],
  follow: ["#B45309", "#FFEEDD"],
};

// ── AI insights / reminders (verbatim) ───────────────────────────

const AI_INSIGHTS = [
  "Comment volume on Hilltop Park is up 40% this week, driven by parking concerns.",
  "Sentiment on Road Paving 2026 shifted positive (+12 pts) after Stage 6 update.",
  "43% of Mixed-Use Development feedback expresses density concerns — consider a public FAQ.",
  "Response rate this week is 91% within 7 days, above your 85% target.",
];

const REMINDERS = [
  "Reply to 3 comments awaiting response on Road Paving 2026",
  "Read new private messages on Hilltop Park Expansion",
  "Confirm Stage 6 dates before Friday board meeting",
  "Delete any off-topic comments on Mixed-Use forum",
];

// ── Component ────────────────────────────────────────────────────

export default function PriorityPanels() {
  const router = useRouter();
  const { projects, aiMode, dept } = useTownship();
  const [drafts, setDrafts] = useState<Record<string, { busy: boolean; text: string }>>({});
  const [doneReminders, setDoneReminders] = useState<number[]>([]);

  const openProj = (id: string, tab: string, extra = "") =>
    router.push(`/township/project/${id}?tab=${tab}${extra}`);

  // Needs Response
  const needsRows = buildNeedsRows(projects);
  const needsCount = needsRows.length;
  const topNeeds = needsRows.slice(0, 3);

  const draftReply = async (row: NeedsRow) => {
    const first = row.c.name.split(" ")[0];
    setDrafts((d) => ({ ...d, [row.key]: { busy: true, text: "" } }));
    const text = await simulateAi(
      `Thank you for reaching out, ${first}. We appreciate you sharing this and want you to know it's on our radar — a staff member from ${dept} will follow up with specifics shortly.\n\n— ${dept}`
    );
    setDrafts((d) => ({ ...d, [row.key]: { busy: false, text } }));
  };

  // Upcoming stage changes
  const upcoming = projects
    .filter((p) => p.stages.length > 0 && p.current < p.stages.length)
    .slice(0, 4)
    .map((p, i) => {
      const days = UP_DAYS[i] ?? 6;
      return {
        p,
        curTitle: p.stages[p.current - 1]?.title ?? "",
        nextStage: p.stages[p.current],
        when: days <= 1 ? (days === 1 ? "Tomorrow" : "Today") : `In ${days} days`,
        dot: days <= 1 ? "#CD481B" : days <= 5 ? "#FFAA55" : "#94A3B8",
      };
    });
  const upCount = upcoming.length;

  // Engagement
  const engWeek = ENG_SEED.reduce((s, e) => s + e.now, 0);
  const engRows = ENG_SEED.flatMap((e) => {
    const p = projects.find((pp) => pp.id === e.id);
    if (!p) return [];
    const dir: "up" | "down" | "flat" =
      e.now > e.prev * 1.2 ? "up" : e.now < e.prev * 0.85 ? "down" : "flat";
    const color = dir === "up" ? "#16A34A" : dir === "down" ? "#B45309" : "#94A3B8";
    const compare = `${e.now} comments this week · ${
      dir === "up"
        ? `up from ${e.prev}`
        : dir === "down"
          ? `down from ${e.prev}`
          : `similar to ${e.prev}`
    } last week`;
    return [{ p, dir, color, compare }];
  }).slice(0, 3);

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "8px 6px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.15s ease",
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Row 1 — priority panels */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        {/* Needs Response */}
        <Panel
          title="Needs Response"
          badge={`${needsCount} awaiting`}
          footer={
            <div style={footerRow}>
              <FooterLink
                label="All awaiting response →"
                onClick={() => router.push("/township/feedback?tab=response")}
              />
              <FooterLink
                label="Responded"
                onClick={() => router.push("/township/feedback?tab=all")}
              />
            </div>
          }
        >
          {topNeeds.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#94A3B8", padding: "14px 4px" }}>
              All caught up — no comments awaiting a response.
            </div>
          ) : (
            topNeeds.map((row) => {
              const [sc, sb, sl] = sentColor(row.c.sent);
              const dot =
                row.days > 7 ? "#CD481B" : row.days >= 3 ? "#FFAA55" : "#94A3B8";
              const draft = drafts[row.key];
              const snippet =
                row.c.text.length > 60 ? `${row.c.text.slice(0, 60)}…` : row.c.text;
              return (
                <div
                  key={row.key}
                  onClick={() => openProj(row.p.id, "feedback", "&sub=public")}
                  style={rowStyle}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: dot,
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>
                        {row.c.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          borderRadius: 4,
                          padding: "1px 5px",
                          color: row.c.verified ? "#16A34A" : "#94A3B8",
                          background: row.c.verified ? "#DCFCE7" : "#F1F5F9",
                        }}
                      >
                        {row.c.verified ? "Verified" : "Unverified"}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          borderRadius: 20,
                          padding: "1px 7px",
                          color: sc,
                          background: sb,
                        }}
                      >
                        {sl}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#475569",
                        lineHeight: 1.4,
                        margin: "2px 0",
                      }}
                    >
                      {snippet}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>
                      {row.p.title} · {row.days} {row.days === 1 ? "day" : "days"} ago
                    </div>
                    {draft && !draft.busy && draft.text && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginTop: 6,
                          background: "#EDE9FE",
                          border: "1px solid #ddd6fe",
                          borderRadius: 8,
                          padding: "8px 10px",
                          fontSize: 11.5,
                          color: "#374151",
                          lineHeight: 1.45,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {draft.text}
                        <div style={{ marginTop: 6 }}>
                          <button
                            onClick={() => openProj(row.p.id, "feedback", "&sub=public")}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              color: "#7C3AED",
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Open in Feedback →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!draft?.busy) draftReply(row);
                    }}
                    disabled={draft?.busy}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      height: 26,
                      padding: "0 10px",
                      borderRadius: 9999,
                      border: "1px solid #7C3AED",
                      background: "#fff",
                      color: "#7C3AED",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: draft?.busy ? "default" : "pointer",
                      opacity: draft?.busy ? 0.7 : 1,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      transition: "background 0.15s ease, opacity 0.15s ease",
                    }}
                  >
                    {draft?.busy ? (
                      <>
                        <SpinnerIcon size={11} /> Drafting…
                      </>
                    ) : (
                      <>
                        <SparkleIcon size={11} /> Draft reply
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </Panel>

        {/* Upcoming Stage Changes */}
        <Panel title="Upcoming Stage Changes" badge={`${upCount} upcoming`}>
          {upcoming.slice(0, 3).map((u) => (
            <div
              key={u.p.id}
              onClick={() =>
                openProj(u.p.id, "details", `&stage=${u.nextStage?.n ?? u.p.current + 1}`)
              }
              style={rowStyle}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: u.dot,
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>
                  {u.p.title}
                </div>
                <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>
                  {u.curTitle} → {u.nextStage?.title}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#94A3B8",
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                {u.when}
              </span>
            </div>
          ))}
        </Panel>

        {/* This Week's Engagement */}
        <Panel
          title="This Week's Engagement"
          badge={`${engWeek} comments`}
          footer={
            <div style={footerRow}>
              <FooterLink
                label="View Insights →"
                onClick={() => router.push("/township/insights")}
              />
            </div>
          }
        >
          {engRows.map((r) => (
            <div
              key={r.p.id}
              onClick={() => openProj(r.p.id, "feedback", "&sub=public")}
              style={rowStyle}
            >
              <span style={{ color: r.color, marginTop: 2, flexShrink: 0 }}>
                <TrendIcon dir={r.dir} size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>
                  {r.p.title}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 5px" }}>
                  {r.compare}
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 5,
                    borderRadius: 3,
                    overflow: "hidden",
                    background: "#F1F5F9",
                  }}
                >
                  <span style={{ width: `${r.p.sentiment.supportive}%`, background: "#16A34A" }} />
                  <span style={{ width: `${r.p.sentiment.mixed}%`, background: "#FFAA55" }} />
                  <span style={{ width: `${r.p.sentiment.concerns}%`, background: "#CD481B" }} />
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 10, marginTop: 3 }}>
                  <span style={{ color: "#16A34A", fontWeight: 600 }}>
                    {r.p.sentiment.supportive}%
                  </span>
                  <span style={{ color: "#B45309", fontWeight: 600 }}>
                    {r.p.sentiment.mixed}%
                  </span>
                  <span style={{ color: "#CD481B", fontWeight: 600 }}>
                    {r.p.sentiment.concerns}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      {/* Row 2 — activity + AI insights / reminders */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Panel title="Recent Activity" flex={1.6}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              columnGap: 12,
            }}
          >
            {ACTIVITY.map((a, i) => {
              const [ac, ab] = ACTIVITY_COLORS[a.type];
              const tab =
                a.type === "comment" ? "feedback" : a.type === "poll" ? "polls" : "details";
              return (
                <div
                  key={i}
                  onClick={() =>
                    openProj(a.pid, tab, tab === "feedback" ? "&sub=public" : "")
                  }
                  style={{ ...rowStyle, alignItems: "center" }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: ab,
                      color: ac,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {a.type === "comment" ? (
                      <CommentBubbleIcon size={13} />
                    ) : a.type === "poll" ? (
                      <PieChartIcon size={13} />
                    ) : a.type === "follow" ? (
                      <UserPlusIcon size={13} />
                    ) : (
                      <StageArrowIcon size={13} />
                    )}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12,
                      color: "#374151",
                      lineHeight: 1.35,
                    }}
                  >
                    {a.text}
                  </span>
                  <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{a.time}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        {aiMode ? (
          <Panel title="AI Insights" badge="AI" accent="#7C3AED">
            {AI_INSIGHTS.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "6px 4px",
                }}
              >
                <span style={{ color: "#7C3AED", marginTop: 2, flexShrink: 0 }}>
                  <SparkleIcon size={11} />
                </span>
                <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>{t}</span>
              </div>
            ))}
          </Panel>
        ) : (
          <Panel title="Reminders" badge={`${REMINDERS.length - doneReminders.length} open`}>
            {REMINDERS.map((t, i) => {
              const done = doneReminders.includes(i);
              return (
                <div
                  key={i}
                  onClick={() =>
                    setDoneReminders((d) =>
                      d.includes(i) ? d.filter((x) => x !== i) : [...d, i]
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "6px 4px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      border: `1.5px solid ${done ? "#16A34A" : "#cbd5e1"}`,
                      background: done ? "#DCFCE7" : "#fff",
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      marginTop: 2,
                      flexShrink: 0,
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: done ? "#94A3B8" : "#374151",
                      lineHeight: 1.45,
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {t}
                  </span>
                </div>
              );
            })}
          </Panel>
        )}
      </div>
    </div>
  );
}
