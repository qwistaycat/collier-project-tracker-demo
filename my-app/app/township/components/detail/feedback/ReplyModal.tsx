"use client";

// Reply modal: quoted original, attribution radio cards (personal vs
// official seal), AI draft button, textarea, and a live resident-view
// preview. Used for fresh replies, edits, and theme response drafts.

import React from "react";
import { STAFF_NAME, type StaffReply } from "@/app/township/data";
import { OfficialBadge, OfficialReplyBubble, Overlay, SparkleIcon, StaffAvatar } from "./ui";

export type ReplyAttr = "name" | "dept";

export default function ReplyModal({
  name,
  quote,
  editing,
  aiMode,
  dept,
  attr,
  setAttr,
  text,
  setText,
  busy,
  onDraft,
  onCancel,
  onSend,
}: {
  name: string;
  quote: string;
  editing: boolean;
  aiMode: boolean;
  dept: string;
  attr: ReplyAttr;
  setAttr: (a: ReplyAttr) => void;
  text: string;
  setText: (t: string) => void;
  busy: boolean;
  onDraft: () => void;
  onCancel: () => void;
  onSend: () => void;
}) {
  const options: {
    key: ReplyAttr;
    seal: boolean;
    title: string;
    sub?: string;
    desc: string;
  }[] = [
    { key: "name", seal: false, title: STAFF_NAME, sub: dept, desc: "Personal and accountable" },
    { key: "dept", seal: true, title: "Township Staff (Official)", desc: "For sensitive matters" },
  ];

  const preview: StaffReply = {
    attr,
    name: STAFF_NAME,
    dept: attr === "name" ? dept : undefined,
    text: text || "Your reply will appear here…",
    time: "just now",
  };

  return (
    <Overlay z={70} onClose={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "white",
          borderRadius: 14,
          padding: 22,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>Reply to {name}</div>

        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
            marginTop: 12,
          }}
        >
          {quote}
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", margin: "16px 0 12px" }} />

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
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((o) => {
            const sel = attr === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setAttr(o.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textAlign: "left",
                  width: "100%",
                  background: sel ? "#EFF3F8" : "white",
                  border: sel ? "1px solid #0d2240" : "1px solid #e5e7eb",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: sel ? "5px solid #0d2240" : "2px solid #CBD5E1",
                    background: "white",
                    boxSizing: "border-box",
                  }}
                />
                <StaffAvatar seal={o.seal} size={32} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>
                      {o.title}
                    </span>
                    <OfficialBadge />
                  </span>
                  {o.sub && (
                    <span style={{ display: "block", fontSize: 11.5, color: "#64748B" }}>
                      {o.sub}
                    </span>
                  )}
                  <span style={{ display: "block", fontSize: 11.5, color: "#94A3B8" }}>
                    {o.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {aiMode && (
          <button
            type="button"
            onClick={onDraft}
            disabled={busy}
            style={{
              marginTop: 12,
              height: 34,
              padding: "0 14px",
              borderRadius: 8,
              background: "#F5F3FF",
              border: "1px solid #DDD6FE",
              color: "#7C3AED",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "default" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
              opacity: busy ? 0.7 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <SparkleIcon size={14} />
            {busy ? "Drafting…" : "Draft with AI"}
          </button>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply…"
          style={{
            width: "100%",
            minHeight: 110,
            marginTop: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 9,
            padding: "10px 12px",
            fontSize: 14,
            fontFamily: "inherit",
            color: "#111827",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: "#94A3B8",
            margin: "14px 0 8px",
          }}
        >
          This is how your reply will look to residents
        </div>
        <OfficialReplyBubble r={preview} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 8,
              background: "white",
              border: "1px solid #e5e7eb",
              color: "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 8,
              background: "#0d2240",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.15s ease",
            }}
          >
            {editing ? "Save Reply" : "Post Reply"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
