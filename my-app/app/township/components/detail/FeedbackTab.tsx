"use client";

// ================================================================
//  Project Detail — Feedback tab body.
//  Private Messages / Public Forum sub-tabs, AI-mode Moderation
//  Queue + sentiment panel, reply modal with attribution choice,
//  and the delete/bulk/mod-action confirm dialogs. The detail-page
//  shell owns the header and main tab bar; this renders only the
//  tab body. Honors ?sub=private|public|moderation on mount.
// ================================================================

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTownship } from "@/app/township/TownshipContext";
import {
  simulateAi,
  STAFF_NAME,
  type SentimentCode,
  type StaffComment,
  type StaffProject,
  type StaffTheme,
} from "@/app/township/data";
import SentimentPanel from "./feedback/SentimentPanel";
import FeedbackCommentCard from "./feedback/FeedbackCommentCard";
import ModerationQueue, { type ModFilter } from "./feedback/ModerationQueue";
import ReplyModal, { type ReplyAttr } from "./feedback/ReplyModal";
import ConfirmDialog from "./feedback/ConfirmDialog";
import ResidentProfileModal from "./feedback/ResidentProfileModal";
import { pillStyle, SortMenu } from "./feedback/ui";

type SubTab = "private" | "public" | "moderation";
type ListKey = "privateMsgs" | "public";

interface ReplyTarget {
  name: string;
  text: string;
  commentId?: string;
  list?: ListKey;
  /** Index of the reply being edited (edit mode). */
  editIdx?: number;
  theme?: boolean;
}

const logEntry = (text: string) => ({ text, time: "just now", by: STAFF_NAME });

const applyToList = (
  p: StaffProject,
  list: ListKey,
  fn: (cs: StaffComment[]) => StaffComment[]
): StaffProject =>
  list === "privateMsgs" ? { ...p, privateMsgs: fn(p.privateMsgs) } : { ...p, public: fn(p.public) };

export default function FeedbackTab({ projectId }: { projectId: string }) {
  const { getProject, updateProject, projects, aiMode, dept, toast } = useTownship();
  const router = useRouter();
  const searchParams = useSearchParams();
  const project = getProject(projectId);

  // ── Sub-tab (initial value honors ?sub=) ───────────────────────
  const [sub, setSub] = useState<SubTab>(() => {
    const s = searchParams.get("sub");
    return s === "private" || s === "moderation" || s === "public" ? s : "public";
  });

  // ── View state ─────────────────────────────────────────────────
  const [privSort, setPrivSort] = useState<"recent" | "oldest">("recent");
  const [pubSort, setPubSort] = useState<"recent" | "oldest" | "replies">("recent");
  const [sortMenu, setSortMenu] = useState<null | "priv" | "pub">(null);
  const [pubSent, setPubSent] = useState<"All" | "Supportive" | "Mixed" | "Concerns">("All");
  const [modFilter, setModFilter] = useState<ModFilter>("awaiting");
  const [modSel, setModSel] = useState<string[]>([]);
  const [themeBusy, setThemeBusy] = useState<string | null>(null);

  // ── Modal state ────────────────────────────────────────────────
  const [replyFor, setReplyFor] = useState<ReplyTarget | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyAttr, setReplyAttr] = useState<ReplyAttr>("name");
  const [replyBusy, setReplyBusy] = useState(false);
  const lastAttr = useRef<ReplyAttr>("name");
  const [delReply, setDelReply] = useState<{
    list: ListKey;
    commentId: string;
    idx: number;
    name: string;
  } | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<null | "approve" | "reject">(null);
  const [modAction, setModAction] = useState<null | {
    kind: "approve" | "reject";
    c: StaffComment;
  }>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  // The moderation view only exists while AI assistance is on.
  const effectiveSub: SubTab = sub === "moderation" && !aiMode ? "public" : sub;

  // ── Derived lists (hooks must run before any early return) ─────
  const privList = useMemo(() => {
    if (!project) return [];
    return privSort === "oldest" ? [...project.privateMsgs].reverse() : project.privateMsgs;
  }, [project, privSort]);

  const pubList = useMemo(() => {
    if (!project) return [];
    const codeFor: Record<string, SentimentCode> = {
      Supportive: "green",
      Mixed: "amber",
      Concerns: "red",
    };
    let list = project.public;
    if (aiMode && pubSent !== "All") list = list.filter((c) => c.sent === codeFor[pubSent]);
    if (pubSort === "oldest") return [...list].reverse();
    if (pubSort === "replies") return [...list].sort((a, b) => b.replies.length - a.replies.length);
    return list;
  }, [project, pubSort, pubSent, aiMode]);

  if (!project) return null;

  const privUnread = project.privateMsgs.filter((c) => c.replies.length === 0).length;
  const pubAwaiting = project.public.filter((c) => c.replies.length === 0).length;
  const hidCount = project.hidden.length;

  // ── Reply modal handlers ───────────────────────────────────────
  const openReplyFresh = (list: ListKey, c: StaffComment) => {
    setReplyFor({ name: c.name, text: c.text, commentId: c.id, list });
    setReplyText("");
    setReplyAttr(lastAttr.current);
  };

  const openReplyEdit = (list: ListKey, c: StaffComment, idx: number) => {
    const r = c.replies[idx];
    if (!r) return;
    setReplyFor({ name: c.name, text: c.text, commentId: c.id, list, editIdx: idx });
    setReplyText(r.text);
    setReplyAttr(r.attr === "dept" ? "dept" : "name");
  };

  const closeReply = () => {
    setReplyFor(null);
    setReplyText("");
    setReplyBusy(false);
  };

  const sendReply = () => {
    if (!replyFor) return;
    const rf = replyFor;
    const text = replyText.trim();
    lastAttr.current = replyAttr;
    if (!text) {
      closeReply();
      return;
    }
    if (rf.commentId && rf.list) {
      const list = rf.list;
      if (rf.editIdx != null) {
        const idx = rf.editIdx;
        updateProject(projectId, (p) => ({
          ...applyToList(p, list, (cs) =>
            cs.map((c) =>
              c.id === rf.commentId
                ? {
                    ...c,
                    replies: c.replies.map((r, i) =>
                      i === idx
                        ? { ...r, text, attr: replyAttr, name: STAFF_NAME, dept, edited: true }
                        : r
                    ),
                  }
                : c
            )
          ),
          log: [logEntry(`Edited a reply to ${rf.name}`), ...p.log],
        }));
        toast("Reply updated");
      } else {
        updateProject(projectId, (p) => ({
          ...applyToList(p, list, (cs) =>
            cs.map((c) =>
              c.id === rf.commentId
                ? {
                    ...c,
                    replies: [
                      ...c.replies,
                      {
                        attr: replyAttr,
                        name: STAFF_NAME,
                        dept,
                        text,
                        time: "just now",
                        edited: false,
                      },
                    ],
                  }
                : c
            )
          ),
          log: [logEntry(`Replied to ${rf.name}`), ...p.log],
        }));
        toast("Reply sent");
      }
    } else {
      // Theme drafts have no thread to post to.
      toast("Response posted");
    }
    closeReply();
  };

  const draftReply = async () => {
    if (!replyFor || replyBusy) return;
    setReplyBusy(true);
    const first = replyFor.name.split(" ")[0];
    const out = await simulateAi(
      `Thank you for reaching out, ${first}. We appreciate you sharing this and want you to know it's on our radar — a staff member from ${dept} will follow up with specifics shortly.\n\n— ${dept}`
    );
    setReplyText(out);
    setReplyBusy(false);
  };

  const draftTheme = async (t: StaffTheme) => {
    if (themeBusy) return;
    setThemeBusy(t.name);
    const out = await simulateAi(
      `We've heard a number of residents raise "${t.name.toLowerCase()}" and want to address it directly. Our team is reviewing this closely, and we'll share concrete next steps in the coming weeks.`
    );
    setThemeBusy(null);
    setReplyFor({ name: "Theme: " + t.name, text: t.quote, theme: true });
    setReplyText(out);
    setReplyAttr(lastAttr.current);
  };

  // ── Comment mutations ──────────────────────────────────────────
  const deleteComment = (c: StaffComment) => {
    updateProject(projectId, (p) => ({
      ...p,
      public: p.public.filter((x) => x.id !== c.id),
      privateMsgs: p.privateMsgs.filter((x) => x.id !== c.id),
      hidden: p.hidden.filter((x) => x.id !== c.id),
    }));
    toast("Comment deleted");
  };

  const delReplyGo = () => {
    if (!delReply) return;
    const d = delReply;
    updateProject(projectId, (p) => ({
      ...applyToList(p, d.list, (cs) =>
        cs.map((c) =>
          c.id === d.commentId
            ? { ...c, replies: c.replies.filter((_, i) => i !== d.idx) }
            : c
        )
      ),
      log: [logEntry(`Deleted a reply to ${d.name}`), ...p.log],
    }));
    toast("Reply deleted");
    setDelReply(null);
  };

  // ── Moderation mutations ───────────────────────────────────────
  const approveComment = (c: StaffComment) => {
    updateProject(projectId, (p) => ({
      ...p,
      hidden: p.hidden.filter((x) => x.id !== c.id),
      public: [{ ...c, flag: null }, ...p.public],
    }));
    toast("Comment approved");
  };

  const rejectComment = (c: StaffComment) => {
    updateProject(projectId, (p) => ({
      ...p,
      hidden: p.hidden.filter((x) => x.id !== c.id),
      public: p.public.filter((x) => x.id !== c.id),
      rejected: [{ ...c }, ...p.rejected],
      log: [logEntry("Rejected a comment"), ...p.log],
    }));
    toast("Comment rejected");
  };

  const doModAction = () => {
    if (!modAction) return;
    if (modAction.kind === "approve") approveComment(modAction.c);
    else rejectComment(modAction.c);
    setModSel((s) => s.filter((x) => x !== modAction.c.id));
    setModAction(null);
  };

  const doBulk = () => {
    if (!bulkConfirm) return;
    const kind = bulkConfirm;
    const n = project.hidden.filter((h) => modSel.includes(h.id)).length;
    updateProject(projectId, (p) => {
      const sel = p.hidden.filter((h) => modSel.includes(h.id));
      const rest = p.hidden.filter((h) => !modSel.includes(h.id));
      if (kind === "approve") {
        return { ...p, hidden: rest, public: [...sel.map((c) => ({ ...c, flag: null })), ...p.public] };
      }
      return {
        ...p,
        hidden: rest,
        rejected: [...sel, ...p.rejected],
        log: [logEntry("Rejected a comment"), ...p.log],
      };
    });
    toast(kind === "approve" ? `${n} comments approved` : `${n} comments rejected`);
    setBulkConfirm(null);
    setModSel([]);
  };

  const restoreRejected = (c: StaffComment) => {
    updateProject(projectId, (p) => ({
      ...p,
      rejected: p.rejected.filter((x) => x.id !== c.id),
      public: [{ ...c, flag: null }, ...p.public],
    }));
    toast("Comment restored to forum");
  };

  const toggleSel = (id: string) =>
    setModSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // ── Resident profile ───────────────────────────────────────────
  const copyVal = (val: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(val).catch(() => {});
    }
    toast("Copied to clipboard");
  };

  const openProjectFeedback = (id: string) => {
    setProfileName(null);
    if (id !== projectId) router.push(`/township/project/${id}?tab=feedback`);
  };

  // ── Shared bits ────────────────────────────────────────────────
  // Block tabs matching the resident Discussion component's tab bar
  // (navy fill on the active tab, white with hairline dividers otherwise).
  const chip = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: 14,
    border: "none",
    borderLeft: active ? "none" : "1px solid #e5e7eb",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: active ? "#0d2240" : "white",
    color: active ? "white" : "#374151",
    borderRadius: 0,
    fontFamily: "inherit",
    transition: "background 0.15s ease, color 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  });

  const badge = (n: number, bg: string) => (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "white",
        background: bg,
        borderRadius: 8,
        padding: "0 5px",
        lineHeight: "16px",
        minWidth: 16,
        textAlign: "center",
      }}
    >
      {n}
    </span>
  );

  const emptyBox = (text: string) => (
    <div style={{ textAlign: "center", padding: 40, fontSize: 13, color: "#94A3B8" }}>{text}</div>
  );

  const dashedNote = (text: string, mt = 0) => (
    <div
      style={{
        border: "1px dashed #e5e7eb",
        background: "#F8FAFC",
        borderRadius: 10,
        padding: "12px 14px",
        fontSize: 12.5,
        color: "#94A3B8",
        lineHeight: 1.5,
        marginTop: mt,
      }}
    >
      {text}
    </div>
  );

  const renderCard = (list: ListKey, c: StaffComment, variant: "private" | "public") => (
    <FeedbackCommentCard
      key={c.id}
      comment={c}
      aiMode={aiMode}
      variant={variant}
      onOpenProfile={setProfileName}
      onReply={() => openReplyFresh(list, c)}
      onEditReply={(i) => openReplyEdit(list, c, i)}
      onDeleteReply={(i) => setDelReply({ list, commentId: c.id, idx: i, name: c.name })}
      onDelete={variant === "public" ? () => deleteComment(c) : undefined}
    />
  );

  return (
    <div>
      {/* AI sentiment panel / manual hint */}
      {aiMode ? (
        <SentimentPanel project={project} themeBusy={themeBusy} onDraftTheme={draftTheme} />
      ) : (
        <div style={{ marginBottom: 18 }}>
          {dashedNote(
            "Read comments in the sub-tabs below to understand resident sentiment on this project."
          )}
        </div>
      )}

      {/* Sub-tab bar — resident Discussion tab style */}
      <div
        style={{
          display: "flex",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <button type="button" style={chip(effectiveSub === "private")} onClick={() => setSub("private")}>
          Private Messages
          {privUnread > 0 && badge(privUnread, "#CD481B")}
        </button>
        <button type="button" style={chip(effectiveSub === "public")} onClick={() => setSub("public")}>
          Public Forum
          {pubAwaiting > 0 && badge(pubAwaiting, "#CD481B")}
        </button>
        {aiMode && (
          <button
            type="button"
            style={chip(effectiveSub === "moderation")}
            onClick={() => setSub("moderation")}
          >
            Moderation Queue
            {hidCount > 0 &&
              badge(
                hidCount,
                effectiveSub === "moderation" ? "rgba(255,255,255,.25)" : "#0d2240"
              )}
          </button>
        )}
      </div>

      {/* ── Private Messages ── */}
      {effectiveSub === "private" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <SortMenu
              label={privSort === "recent" ? "Recent first" : "Oldest first"}
              open={sortMenu === "priv"}
              onToggle={() => setSortMenu((m) => (m === "priv" ? null : "priv"))}
              options={[
                { key: "recent", label: "Recent first" },
                { key: "oldest", label: "Oldest first" },
              ]}
              value={privSort}
              onPick={(k) => {
                setPrivSort(k === "oldest" ? "oldest" : "recent");
                setSortMenu(null);
              }}
              width={160}
            />
          </div>
          {privList.length === 0 ? (
            emptyBox("No private messages yet.")
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {privList.map((c) => renderCard("privateMsgs", c, "private"))}
            </div>
          )}
        </div>
      )}

      {/* ── Public Forum ── */}
      {effectiveSub === "public" && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {aiMode && (
              <>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>Sentiment:</span>
                {(["All", "Supportive", "Mixed", "Concerns"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    style={pillStyle(pubSent === s)}
                    onClick={() => setPubSent(s)}
                  >
                    {s}
                  </button>
                ))}
              </>
            )}
            <span style={{ flex: 1 }} />
            <SortMenu
              label={
                pubSort === "recent"
                  ? "Recent first"
                  : pubSort === "oldest"
                    ? "Oldest first"
                    : "Most replies"
              }
              open={sortMenu === "pub"}
              onToggle={() => setSortMenu((m) => (m === "pub" ? null : "pub"))}
              options={[
                { key: "recent", label: "Recent first" },
                { key: "oldest", label: "Oldest first" },
                { key: "replies", label: "Most replies" },
              ]}
              value={pubSort}
              onPick={(k) => {
                setPubSort(k === "oldest" ? "oldest" : k === "replies" ? "replies" : "recent");
                setSortMenu(null);
              }}
              width={170}
            />
          </div>
          {pubList.length === 0 ? (
            emptyBox("No comments yet.")
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {pubList.map((c) => renderCard("public", c, "public"))}
            </div>
          )}
          {!aiMode &&
            dashedNote(
              "All comments are visible to residents by default. Delete individual comments as needed.",
              14
            )}
        </div>
      )}

      {/* ── Moderation Queue (AI only) ── */}
      {effectiveSub === "moderation" && aiMode && (
        <ModerationQueue
          project={project}
          modFilter={modFilter}
          setModFilter={setModFilter}
          modSel={modSel}
          toggleSel={toggleSel}
          clearSel={() => setModSel([])}
          onAsk={(kind, c) => setModAction({ kind, c })}
          onBulk={(kind) => setBulkConfirm(kind)}
          onRestore={restoreRejected}
          onOpenProfile={setProfileName}
        />
      )}

      {/* ── Modals ── */}
      {replyFor && (
        <ReplyModal
          name={replyFor.name}
          quote={replyFor.text}
          editing={replyFor.editIdx != null}
          aiMode={aiMode}
          dept={dept}
          attr={replyAttr}
          setAttr={(a) => {
            setReplyAttr(a);
            lastAttr.current = a;
          }}
          text={replyText}
          setText={setReplyText}
          busy={replyBusy}
          onDraft={draftReply}
          onCancel={closeReply}
          onSend={sendReply}
        />
      )}

      {delReply && (
        <ConfirmDialog
          title="Delete this reply?"
          body="This reply will be removed from the resident view. This action will be logged in the project’s edit history."
          confirmLabel="Delete Reply"
          variant="danger"
          width={440}
          z={75}
          onCancel={() => setDelReply(null)}
          onConfirm={delReplyGo}
        />
      )}

      {bulkConfirm && (
        <ConfirmDialog
          title={
            bulkConfirm === "approve"
              ? `Approve ${modSel.length} comments?`
              : `Reject ${modSel.length} comments?`
          }
          body="This applies to all selected comments at once. Rejected comments stay in the audit log."
          confirmLabel="Confirm"
          width={420}
          z={84}
          onCancel={() => setBulkConfirm(null)}
          onConfirm={doBulk}
        />
      )}

      {modAction && (
        <ConfirmDialog
          title={
            modAction.kind === "approve" ? "Approve this comment?" : "Reject this comment?"
          }
          body={
            modAction.kind === "approve"
              ? "It will be published to the public forum exactly as the resident wrote it."
              : "It will be removed and kept in the audit log for reference."
          }
          confirmLabel="Confirm"
          width={400}
          z={78}
          onCancel={() => setModAction(null)}
          onConfirm={doModAction}
        />
      )}

      {profileName && (
        <ResidentProfileModal
          name={profileName}
          projects={projects}
          onClose={() => setProfileName(null)}
          onOpenProject={openProjectFeedback}
          onCopy={copyVal}
        />
      )}
    </div>
  );
}
