"use client";

import { useState, useRef, useEffect } from "react";
import type { DiscussionData, Comment, Reply } from "@/app/data/proposals";
import { EyeIcon } from "./icons";

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

// ── Reply Form ──────────────────────────────────────────────────

function ReplyForm({
  threadIdx,
  onSend,
  onCancel,
  initialValue,
}: {
  threadIdx: string;
  onSend: (threadIdx: string, message: string) => void;
  onCancel: () => void;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        ref={inputRef}
        placeholder="Write a reply..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        style={{
          width: "100%",
          height: 76,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "#374151",
          resize: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
          transition: "border-color 0.15s",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 6,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: "7px 16px",
            background: "white",
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 500,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (value.trim()) onSend(threadIdx, value.trim());
          }}
          style={{
            padding: "7px 18px",
            background: "#0d2240",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Send Reply
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
  const nameStyle: React.CSSProperties = reply.isOfficial
    ? { fontWeight: 700, color: "#2563eb", fontSize: 13 }
    : { fontWeight: 600, fontSize: 13, color: "#111827" };

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 5,
        }}
      >
        <Avatar
          initial={reply.user.charAt(0).toUpperCase()}
          color={reply.avatarColor}
        />
        <span style={nameStyle}>{reply.user}</span>
        {reply.isOfficial && (
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
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{reply.timeAgo}</span>
      </div>
      <div style={{ marginLeft: 40 }}>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          {reply.replyTo && (
            <span style={{ color: "#2563eb", fontWeight: 600 }}>
              @{reply.replyTo}{" "}
            </span>
          )}
          {reply.message}
        </div>
        <span
          onClick={() => onReply(reply.user)}
          style={{
            display: "inline-block",
            marginTop: 5,
            fontSize: 12,
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          ↩ Reply
        </span>
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
  openInitial,
  onOpenReply,
  onCloseReply,
}: {
  comment: Comment;
  threadIdx: string;
  onSendReply: (threadIdx: string, message: string) => void;
  openThreadIdx: string | null;
  openNonce: number;
  openInitial: string;
  onOpenReply: (threadIdx: string, user: string | null) => void;
  onCloseReply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isReplyOpen = openThreadIdx === threadIdx;

  const allReplies = comment.replies || [];
  const officialReplies = allReplies.filter((r) => r.isOfficial);
  const normalReplies = allReplies.filter((r) => !r.isOfficial);
  const shouldCollapse = normalReplies.length > 2;

  const nameStyle: React.CSSProperties = comment.isOfficial
    ? { fontWeight: 700, color: "#2563eb", fontSize: 13 }
    : { fontWeight: 600, fontSize: 13, color: "#111827" };

  const openReply = (user: string | null) => {
    onOpenReply(threadIdx, user);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Top-level comment */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <Avatar
            initial={comment.user.charAt(0).toUpperCase()}
            color={comment.avatarColor}
          />
          <span style={nameStyle}>{comment.user}</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {comment.timeAgo}
          </span>
        </div>
        <div style={{ marginLeft: 40 }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "10px 14px",
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            {comment.message}
          </div>
          <span
            onClick={() => openReply(comment.user)}
            style={{
              display: "inline-block",
              marginTop: 5,
              fontSize: 12,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            ↩ Reply
          </span>
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

        {/* Reply form */}
        {isReplyOpen && (
          <ReplyForm
            key={openNonce}
            threadIdx={threadIdx}
            initialValue={openInitial}
            onCancel={onCloseReply}
            onSend={(tid, msg) => {
              onSendReply(tid, msg);
              onCloseReply();
            }}
          />
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <Avatar initial="Y" color="#22c55e" />
        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
          You
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{time}</span>
      </div>
      <div
        style={{
          marginLeft: 42,
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: "10px 14px",
          fontSize: 13,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        {message}
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
  const [privateText, setPrivateText] = useState("");
  const [publicText, setPublicText] = useState("");
  const privateInputRef = useRef<HTMLTextAreaElement>(null);
  const publicInputRef = useRef<HTMLTextAreaElement>(null);
  const [liveViewers, setLiveViewers] = useState(data.public.viewCount);

  // Only one reply form (across all threads) may be open at a time.
  const [openThreadIdx, setOpenThreadIdx] = useState<string | null>(null);
  const [openInitial, setOpenInitial] = useState("");
  const [openNonce, setOpenNonce] = useState(0);

  const handleOpenReply = (threadIdx: string, user: string | null) => {
    setOpenThreadIdx(threadIdx);
    setOpenInitial(user ? `@${user} ` : "");
    setOpenNonce((n) => n + 1); // force remount so scroll/focus + prefill re-run every click
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

  const submitPrivateMessage = () => {
    if (!privateText.trim()) return;
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
      { time: timeStr, message: privateText.trim() },
      ...prev,
    ]);
    setPrivateText("");
  };

  const submitPublicMessage = () => {
    if (!publicText.trim()) return;
    const newComment: Comment = {
      user: "You",
      avatarColor: "#22c55e",
      timeAgo: "just now",
      message: publicText.trim(),
      replies: [],
    };
    setPublicComments((prev) => [newComment, ...prev]);
    setPublicText("");
  };

  const handleSendReply = (threadIdx: string, message: string) => {
    // threadIdx is like "pub-0", "pub-1", etc.
    const parts = threadIdx.split("-");
    const idx = parseInt(parts[1], 10);
    if (isNaN(idx)) return;

    // Parse @username mention from the start of the message
    let replyTo: string | undefined;
    let cleanMessage = message;
    const mentionMatch = message.match(/^@(\S+)\s*/);
    if (mentionMatch) {
      replyTo = mentionMatch[1];
      cleanMessage = message.slice(mentionMatch[0].length);
    }

    const newReply: Reply = {
      user: "You",
      avatarColor: "#22c55e",
      timeAgo: "just now",
      replyTo,
      message: cleanMessage,
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
            <textarea
              ref={privateInputRef}
              value={privateText}
              onChange={(e) => setPrivateText(e.target.value)}
              placeholder={data.private.placeholder}
              style={{
                width: "100%",
                height: 90,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 13,
                color: "#374151",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
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
              {privateText.length > 0 && (
                <button
                  onClick={() => setPrivateText("")}
                  style={{
                    padding: "8px 16px",
                    background: "white",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 500,
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={submitPrivateMessage}
                style={{
                  padding: "8px 18px",
                  background: "#0d2240",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {data.private.buttonLabel}
              </button>
            </div>
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
            <textarea
              ref={publicInputRef}
              value={publicText}
              onChange={(e) => setPublicText(e.target.value)}
              placeholder={data.public.placeholder}
              style={{
                width: "100%",
                height: 90,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 13,
                color: "#374151",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
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
              {publicText.length > 0 && (
                <button
                  onClick={() => setPublicText("")}
                  style={{
                    padding: "8px 16px",
                    background: "white",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 500,
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={submitPublicMessage}
                style={{
                  padding: "8px 18px",
                  background: "#0d2240",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {data.public.buttonLabel}
              </button>
            </div>
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
                  openInitial={openInitial}
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
