"use client";

// "Rewrite in plain language" modal. The trigger lives on the
// Details tab (per-stage), but the modal itself is owned by this
// namespace — it is self-contained: pass the projectId and the
// stage to rewrite, and it mutates the stage description + toasts
// "Description updated" on Accept.

import React, { useState } from "react";
import { simulateAi, type StaffStage } from "@/app/township/data";
import { useTownship } from "@/app/township/TownshipContext";
import { Overlay, SparkleIcon } from "./ui";

export default function RewriteModal({
  projectId,
  stage,
  onClose,
}: {
  projectId: string;
  stage: StaffStage;
  onClose: () => void;
}) {
  const { updateProject, toast } = useTownship();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    const out = await simulateAi(
      stage.desc.replace(/\.$/, "") +
        " — in plain terms, here is what is happening and what to expect next."
    );
    setText(out);
    setBusy(false);
  };

  const accept = () => {
    updateProject(projectId, (p) => ({
      ...p,
      stages: p.stages.map((s) => (s.n === stage.n ? { ...s, desc: text } : s)),
    }));
    toast("Description updated");
    onClose();
  };

  const ready = !!text && !busy;
  const start = !text && !busy;

  return (
    <Overlay z={70} onClose={onClose}>
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
        <style>{`@keyframes twfbSpin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SparkleIcon size={17} />
          <span style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>
            Rewrite in plain language
          </span>
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.4,
            color: "#94A3B8",
            margin: "14px 0 6px",
          }}
        >
          ORIGINAL
        </div>
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
          }}
        >
          {stage.desc}
        </div>

        {busy && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "26px 0 10px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "3px solid #EDE9FE",
                borderTopColor: "#7C3AED",
                animation: "twfbSpin 1s linear infinite",
              }}
            />
            <div style={{ fontSize: 13, color: "#7C3AED" }}>Rewriting at 8th-grade level…</div>
          </div>
        )}

        {ready && (
          <>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.4,
                color: "#7C3AED",
                margin: "14px 0 6px",
              }}
            >
              PLAIN LANGUAGE
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: "100%",
                minHeight: 90,
                border: "1px solid #DDD6FE",
                borderRadius: 9,
                padding: "10px 12px",
                fontSize: 13.5,
                fontFamily: "inherit",
                color: "#111827",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
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
          {start && (
            <button
              type="button"
              onClick={generate}
              style={{
                height: 38,
                padding: "0 18px",
                borderRadius: 8,
                background: "#7C3AED",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "opacity 0.15s ease",
              }}
            >
              Generate
            </button>
          )}
          {ready && (
            <button
              type="button"
              onClick={accept}
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
              Accept
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}
