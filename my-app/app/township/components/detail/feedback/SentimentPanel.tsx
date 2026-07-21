"use client";

// AI Sentiment Analysis panel — AI mode only. Collapsible card with
// the stacked sentiment bar, legend, top themes, and per-theme
// "Draft response to this theme" AI actions.

import React, { useState } from "react";
import { ChevronDownIcon } from "@/app/components/icons";
import {
  sentColor,
  type SentimentCode,
  type SentimentWord,
  type StaffProject,
  type StaffTheme,
} from "@/app/township/data";
import { SparkleIcon } from "./ui";

const wordToCode = (w: SentimentWord): SentimentCode =>
  w === "concerns" ? "red" : w === "supportive" ? "green" : "amber";

export default function SentimentPanel({
  project,
  themeBusy,
  onDraftTheme,
}: {
  project: StaffProject;
  themeBusy: string | null;
  onDraftTheme: (t: StaffTheme) => void;
}) {
  const [open, setOpen] = useState(true);
  const s = project.sentiment;

  return (
    <div
      style={{
        background: "#F0F7FF",
        border: "1px solid #DBEAFE",
        borderRadius: 12,
        marginBottom: 18,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          width: "100%",
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <SparkleIcon size={16} />
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1E40AF" }}>
          AI Sentiment Analysis
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#2563eb",
            background: "#DBEAFE",
            padding: "1px 6px",
            borderRadius: 5,
          }}
        >
          AI
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            color: "#94A3B8",
            display: "inline-flex",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 20px 18px" }}>
          {/* Stacked sentiment bar */}
          <div
            style={{
              display: "flex",
              height: 12,
              borderRadius: 8,
              overflow: "hidden",
              background: "#E2E8F0",
            }}
          >
            <div style={{ width: `${s.supportive}%`, background: "#567A67" }} />
            <div style={{ width: `${s.mixed}%`, background: "#FFAA55" }} />
            <div style={{ width: `${s.concerns}%`, background: "#CD481B" }} />
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginTop: 8,
              fontSize: 12,
              color: "#475569",
            }}
          >
            <span>
              <span style={{ color: "#567A67" }}>●</span> {s.supportive}% supportive
            </span>
            <span>
              <span style={{ color: "#FFAA55" }}>●</span> {s.mixed}% mixed
            </span>
            <span>
              <span style={{ color: "#CD481B" }}>●</span> {s.concerns}% concerns
            </span>
          </div>

          {project.themes.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", margin: "14px 0 8px" }}>
                Top themes
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {project.themes.map((t) => {
                  const [c, bg, label] = sentColor(wordToCode(t.sent));
                  const busy = themeBusy === t.name;
                  return (
                    <div
                      key={t.name}
                      style={{
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: c,
                            background: bg,
                            padding: "1px 7px",
                            borderRadius: 5,
                          }}
                        >
                          {label}
                        </span>
                        <span style={{ fontSize: 12, color: "#94A3B8" }}>{t.count} comments</span>
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#64748B",
                          fontStyle: "italic",
                          marginTop: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        “{t.quote}”
                      </div>
                      <button
                        type="button"
                        disabled={themeBusy !== null}
                        onClick={() => onDraftTheme(t)}
                        style={{
                          marginTop: 10,
                          height: 30,
                          padding: "0 12px",
                          background: "#EFF6FF",
                          border: "1px solid #BFDBFE",
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#2563eb",
                          cursor: themeBusy !== null ? "default" : "pointer",
                          fontFamily: "inherit",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          opacity: themeBusy !== null && !busy ? 0.6 : 1,
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        <SparkleIcon size={12} />
                        {busy ? "Drafting…" : "Draft response to this theme"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 12 }}>
            This analysis updates every 4 hours. Last updated 2 hours ago.
          </div>
        </div>
      )}
    </div>
  );
}
