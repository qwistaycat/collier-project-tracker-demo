"use client";

// Moderation Queue sub-view (AI mode only): awaiting/rejected filter
// chips, bulk-select bar, flagged comment rows with Approve/Reject,
// and the rejected audit list with Restore.

import React from "react";
import type { ModMode, StaffComment, StaffProject } from "@/app/township/data";
import { btnDanger, btnGreen, btnNeutral, pillStyle, ResidentAvatar } from "./ui";

const MOD_LABEL: Record<ModMode, string> = {
  post: "Post-moderation",
  selective: "Selective pre-moderation",
  full: "Full pre-moderation",
};

export type ModFilter = "awaiting" | "rejected";

export default function ModerationQueue({
  project,
  modFilter,
  setModFilter,
  modSel,
  toggleSel,
  clearSel,
  onAsk,
  onBulk,
  onRestore,
  onOpenProfile,
}: {
  project: StaffProject;
  modFilter: ModFilter;
  setModFilter: (f: ModFilter) => void;
  modSel: string[];
  toggleSel: (id: string) => void;
  clearSel: () => void;
  onAsk: (kind: "approve" | "reject", c: StaffComment) => void;
  onBulk: (kind: "approve" | "reject") => void;
  onRestore: (c: StaffComment) => void;
  onOpenProfile: (name: string) => void;
}) {
  const awaiting = modFilter === "awaiting";
  const rows = awaiting ? project.hidden : project.rejected;

  const emptyText =
    project.hidden.length === 0 && project.rejected.length === 0
      ? "No moderation actions needed. All comments have been reviewed."
      : awaiting && project.hidden.length === 0
        ? "No new comments awaiting review. View rejected comments for audit history."
        : "No comments in this view.";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Moderation Queue</span>
        <span
          title={`This project is in ${MOD_LABEL[project.modMode]} mode.`}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#F1F5F9",
            color: "#64748B",
            fontSize: 11,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "help",
            flexShrink: 0,
          }}
        >
          i
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 4, lineHeight: 1.5 }}>
        You can approve or reject comments. To preserve trust, comments are published as residents
        wrote them.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button type="button" style={pillStyle(awaiting)} onClick={() => setModFilter("awaiting")}>
          Awaiting review · {project.hidden.length}
        </button>
        <button
          type="button"
          style={pillStyle(!awaiting)}
          onClick={() => setModFilter("rejected")}
        >
          Rejected · {project.rejected.length}
        </button>
      </div>

      {modSel.length > 0 && (
        <div
          style={{
            background: "#0d2240",
            borderRadius: 11,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <span style={{ color: "white", fontSize: 12.5, fontWeight: 600, flex: 1 }}>
            {modSel.length} selected
          </span>
          <button
            type="button"
            onClick={clearSel}
            style={{
              height: 30,
              padding: "0 12px",
              borderRadius: 7,
              background: "rgba(255,255,255,.14)",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s ease",
            }}
          >
            Clear
          </button>
          <button type="button" style={btnDanger(30)} onClick={() => onBulk("reject")}>
            Bulk Reject
          </button>
          <button type="button" style={btnGreen(30)} onClick={() => onBulk("approve")}>
            Bulk Approve
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, fontSize: 13.5, color: "#94A3B8" }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {rows.map((c) => (
            <div
              key={c.id}
              style={{
                background: "white",
                border: `1px solid ${awaiting ? "#FFD5AA" : "#F2C6B3"}`,
                borderRadius: 11,
                padding: "14px 16px",
                opacity: awaiting ? 1 : 0.72,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {awaiting && (
                  <input
                    type="checkbox"
                    checked={modSel.includes(c.id)}
                    onChange={() => toggleSel(c.id)}
                    style={{ width: 15, height: 15, accentColor: "#0d2240", cursor: "pointer" }}
                  />
                )}
                <ResidentAvatar name={c.name} size={28} onClick={() => onOpenProfile(c.name)} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", flex: 1 }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11.5, color: "#94A3B8", flexShrink: 0 }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 7 }}>
                {project.title} · Stage {project.current}
              </div>
              <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.5, marginTop: 5 }}>
                {c.text}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                {awaiting ? (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: "#B45309",
                      background: "#FFEEDD",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    ⚑ {c.flag}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#CD481B",
                      background: "#F9E3D8",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    Rejected · in audit log
                  </span>
                )}
                <span style={{ flex: 1 }} />
                {awaiting ? (
                  <>
                    <button type="button" style={btnGreen(30)} onClick={() => onAsk("approve", c)}>
                      Approve
                    </button>
                    <button type="button" style={btnDanger(30)} onClick={() => onAsk("reject", c)}>
                      Reject
                    </button>
                  </>
                ) : (
                  <button type="button" style={btnNeutral(30)} onClick={() => onRestore(c)}>
                    Restore to forum
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
