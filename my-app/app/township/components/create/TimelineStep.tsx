"use client";

// ================================================================
//  Step 4 — Build the timeline. Stage cards with drag-reorder,
//  insert dividers, templates, per-stage publish status, document
//  attachments, and the AI "Rewrite in plain language" action.
//  Editing any stage content clears its AI-suggested flag.
// ================================================================

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, DragHandleIcon, EyeIcon } from "@/app/components/icons";
import { simulateAi, STAGE_TEMPLATES } from "../../data";
import { useTownship } from "../../TownshipContext";
import {
  AiChip,
  btnPrimary,
  btnSecondary,
  ctrlSrcStyle,
  DOC_FIXTURES,
  fieldLabelStyle,
  FileTextIcon,
  inputStyle,
  mkStage,
  SparkleIcon,
  SpinnerRing,
  stickyFooterStyle,
  textareaStyle,
  type ExtractMeta,
  type StageStatus,
  type WizardStage,
} from "./shared";

interface Props {
  stages: WizardStage[];
  setStages: React.Dispatch<React.SetStateAction<WizardStage[]>>;
  stageErrors: Record<number, string>;
  setStageErrors: (e: Record<number, string>) => void;
  extract: ExtractMeta | null;
  onViewSource: (key: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const STATUS_SEGMENTS: { key: StageStatus; label: string; c: string; bg: string }[] = [
  { key: "draft", label: "Draft", c: "#0d2240", bg: "#E2E8F0" },
  { key: "published", label: "Published", c: "#567A67", bg: "#E4EDE7" },
  { key: "hidden", label: "Hidden", c: "#CD481B", bg: "#F9E3D8" },
];

export default function TimelineStep({
  stages,
  setStages,
  stageErrors,
  setStageErrors,
  extract,
  onViewSource,
  onBack,
  onContinue,
}: Props) {
  const { aiMode, toast } = useTownship();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [rewriting, setRewriting] = useState<Record<number, boolean>>({});
  const dragIdx = useRef<number | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!templateOpen) return;
    const handler = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setTemplateOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [templateOpen]);

  /** Content edit — clears the stage's ai flag + all validation errors. */
  const updStage = (i: number, patch: Partial<WizardStage>) => {
    setStages((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch, ai: false } : s)));
    setStageErrors({});
  };

  /** Non-content patch (docs / docsOpen) — keeps the ai flag. */
  const patchStage = (i: number, patch: Partial<WizardStage>) => {
    setStages((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  };

  const insertStage = (i: number) => {
    setStages((prev) => [...prev.slice(0, i), mkStage(), ...prev.slice(i)]);
    setStageErrors({});
  };

  const delStage = (i: number) => {
    setStages((prev) => prev.filter((_, j) => j !== i));
    setStageErrors({});
  };

  const moveStage = (from: number, to: number) => {
    if (from === to) return;
    setStages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setStageErrors({});
  };

  const loadTemplate = (key: string) => {
    setStages(
      STAGE_TEMPLATES[key].map((t) =>
        mkStage({
          title: t.title,
          start: t.start,
          end: t.end || "",
          summary: t.summary,
          bullets: [...t.bullets],
          status: t.status === "published" ? "published" : "draft",
        })
      )
    );
    setStageErrors({});
    setTemplateOpen(false);
    toast(`Loaded "${key}" template`);
  };

  const addDoc = (i: number) => {
    const st = stages[i];
    const doc = DOC_FIXTURES[st.docs.length % DOC_FIXTURES.length];
    patchStage(i, { docs: [...st.docs, doc] });
    toast("Document attached");
  };

  const rewriteStageSummary = async (i: number) => {
    const st = stages[i];
    toast("Rewriting in plain language…");
    setRewriting((r) => ({ ...r, [i]: true }));
    const fallback =
      (st.summary || "This stage").replace(/\.$/, "") +
      " — explained simply so any resident can follow along.";
    const text = await simulateAi(fallback);
    setStages((prev) => prev.map((s, j) => (j === i ? { ...s, summary: text, ai: false } : s)));
    setRewriting((r) => ({ ...r, [i]: false }));
  };

  const helperStyle: React.CSSProperties = {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 5,
    lineHeight: 1.45,
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#0f2d59", margin: 0 }}>
            Build the timeline
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "#64748B",
              margin: "6px 0 0",
              maxWidth: 620,
              lineHeight: 1.5,
            }}
          >
            {aiMode
              ? "Review the stages AI suggested from your documents. Add, edit, or remove stages as needed."
              : "Add each stage of the project. Residents will see these as the project moves forward."}
          </p>
        </div>
        <div ref={templateRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setTemplateOpen((v) => !v)}
            style={{ ...btnSecondary, height: 36 }}
          >
            Load a template
            <ChevronDownIcon size={14} />
          </button>
          {templateOpen && (
            <div
              style={{
                position: "absolute",
                top: 42,
                right: 0,
                width: 240,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                boxShadow: "0 12px 32px rgba(15,23,42,.12)",
                padding: "10px 0",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  color: "#94A3B8",
                  padding: "2px 14px 8px",
                }}
              >
                Common project types
              </div>
              {Object.keys(STAGE_TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key)}
                  className="township-menu-item"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    padding: "8px 14px",
                    fontSize: 13,
                    color: "#111827",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stage cards */}
      <div style={{ marginTop: 10 }}>
        {stages.map((st, i) => (
          <div key={i}>
            <InsertDivider onClick={() => insertStage(i)} />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx.current != null) moveStage(dragIdx.current, i);
                dragIdx.current = null;
              }}
              style={{
                display: "flex",
                background: "#fff",
                borderRadius: 12,
                border: stageErrors[i] ? "1px solid #F2B49C" : "1px solid #e5e7eb",
                boxShadow: stageErrors[i] ? "0 0 0 3px rgba(220,38,38,.08)" : "none",
                overflow: "hidden",
                transition: "all 0.15s ease",
              }}
            >
              {/* Left rail — drag handle */}
              <div
                draggable
                onDragStart={() => {
                  dragIdx.current = i;
                }}
                title="Drag to reorder"
                style={{
                  width: 64,
                  flexShrink: 0,
                  background: "#FAFBFC",
                  borderRight: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 18,
                  gap: 12,
                  cursor: "grab",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#EFF3F8",
                    color: "#0d2240",
                    fontSize: 15,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "#CBD5E1" }}>
                  <DragHandleIcon size={16} />
                </span>
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  {aiMode && st.ai && <AiChip />}
                  <span style={{ flex: 1 }} />
                  {aiMode &&
                    extract &&
                    extract.stages.some((es) => es.title === st.title) && (
                      <button onClick={() => onViewSource(`stage:${i}`)} style={ctrlSrcStyle}>
                        <EyeIcon size={11} />
                        View source
                      </button>
                    )}
                  <button
                    onClick={() => delStage(i)}
                    title="Delete stage"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      border: "1px solid #F2C6B3",
                      background: "#fff",
                      color: "#CD481B",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ×
                  </button>
                </div>

                {stageErrors[i] && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#CD481B", marginBottom: 9 }}>
                    ⚠ {stageErrors[i]}
                  </div>
                )}

                {/* Title */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ ...fieldLabelStyle, marginBottom: 6 }}>Stage title</div>
                  <input
                    value={st.title}
                    onChange={(e) => updStage(i, { title: e.target.value })}
                    placeholder="e.g., Road Condition Assessment"
                    style={{ ...inputStyle, fontSize: 14, fontWeight: 600 }}
                  />
                  <div style={helperStyle}>
                    Short and descriptive. Residents see this in the timeline.
                  </div>
                </div>

                {/* Timeframe */}
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span style={fieldLabelStyle}>Timeframe</span>
                    <span style={{ display: "inline-flex", gap: 6 }}>
                      {[false, true].map((single) => (
                        <button
                          key={String(single)}
                          onClick={() => updStage(i, { singleDate: single })}
                          style={{
                            height: 30,
                            padding: "0 12px",
                            borderRadius: 7,
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s ease",
                            background: st.singleDate === single ? "#EFF3F8" : "#fff",
                            border:
                              st.singleDate === single
                                ? "1px solid #0d2240"
                                : "1px solid #e5e7eb",
                            color: st.singleDate === single ? "#0d2240" : "#64748B",
                          }}
                        >
                          {single ? "Single date" : "Date range"}
                        </button>
                      ))}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: st.singleDate ? "1fr" : "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <input
                      value={st.start}
                      onChange={(e) => updStage(i, { start: e.target.value })}
                      placeholder="Start — e.g., Winter 2025"
                      style={inputStyle}
                    />
                    {!st.singleDate && (
                      <input
                        value={st.end}
                        onChange={(e) => updStage(i, { end: e.target.value })}
                        placeholder="End — e.g., Late 2026"
                        style={inputStyle}
                      />
                    )}
                  </div>
                  <div style={helperStyle}>
                    {"Accepts specific dates or general timeframes like “Winter 2025” or “Late 2026.”"}
                  </div>
                </div>

                {/* Summary */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ ...fieldLabelStyle, marginBottom: 6 }}>Summary sentence</div>
                  <textarea
                    value={st.summary}
                    onChange={(e) => updStage(i, { summary: e.target.value })}
                    placeholder="e.g., Public Works evaluates every Township-owned road and scores its condition from 1 (minimal work) to 5 (most in need of work)."
                    style={{ ...textareaStyle, minHeight: 60 }}
                  />
                  <div style={helperStyle}>
                    One sentence describing what happens in this stage. Residents see this
                    at the top of the stage detail.
                  </div>
                </div>

                {/* Bullets */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ ...fieldLabelStyle, marginBottom: 6 }}>
                    Key details (3 to 5 recommended)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {st.bullets.map((b, bi) => (
                      <div key={bi} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#94A3B8",
                            flexShrink: 0,
                          }}
                        />
                        <input
                          value={b}
                          onChange={(e) =>
                            updStage(i, {
                              bullets: st.bullets.map((x, xi) =>
                                xi === bi ? e.target.value : x
                              ),
                            })
                          }
                          placeholder="Add a short detail residents can scan"
                          style={{ ...inputStyle, height: 34, fontSize: 12.5 }}
                        />
                        <button
                          onClick={() =>
                            updStage(i, { bullets: st.bullets.filter((_, xi) => xi !== bi) })
                          }
                          title="Remove bullet"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            color: "#94A3B8",
                            fontSize: 13,
                            cursor: "pointer",
                            flexShrink: 0,
                            fontFamily: "inherit",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updStage(i, { bullets: [...st.bullets, ""] })}
                    style={{
                      marginTop: 7,
                      border: "none",
                      background: "none",
                      color: "#0d2240",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    + Add a bullet
                  </button>
                  <div style={helperStyle}>
                    Short bullets residents scan when reading the stage detail. Aim for 3
                    to 5.
                  </div>
                </div>

                {/* Publish status */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ ...fieldLabelStyle, marginBottom: 6 }}>
                    Publish status for this stage
                  </div>
                  <div
                    style={{
                      display: "flex",
                      background: "#F1F5F9",
                      borderRadius: 9,
                      padding: 4,
                      maxWidth: 340,
                      gap: 2,
                    }}
                  >
                    {STATUS_SEGMENTS.map((seg) => (
                      <button
                        key={seg.key}
                        onClick={() => updStage(i, { status: seg.key })}
                        style={{
                          flex: 1,
                          height: 30,
                          borderRadius: 7,
                          border: "none",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s ease",
                          background: st.status === seg.key ? seg.bg : "transparent",
                          color: st.status === seg.key ? seg.c : "#64748B",
                        }}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                  <div style={helperStyle}>
                    Draft stages are visible only to staff. Published stages are visible to
                    residents. Hidden stages are removed from the resident timeline.
                  </div>
                </div>

                {/* Documents */}
                {!st.docsOpen ? (
                  <button
                    onClick={() => patchStage(i, { docsOpen: true })}
                    style={{ ...btnSecondary, height: 32, fontSize: 12 }}
                  >
                    + Attach documents
                  </button>
                ) : (
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ ...fieldLabelStyle, marginBottom: 8 }}>
                      Attached documents
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {st.docs.map((d, di) => (
                        <div
                          key={di}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "8px 11px",
                          }}
                        >
                          <FileTextIcon size={14} color="#2563eb" />
                          <span style={{ fontSize: 12.5, color: "#111827", flex: 1 }}>
                            {d.name}
                          </span>
                          <span style={{ fontSize: 11, color: "#94A3B8" }}>{d.size}</span>
                          <button
                            onClick={() =>
                              patchStage(i, { docs: st.docs.filter((_, xi) => xi !== di) })
                            }
                            title="Remove document"
                            style={{
                              border: "none",
                              background: "none",
                              color: "#94A3B8",
                              fontSize: 14,
                              cursor: "pointer",
                              padding: "0 2px",
                              fontFamily: "inherit",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addDoc(i)}
                      style={{
                        marginTop: 8,
                        width: "100%",
                        height: 34,
                        borderRadius: 8,
                        border: "1.5px dashed #CBD5E1",
                        background: "#fff",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                      }}
                    >
                      + Upload a document
                    </button>
                    <div style={helperStyle}>
                      Documents attached here will be linked in the stage detail residents
                      see.
                    </div>
                  </div>
                )}

                {/* AI row */}
                {aiMode && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      onClick={() => rewriteStageSummary(i)}
                      disabled={!!rewriting[i]}
                      style={{
                        height: 30,
                        padding: "0 13px",
                        borderRadius: 9999,
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        color: "#2563eb",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: rewriting[i] ? "wait" : "pointer",
                        fontFamily: "inherit",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        transition: "all 0.15s ease",
                        opacity: rewriting[i] ? 0.75 : 1,
                      }}
                    >
                      {rewriting[i] ? (
                        <>
                          <SpinnerRing size={12} color="#2563eb" />
                          Rewriting…
                        </>
                      ) : (
                        <>
                          <SparkleIcon size={12} color="#2563eb" />
                          Rewrite in plain language
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add stage */}
      <button
        onClick={() => {
          setStages((prev) => [...prev, mkStage()]);
          setStageErrors({});
        }}
        style={{
          marginTop: 16,
          width: "100%",
          height: 52,
          borderRadius: 12,
          border: "1.5px dashed #CBD5E1",
          background: "#F8FAFC",
          color: "#475569",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s ease",
        }}
      >
        + Add Stage
      </button>
      <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>
        Add as many stages as this project needs. Most projects have 3 to 11 stages.
      </div>

      {/* Footer */}
      <div style={stickyFooterStyle}>
        <button onClick={onBack} style={btnSecondary}>
          Back
        </button>
        <button onClick={onContinue} style={{ ...btnPrimary, height: 42, padding: "0 22px" }}>
          Preview &amp; Publish
        </button>
      </div>
    </div>
  );
}

function InsertDivider({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 0",
        cursor: "pointer",
        opacity: hover ? 1 : 0.4,
        transition: "opacity 0.15s ease",
      }}
    >
      <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B" }}>
        + Insert stage here
      </span>
      <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
    </div>
  );
}
