"use client";

// Comment card shared by the Private Messages and Public Forum
// sub-views: resident header, AI-only sentiment pill, official
// reply bubbles with Edit/Delete, and the footer action row.

import React from "react";
import type { StaffComment } from "@/app/township/data";
import {
  btnDanger,
  btnNavy,
  btnNeutral,
  OfficialReplyBubble,
  ResidentAvatar,
  SentPill,
} from "./ui";

export default function FeedbackCommentCard({
  comment,
  aiMode,
  variant,
  onOpenProfile,
  onReply,
  onEditReply,
  onDeleteReply,
  onDelete,
}: {
  comment: StaffComment;
  aiMode: boolean;
  variant: "private" | "public";
  onOpenProfile: (name: string) => void;
  onReply: () => void;
  onEditReply: (replyIdx: number) => void;
  onDeleteReply: (replyIdx: number) => void;
  /** Public forum only — deletes the whole comment. */
  onDelete?: () => void;
}) {
  const replyH = variant === "private" ? 32 : 30;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "15px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <ResidentAvatar name={comment.name} size={30} onClick={() => onOpenProfile(comment.name)} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>{comment.name}</span>
        {aiMode && <SentPill sent={comment.sent} />}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#94A3B8", flexShrink: 0 }}>{comment.time}</span>
      </div>

      <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.5, marginTop: 8 }}>
        {comment.text}
      </div>

      {comment.replies.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {comment.replies.map((r, i) => (
            <OfficialReplyBubble
              key={i}
              r={r}
              actions={
                <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
                  <button type="button" style={btnNeutral(27)} onClick={() => onEditReply(i)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{ ...btnNeutral(27), border: "1px solid #FECACA", color: "#DC2626" }}
                    onClick={() => onDeleteReply(i)}
                  >
                    Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
        <button type="button" style={btnNavy(replyH)} onClick={onReply}>
          Reply
        </button>
        {variant === "public" && onDelete && (
          <button type="button" style={btnDanger(30)} onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
