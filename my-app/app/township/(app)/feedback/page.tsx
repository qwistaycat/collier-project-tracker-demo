"use client";

// ================================================================
//  Township Feedback — cross-project comment inbox. Flattens every
//  resident comment (public, private DMs, and — in AI mode — the
//  auto-moderated queue) from every project into one triage list.
//  Rows deep-link into the project detail's Feedback tab; Reply
//  opens the attribution modal (personal vs. official, with an AI
//  draft assist when AI Assistance is on); Delete is immediate.
//
//  Deep links in: /township/feedback?tab=all|response|moderation
//  (dashboard shortcuts). Tab/sentiment selection is local page
//  state — a simplification of the prototype's app-level state.
// ================================================================

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import { useTownship } from "../../TownshipContext";
import {
  STAFF_NAME,
  initialsOf,
  sentColor,
  simulateAi,
  type StaffComment,
  type StaffProject,
} from "../../data";

// ── Local types ──────────────────────────────────────────────────

type FeedTab = "all" | "response" | "moderation";
type SentFilter = "All" | "Supportive" | "Mixed" | "Concerns";
type RowKind = "public" | "private" | "hidden";
type AttrKey = "name" | "official";

interface FeedRow {
  proj: StaffProject;
  c: StaffComment;
  kind: RowKind;
}

interface ReplyTarget {
  projId: string;
  kind: RowKind;
  commentId: string;
  name: string;
  text: string;
}

const SENT_FILTER_MAP: Record<Exclude<SentFilter, "All">, string> = {
  Supportive: "green",
  Mixed: "amber",
  Concerns: "red",
};

const TAB_LABELS: Record<FeedTab, string> = {
  all: "All Comments",
  response: "Awaiting Response",
  moderation: "Awaiting Moderation",
};

// ── Local icons (not in shared icons.tsx) ────────────────────────

function PersonIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#94A3B8"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}

function SparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.9 5.7 5.7 1.9-5.7 1.9L12 17.2l-1.9-5.7L4.4 9.6l5.7-1.9L12 2z" />
      <path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
    </svg>
  );
}

// ── Small presentational pieces ──────────────────────────────────

function Pill({
  on,
  small,
  onClick,
  children,
}: {
  on: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: small ? 30 : 34,
        padding: "0 13px",
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: on ? 600 : 500,
        cursor: "pointer",
        border: `1px solid ${on ? "#0d2240" : "#e5e7eb"}`,
        background: on ? "#0d2240" : "#fff",
        color: on ? "#fff" : "#475569",
        transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 600,
        padding: "0 5px",
        borderRadius: 4,
        lineHeight: "16px",
        color: verified ? "#567A67" : "#94A3B8",
        background: verified ? "#E4EDE7" : "#F1F5F9",
        flexShrink: 0,
      }}
    >
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function SentimentChip({ sent }: { sent: StaffComment["sent"] }) {
  const [color, bg, label] = sentColor(sent);
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        padding: "1px 7px",
        borderRadius: 5,
        color,
        background: bg,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function OfficialBadge() {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        padding: "1px 5px",
        borderRadius: 5,
        background: "#DBEAFE",
        color: "#1D4ED8",
        flexShrink: 0,
      }}
    >
      Official
    </span>
  );
}

function AttrAvatar({ attr, size = 30 }: { attr: AttrKey; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: attr === "name" ? "#2563EB" : "#0d2240",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {attr === "name" ? initialsOf(STAFF_NAME) : "CT"}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────

function FeedbackContent() {
  const { projects, updateProject, aiMode, dept, toast } = useTownship();
  const searchParams = useSearchParams();

  const paramTab = searchParams.get("tab");
  const initialTab: FeedTab =
    paramTab === "response" || paramTab === "moderation" || paramTab === "all"
      ? paramTab
      : "all";

  const [feedTab, setFeedTab] = useState<FeedTab>(initialTab);
  const [feedSent, setFeedSent] = useState<SentFilter>("All");

  // Moderation tab only exists while AI Assistance is on — adjust
  // during render (React's "derive state" pattern) rather than in
  // an effect.
  if (!aiMode && feedTab === "moderation") setFeedTab("all");

  // Reply modal state
  const [replyFor, setReplyFor] = useState<ReplyTarget | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyAttr, setReplyAttr] = useState<AttrKey>("name");
  const [replyBusy, setReplyBusy] = useState(false);
  const lastAttrRef = useRef<AttrKey>("name");

  // ── Row sourcing (mirrors the prototype exactly) ───────────────
  const rows = useMemo(() => {
    let feedRows: FeedRow[] = [];
    projects.forEach((p) => {
      p.public.forEach((c) => feedRows.push({ proj: p, c, kind: "public" }));
      p.privateMsgs.forEach((c) => feedRows.push({ proj: p, c, kind: "private" }));
      if (aiMode) p.hidden.forEach((c) => feedRows.push({ proj: p, c, kind: "hidden" }));
    });
    if (feedTab === "response") {
      feedRows = feedRows.filter((r) => !(r.c.replies && r.c.replies.length));
    }
    if (feedTab === "moderation") {
      feedRows = feedRows.filter((r) => r.kind === "hidden");
    }
    // Sentiment filter is an AI-mode affordance; apply only while on
    // (the prototype let a hidden filter keep applying — fixed here).
    if (aiMode && feedSent !== "All") {
      feedRows = feedRows.filter((r) => r.c.sent === SENT_FILTER_MAP[feedSent]);
    }
    return feedRows.slice(0, 24);
  }, [projects, aiMode, feedTab, feedSent]);

  const tabs: FeedTab[] = aiMode ? ["all", "response", "moderation"] : ["all", "response"];

  // ── Actions ────────────────────────────────────────────────────

  const deleteComment = (projId: string, commentId: string) => {
    updateProject(projId, (p) => ({
      ...p,
      public: p.public.filter((c) => c.id !== commentId),
      privateMsgs: p.privateMsgs.filter((c) => c.id !== commentId),
      hidden: p.hidden.filter((c) => c.id !== commentId),
    }));
    toast("Comment deleted");
  };

  const openReply = (row: FeedRow) => {
    setReplyFor({
      projId: row.proj.id,
      kind: row.kind,
      commentId: row.c.id,
      name: row.c.name,
      text: row.c.text,
    });
    setReplyText("");
    setReplyAttr(lastAttrRef.current);
    setReplyBusy(false);
  };

  const closeReply = () => {
    setReplyFor(null);
    setReplyText("");
    setReplyBusy(false);
  };

  const sendReply = () => {
    if (!replyFor) return;
    const text = replyText.trim();
    if (!text) {
      closeReply();
      return;
    }
    const target = replyFor;
    const attr: "name" | "dept" = replyAttr === "official" ? "dept" : "name";
    const addReply = (arr: StaffComment[]) =>
      arr.map((c) =>
        c.id === target.commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                { attr, name: STAFF_NAME, dept, text, time: "just now", edited: false },
              ],
            }
          : c
      );
    updateProject(target.projId, (p) => ({
      ...p,
      public: target.kind === "public" ? addReply(p.public) : p.public,
      privateMsgs: target.kind === "private" ? addReply(p.privateMsgs) : p.privateMsgs,
      hidden: target.kind === "hidden" ? addReply(p.hidden) : p.hidden,
      log: [{ text: `Replied to ${target.name}`, time: "just now", by: STAFF_NAME }, ...p.log],
    }));
    lastAttrRef.current = replyAttr;
    toast("Reply sent");
    closeReply();
  };

  const draftWithAi = async () => {
    if (!replyFor || replyBusy) return;
    setReplyBusy(true);
    const firstName = replyFor.name.split(" ")[0];
    const fallback = `Thank you for reaching out, ${firstName}. We appreciate you sharing this and want you to know it's on our radar — a staff member from ${dept} will follow up with specifics shortly.\n\n— ${dept}`;
    const text = await simulateAi(fallback);
    setReplyText(text);
    setReplyBusy(false);
  };

  const subFor = (kind: RowKind) =>
    kind === "private" ? "private" : kind === "hidden" ? "moderation" : "public";

  const previewName = replyAttr === "name" ? STAFF_NAME : "Township Staff (Official)";

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "26px 28px 60px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
        Feedback
      </h1>

      {/* Tab pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <Pill key={t} on={feedTab === t} onClick={() => setFeedTab(t)}>
            {TAB_LABELS[t]}
          </Pill>
        ))}
      </div>

      {/* Sentiment filter (AI mode only) */}
      {aiMode && (
        <div
          style={{
            display: "flex",
            gap: 7,
            marginBottom: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "#94a3b8", marginRight: 4 }}>Sentiment:</span>
          {(["All", "Supportive", "Mixed", "Concerns"] as SentFilter[]).map((s) => (
            <Pill key={s} small on={feedSent === s} onClick={() => setFeedSent(s)}>
              {s}
            </Pill>
          ))}
        </div>
      )}

      {/* Count */}
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
        {rows.length} comments
      </div>

      {/* Comment list card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {rows.length === 0 && (
          <div
            style={{
              padding: "70px 20px",
              textAlign: "center",
              color: "#94A3B8",
              fontSize: 14,
            }}
          >
            No comments match these filters.
          </div>
        )}

        {rows.map((row, i) => (
          <div
            key={`${row.proj.id}-${row.kind}-${row.c.id}`}
            style={{
              display: "flex",
              gap: 13,
              padding: "14px 16px",
              borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              alignItems: "flex-start",
            }}
          >
            {/* Generic resident avatar */}
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PersonIcon />
            </span>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 3,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>
                  {row.c.name}
                </span>
                <VerifiedBadge verified={row.c.verified} />
                {aiMode && <SentimentChip sent={row.c.sent} />}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: "#334155",
                  lineHeight: 1.5,
                  marginBottom: 5,
                }}
              >
                {row.c.text}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                <Link
                  href={`/township/project/${row.proj.id}?tab=feedback&sub=${subFor(row.kind)}`}
                  style={{
                    color: "#2563eb",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {row.proj.title}
                </Link>
                {" · "}
                {row.c.time}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => openReply(row)}
                style={{
                  height: 30,
                  padding: "0 14px",
                  background: "#0d2240",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Reply
              </button>
              <button
                onClick={() => deleteComment(row.proj.id, row.c.id)}
                style={{
                  height: 30,
                  padding: "0 14px",
                  background: "#fff",
                  color: "#CD481B",
                  border: "1px solid #F2C6B3",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF0EA")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply modal */}
      {replyFor && (
        <div
          onClick={closeReply}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            background: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 560,
              maxWidth: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 22,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 12 }}>
              Reply to {replyFor.name}
            </div>

            {/* Quoted original */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                fontSize: 13,
                color: "#475569",
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              {replyFor.text}
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", marginBottom: 14 }} />

            {/* Attribution */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                color: "#475569",
                marginBottom: 8,
              }}
            >
              Reply as
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}
            >
              {(
                [
                  {
                    key: "name" as AttrKey,
                    title: STAFF_NAME,
                    sub: dept,
                    desc: "Personal and accountable",
                  },
                  {
                    key: "official" as AttrKey,
                    title: "Township Staff (Official)",
                    sub: null,
                    desc: "For sensitive matters",
                  },
                ] as const
              ).map((opt) => {
                const on = replyAttr === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setReplyAttr(opt.key)}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      textAlign: "left",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#fff",
                      border: `1px solid ${on ? "#0d2240" : "#e5e7eb"}`,
                      cursor: "pointer",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <AttrAvatar attr={opt.key} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {opt.title}
                        <OfficialBadge />
                      </span>
                      {opt.sub && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11.5,
                            color: "#64748b",
                            marginTop: 1,
                          }}
                        >
                          {opt.sub}
                        </span>
                      )}
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "#94a3b8",
                          marginTop: 1,
                        }}
                      >
                        {opt.desc}
                      </span>
                    </span>
                    {/* Radio */}
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `1.5px solid ${on ? "#0d2240" : "#cbd5e1"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {on && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#0d2240",
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Draft with AI (AI mode only) */}
            {aiMode && (
              <button
                onClick={draftWithAi}
                disabled={replyBusy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 8,
                  background: "#F5F3FF",
                  border: "1px solid #DDD6FE",
                  color: "#7C3AED",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: replyBusy ? "default" : "pointer",
                  opacity: replyBusy ? 0.7 : 1,
                  marginBottom: 10,
                  transition: "opacity 0.15s ease",
                }}
              >
                <SparkleIcon />
                {replyBusy ? "Drafting…" : "Draft with AI"}
              </button>
            )}

            {/* Textarea */}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply…"
              className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                width: "100%",
                minHeight: 110,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "inherit",
                color: "#374151",
                lineHeight: 1.5,
                resize: "vertical",
                marginBottom: 12,
              }}
            />

            {/* Preview */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                color: "#94A3B8",
                marginBottom: 6,
              }}
            >
              This is how your reply will look to residents
            </div>
            <div
              style={{
                background: "#F0F7FF",
                border: "1px solid #DBEAFE",
                borderRadius: 11,
                padding: "12px 13px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <AttrAvatar attr={replyAttr} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f2d59" }}>
                  {previewName}
                </span>
                <OfficialBadge />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>just now</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: replyText ? "#334155" : "#94a3b8",
                  lineHeight: 1.5,
                  marginTop: 6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {replyText || "Your reply will appear here…"}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={closeReply}
                style={{
                  height: 38,
                  padding: "0 18px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9999,
                  color: "#475569",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                style={{
                  height: 38,
                  padding: "0 18px",
                  background: "#0d2240",
                  border: "none",
                  borderRadius: 9999,
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={null}>
      <FeedbackContent />
    </Suspense>
  );
}
