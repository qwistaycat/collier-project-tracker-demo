"use client";

import { useState, useRef, useEffect } from "react";
import type { DiscussionData, Comment, Reply } from "@/app/data/proposals";
import { EyeIcon, ThumbUpIcon, ThumbDownIcon, ReplyIcon, MoreIcon } from "./icons";

// ── Local data shapes ─────────────────────────────────────────────
// The shared Comment/Reply types don't carry an id or vote counts (the
// mobile app also consumes that file), so we layer them on locally the
// moment data comes in, rather than touching the shared schema.

type VoteValue = "like" | "dislike" | undefined;

type PastFeedbackWithMeta = { time: string; message: string; _id: string };

type ReplyWithMeta = Reply & {
  _id: string;
  likes: number;
  dislikes: number;
  /** Posted by the current resident this session (drives edit/delete). */
  own?: boolean;
  // The comment's _id (replied to the top-level post) or another reply's
  // _id (replied to a specific, currently-visible reply) that this reply
  // was created under. Only used while the thread is collapsed, so the
  // reply stays visible right where it was posted instead of disappearing
  // behind the "View N replies" toggle.
  pinnedAfter?: string;
};

type CommentWithMeta = Omit<Comment, "replies"> & {
  _id: string;
  likes: number;
  dislikes: number;
  replies: ReplyWithMeta[];
  /** Posted by the current resident this session (drives edit/delete). */
  own?: boolean;
};

// ── Posting identity ──────────────────────────────────────────────
// Residents choose how they appear on PUBLIC comments: username,
// initials, or a Google-Docs-style anonymous animal. Private
// messages to the township always carry the real name and username.

export type PostIdentity = "username" | "initials" | "anonymous";

const RESIDENT_NAME = "Christy Yu";
const RESIDENT_USERNAME = "Christy";
const RESIDENT_INITIALS = "C.Y.";

const ANON_ANIMALS = ["Duck", "Ant", "Fox", "Owl", "Beaver", "Heron", "Turtle", "Quail"];
// Session counter (not Math.random) keeps renders pure.
let anonCounter = 0;
function nextAnonName(): string {
  return `Anonymous ${ANON_ANIMALS[anonCounter++ % ANON_ANIMALS.length]}`;
}

function identityDisplay(
  identity: PostIdentity,
  anonName: string | null
): { name: string; initial: string; color: string } {
  if (identity === "initials") {
    return { name: RESIDENT_INITIALS, initial: "C", color: "#22c55e" };
  }
  if (identity === "anonymous") {
    const name = anonName ?? "Anonymous";
    return { name, initial: name.split(" ")[1]?.charAt(0) ?? "A", color: "#64748b" };
  }
  return { name: RESIDENT_USERNAME, initial: "C", color: "#22c55e" };
}

function seedPastFeedback(
  items: { time: string; message: string }[]
): PastFeedbackWithMeta[] {
  return items.map((f, i) => ({ ...f, _id: `pf${i}` }));
}

function seedComments(comments: Comment[]): CommentWithMeta[] {
  return comments.map((c, i) => ({
    ...c,
    _id: `c${i}`,
    likes: 0,
    dislikes: 0,
    replies: c.replies.map((r, j) => ({
      ...r,
      _id: `c${i}-r${j}`,
      likes: 0,
      dislikes: 0,
    })),
  }));
}

// Delta to apply to a single vote-kind's counter when switching a vote
// from `current` to `next` (either of which may be undefined/"no vote").
function voteDelta(current: VoteValue, next: VoteValue, kind: "like" | "dislike") {
  const wasActive = current === kind;
  const isActive = next === kind;
  if (wasActive === isActive) return 0;
  return isActive ? 1 : -1;
}

// threadIdx is formatted as "pub-<index>" — every comment handler below
// needs the numeric index back out to look up/update the right comment.
function parseThreadIdx(threadIdx: string): number | null {
  const idx = parseInt(threadIdx.split("-")[1], 10);
  return isNaN(idx) ? null : idx;
}

// ── Shared styles & helpers ───────────────────────────────────────
// Pulled out because the same "message bubble", "reply link", and
// "cancel/submit button" visuals were previously copy-pasted across
// ReplyItem, CommentThread, PastFeedbackItem, ReplyForm, and both the
// private/public composer blocks.

// Shared inactive color for reply/like/dislike so all three read as one
// consistent set of icon+text controls.
const actionIdleColor = "#6b7280";
const actionHoverColor = "#2563eb";

// Hover-to-blue behavior shared by every inline icon+text control (Reply,
// Like/Dislike, the "..." menu trigger) — pass `isActive` for controls
// that should stay blue on mouse-out once toggled on (e.g. a pressed vote).
function hoverColorHandlers(isActive: boolean = false) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.color = actionHoverColor;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.color = isActive ? actionHoverColor : actionIdleColor;
    },
  };
}

const bubbleStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  padding: "10px 14px",
  fontSize: 13,
  color: "#374151",
  lineHeight: 1.6,
};

const replyTriggerStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 14,
  color: actionIdleColor,
  cursor: "pointer",
};

const actionsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: 5,
};

const voteButtonStyle = (active: boolean, activeColor: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  color: active ? activeColor : actionIdleColor,
  cursor: "pointer",
});

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "white",
  color: "#6b7280",
  fontSize: 12,
  fontWeight: 500,
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  cursor: "pointer",
};

function getSubmitButtonStyle(enabled: boolean): React.CSSProperties {
  return {
    padding: "8px 18px",
    background: "#0d2240",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.65,
    transition: "opacity 0.15s",
  };
}

function getNameStyle(isOfficial?: boolean): React.CSSProperties {
  return isOfficial
    ? { fontWeight: 700, color: "#2563eb", fontSize: 13 }
    : { fontWeight: 600, fontSize: 13, color: "#111827" };
}

function getTabStyle(active: boolean): React.CSSProperties {
  return {
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
  };
}

// ── Avatar ──────────────────────────────────────────────────────

function Avatar({ initial, color }: { initial: string; color: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        flexShrink: 0,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {initial}
    </div>
  );
}

// ── Comment Header (avatar + name + optional Official badge + time) ─

function CommentHeader({
  initial,
  avatarColor,
  name,
  timeAgo,
  isOfficial,
  marginBottom = 3,
  menu,
}: {
  initial: string;
  avatarColor: string;
  name: string;
  timeAgo: string;
  isOfficial?: boolean;
  marginBottom?: number;
  menu?: React.ReactNode;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, marginBottom }}
    >
      <Avatar initial={initial} color={avatarColor} />
      <span style={getNameStyle(isOfficial)}>{name}</span>
      {isOfficial && (
        <span
          style={{
            fontSize: 10,
            background: "#dbeafe",
            color: "#1d4ed8",
            padding: "1px 7px",
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          Official
        </span>
      )}
      <span style={{ fontSize: 12, color: "#9ca3af" }}>{timeAgo}</span>
      {menu && <span style={{ marginLeft: "auto" }}>{menu}</span>}
    </div>
  );
}

// ── Message Bubble (optional @mention prefix + message text) ────────

function MessageBubble({
  replyTo,
  message,
}: {
  replyTo?: string;
  message: string;
}) {
  return (
    <div style={bubbleStyle}>
      {replyTo && (
        <span style={{ color: "#2563eb", fontWeight: 600 }}>
          @{replyTo}{" "}
        </span>
      )}
      {message}
    </div>
  );
}

// ── Reply Trigger ("↩ Reply" link) ──────────────────────────────────

function ReplyTrigger({ onClick }: { onClick: () => void }) {
  return (
    <span onClick={onClick} {...hoverColorHandlers()} style={replyTriggerStyle}>
      <ReplyIcon size={16} />
      Reply
    </span>
  );
}

// ── Vote Controls (like/dislike icons + counts) ──────────────────────

function VoteControls({
  likes,
  dislikes,
  myVote,
  onVote,
}: {
  likes: number;
  dislikes: number;
  myVote: VoteValue;
  onVote: (direction: "like" | "dislike") => void;
}) {
  return (
    <>
      <span
        onClick={() => onVote("like")}
        {...hoverColorHandlers(myVote === "like")}
        title={`${likes} like${likes === 1 ? "" : "s"}`}
        style={voteButtonStyle(myVote === "like", actionHoverColor)}
      >
        <ThumbUpIcon size={16} filled={myVote === "like"} />
        {likes > 0 && likes}
      </span>
      <span
        onClick={() => onVote("dislike")}
        {...hoverColorHandlers(myVote === "dislike")}
        title={`${dislikes} dislike${dislikes === 1 ? "" : "s"}`}
        style={voteButtonStyle(myVote === "dislike", actionHoverColor)}
      >
        <ThumbDownIcon size={16} filled={myVote === "dislike"} />
      </span>
    </>
  );
}

// ── More Menu ("...") — report someone else's message, or edit/delete your own ─

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      style={{
        padding: "8px 14px",
        fontSize: 12,
        color: danger ? "#CD481B" : "#374151",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

function MoreMenu({
  isOwn,
  onEdit,
  onDelete,
}: {
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    // Sized to the icon itself (no padding here) so the dropdown below
    // anchors flush against it. The hit area is enlarged separately via
    // an invisible absolutely-positioned layer that doesn't affect this
    // box's size — click target grows without moving the anchor point.
    <span
      {...hoverColorHandlers()}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
        color: actionIdleColor,
      }}
    >
      <span
        onClick={() => setOpen((o) => !o)}
        aria-label="More options"
        style={{ position: "absolute", inset: -8, cursor: "pointer" }}
      />
      <MoreIcon size={20} style={{ pointerEvents: "none" }} />
      {open && (
        <>
          {/* Click-outside catcher */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            style={{ position: "fixed", inset: 0, zIndex: 9 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              margin: 0,
              lineHeight: "normal",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 10,
              minWidth: 100,
              overflow: "hidden",
            }}
          >
            {isOwn ? (
              <>
                <MenuItem
                  label="Edit"
                  onClick={() => {
                    setOpen(false);
                    onEdit();
                  }}
                />
                <MenuItem
                  label="Delete"
                  danger
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                />
              </>
            ) : (
              <MenuItem
                label="Report"
                onClick={() => {
                  setOpen(false);
                  alert("Reported. Our moderators will take a look.");
                }}
              />
            )}
          </div>
        </>
      )}
    </span>
  );
}

// ── Animated Counter ────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");

  // Kick off the slide the moment `value` changes — adjusted during
  // render (React's "derive state" pattern); the effect only owns the
  // settle timer.
  if (value !== prevValue) {
    setDirection(value > prevValue ? "up" : "down");
    setAnimating(true);
    setPrevValue(value);
  }

  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => {
      setDisplayValue(value);
      setAnimating(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [animating, value]);

  const slideOut = animating
    ? direction === "up"
      ? "translateY(-100%)"
      : "translateY(100%)"
    : "translateY(0)";
  const slideIn = animating
    ? "translateY(0)"
    : direction === "up"
      ? "translateY(100%)"
      : "translateY(-100%)";

  return (
    <span
      style={{
        display: "inline-flex",
        overflow: "hidden",
        height: "1.2em",
        position: "relative",
        minWidth: 16,
        verticalAlign: "middle",
      }}
    >
      {/* Outgoing number */}
      <span
        style={{
          display: "block",
          transition: animating ? "transform 0.25s ease-in-out, opacity 0.25s" : "none",
          transform: slideOut,
          opacity: animating ? 0 : 1,
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        {animating ? displayValue : value}
      </span>
      {/* Incoming number */}
      {animating && (
        <span
          style={{
            display: "block",
            position: "absolute",
            left: 0,
            top: 0,
            transition: "transform 0.25s ease-in-out, opacity 0.25s",
            transform: slideIn,
            opacity: animating ? 1 : 0,
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          {value}
        </span>
      )}
    </span>
  );
}

// Shared prop defaults for every *inline* composer — replying to a
// thread, and editing an existing comment/reply/feedback item. They're
// all the same small size with the same focus-highlight border, unlike
// the two top-level (collapsible) "write a comment" boxes.
const inlineComposerDefaults = {
  alwaysShowCancel: true,
  autoFocus: true,
  focusHighlight: true,
  height: 76,
  resize: "none" as const,
  borderColor: "#e5e7eb",
};

// ── Message Composer ─────────────────────────────────────────────
// One shared textarea + cancel/submit control used for: the top-level
// private message box, the top-level public comment box, and the
// per-thread reply box. Owns its own draft text so callers don't need
// to keep text state around just to feed this component.

function MessageComposer({
  placeholder,
  onSubmit,
  onCancel,
  submitLabel = "Send",
  alwaysShowCancel = false,
  autoFocus = false,
  focusHighlight = false,
  height = 90,
  resize = "none",
  borderColor = "#d1d5db",
  initialValue = "",
  collapsible = false,
  avatarInitial,
  avatarColor = "#22c55e",
}: {
  placeholder: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  alwaysShowCancel?: boolean;
  autoFocus?: boolean;
  focusHighlight?: boolean;
  height?: number;
  resize?: "none" | "vertical";
  borderColor?: string;
  initialValue?: string;
  // Collapsible composers (the top-level "write a comment" boxes) render
  // as a compact gray pill until focused or typed into, then expand into
  // a full box — gaining an avatar, full height, and the Cancel/Comment
  // buttons. Reply/edit composers don't set this and behave as before.
  collapsible?: boolean;
  avatarInitial?: string;
  avatarColor?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const el = inputRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length); // cursor at the end
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = collapsible ? focused || value.length > 0 : true;
  const showButtons = collapsible ? isActive : true;
  const showCancel = isActive && (alwaysShowCancel || value.length > 0 || collapsible);
  const canSubmit = value.trim().length > 0;

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleCancel = () => {
    setValue("");
    onCancel?.();
  };

  const textarea = (
    <textarea
      ref={inputRef}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        if (focusHighlight) e.target.style.borderColor = "#93c5fd";
      }}
      onBlur={(e) => {
        setFocused(false);
        if (focusHighlight) e.target.style.borderColor = borderColor;
      }}
      style={{
        width: "100%",
        height: collapsible ? (isActive ? height : 40) : height,
        border: `1px solid ${
          collapsible ? (isActive ? "#93c5fd" : "#e5e7eb") : borderColor
        }`,
        borderRadius: 6,
        padding: "10px 14px",
        fontSize: 13,
        color: "#374151",
        background: collapsible ? (isActive ? "white" : "#f3f4f6") : "white",
        resize,
        fontFamily: "inherit",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.15s, background 0.15s, height 0.15s",
      }}
    />
  );

  const buttons = showButtons && (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 8,
      }}
    >
      {showCancel && (
        <button onClick={handleCancel} style={cancelButtonStyle}>
          Cancel
        </button>
      )}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={getSubmitButtonStyle(canSubmit)}
      >
        {submitLabel}
      </button>
    </div>
  );

  if (!collapsible) {
    return (
      <div>
        {textarea}
        {buttons}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      {avatarInitial && (
        <Avatar initial={avatarInitial} color={avatarColor} />
      )}
      <div style={{ flex: 1 }}>
        {textarea}
        {buttons}
      </div>
    </div>
  );
}

// ── Reply Item ──────────────────────────────────────────────────

function ReplyItem({
  reply,
  onReply,
  myVote,
  onVote,
  onEdit,
  onDelete,
}: {
  reply: ReplyWithMeta;
  onReply: (user: string) => void;
  myVote: VoteValue;
  onVote: (direction: "like" | "dislike") => void;
  onEdit: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const isOwn = reply.own ?? reply.user === "You";

  return (
    <div style={{ marginBottom: 8 }}>
      <CommentHeader
        initial={reply.user.charAt(0).toUpperCase()}
        avatarColor={reply.avatarColor}
        name={reply.user}
        timeAgo={reply.timeAgo}
        isOfficial={reply.isOfficial}
        marginBottom={3}
        menu={
          <MoreMenu
            isOwn={isOwn}
            onEdit={() => setEditing(true)}
            onDelete={onDelete}
          />
        }
      />
      <div style={{ marginLeft: 40 }}>
        {editing ? (
          <MessageComposer
            {...inlineComposerDefaults}
            placeholder="Write a reply..."
            initialValue={reply.message}
            submitLabel="Save"
            onCancel={() => setEditing(false)}
            onSubmit={(text) => {
              onEdit(text);
              setEditing(false);
            }}
          />
        ) : (
          <>
            <MessageBubble replyTo={reply.replyTo} message={reply.message} />
            <div style={actionsRowStyle}>
              <VoteControls
                likes={reply.likes}
                dislikes={reply.dislikes}
                myVote={myVote}
                onVote={onVote}
              />
              <ReplyTrigger onClick={() => onReply(reply.user)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Comment Thread ──────────────────────────────────────────────

function CommentThread({
  comment,
  threadIdx,
  onSendReply,
  openThreadIdx,
  openNonce,
  openReplyToUser,
  onOpenReply,
  onCloseReply,
  votes,
  onVote,
  onEditComment,
  onDeleteComment,
  onEditReply,
  onDeleteReply,
}: {
  comment: CommentWithMeta;
  threadIdx: string;
  onSendReply: (threadIdx: string, message: string, replyTo?: string) => void;
  openThreadIdx: string | null;
  openNonce: number;
  openReplyToUser: string | null;
  onOpenReply: (threadIdx: string, user: string | null, targetId: string) => void;
  onCloseReply: () => void;
  votes: Record<string, VoteValue>;
  onVote: (replyId: string | null, direction: "like" | "dislike") => void;
  onEditComment: (text: string) => void;
  onDeleteComment: () => void;
  onEditReply: (replyId: string, text: string) => void;
  onDeleteReply: (replyId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingComment, setEditingComment] = useState(false);

  const isReplyOpen = openThreadIdx === threadIdx;
  const isOwnComment = comment.own ?? comment.user === "You";

  const allReplies = comment.replies || [];
  const officialReplies = allReplies.filter((r) => r.isOfficial);
  const normalReplies = allReplies.filter((r) => !r.isOfficial);
  const shouldCollapse = normalReplies.length > 2;
  const isCollapsedView = shouldCollapse && !expanded;

  // A reply created while the thread was collapsed — whether it replied
  // to the comment itself or to one of the always-visible official
  // replies — stacks right after that visible group, instead of
  // disappearing behind the "View N replies" toggle. Once expanded,
  // everything just renders in its normal spot; pinning only matters
  // while something is actually hidden.
  const officialIds = new Set(officialReplies.map((r) => r._id));
  const pinnedVisible = isCollapsedView
    ? normalReplies.filter(
        (r) =>
          r.pinnedAfter === comment._id ||
          (r.pinnedAfter && officialIds.has(r.pinnedAfter))
      )
    : [];
  const pinnedIds = new Set(pinnedVisible.map((r) => r._id));
  const collapsibleNormalReplies = normalReplies.filter(
    (r) => !pinnedIds.has(r._id)
  );

  const openReply = (user: string | null, targetId: string) => {
    onOpenReply(threadIdx, user, targetId);
  };

  const replyComposer = (
    <MessageComposer
      {...inlineComposerDefaults}
      key={openNonce}
      placeholder={openReplyToUser ? `@${openReplyToUser}` : "Write a reply..."}
      submitLabel="Reply"
      onCancel={onCloseReply}
      onSubmit={(text) => {
        onSendReply(threadIdx, text, openReplyToUser ?? undefined);
        onCloseReply();
      }}
    />
  );

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Top-level comment */}
      <div style={{ marginBottom: 8 }}>
        <CommentHeader
          initial={comment.user.charAt(0).toUpperCase()}
          avatarColor={comment.avatarColor}
          name={comment.user}
          timeAgo={comment.timeAgo}
          isOfficial={comment.isOfficial}
          menu={
            <MoreMenu
              isOwn={isOwnComment}
              onEdit={() => setEditingComment(true)}
              onDelete={onDeleteComment}
            />
          }
        />
        <div style={{ marginLeft: 40 }}>
          {editingComment ? (
            <MessageComposer
              {...inlineComposerDefaults}
              placeholder="Write a comment..."
              initialValue={comment.message}
              submitLabel="Save"
              onCancel={() => setEditingComment(false)}
              onSubmit={(text) => {
                onEditComment(text);
                setEditingComment(false);
              }}
            />
          ) : (
            <>
              <MessageBubble message={comment.message} />
              <div style={actionsRowStyle}>
                <VoteControls
                  likes={comment.likes}
                  dislikes={comment.dislikes}
                  myVote={votes[comment._id]}
                  onVote={(direction) => onVote(null, direction)}
                />
                <ReplyTrigger onClick={() => openReply(comment.user, comment._id)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Replies area */}
      <div style={{ marginLeft: 40, marginTop: 2 }}>
        {/* Official replies (always visible) */}
        {officialReplies.map((r) => (
          <ReplyItem
            key={r._id}
            reply={r}
            onReply={(u) => openReply(u, r._id)}
            myVote={votes[r._id]}
            onVote={(direction) => onVote(r._id, direction)}
            onEdit={(text) => onEditReply(r._id, text)}
            onDelete={() => onDeleteReply(r._id)}
          />
        ))}

        {/* Replies created while the thread was collapsed (whether
            replying to the comment or to one of the official replies
            above) — stack together right after the visible group instead
            of disappearing behind the "View N replies" toggle. */}
        {pinnedVisible.map((r) => (
          <ReplyItem
            key={r._id}
            reply={r}
            onReply={(u) => openReply(u, r._id)}
            myVote={votes[r._id]}
            onVote={(direction) => onVote(r._id, direction)}
            onEdit={(text) => onEditReply(r._id, text)}
            onDelete={() => onDeleteReply(r._id)}
          />
        ))}

        {/* Normal replies (collapsible) */}
        {(!shouldCollapse || expanded) &&
          collapsibleNormalReplies.map((r) => (
            <ReplyItem
              key={r._id}
              reply={r}
              onReply={(u) => openReply(u, r._id)}
              myVote={votes[r._id]}
              onVote={(direction) => onVote(r._id, direction)}
              onEdit={(text) => onEditReply(r._id, text)}
              onDelete={() => onDeleteReply(r._id)}
            />
          ))}

        {/* Collapse/expand controls */}
        {shouldCollapse && !expanded && (
          <div
            onClick={() => setExpanded(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginTop: 6,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex" }}>
              {collapsibleNormalReplies.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: r.avatarColor,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 8,
                    fontWeight: 700,
                    flexShrink: 0,
                    border: "1.5px solid white",
                    marginLeft: i > 0 ? -5 : 0,
                  }}
                >
                  {r.user.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span
              style={{ fontSize: 12, color: "#2563eb", fontWeight: 500 }}
            >
              View {collapsibleNormalReplies.length} replies ›
            </span>
          </div>
        )}

        {shouldCollapse && expanded && (
          <div style={{ marginTop: 4 }}>
            <span
              onClick={() => setExpanded(false)}
              style={{ fontSize: 12, color: "#6b7280", cursor: "pointer" }}
            >
              ∧ Hide replies
            </span>
          </div>
        )}

        {/* Reply form — always at the bottom of the thread, regardless of
            which reply was clicked. Only one open across the discussion
            at a time. Where the eventually-submitted reply itself shows
            up is handled separately via pinnedAfter above. */}
        {isReplyOpen && (
          <div style={{ marginTop: 8 }}>{replyComposer}</div>
        )}
      </div>
    </div>
  );
}

// ── Past Feedback ───────────────────────────────────────────────

function PastFeedbackItem({
  time,
  message,
  onEdit,
  onDelete,
}: {
  time: string;
  message: string;
  onEdit: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ marginBottom: 16 }}>
      <CommentHeader
        initial="C"
        avatarColor="#22c55e"
        name={RESIDENT_NAME}
        timeAgo={time}
        menu={
          <MoreMenu isOwn onEdit={() => setEditing(true)} onDelete={onDelete} />
        }
      />
      <div style={{ marginLeft: 42 }}>
        {editing ? (
          <MessageComposer
            {...inlineComposerDefaults}
            placeholder="Edit your message..."
            initialValue={message}
            submitLabel="Save"
            onCancel={() => setEditing(false)}
            onSubmit={(text) => {
              onEdit(text);
              setEditing(false);
            }}
          />
        ) : (
          <MessageBubble message={message} />
        )}
      </div>
    </div>
  );
}

// ── Main Discussion Component ───────────────────────────────────

interface DiscussionProps {
  data: DiscussionData;
}

export default function Discussion({ data }: DiscussionProps) {
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");

  // How the resident appears on public posts. The anonymous animal is
  // assigned once per session, the first time Anonymous is selected.
  const [identity, setIdentity] = useState<PostIdentity>("username");
  const [anonName, setAnonName] = useState<string | null>(null);
  const pickIdentity = (k: PostIdentity) => {
    setIdentity(k);
    if (k === "anonymous" && !anonName) setAnonName(nextAnonName());
  };
  const publicId = identityDisplay(identity, anonName);
  const [privateFeedback, setPrivateFeedback] = useState<PastFeedbackWithMeta[]>(
    () => seedPastFeedback(data.private.pastFeedback)
  );
  const [publicComments, setPublicComments] = useState<CommentWithMeta[]>(() =>
    seedComments(data.public.comments)
  );
  const [liveViewers, setLiveViewers] = useState(data.public.viewCount);

  // Only one reply form (across all threads) may be open at a time.
  const [openThreadIdx, setOpenThreadIdx] = useState<string | null>(null);
  const [openReplyToUser, setOpenReplyToUser] = useState<string | null>(null);
  // Id of the specific thing "Reply" was clicked on (a comment's _id, or
  // a reply's _id) — lets CommentThread anchor the composer right under
  // whatever was actually clicked while the thread is collapsed.
  const [openReplyTargetId, setOpenReplyTargetId] = useState<string | null>(
    null
  );
  const [openNonce, setOpenNonce] = useState(0);

  // "You" haven't voted on anything yet; keyed by comment/reply _id.
  const [votes, setVotes] = useState<Record<string, VoteValue>>({});

  // Shared read-modify-write for a single comment by array index — every
  // reply/vote/edit/delete handler below is just a different `updater`.
  const updateCommentAt = (
    idx: number,
    updater: (comment: CommentWithMeta) => CommentWithMeta
  ) => {
    setPublicComments((prev) =>
      prev.map((c, i) => (i === idx ? updater(c) : c))
    );
  };

  const removeCommentAt = (idx: number) => {
    setPublicComments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOpenReply = (
    threadIdx: string,
    user: string | null,
    targetId: string
  ) => {
    setOpenThreadIdx(threadIdx);
    setOpenReplyToUser(user);
    setOpenReplyTargetId(targetId);
    setOpenNonce((n) => n + 1); // force remount so scroll/focus re-run every click
  };
  const handleCloseReply = () => setOpenThreadIdx(null);

  // Randomly fluctuate live viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(1, prev + delta);
      });
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const submitPrivateMessage = (text: string) => {
    const now = new Date();
    const timeStr =
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    setPrivateFeedback((prev) => [
      { time: timeStr, message: text, _id: `pf-new-${Date.now()}` },
      ...prev,
    ]);
  };

  const handleEditPrivateFeedback = (id: string, text: string) => {
    setPrivateFeedback((prev) =>
      prev.map((f) => (f._id === id ? { ...f, message: text } : f))
    );
  };

  const handleDeletePrivateFeedback = (id: string) => {
    setPrivateFeedback((prev) => prev.filter((f) => f._id !== id));
  };

  const submitPublicMessage = (text: string) => {
    const id = identityDisplay(identity, anonName);
    const newComment: CommentWithMeta = {
      user: id.name,
      avatarColor: id.color,
      timeAgo: "just now",
      message: text,
      replies: [],
      _id: `c-new-${Date.now()}`,
      likes: 0,
      dislikes: 0,
      own: true,
    };
    setPublicComments((prev) => [newComment, ...prev]);
  };

  const handleSendReply = (
    threadIdx: string,
    message: string,
    replyTo?: string
  ) => {
    const idx = parseThreadIdx(threadIdx);
    if (idx === null) return;

    const id = identityDisplay(identity, anonName);
    const newReply: ReplyWithMeta = {
      user: id.name,
      avatarColor: id.color,
      timeAgo: "just now",
      replyTo,
      message,
      _id: `r-new-${Date.now()}`,
      likes: 0,
      dislikes: 0,
      pinnedAfter: openReplyTargetId ?? undefined,
      own: true,
    };

    updateCommentAt(idx, (c) => ({ ...c, replies: [...c.replies, newReply] }));
  };

  const handleVote = (
    threadIdx: string,
    replyId: string | null,
    direction: "like" | "dislike"
  ) => {
    const idx = parseThreadIdx(threadIdx);
    if (idx === null) return;

    const comment = publicComments[idx];
    if (!comment) return;
    const targetId = replyId ?? comment._id;
    const current = votes[targetId];
    const next = current === direction ? undefined : direction;

    setVotes((prev) => ({ ...prev, [targetId]: next }));

    updateCommentAt(idx, (c) =>
      replyId === null
        ? {
            ...c,
            likes: c.likes + voteDelta(current, next, "like"),
            dislikes: c.dislikes + voteDelta(current, next, "dislike"),
          }
        : {
            ...c,
            replies: c.replies.map((r) =>
              r._id === replyId
                ? {
                    ...r,
                    likes: r.likes + voteDelta(current, next, "like"),
                    dislikes: r.dislikes + voteDelta(current, next, "dislike"),
                  }
                : r
            ),
          }
    );
  };

  const handleDeleteComment = (threadIdx: string) => {
    const idx = parseThreadIdx(threadIdx);
    if (idx === null) return;
    removeCommentAt(idx);
  };

  const handleEditComment = (threadIdx: string, text: string) => {
    const idx = parseThreadIdx(threadIdx);
    if (idx === null) return;
    updateCommentAt(idx, (c) => ({ ...c, message: text }));
  };

  const handleDeleteReply = (threadIdx: string, replyId: string) => {
    const idx = parseThreadIdx(threadIdx);
    if (idx === null) return;
    updateCommentAt(idx, (c) => ({
      ...c,
      replies: c.replies.filter((r) => r._id !== replyId),
    }));
  };

  const handleEditReply = (threadIdx: string, replyId: string, text: string) => {
    const idx = parseThreadIdx(threadIdx);
    if (idx === null) return;
    updateCommentAt(idx, (c) => ({
      ...c,
      replies: c.replies.map((r) =>
        r._id === replyId ? { ...r, message: text } : r
      ),
    }));
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Tab buttons */}
      <div style={{ display: "flex" }}>
        <button
          onClick={() => setActiveTab("private")}
          style={getTabStyle(activeTab === "private")}
        >
          Private Message to Township
        </button>
        <button
          onClick={() => setActiveTab("public")}
          style={getTabStyle(activeTab === "public")}
        >
          Community Feedback Forum
        </button>
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px 24px" }}>
        {/* Private tab */}
        {activeTab === "private" && (
          <div>
            <p
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.6,
                margin: "0 0 4px 0",
              }}
            >
              {data.private.descriptions[0]}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                margin: "0 0 14px 0",
              }}
            >
              {data.private.descriptions[1]}
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px 0" }}>
              Posting as{" "}
              <strong style={{ color: "#374151" }}>{RESIDENT_NAME}</strong> (@
              {RESIDENT_USERNAME}) — the township sees your name and username on
              private messages.
            </p>
            <MessageComposer
              placeholder={data.private.placeholder}
              submitLabel="Comment"
              onSubmit={submitPrivateMessage}
              collapsible
              avatarInitial="C"
              avatarColor="#22c55e"
            />
            <div style={{ marginTop: 24 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#2563eb",
                  margin: "0 0 16px 0",
                }}
              >
                Your Past Feedback
              </h3>
              {privateFeedback.map((item) => (
                <PastFeedbackItem
                  key={item._id}
                  time={item.time}
                  message={item.message}
                  onEdit={(text) => handleEditPrivateFeedback(item._id, text)}
                  onDelete={() => handleDeletePrivateFeedback(item._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Public tab */}
        {activeTab === "public" && (
          <div>
            <p
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.6,
                margin: "0 0 4px 0",
              }}
            >
              {data.public.descriptions[0]}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#374151",
                margin: "0 0 14px 0",
              }}
            >
              {data.public.descriptions[1]}
            </p>
            {/* Public identity picker — username, initials, or anonymous */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                margin: "0 0 10px 0",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
                Comment as
              </span>
              <div
                role="group"
                aria-label="Choose how your name appears on public comments"
                style={{
                  display: "inline-flex",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9999,
                  padding: 3,
                  gap: 2,
                }}
              >
                {(
                  [
                    { key: "username", label: RESIDENT_USERNAME },
                    { key: "initials", label: RESIDENT_INITIALS },
                    { key: "anonymous", label: anonName ?? "Anonymous" },
                  ] as { key: PostIdentity; label: string }[]
                ).map((opt) => {
                  const on = identity === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => pickIdentity(opt.key)}
                      aria-pressed={on}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      style={{
                        height: 26,
                        padding: "0 12px",
                        borderRadius: 9999,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        background: on ? "#0d2240" : "transparent",
                        color: on ? "#fff" : "#475569",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s ease, color 0.15s ease",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {identity === "anonymous" && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Other residents won&apos;t see who you are.
                </span>
              )}
            </div>
            <MessageComposer
              placeholder={data.public.placeholder}
              submitLabel="Comment"
              onSubmit={submitPublicMessage}
              collapsible
              avatarInitial={publicId.initial}
              avatarColor={publicId.color}
            />
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#2563eb",
                    margin: 0,
                  }}
                >
                  Public Feedback
                </h3>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "default",
                  }}
                  title="Live viewers on this forum"
                >
                  <EyeIcon />
                  <AnimatedCounter value={liveViewers} />
                </div>
              </div>
              {publicComments.map((comment, i) => (
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  threadIdx={`pub-${i}`}
                  onSendReply={handleSendReply}
                  openThreadIdx={openThreadIdx}
                  openNonce={openNonce}
                  openReplyToUser={openReplyToUser}
                  onOpenReply={handleOpenReply}
                  onCloseReply={handleCloseReply}
                  votes={votes}
                  onVote={(replyId, direction) =>
                    handleVote(`pub-${i}`, replyId, direction)
                  }
                  onEditComment={(text) => handleEditComment(`pub-${i}`, text)}
                  onDeleteComment={() => handleDeleteComment(`pub-${i}`)}
                  onEditReply={(replyId, text) =>
                    handleEditReply(`pub-${i}`, replyId, text)
                  }
                  onDeleteReply={(replyId) =>
                    handleDeleteReply(`pub-${i}`, replyId)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
