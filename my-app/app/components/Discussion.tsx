"use client";

import { useState, useRef, useEffect } from "react";
import type { DiscussionData, Comment, Reply } from "@/app/data/proposals";
import { EyeIcon } from "./icons";

// ── Shared styles & helpers ───────────────────────────────────────
// Pulled out because the same "message bubble", "reply link", and
// "cancel/submit button" visuals were previously copy-pasted across
// ReplyItem, CommentThread, PastFeedbackItem, ReplyForm, and both the
// private/public composer blocks.

const bubbleStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  padding: "10px 14px",
  fontSize: 13,
  color: "#374151",
  lineHeight: 1.6,
};

const replyTriggerStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 5,
  fontSize: 12,
  color: "#6b7280",
  cursor: "pointer",
};

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

const submitButtonStyle: React.CSSProperties = {
  padding: "8px 18px",
  background: "#0d2240",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

function getNameStyle(isOfficial?: boolean): React.CSSProperties {
  return isOfficial
    ? { fontWeight: 700, color: "#2563eb", fontSize: 13 }
    : { fontWeight: 600, fontSize: 13, color: "#111827" };
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
  marginBottom = 6,
}: {
  initial: string;
  avatarColor: string;
  name: string;
  timeAgo: string;
  isOfficial?: boolean;
  marginBottom?: number;
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
    <span onClick={onClick} style={replyTriggerStyle}>
      ↩ Reply
    </span>
  );
}

// ── Animated Counter ────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    if (value !== prevValue) {
      setDirection(value > prevValue ? "up" : "down");
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimating(false);
      }, 250);
      setPrevValue(value);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

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
  resize = "vertical",
  borderColor = "#d1d5db",
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
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const el = inputRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
    el.setSelectionRange(0, 0); // cursor at the very front
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCancel = alwaysShowCancel || value.length > 0;

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleCancel = () => {
    setValue("");
    onCancel?.();
  };

  return (
    <div>
      <textarea
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={
          focusHighlight ? (e) => (e.target.style.borderColor = "#93c5fd") : undefined
        }
        onBlur={
          focusHighlight
            ? (e) => (e.target.style.borderColor = borderColor)
            : undefined
        }
        style={{
          width: "100%",
          height,
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          padding: "10px 14px",
          fontSize: 13,
          color: "#374151",
          resize,
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
          transition: focusHighlight ? "border-color 0.15s" : undefined,
        }}
      />
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
        <button onClick={handleSubmit} style={submitButtonStyle}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

// ── Reply Item ──────────────────────────────────────────────────

function ReplyItem({
  reply,
  onReply,
}: {
  reply: Reply;
  onReply: (user: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <CommentHeader
        initial={reply.user.charAt(0).toUpperCase()}
        avatarColor={reply.avatarColor}
        name={reply.user}
        timeAgo={reply.timeAgo}
        isOfficial={reply.isOfficial}
        marginBottom={5}
      />
      <div style={{ marginLeft: 40 }}>
        <MessageBubble replyTo={reply.replyTo} message={reply.message} />
        <ReplyTrigger onClick={() => onReply(reply.user)} />
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
}: {
  comment: Comment;
  threadIdx: string;
  onSendReply: (threadIdx: string, message: string, replyTo?: string) => void;
  openThreadIdx: string | null;
  openNonce: number;
  openReplyToUser: string | null;
  onOpenReply: (threadIdx: string, user: string | null) => void;
  onCloseReply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isReplyOpen = openThreadIdx === threadIdx;

  const allReplies = comment.replies || [];
  const officialReplies = allReplies.filter((r) => r.isOfficial);
  const normalReplies = allReplies.filter((r) => !r.isOfficial);
  const shouldCollapse = normalReplies.length > 2;

  const openReply = (user: string | null) => {
    onOpenReply(threadIdx, user);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Top-level comment */}
      <div style={{ marginBottom: 8 }}>
        <CommentHeader
          initial={comment.user.charAt(0).toUpperCase()}
          avatarColor={comment.avatarColor}
          name={comment.user}
          timeAgo={comment.timeAgo}
          isOfficial={comment.isOfficial}
        />
        <div style={{ marginLeft: 40 }}>
          <MessageBubble message={comment.message} />
          <ReplyTrigger onClick={() => openReply(comment.user)} />
        </div>
      </div>

      {/* Replies area */}
      <div style={{ marginLeft: 40, marginTop: 2 }}>
        {/* Official replies (always visible) */}
        {officialReplies.map((r, i) => (
          <ReplyItem key={`off-${i}`} reply={r} onReply={(u) => openReply(u)} />
        ))}

        {/* Normal replies */}
        {(!shouldCollapse || expanded) &&
          normalReplies.map((r, i) => (
            <ReplyItem
              key={`norm-${i}`}
              reply={r}
              onReply={(u) => openReply(u)}
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
              {normalReplies.slice(0, 3).map((r, i) => (
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
              View {normalReplies.length} replies ›
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

        {/* Reply form — only one open across the whole discussion at a time */}
        {isReplyOpen && (
          <div style={{ marginTop: 8 }}>
            <MessageComposer
              key={openNonce}
              placeholder={openReplyToUser ? `@${openReplyToUser}` : "Write a reply..."}
              submitLabel="Send Reply"
              alwaysShowCancel
              autoFocus
              focusHighlight
              height={76}
              resize="none"
              borderColor="#e5e7eb"
              onCancel={onCloseReply}
              onSubmit={(text) => {
                onSendReply(threadIdx, text, openReplyToUser ?? undefined);
                onCloseReply();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Past Feedback ───────────────────────────────────────────────

function PastFeedbackItem({
  time,
  message,
}: {
  time: string;
  message: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <CommentHeader initial="Y" avatarColor="#22c55e" name="You" timeAgo={time} />
      <div style={{ marginLeft: 42 }}>
        <MessageBubble message={message} />
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
  const [privateFeedback, setPrivateFeedback] = useState(
    data.private.pastFeedback
  );
  const [publicComments, setPublicComments] = useState(data.public.comments);
  const [liveViewers, setLiveViewers] = useState(data.public.viewCount);

  // Only one reply form (across all threads) may be open at a time.
  const [openThreadIdx, setOpenThreadIdx] = useState<string | null>(null);
  const [openReplyToUser, setOpenReplyToUser] = useState<string | null>(null);
  const [openNonce, setOpenNonce] = useState(0);

  const handleOpenReply = (threadIdx: string, user: string | null) => {
    setOpenThreadIdx(threadIdx);
    setOpenReplyToUser(user);
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
    setPrivateFeedback((prev) => [{ time: timeStr, message: text }, ...prev]);
  };

  const submitPublicMessage = (text: string) => {
    const newComment: Comment = {
      user: "You",
      avatarColor: "#22c55e",
      timeAgo: "just now",
      message: text,
      replies: [],
    };
    setPublicComments((prev) => [newComment, ...prev]);
  };

  const handleSendReply = (
    threadIdx: string,
    message: string,
    replyTo?: string
  ) => {
    // threadIdx is like "pub-0", "pub-1", etc.
    const parts = threadIdx.split("-");
    const idx = parseInt(parts[1], 10);
    if (isNaN(idx)) return;

    const newReply: Reply = {
      user: "You",
      avatarColor: "#22c55e",
      timeAgo: "just now",
      replyTo,
      message,
    };

    setPublicComments((prev) =>
      prev.map((comment, i) =>
        i === idx
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );
  };

  const activeStyle: React.CSSProperties = {
    flex: 1,
    padding: 14,
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    borderLeft: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: "#0d2240",
    color: "white",
    borderRadius: 0,
  };

  const inactiveStyle: React.CSSProperties = {
    flex: 1,
    padding: 14,
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    borderLeft: "1px solid #e5e7eb",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: "white",
    color: "#374151",
    borderRadius: 0,
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
          style={activeTab === "private" ? activeStyle : inactiveStyle}
        >
          Private Message to Township
        </button>
        <button
          onClick={() => setActiveTab("public")}
          style={activeTab === "public" ? activeStyle : inactiveStyle}
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
            <MessageComposer
              placeholder={data.private.placeholder}
              submitLabel={data.private.buttonLabel}
              onSubmit={submitPrivateMessage}
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
              {privateFeedback.map((item, i) => (
                <PastFeedbackItem
                  key={i}
                  time={item.time}
                  message={item.message}
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
            <MessageComposer
              placeholder={data.public.placeholder}
              submitLabel={data.public.buttonLabel}
              onSubmit={submitPublicMessage}
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
                  key={i}
                  comment={comment}
                  threadIdx={`pub-${i}`}
                  onSendReply={handleSendReply}
                  openThreadIdx={openThreadIdx}
                  openNonce={openNonce}
                  openReplyToUser={openReplyToUser}
                  onOpenReply={handleOpenReply}
                  onCloseReply={handleCloseReply}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
