"use client";

// ================================================================
//  StageAiUploadModal — "fill this stage from documents" flow.
//  Three phases: upload → extract (split view, rows reveal on an
//  interval) → done (apply to draft). All AI output is the canned
//  extraction from the spec; simulateAi-style pacing.
// ================================================================

import { useEffect, useState } from "react";
import { CloseIcon } from "@/app/components/icons";
import {
  ModalShell,
  SparkleIcon,
  UploadIcon,
  FileIcon,
  Spinner,
  ghostBtn,
  type StageDraft,
  type XStage,
} from "./shared";

export const SAMPLE_DOC = "Board Meeting Minutes — Aug 2026.pdf";

const AI_RESULT = {
  title: "Board Vote & Contract Award",
  datesLabel: "August 2026",
  summary:
    "The Board of Commissioners voted to approve the contract award at the August public meeting, clearing the way for work to begin.",
  bullets: [
    "Motion carried by a 5–0 vote",
    "Contract awarded to the lowest responsible bidder",
    "Notice to proceed issued to the contractor",
  ],
};

export interface AiApplyResult {
  fields: Partial<StageDraft>;
  filled: string[];
  attach: boolean;
  files: string[];
}

interface Props {
  stage: XStage;
  stageEmpty: boolean;
  initialFiles?: string[];
  onClose: () => void;
  onApply: (r: AiApplyResult) => void;
}

type Phase = "upload" | "extract" | "done";

export default function StageAiUploadModal({ stage, stageEmpty, initialFiles, onClose, onApply }: Props) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [files, setFiles] = useState<string[]>(initialFiles ?? []);
  const [note, setNote] = useState("");
  const [attach, setAttach] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const fieldEmpty = {
    title: !stage.title || stage.title === "New Stage",
    dates: !stage.dates || stage.dates === "—",
    summary: !stage.desc,
    bullets: stage.bullets.length === 0,
  };
  const can = (k: keyof typeof fieldEmpty) => stageEmpty || overwrite || fieldEmpty[k];

  const rows: { label: string; value: string; applies: boolean }[] = [
    { label: "Stage title", value: AI_RESULT.title, applies: can("title") },
    { label: "Timeframe", value: AI_RESULT.datesLabel, applies: can("dates") },
    { label: "Summary", value: AI_RESULT.summary, applies: can("summary") },
    ...AI_RESULT.bullets.map((b) => ({ label: "Key detail", value: b, applies: can("bullets") })),
  ];

  useEffect(() => {
    if (phase !== "extract") return;
    const per = Math.max(900, 15000 / rows.length);
    let r = 0;
    const t = setInterval(() => {
      r += 1;
      setRevealed(r);
      if (r >= rows.length) {
        clearInterval(t);
        setTimeout(() => setPhase("done"), 700);
      }
    }, per);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const filledCount =
    (can("title") ? 1 : 0) + (can("dates") ? 1 : 0) + (can("summary") ? 1 : 0) + (can("bullets") ? 1 : 0);

  const apply = () => {
    const fields: Partial<StageDraft> = {};
    const filled: string[] = [];
    if (can("title")) {
      fields.title = AI_RESULT.title;
      filled.push("Stage title");
    }
    if (can("dates")) {
      fields.dates = AI_RESULT.datesLabel;
      filled.push("Timeframe");
    }
    if (can("summary")) {
      fields.desc = AI_RESULT.summary;
      filled.push("Summary");
    }
    if (can("bullets")) {
      fields.bullets = [...AI_RESULT.bullets];
      filled.push("Key details");
    }
    onApply({ fields, filled, attach, files });
  };

  const chk: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12.5,
    color: "#334155",
    cursor: "pointer",
  };

  return (
    <ModalShell width={760} onClose={onClose} z={70}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "#DBEAFE",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SparkleIcon size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
            Add documents to this stage
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>
            AI will read these documents and suggest content for Stage {stage.n}: {stage.title}.
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ ...ghostBtn(30), padding: "0 10px" }}>
          Close
        </button>
      </div>

      {/* ── Upload phase ── */}
      {phase === "upload" && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              border: "2px dashed #BFDBFE",
              background: "#FAFAFF",
              borderRadius: 12,
              padding: "28px 20px",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#2563eb", display: "inline-block" }}>
              <UploadIcon size={26} />
            </span>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginTop: 8 }}>
              Drag documents here to upload
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12, alignItems: "center" }}>
              <button
                onClick={() => setFiles((f) => [...f, `Stage Document ${f.length + 1}.pdf`])}
                style={ghostBtn(32)}
              >
                Select files
              </button>
              <button
                onClick={() => setFiles((f) => (f.includes(SAMPLE_DOC) ? f : [...f, SAMPLE_DOC]))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try with sample document
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 10 }}>
              Accepted: PDF, DOCX, TXT
            </div>
          </div>

          {files.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {files.map((f, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "#F8FAFC",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "7px 10px",
                    fontSize: 12,
                    color: "#334155",
                  }}
                >
                  <span style={{ color: "#2563eb", display: "inline-flex" }}>
                    <FileIcon size={13} />
                  </span>
                  {f}
                  <button
                    onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}
                    aria-label={`Remove ${f}`}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "inline-flex", padding: 0 }}
                  >
                    <CloseIcon size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Note for AI (optional)
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., ‘Focus on the vote outcome’ or ‘This is preliminary’"
              style={{
                width: "100%",
                height: 36,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "0 11px",
                fontSize: 13,
                fontFamily: "inherit",
                color: "#334155",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
            <label style={chk}>
              <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
              Also attach these documents to this stage so residents can see them
            </label>
            <label style={{ ...chk, color: stageEmpty ? "#94A3B8" : "#334155", cursor: stageEmpty ? "not-allowed" : "pointer" }}>
              <input
                type="checkbox"
                checked={overwrite}
                disabled={stageEmpty}
                onChange={(e) => setOverwrite(e.target.checked)}
              />
              Overwrite any existing content in this stage{stageEmpty ? " (this stage is empty)" : ""}
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={ghostBtn(36)}>
              Cancel
            </button>
            <button
              onClick={() => files.length && setPhase("extract")}
              disabled={files.length === 0}
              style={{
                ...ghostBtn(36),
                background: files.length ? "#2563eb" : "#DBEAFE",
                border: `1px solid ${files.length ? "#2563eb" : "#DBEAFE"}`,
                color: files.length ? "#fff" : "#B4A2E0",
                cursor: files.length ? "pointer" : "not-allowed",
              }}
            >
              Read Documents with AI
            </button>
          </div>
        </div>
      )}

      {/* ── Extract / Done phases (split view) ── */}
      {phase !== "upload" && (
        <div style={{ marginTop: 16 }}>
          {/* Progress bar */}
          <div style={{ height: 5, borderRadius: 3, background: "#DBEAFE", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round((revealed / rows.length) * 100)}%`,
                background: "#0d2240",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {phase === "done" && (
            <div
              style={{
                marginTop: 12,
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 10,
                padding: "10px 13px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#1E40AF",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <SparkleIcon size={14} color="#2563eb" />
              AI filled {filledCount} field(s). Review each before saving the stage.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
            {/* Left: source document */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
                background: "#fff",
                fontSize: 11.5,
                color: "#475569",
                lineHeight: 1.6,
                maxHeight: 320,
                overflow: "auto",
              }}
            >
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 12 }}>
                Collier Township Board of Commissioners
              </div>
              <div style={{ color: "#64748B", marginBottom: 8 }}>
                Regular Meeting Minutes — August 12, 2026
              </div>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 3 }}>
                Item 6 — Contract Award
              </div>
              <p style={{ margin: "0 0 8px" }}>
                Commissioner Reilly moved to approve the award of the paving contract as recommended
                by the Township Engineer. Commissioner Hess seconded.{" "}
                <span style={{ background: "#FFEEDD" }}>The motion carried by a vote of 5–0.</span>{" "}
                <span style={{ background: "#FFEEDD" }}>
                  The contract was awarded to the lowest responsible bidder
                </span>{" "}
                following review of three sealed bids. The Manager was directed to{" "}
                <span style={{ background: "#FFEEDD" }}>
                  issue the notice to proceed to the contractor
                </span>{" "}
                upon receipt of bonds and insurance.
              </p>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 3 }}>
                Item 7 — Public Comment
              </div>
              <p style={{ margin: 0 }}>
                Two residents spoke regarding the schedule of work on Orchard Drive. Staff will post
                the paving schedule to the Township website.
              </p>
            </div>

            {/* Right: suggested content */}
            <div style={{ maxHeight: 320, overflow: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.4, marginBottom: 8 }}>
                SUGGESTED CONTENT FOR THIS STAGE
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rows.map((row, i) => {
                  const shown = i < revealed || phase === "done";
                  return shown ? (
                    <div
                      key={i}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 9,
                        padding: "8px 11px",
                        background: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B" }}>{row.label}</span>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            borderRadius: 5,
                            padding: "1px 6px",
                            color: row.applies ? "#2563eb" : "#64748B",
                            background: row.applies ? "#DBEAFE" : "#F1F5F9",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.applies ? "AI-suggested" : "Kept yours"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#334155", marginTop: 3, lineHeight: 1.5 }}>
                        {row.value}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="animate-pulse"
                      style={{ height: 44, borderRadius: 9, background: "#F1F5F9", border: "1px solid #e5e7eb" }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          {phase === "extract" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <Spinner size={14} color="#2563eb" />
              <span style={{ fontSize: 12.5, color: "#64748B", flex: 1 }}>
                Reading documents and drafting stage content…
              </span>
              <button
                onClick={() => {
                  setRevealed(rows.length);
                  setPhase("done");
                }}
                style={ghostBtn(32)}
              >
                Skip to results
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button onClick={onClose} style={ghostBtn(36)}>
                Cancel
              </button>
              <button
                onClick={apply}
                style={{ ...ghostBtn(36), background: "#0d2240", border: "1px solid #0d2240", color: "#fff" }}
              >
                Apply to Stage
              </button>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}
