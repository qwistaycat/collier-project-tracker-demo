"use client";

// Comment card shared by the Private Messages and Public Forum
// sub-views: resident header, AI-only sentiment pill, official
// reply bubbles with Edit/Delete, and the footer action row.

import React from "react";
import type { StaffComment } from "@/app/township/data";
import {
  btnDanger,
  btnNavy,
  KebabMenu,
  NameLink,
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
        <NameLink name={comment.name} onClick={() => onOpenProfile(comment.name)} />
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
              menu={
                <KebabMenu
                  label="Reply actions"
                  items={[
                    { label: "Edit", onClick: () => onEditReply(i) },
                    { label: "Delete", danger: true, onClick: () => onDeleteReply(i) },
                  ]}
                />
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
