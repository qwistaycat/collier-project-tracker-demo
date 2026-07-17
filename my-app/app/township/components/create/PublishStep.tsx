"use client";

// ================================================================
//  Step 5 — Preview & publish. Left: mock resident preview inside
//  a browser-chrome frame (desktop/mobile). Right: compliance
//  checklist gating publish. Publish/Submit runs through a confirm
//  modal owned here; the wizard owns the actual project build.
// ================================================================

import { useState } from "react";
import { CheckIcon, EyeIcon, MapPinIcon } from "@/app/components/icons";
import { CAT_META, catFull } from "../../data";
import { useTownship } from "../../TownshipContext";
import {
  btnPrimary,
  btnSecondary,
  cardStyle,
  FileTextIcon,
  overlayStyle,
  WarnTriangleIcon,
  type WizardFields,
  type WizardStage,
} from "./shared";

export interface Compliance {
  rtk: boolean;
  acc: boolean;
}

interface Props {
  fields: WizardFields;
  stages: WizardStage[];
  compliance: Compliance;
  setCompliance: React.Dispatch<React.SetStateAction<Compliance>>;
  previewStage: number;
  setPreviewStage: (i: number) => void;
  isManager: boolean;
  onSaveDraft: () => void;
  onConfirmPublish: () => void;
  onBack: () => void;
}

export default function PublishStep({
  fields,
  stages,
  compliance,
  setCompliance,
  previewStage,
  setPreviewStage,
  isManager,
  onSaveDraft,
  onConfirmPublish,
  onBack,
}: Props) {
  const { aiMode, toast } = useTownship();
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const previewTitle = fields.title.trim() || "Untitled Project";
  const previewDesc = fields.desc.trim() || "No description provided yet.";
  const cat = CAT_META[fields.category] ? fields.category : "Roads";
  const visible = stages.filter((s) => s.status !== "hidden");
  const firstPubIdx = visible.findIndex((s) => s.status === "published");
  const selIdx = Math.min(Math.max(previewStage, 0), Math.max(visible.length - 1, 0));
  const sel = visible[selIdx];
  const pvUnreviewed = aiMode && stages.some((s) => s.ai);
  const canPublish = compliance.rtk && compliance.acc;
  const publishLabel = isManager ? "Publish to Residents" : "Submit for Review";

  const stageDates = (s: WizardStage) =>
    s.singleDate || !s.end.trim()
      ? s.start.trim() || "—"
      : `${s.start.trim()} – ${s.end.trim()}`;

  const openResidentPreview = () => {
    toast("Opening full-screen resident preview…");
    window.open("/proposal", "_blank");
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: "#0f2d59", margin: 0 }}>
        Preview &amp; publish
      </h1>
      <p style={{ fontSize: 13.5, color: "#64748B", margin: "6px 0 18px", lineHeight: 1.5 }}>
        This is exactly what residents will see. Review carefully, complete the compliance
        checklist, then publish.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
        {/* ── LEFT — resident preview ── */}
        <div>
          {/* Chrome bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#0F172A",
              borderRadius: "12px 12px 0 0",
              padding: "9px 14px",
            }}
          >
            <span style={{ color: "#CBD5E1", display: "inline-flex" }}>
              <EyeIcon size={14} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#CBD5E1", flex: 1 }}>
              Resident view
            </span>
            <span
              style={{
                display: "inline-flex",
                background: "rgba(255,255,255,.08)",
                borderRadius: 9999,
                padding: 2,
                gap: 2,
              }}
            >
              {(["desktop", "mobile"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPreviewMode(m)}
                  style={{
                    height: 22,
                    padding: "0 11px",
                    borderRadius: 9999,
                    border: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                    background: previewMode === m ? "#fff" : "transparent",
                    color: previewMode === m ? "#0F172A" : "#CBD5E1",
                    textTransform: "capitalize",
                  }}
                >
                  {m === "desktop" ? "Desktop" : "Mobile"}
                </button>
              ))}
            </span>
            <a
              href="/proposal"
              target="_blank"
              rel="noreferrer"
              onClick={() => toast("Opening full-screen resident preview…")}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#93C5FD",
                textDecoration: "none",
              }}
            >
              Open in new tab ↗
            </a>
          </div>

          {/* Frame body */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #e5e7eb",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              padding: 20,
            }}
          >
            {pvUnreviewed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 10,
                  padding: "10px 13px",
                  marginBottom: 14,
                }}
              >
                <span style={{ marginTop: 1 }}>
                  <WarnTriangleIcon size={15} color="#D97706" />
                </span>
                <span style={{ fontSize: 12.5, color: "#92400E", lineHeight: 1.5 }}>
                  {"This project contains AI-suggested content that hasn't been reviewed. Open each stage and confirm its content before publishing."}
                </span>
              </div>
            )}

            <div
              style={{
                maxWidth: previewMode === "mobile" ? 390 : "none",
                margin: previewMode === "mobile" ? "0 auto" : 0,
              }}
            >
              {/* Mock resident page */}
              <div style={{ ...cardStyle, overflow: "hidden" }}>
                {/* Hero — flat category tint */}
                <div style={{ height: 120, background: CAT_META[cat].bg }} />

                <div style={{ padding: "16px 20px 20px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: CAT_META[cat].color,
                      background: CAT_META[cat].bg,
                      padding: "3px 10px",
                      borderRadius: 9999,
                      marginBottom: 9,
                    }}
                  >
                    {catFull(cat)}
                  </span>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0, flex: 1 }}>
                      {previewTitle}
                    </h2>
                    <span
                      title="Preview only"
                      style={{
                        ...btnPrimary,
                        height: 32,
                        padding: "0 14px",
                        fontSize: 12,
                        cursor: "default",
                        flexShrink: 0,
                      }}
                    >
                      + Follow
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", margin: "4px 0 10px" }}>
                    Last updated just now
                  </div>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {previewDesc}
                  </p>

                  {/* Link pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {["Link to Project", "Link to Meeting Notes"].map((l) => (
                      <span
                        key={l}
                        title="Preview only"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          height: 34,
                          padding: "0 14px",
                          borderRadius: 9999,
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          color: "#0d2240",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "default",
                        }}
                      >
                        <FileTextIcon size={12} color="#0d2240" />
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: previewMode === "mobile" ? "1fr" : "1fr 1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    {(
                      [
                        ["Sponsor", fields.sponsor.trim() || "—"],
                        ["Duration", fields.duration.trim() || "—"],
                        ["Total cost", fields.cost.trim() || "—"],
                      ] as const
                    ).map(([label, val]) => (
                      <div key={label}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                            color: "#94A3B8",
                            marginBottom: 3,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: previewMode === "mobile" ? "1fr" : "1fr 1fr",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    {(
                      [
                        ["Funding", fields.funding.trim() || "—"],
                        ["Category", catFull(cat)],
                      ] as const
                    ).map(([label, val]) => (
                      <div
                        key={label}
                        style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 13px" }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                            color: "#94A3B8",
                            marginBottom: 3,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#334155" }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Map placeholder */}
                  <div
                    style={{
                      position: "relative",
                      height: 150,
                      background: "#E8EEF4",
                      borderRadius: 10,
                      overflow: "hidden",
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 46,
                        left: -10,
                        width: "70%",
                        height: 8,
                        background: "#fff",
                        transform: "rotate(-7deg)",
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 34,
                        right: -12,
                        width: "62%",
                        height: 8,
                        background: "#fff",
                        transform: "rotate(5deg)",
                        borderRadius: 4,
                      }}
                    />
                    <span style={{ position: "absolute", top: 34, left: "38%", color: "#DC2626" }}>
                      <MapPinIcon size={20} />
                    </span>
                    <span style={{ position: "absolute", bottom: 46, right: "30%", color: "#2563eb" }}>
                      <MapPinIcon size={18} />
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: "#334155",
                        background: "rgba(255,255,255,.8)",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      Collier Township, PA
                    </span>
                  </div>

                  {/* Timeline */}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>
                    Project Timeline
                  </h3>
                  {visible.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: previewMode === "mobile" ? "1fr" : "200px 1fr",
                        gap: 16,
                      }}
                    >
                      {/* Nodes */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {visible.map((s, i) => {
                          const done = firstPubIdx >= 0 && i < firstPubIdx;
                          const current = firstPubIdx >= 0 && i === firstPubIdx;
                          return (
                            <div
                              key={i}
                              onClick={() => setPreviewStage(i)}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 9,
                                padding: "7px 8px",
                                borderRadius: 8,
                                cursor: "pointer",
                                background: selIdx === i ? "#EFF3F8" : "transparent",
                                transition: "background 0.15s ease",
                              }}
                            >
                              <span
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  marginTop: 2,
                                  flexShrink: 0,
                                  background: done ? "#16A34A" : current ? "#2563EB" : "#fff",
                                  border: done
                                    ? "2px solid #16A34A"
                                    : current
                                      ? "2px solid #2563EB"
                                      : "2px solid #CBD5E1",
                                  boxSizing: "border-box",
                                }}
                              />
                              <span style={{ minWidth: 0 }}>
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0d2240" }}>
                                    {s.title.trim() || "Untitled stage"}
                                  </span>
                                  {current && (
                                    <span
                                      style={{
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        background: "#DBEAFE",
                                        color: "#1D4ED8",
                                        padding: "1px 7px",
                                        borderRadius: 9999,
                                      }}
                                    >
                                      Current
                                    </span>
                                  )}
                                </span>
                                <span style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>
                                  {stageDates(s)}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Detail */}
                      <div
                        style={{
                          background: "#F8FAFC",
                          borderRadius: 10,
                          padding: "14px 16px",
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                          {sel?.title.trim() || "Untitled stage"}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#94A3B8", margin: "3px 0 8px" }}>
                          {sel ? stageDates(sel) : "—"}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.6 }}>
                          {sel?.summary.trim() || "No summary provided yet."}
                        </div>
                        {sel && sel.bullets.filter((b) => b.trim()).length > 0 && (
                          <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 5 }}>
                            {sel.bullets
                              .filter((b) => b.trim())
                              .map((b, bi) => (
                                <div
                                  key={bi}
                                  style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
                                >
                                  <span style={{ color: "#16A34A", marginTop: 2 }}>
                                    <CheckIcon size={11} />
                                  </span>
                                  <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
                                    {b}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                        {sel && sel.docs.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 7 }}>
                            {sel.docs.map((d, di) => (
                              <span
                                key={di}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  background: "#fff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: 7,
                                  padding: "4px 9px",
                                  fontSize: 11.5,
                                  color: "#334155",
                                }}
                              >
                                <FileTextIcon size={11} color="#7C3AED" />
                                {d.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>
                      No published stages yet. Add stages on the previous step.
                    </div>
                  )}

                  {/* Feedback placeholder */}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "18px 0 10px" }}>
                    Feedback
                  </h3>
                  <div
                    style={{
                      border: "1.5px dashed #CBD5E1",
                      borderRadius: 10,
                      padding: "16px 18px",
                      fontSize: 12.5,
                      color: "#94A3B8",
                      lineHeight: 1.55,
                    }}
                  >
                    The private message and community forum will be available to residents
                    once this project is published.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — compliance card ── */}
        <div style={{ ...cardStyle, position: "sticky", top: 74, padding: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>Ready to publish?</div>
          <div style={{ fontSize: 13, color: "#64748B", margin: "5px 0 16px", lineHeight: 1.5 }}>
            Complete the checklist below before residents can see this project.
          </div>

          <CheckRow
            checked={compliance.rtk}
            onToggle={() => setCompliance((c) => ({ ...c, rtk: !c.rtk }))}
            title="Right-to-Know Act reviewed"
            sub={"Confirm all content in this project is appropriate for public release under Pennsylvania's Right-to-Know Act."}
          />
          <CheckRow
            checked={compliance.acc}
            onToggle={() => setCompliance((c) => ({ ...c, acc: !c.acc }))}
            title="Content reviewed for accuracy"
            sub="Confirm all facts, dates, funding amounts, and names are correct."
          />

          <div style={{ fontSize: 12, fontStyle: "italic", color: "#64748B", margin: "6px 0 16px", lineHeight: 1.5 }}>
            The township requires both items before any project can go live for residents.
          </div>

          <button
            onClick={onSaveDraft}
            style={{ ...btnSecondary, width: "100%", height: 44, marginBottom: 10 }}
          >
            Save as Draft
          </button>
          <button
            onClick={() => canPublish && setConfirmOpen(true)}
            disabled={!canPublish}
            style={{
              width: "100%",
              height: 46,
              borderRadius: 9999,
              border: "none",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              background: canPublish ? "#0d2240" : "#CBD5E1",
              color: "#fff",
              cursor: canPublish ? "pointer" : "not-allowed",
              marginBottom: 10,
            }}
          >
            {publishLabel}
          </button>
          <button
            onClick={openResidentPreview}
            style={{ ...btnSecondary, width: "100%", height: 40, color: "#0d2240" }}
          >
            <EyeIcon size={14} />
            Preview as Resident
          </button>
          <div style={{ fontSize: 11.5, color: "#94A3B8", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
            You can move any project to Draft or edit it at any time from the Projects
            page.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={onBack} style={btnSecondary}>
          ← Back to timeline
        </button>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div style={overlayStyle} onClick={() => setConfirmOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 440, maxWidth: "100%", background: "#fff", borderRadius: 12, padding: 24 }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              {isManager
                ? `Publish ${previewTitle} to residents?`
                : `Submit ${previewTitle} for review?`}
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55, marginBottom: 20 }}>
              {isManager
                ? "Residents will be able to see this project immediately. You can move it to Draft or edit it later at any time."
                : "The Manager's Office will review this project before it goes live for residents."}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setConfirmOpen(false)} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  onConfirmPublish();
                }}
                style={btnPrimary}
              >
                {isManager ? "Confirm and Publish" : "Confirm and Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckRow({
  checked,
  onToggle,
  title,
  sub,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  sub: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        cursor: "pointer",
        marginBottom: 14,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ marginTop: 3, width: 15, height: 15, accentColor: "#0d2240", cursor: "pointer" }}
      />
      <span>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#111827" }}>
          {title}
        </span>
        <span style={{ display: "block", fontSize: 11.5, color: "#64748B", lineHeight: 1.5, marginTop: 2 }}>
          {sub}
        </span>
      </span>
    </label>
  );
}
