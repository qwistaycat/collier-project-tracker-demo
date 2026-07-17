"use client";

// ================================================================
//  Feedback tab — AI sentiment analysis panel (AI mode), private /
//  public / moderation sub-tabs, comment cards with official
//  replies, the reply modal (personal vs official attribution +
//  AI draft), a resident profile popover, and the moderation queue
//  with per-row and bulk approve/reject.
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../../lib/StaffContext";
import type { Comment, Project } from "../../lib/types";
import {
  MOD_MODES,
  STAFF_NAME,
  agoHours,
  residentContact,
  sentMeta,
} from "../../lib/utils";
import {
  AiChip,
  Avatar,
  Card,
  ConfirmModal,
  DropdownItem,
  DropdownPill,
  EmptyState,
  Modal,
  SealAvatar,
  SentChip,
  SentimentBar,
} from "../../components/ui";

type SortKey = "recent" | "oldest" | "replies";

export default function FeedbackTab() {
  const {
    activeProject,
    feedbackSub,
    setFeedbackSub,
    aiMode,
    updateProject,
    addLog,
    toast,
    addReply,
    editReply,
    deleteReply,
    deleteComment,
    approveComment,
    rejectComment,
    restoreRejected,
  } = useStaff();
  const p = activeProject as Project;

  const [sentPanelOpen, setSentPanelOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [sentFilter, setSentFilter] = useState("All");
  const [replyFor, setReplyFor] = useState<{
    comment: Comment;
    editIdx?: number;
    themeMode?: boolean;
  } | null>(null);
  const [profileFor, setProfileFor] = useState<Comment | null>(null);
  const [delFor, setDelFor] = useState<Comment | null>(null);
  const [delReplyFor, setDelReplyFor] = useState<{ comment: Comment; idx: number } | null>(null);
  const [modFilter, setModFilter] = useState<"Awaiting review" | "Rejected">("Awaiting review");
  const [modSel, setModSel] = useState<string[]>([]);
  const [modConfirm, setModConfirm] = useState<{ action: "approve" | "reject"; c: Comment } | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<"approve" | "reject" | null>(null);

  const privUnread = p.privateMsgs.filter((c) => !c.replies.length).length;
  const pubAwaiting = p.public.filter((c) => !c.replies.length).length;

  const sortList = (list: Comment[]): Comment[] => {
    const arr = [...list];
    if (sort === "recent") arr.sort((a, b) => agoHours(a.time) - agoHours(b.time));
    if (sort === "oldest") arr.sort((a, b) => agoHours(b.time) - agoHours(a.time));
    if (sort === "replies") arr.sort((a, b) => b.replies.length - a.replies.length);
    return arr;
  };

  const filterSent = (list: Comment[]): Comment[] => {
    if (!aiMode || sentFilter === "All") return list;
    return list.filter((c) => sentMeta(c.sent).label === sentFilter);
  };

  const currentList =
    feedbackSub === "private"
      ? sortList(p.privateMsgs)
      : feedbackSub === "public"
      ? filterSent(sortList(p.public))
      : [];

  const modRows = modFilter === "Awaiting review" ? p.hidden : p.rejected;

  const setModMode = (mode: (typeof MOD_MODES)[number]) => {
    updateProject(p.id, (proj) => ({ ...proj, modMode: mode.key }));
    addLog(p.id, `Changed comment moderation to ${mode.label}`);
    toast(`Moderation set to ${mode.label}`);
  };

  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* AI sentiment panel / manual note */}
      {aiMode ? (
        <Card className="overflow-hidden">
          <button
            onClick={() => setSentPanelOpen((v) => !v)}
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-[#F5F3FF] px-5 py-3.5 text-left"
          >
            <span className="text-[#7C3AED]">✦</span>
            <span className="text-sm font-bold text-[#5B21B6]">AI Sentiment Analysis</span>
            <AiChip label="AI" />
            <span className="flex-1" />
            <span className="text-xs text-[#94A3B8]">{sentPanelOpen ? "▲" : "▼"}</span>
          </button>
          {sentPanelOpen && (
            <div className="p-5">
              <SentimentBar
                supportive={p.sentiment.supportive}
                mixed={p.sentiment.mixed}
                concerns={p.sentiment.concerns}
                width="100%"
                height={12}
              />
              <div className="mt-2 flex flex-wrap gap-4 text-[11px] font-semibold">
                <span className="text-[#16A34A]">● {p.sentiment.supportive}% supportive</span>
                <span className="text-[#D97706]">● {p.sentiment.mixed}% mixed</span>
                <span className="text-[#DC2626]">● {p.sentiment.concerns}% concerns</span>
              </div>

              {p.themes.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Top themes
                  </div>
                  {p.themes.map((t) => {
                    const m =
                      t.sent === "supportive"
                        ? sentMeta("green")
                        : t.sent === "concerns"
                        ? sentMeta("red")
                        : sentMeta("amber");
                    return (
                      <div
                        key={t.name}
                        className="rounded-xl border border-[#E2E8F0] bg-[#FBFCFD] p-3.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#111827]">{t.name}</span>
                          <span
                            style={{ color: m.color, backgroundColor: m.bg }}
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                          >
                            {m.label}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">
                            {t.count} comments
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] italic text-[#64748B]">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <button
                          onClick={() =>
                            setReplyFor({
                              comment: {
                                id: `theme-${t.name}`,
                                name: `Theme: ${t.name}`,
                                verified: false,
                                anon: false,
                                text: t.quote,
                                sent: "amber",
                                time: "",
                                replies: [],
                                flag: null,
                              },
                              themeMode: true,
                            })
                          }
                          className="mt-2 cursor-pointer rounded border-none bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-bold text-[#7C3AED]"
                        >
                          ✦ Draft response to this theme
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-[10px] text-[#94A3B8]">
                This analysis updates every 4 hours. Last updated 2 hours ago.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-4 text-xs text-[#64748B]">
          Read comments in the sub-tabs below to understand resident sentiment on this project.
        </div>
      )}

      {/* Sub-tab bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <SubTab
          label="Private Messages"
          badge={privUnread}
          active={feedbackSub === "private"}
          onClick={() => setFeedbackSub("private")}
        />
        <SubTab
          label="Public Forum"
          badge={pubAwaiting}
          active={feedbackSub === "public"}
          onClick={() => setFeedbackSub("public")}
        />
        {aiMode && (
          <SubTab
            label="Moderation Queue"
            badge={p.hidden.length}
            purple
            active={feedbackSub === "moderation"}
            onClick={() => setFeedbackSub("moderation")}
          />
        )}
        <div className="flex-1" />
        {feedbackSub !== "moderation" && (
          <DropdownPill
            label={`Sort: ${sort === "recent" ? "Most recent" : sort === "oldest" ? "Oldest" : "Most replies"}`}
            open={sortOpen}
            onToggle={() => setSortOpen((v) => !v)}
          >
            {(
              [
                ["recent", "Most recent"],
                ["oldest", "Oldest"],
                ...(feedbackSub === "public" ? ([["replies", "Most replies"]] as const) : []),
              ] as Array<[SortKey, string]>
            ).map(([k, label]) => (
              <DropdownItem
                key={k}
                label={label}
                active={sort === k}
                onClick={() => {
                  setSort(k);
                  setSortOpen(false);
                }}
              />
            ))}
          </DropdownPill>
        )}
      </div>

      {/* Sentiment filter chips (AI + public) */}
      {aiMode && feedbackSub === "public" && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#94A3B8]">Sentiment:</span>
          {["All", "Supportive", "Mixed", "Concerns"].map((s) => (
            <button
              key={s}
              onClick={() => setSentFilter(s)}
              className={`h-7 cursor-pointer rounded-full border px-2.5 text-[11px] font-semibold ${
                sentFilter === s
                  ? "border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]"
                  : "border-[#E2E8F0] bg-white text-[#475569]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Comment lists ── */}
      {feedbackSub !== "moderation" && (
        <div className="flex flex-col gap-3">
          {currentList.length === 0 ? (
            <EmptyState
              title={feedbackSub === "private" ? "No private messages yet." : "No comments yet."}
            />
          ) : (
            currentList.map((c) => (
              <CommentCard
                key={c.id}
                c={c}
                aiMode={aiMode}
                onName={() => setProfileFor(c)}
                onReply={() => setReplyFor({ comment: c })}
                onEditReply={(idx) => setReplyFor({ comment: c, editIdx: idx })}
                onDeleteReply={(idx) => setDelReplyFor({ comment: c, idx })}
                onDelete={feedbackSub === "public" ? () => setDelFor(c) : undefined}
              />
            ))
          )}
          {!aiMode && feedbackSub === "public" && (
            <p className="text-[11px] text-[#94A3B8]">
              All comments are visible to residents by default. Delete individual comments as
              needed.
            </p>
          )}
        </div>
      )}

      {/* ── Moderation queue ── */}
      {feedbackSub === "moderation" && aiMode && (
        <div className="flex flex-col gap-4">
          {/* Moderation mode selector */}
          <Card className="p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Comment moderation mode
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {MOD_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModMode(m)}
                  className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                    p.modMode === m.key
                      ? "border-[#7C3AED] bg-[#F5F3FF]"
                      : "border-[#E2E8F0] bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold text-[#111827]">{m.label}</div>
                  <div className="mt-0.5 text-[10px] leading-relaxed text-[#64748B]">
                    {m.desc}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <p className="text-xs text-[#64748B]">
            You can approve or reject comments. To preserve trust, comments are published as
            residents wrote them.
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {(["Awaiting review", "Rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setModFilter(f);
                  setModSel([]);
                }}
                className={`h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold ${
                  modFilter === f
                    ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                    : "border-[#E2E8F0] bg-white text-[#475569]"
                }`}
              >
                {f} · {f === "Awaiting review" ? p.hidden.length : p.rejected.length}
              </button>
            ))}
          </div>

          {modSel.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-xs text-white">
              <span className="font-semibold">{modSel.length} selected</span>
              <button
                onClick={() => setModSel([])}
                className="cursor-pointer border-none bg-transparent text-xs text-white/70 hover:text-white"
              >
                Clear
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setBulkConfirm("reject")}
                className="h-7 cursor-pointer rounded-lg border border-white/30 bg-transparent px-3 text-xs font-semibold text-white"
              >
                Bulk Reject
              </button>
              <button
                onClick={() => setBulkConfirm("approve")}
                className="h-7 cursor-pointer rounded-lg border-none bg-[#16A34A] px-3 text-xs font-semibold text-white"
              >
                Bulk Approve
              </button>
            </div>
          )}

          {modRows.length === 0 ? (
            <EmptyState
              title={
                modFilter === "Awaiting review"
                  ? "No comments awaiting review."
                  : "No rejected comments."
              }
            />
          ) : (
            modRows.map((c) => (
              <Card key={c.id} className="border-l-4 border-l-[#F59E0B] p-4">
                <div className="flex items-start gap-3">
                  {modFilter === "Awaiting review" && (
                    <input
                      type="checkbox"
                      className="mt-1 cursor-pointer"
                      checked={modSel.includes(c.id)}
                      onChange={(e) =>
                        setModSel((sel) =>
                          e.target.checked ? [...sel, c.id] : sel.filter((x) => x !== c.id)
                        )
                      }
                    />
                  )}
                  <Avatar name={c.name} size={28} onClick={() => setProfileFor(c)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setProfileFor(c)}
                        className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-[#1E3A5F] hover:underline"
                      >
                        {c.anon ? "Anonymous" : c.name}
                      </button>
                      <span className="text-[10px] text-[#94A3B8]">{c.time}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#374151]">{c.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {c.flag && modFilter === "Awaiting review" && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          ⚑ {c.flag}
                        </span>
                      )}
                      {modFilter === "Rejected" && (
                        <span className="rounded bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                          Rejected · in audit log
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {modFilter === "Awaiting review" ? (
                      <>
                        <button
                          onClick={() => setModConfirm({ action: "approve", c })}
                          className="h-8 cursor-pointer rounded-lg border-none bg-[#16A34A] px-3 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setModConfirm({ action: "reject", c })}
                          className="h-8 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => restoreRejected(p.id, c.id)}
                        className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
                      >
                        Restore to forum
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {replyFor && (
        <ReplyModal
          target={replyFor.comment}
          editIdx={replyFor.editIdx}
          themeMode={replyFor.themeMode}
          aiMode={aiMode}
          onClose={() => setReplyFor(null)}
          onSubmit={(text, attr) => {
            if (replyFor.themeMode) {
              toast("Response posted");
            } else if (replyFor.editIdx !== undefined) {
              editReply(p.id, replyFor.comment.id, replyFor.editIdx, text);
              addLog(p.id, `Edited a reply to ${replyFor.comment.name}`);
              toast("Reply updated");
            } else {
              addReply(p.id, replyFor.comment.id, {
                attr,
                dept: p.dept,
                name: attr === "name" ? STAFF_NAME : undefined,
                text,
                time: "just now",
              });
              addLog(p.id, `Replied to ${replyFor.comment.name}`);
              toast("Reply posted");
            }
            setReplyFor(null);
          }}
        />
      )}

      {profileFor && (
        <ResidentProfileModal c={profileFor} onClose={() => setProfileFor(null)} />
      )}

      {delFor && (
        <ConfirmModal
          title="Delete this comment?"
          body="The comment will be removed from the public forum. This action is logged."
          confirmLabel="Delete Comment"
          danger
          onCancel={() => setDelFor(null)}
          onConfirm={() => {
            deleteComment(p.id, delFor.id);
            setDelFor(null);
          }}
        />
      )}

      {delReplyFor && (
        <ConfirmModal
          title="Delete this reply?"
          body="The reply will be removed from the resident view. This action is logged in the project's edit history."
          confirmLabel="Delete Reply"
          danger
          onCancel={() => setDelReplyFor(null)}
          onConfirm={() => {
            deleteReply(p.id, delReplyFor.comment.id, delReplyFor.idx);
            setDelReplyFor(null);
          }}
        />
      )}

      {modConfirm && (
        <ConfirmModal
          title={
            modConfirm.action === "approve" ? "Approve this comment?" : "Reject this comment?"
          }
          body={
            modConfirm.action === "approve"
              ? "It will be published to the public forum exactly as the resident wrote it."
              : "It will be removed and kept in the audit log for reference."
          }
          confirmLabel="Confirm"
          danger={modConfirm.action === "reject"}
          onCancel={() => setModConfirm(null)}
          onConfirm={() => {
            if (modConfirm.action === "approve") approveComment(p.id, modConfirm.c.id);
            else rejectComment(p.id, modConfirm.c.id);
            setModSel((sel) => sel.filter((x) => x !== modConfirm.c.id));
            setModConfirm(null);
          }}
        />
      )}

      {bulkConfirm && (
        <ConfirmModal
          title={`${bulkConfirm === "approve" ? "Approve" : "Reject"} ${modSel.length} comment${
            modSel.length === 1 ? "" : "s"
          }?`}
          body={
            bulkConfirm === "approve"
              ? "They will be published to the public forum exactly as residents wrote them."
              : "They will be removed. Rejected comments stay in the audit log."
          }
          confirmLabel="Confirm"
          danger={bulkConfirm === "reject"}
          onCancel={() => setBulkConfirm(null)}
          onConfirm={() => {
            modSel.forEach((id) => {
              if (bulkConfirm === "approve") approveComment(p.id, id);
              else rejectComment(p.id, id);
            });
            toast(
              `${modSel.length} comment${modSel.length === 1 ? "" : "s"} ${
                bulkConfirm === "approve" ? "approved" : "rejected"
              }`
            );
            setModSel([]);
            setBulkConfirm(null);
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function SubTab({
  label,
  badge,
  purple,
  active,
  onClick,
}: {
  label: string;
  badge: number;
  purple?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border-none px-3 text-xs font-semibold transition-colors ${
        active ? "bg-[#EFF3F8] text-[#1E3A5F]" : "bg-transparent text-[#64748B] hover:text-[#1E3A5F]"
      }`}
    >
      {label}
      {badge > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white ${
            purple ? "bg-[#7C3AED]" : "bg-[#ef4444]"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function CommentCard({
  c,
  aiMode,
  onName,
  onReply,
  onEditReply,
  onDeleteReply,
  onDelete,
}: {
  c: Comment;
  aiMode: boolean;
  onName: () => void;
  onReply: () => void;
  onEditReply: (idx: number) => void;
  onDeleteReply: (idx: number) => void;
  onDelete?: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={c.anon ? "Anonymous" : c.name} size={30} onClick={onName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onName}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-[#1E3A5F] hover:underline"
            >
              {c.anon ? "Anonymous" : c.name}
            </button>
            {c.verified && (
              <span className="rounded bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-bold text-[#16A34A]">
                Verified
              </span>
            )}
            {aiMode && <SentChip sent={c.sent} />}
            <span className="text-[10px] text-[#94A3B8]">{c.time}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#374151]">{c.text}</p>

          {/* Official replies */}
          {c.replies.map((r, i) => (
            <div
              key={i}
              className="mt-2.5 rounded-lg border border-[#DBEAFE] bg-[#F0F7FF] p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                {r.attr === "official" || !r.name ? <SealAvatar size={24} /> : <Avatar name={r.name} size={24} bg="#2563EB" />}
                <span className="text-[11px] font-bold text-[#111827]">
                  {r.attr === "official" || !r.name ? "Township Staff" : r.name}
                </span>
                <span className="rounded bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold text-[#1D4ED8]">
                  Official
                </span>
                {r.edited && <span className="text-[10px] italic text-[#94A3B8]">(edited)</span>}
                <span className="text-[10px] text-[#94A3B8]">{r.time}</span>
                <div className="flex-1" />
                <button
                  onClick={() => onEditReply(i)}
                  className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-semibold text-[#2563EB] hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteReply(i)}
                  className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-semibold text-[#DC2626] hover:underline"
                >
                  Delete
                </button>
              </div>
              <div className="mt-1 text-[10px] text-[#64748B]">{r.dept}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#374151]">{r.text}</p>
            </div>
          ))}

          <div className="mt-2.5 flex gap-3">
            <button
              onClick={onReply}
              className="h-7 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3 text-[11px] font-semibold text-white hover:bg-[#152a45]"
            >
              Reply
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="h-7 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3 text-[11px] font-semibold text-[#DC2626] hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReplyModal({
  target,
  editIdx,
  themeMode,
  aiMode,
  onClose,
  onSubmit,
}: {
  target: Comment;
  editIdx?: number;
  themeMode?: boolean;
  aiMode: boolean;
  onClose: () => void;
  onSubmit: (text: string, attr: "name" | "official") => void;
}) {
  const editing = editIdx !== undefined;
  const editingReply = editing ? target.replies[editIdx] : null;
  const [text, setText] = useState(editingReply?.text ?? "");
  const [attr, setAttr] = useState<"name" | "official">(editingReply?.attr ?? "name");
  const [busy, setBusy] = useState(false);
  const { dept } = useStaff();

  const draftWithAi = () => {
    setBusy(true);
    setTimeout(() => {
      setText(
        `Thank you for sharing this — we hear you. ${
          target.sent === "red"
            ? "Your concern has been passed to the project team, and we will post an update on this page as soon as we have specifics."
            : "We appreciate the input and will factor it into the next stage of this project. Watch this page for updates."
        }`
      );
      setBusy(false);
    }, 1100);
  };

  return (
    <Modal onClose={onClose} width={540}>
      <h3 className="mb-1 text-base font-bold text-[#111827]">
        {editing ? "Edit reply" : `Reply to ${target.anon ? "Anonymous" : target.name}`}
      </h3>
      {!themeMode && (
        <div className="mb-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs italic text-[#64748B]">
          &ldquo;{target.text}&rdquo;
        </div>
      )}

      <div className="mb-3">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Reply as
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAttr("name")}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left ${
              attr === "name" ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white"
            }`}
          >
            <Avatar name={STAFF_NAME} size={28} bg="#2563EB" />
            <span>
              <span className="block text-xs font-bold text-[#111827]">{STAFF_NAME}</span>
              <span className="block text-[10px] text-[#64748B]">
                Personal and accountable · {dept}
              </span>
            </span>
          </button>
          <button
            onClick={() => setAttr("official")}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left ${
              attr === "official" ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white"
            }`}
          >
            <SealAvatar size={28} />
            <span>
              <span className="block text-xs font-bold text-[#111827]">
                Township Staff (Official)
              </span>
              <span className="block text-[10px] text-[#64748B]">For sensitive matters</span>
            </span>
          </button>
        </div>
      </div>

      {aiMode && (
        <button
          onClick={draftWithAi}
          disabled={busy}
          className="mb-2 cursor-pointer rounded border-none bg-[#F5F3FF] px-2.5 py-1.5 text-[11px] font-bold text-[#7C3AED]"
        >
          {busy ? "Drafting…" : "✦ Draft with AI"}
        </button>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your reply…"
        className="min-h-[90px] w-full rounded-lg border border-[#E2E8F0] p-3 text-xs leading-relaxed outline-none"
      />

      {/* Live preview */}
      {text.trim() && (
        <div className="mt-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            This is how your reply will look to residents
          </div>
          <div className="rounded-lg border border-[#DBEAFE] bg-[#F0F7FF] p-3">
            <div className="flex items-center gap-2">
              {attr === "official" ? <SealAvatar size={22} /> : <Avatar name={STAFF_NAME} size={22} bg="#2563EB" />}
              <span className="text-[11px] font-bold text-[#111827]">
                {attr === "official" ? "Township Staff" : STAFF_NAME}
              </span>
              <span className="rounded bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold text-[#1D4ED8]">
                Official
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#374151]">{text}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
        >
          Cancel
        </button>
        <button
          disabled={!text.trim()}
          onClick={() => onSubmit(text.trim(), attr)}
          className={`h-9 rounded-lg border-none px-4 text-xs font-semibold text-white ${
            text.trim() ? "cursor-pointer bg-[#1E3A5F] hover:bg-[#152a45]" : "cursor-not-allowed bg-slate-300"
          }`}
        >
          {editing ? "Save reply" : "Post Reply"}
        </button>
      </div>
    </Modal>
  );
}

function ResidentProfileModal({ c, onClose }: { c: Comment; onClose: () => void }) {
  const { projects, openProj, toast } = useStaff();
  const name = c.anon ? "Anonymous resident" : c.name;
  const contact = residentContact(c.anon ? "anonymous" : c.name);

  const engagement = projects
    .map((p) => ({
      p,
      count: [...p.public, ...p.privateMsgs].filter((x) => x.name === c.name && !c.anon).length,
    }))
    .filter((e) => e.count > 0);

  const copy = (v: string) => {
    try {
      navigator.clipboard?.writeText(v);
    } catch {
      // clipboard unavailable — the toast still confirms the intent
    }
    toast("Copied to clipboard");
  };

  return (
    <Modal onClose={onClose} width={340}>
      <div className="flex items-center gap-3">
        <Avatar name={c.anon ? "Anonymous" : c.name} size={40} />
        <div>
          <div className="text-sm font-bold text-[#111827]">{name}</div>
          <div className="text-[11px] text-[#94A3B8]">Collier Township resident</div>
        </div>
      </div>

      {!c.anon && (
        <div className="mt-4 flex flex-col gap-2">
          {(
            [
              ["ZIP", contact.zip],
              ["Email", contact.email],
              ["Phone", contact.phone],
            ] as Array<[string, string]>
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2"
            >
              <span className="text-[10px] font-bold uppercase text-[#94A3B8]">{label}</span>
              <span className="text-xs text-[#334155]">{value}</span>
              <button
                onClick={() => copy(value)}
                className="cursor-pointer border-none bg-transparent text-[10px] font-semibold text-[#2563EB] hover:underline"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Engagement across projects
        </div>
        {engagement.length === 0 ? (
          <p className="text-xs italic text-[#94A3B8]">
            This resident has not commented on any other projects yet.
          </p>
        ) : (
          engagement.map((e) => (
            <button
              key={e.p.id}
              onClick={() => {
                onClose();
                openProj(e.p.id, { tab: "feedback" });
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border-none bg-transparent px-2 py-1.5 text-left text-xs text-[#2563EB] hover:bg-slate-50"
            >
              <span className="truncate">{e.p.title}</span>
              <span className="text-[#94A3B8]">{e.count}</span>
            </button>
          ))
        )}
      </div>

      <p className="mt-4 border-t border-[#F1F5F9] pt-3 text-[10px] leading-relaxed text-[#94A3B8]">
        This information is only visible to authorized township staff. Do not share resident
        contact information externally.
      </p>
    </Modal>
  );
}
