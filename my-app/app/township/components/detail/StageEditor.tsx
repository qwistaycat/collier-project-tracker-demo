"use client";

// ================================================================
//  StageEditor — right column of the stage grid. Works on a draft
//  copy of the selected stage; nothing touches the project until
//  Save. Parent remounts this component (key) when the selected
//  stage changes; the nav guard in the shell prevents switching
//  away while dirty. Exposes save/discard through handleRef for
//  the shell's nav-guard modal.
//
//  Pragmatic simplifications vs the prototype (per screen notes):
//  timeframe is a single text input (no month-picker popover) and
//  the 30s localStorage autosave/restore banner is omitted.
// ================================================================

import { useEffect, useState } from "react";
import { useTownship } from "../../TownshipContext";
import { simulateAi, STAFF_NAME, type StaffProject, type StaffStage } from "../../data";
import {
  cleanDraft,
  draftEq,
  dangerOutlineBtn,
  ghostBtn,
  primaryBtn,
  aiChipBtn,
  ConfirmModal,
  dangerBtn,
  SparkleIcon,
  UploadIcon,
  Spinner,
  type StageDraft,
  type XProject,
  type XStage,
} from "./shared";
import StageAiUploadModal, { SAMPLE_DOC, type AiApplyResult } from "./StageAiUploadModal";

export interface StageEditorHandle {
  save: (ms?: number) => Promise<void>;
  discard: () => void;
}

interface Props {
  project: XProject;
  stage: XStage;
  onDirtyChange: (d: boolean) => void;
  handleRef: React.RefObject<StageEditorHandle | null>;
}

const fieldLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 6,
};

const textInput: React.CSSProperties = {
  width: "100%",
  height: 40,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "0 11px",
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
  fontFamily: "inherit",
};

export default function StageEditor({ project, stage, onDirtyChange, handleRef }: Props) {
  const { updateProject, toast, aiMode } = useTownship();

  const [draft, setDraft] = useState<StageDraft>(() => cleanDraft(stage));
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [aiUpload, setAiUpload] = useState<null | { files: string[] }>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const clean = cleanDraft(stage);
  const dirty = !draftEq(draft, clean);
  const isCurrent = project.current === stage.n;
  const stageEmpty = !stage.desc && stage.bullets.length === 0;

  useEffect(() => {
    onDirtyChange(dirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);
  useEffect(
    () => () => {
      onDirtyChange(false);
      handleRef.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const patch = (f: Partial<StageDraft>) => setDraft((d) => ({ ...d, ...f }));

  const commit = (d: StageDraft) => {
    const bullets = d.bullets.map((b) => b.trim()).filter(Boolean);
    updateProject(project.id, (p) => ({
      ...p,
      edited: "just now",
      stages: p.stages.map((s) =>
        s.n === stage.n
          ? ({ ...s, title: d.title, dates: d.dates, desc: d.desc, bullets, state: d.state } as StaffStage)
          : s
      ),
      log: [{ text: `Updated Stage ${stage.n}`, time: "just now", by: STAFF_NAME }, ...p.log],
    }));
    setDraft({ title: d.title, dates: d.dates, desc: d.desc, bullets, state: d.state });
  };

  const save = async (ms = 900) => {
    if (saving) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, ms));
    commit(draft);
    setSaving(false);
    toast("Stage saved.");
  };

  const discard = () => setDraft(cleanDraft(stage));

  // expose to the shell's nav guard — refs must not be written
  // during render, so publish after each commit
  useEffect(() => {
    handleRef.current = { save, discard };
  });

  const markCurrent = () => {
    updateProject(project.id, (p) => ({
      ...p,
      current: stage.n,
      log: [{ text: `Marked Stage ${stage.n} as current`, time: "just now", by: STAFF_NAME }, ...p.log],
    }));
    toast("Stage marked as current");
  };

  const doDelStage = () => {
    updateProject(project.id, (p) => ({
      ...p,
      stages: p.stages.filter((s) => s.n !== stage.n),
      log: [{ text: `Deleted Stage ${stage.n}`, time: "just now", by: STAFF_NAME }, ...p.log],
    }));
    setConfirmDel(false);
    toast("Stage deleted");
  };

  const doDiscard = () => {
    discard();
    setConfirmDiscard(false);
    toast("Changes discarded");
  };

  const draftRewrite = async () => {
    if (rewriting) return;
    setRewriting(true);
    toast("Rewriting in plain language…");
    const base = (draft.desc || "This stage").replace(/\.$/, "");
    const result = await simulateAi(`${base} — explained simply so any resident can follow along.`);
    setDraft((d) => ({ ...d, desc: result, ai: true }));
    setRewriting(false);
  };

  const applyAi = (r: AiApplyResult) => {
    setDraft((d) => ({ ...d, ...r.fields, ai: true, aiFilled: r.filled }));
    if (r.attach && r.files.length) {
      updateProject(project.id, (p) => {
        const docs = (p as XProject).docs ?? [];
        return { ...p, docs: [...docs, ...r.files.filter((f) => !docs.includes(f))] } as StaffProject;
      });
    }
    setAiUpload(null);
    toast(`AI filled ${r.filled.length} field${r.filled.length === 1 ? "" : "s"} — review before saving`);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 18,
        alignSelf: "start",
        position: "relative",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        {isCurrent && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#1D4ED8",
              background: "#DBEAFE",
              borderRadius: 5,
              padding: "2px 7px",
            }}
          >
            Current stage
          </span>
        )}
        {dirty && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#B45309" }}>
            You have unsaved changes
          </span>
        )}
        <div style={{ flex: 1 }} />
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            fontWeight: 600,
            color: "#475569",
            cursor: isCurrent ? "default" : "pointer",
          }}
        >
          <input type="checkbox" checked={isCurrent} onChange={() => !isCurrent && markCurrent()} />
          Mark as Current
        </label>
      </div>

      {/* AI-filled banner */}
      {draft.aiFilled && draft.aiFilled.length > 0 && (
        <div
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 10,
            padding: "10px 13px",
            fontSize: 12.5,
            color: "#1E40AF",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <SparkleIcon size={14} color="#2563eb" />
          <span>
            <strong>AI filled: {draft.aiFilled.join(", ")}.</strong> Review each field before saving the
            stage.
          </span>
        </div>
      )}

      {/* Stage title */}
      <div style={{ marginBottom: 14 }}>
        <div style={fieldLabel}>Stage title</div>
        <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} style={textInput} />
      </div>

      {/* Timeframe */}
      <div style={{ marginBottom: 14 }}>
        <div style={fieldLabel}>Timeframe</div>
        <input
          value={draft.dates === "—" ? "" : draft.dates}
          placeholder="e.g. Aug 2026 – Sep 2026"
          onChange={(e) => patch({ dates: e.target.value })}
          style={{ ...textInput, fontWeight: 500, fontSize: 13.5 }}
        />
        <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 5 }}>
          Choose the months this stage spans. Residents see this next to the stage title.
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: 14 }}>
        <div style={fieldLabel}>Summary sentence</div>
        <textarea
          value={draft.desc}
          onChange={(e) => patch({ desc: e.target.value })}
          style={{
            ...textInput,
            height: "auto",
            minHeight: 58,
            padding: "9px 11px",
            fontSize: 13.5,
            fontWeight: 400,
            lineHeight: 1.5,
            color: "#334155",
            resize: "vertical",
          }}
        />
      </div>

      {/* Key details */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 8 }}>
          Key details
          {draft.ai && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: "#2563eb",
                background: "#DBEAFE",
                borderRadius: 5,
                padding: "1px 6px",
              }}
            >
              AI-suggested
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {draft.bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#94A3B8", flexShrink: 0 }} />
              <input
                value={b}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    bullets: d.bullets.map((x, j) => (j === i ? e.target.value : x)),
                  }))
                }
                style={{ ...textInput, height: 34, borderRadius: 7, fontSize: 13, fontWeight: 400, color: "#334155" }}
              />
              <button
                onClick={() => setDraft((d) => ({ ...d, bullets: d.bullets.filter((_, j) => j !== i) }))}
                aria-label="Remove bullet"
                style={{ ...ghostBtn(26), width: 26, padding: 0, fontSize: 14, color: "#94A3B8" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setDraft((d) => ({ ...d, bullets: [...d.bullets, ""] }))}
          style={{
            background: "none",
            border: "none",
            color: "#0d2240",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            marginTop: 8,
            fontFamily: "inherit",
          }}
        >
          + Add a bullet
        </button>
      </div>

      {/* AI upload panel — global AI mode only */}
      <div style={{ marginBottom: 4 }}>
        {aiMode && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <SparkleIcon size={15} color="#2563eb" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1E40AF" }}>
                Use AI to fill this stage from documents
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
              Upload documents relevant to this stage. AI will suggest content for the fields above.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setAiUpload({ files: [] })}
                style={{
                  ...ghostBtn(36),
                  border: "1px solid #BFDBFE",
                  color: "#2563eb",
                }}
              >
                <UploadIcon size={14} />
                Upload documents for this stage
              </button>
              <button
                onClick={() => setAiUpload({ files: [SAMPLE_DOC] })}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try with sample document
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions row */}
      {aiMode && (
        <div style={{ borderTop: "1px solid #F1F5F9", marginTop: 14, paddingTop: 12 }}>
          <button onClick={draftRewrite} disabled={rewriting} style={{ ...aiChipBtn(32), opacity: rewriting ? 0.7 : 1 }}>
            {rewriting ? <Spinner size={12} color="#2563eb" /> : <SparkleIcon size={13} />}
            {rewriting ? "Rewriting…" : "Rewrite in plain language"}
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div style={{ borderTop: "1px solid #F1F5F9", marginTop: 14, paddingTop: 12 }}>
        <button onClick={() => setConfirmDel(true)} style={dangerOutlineBtn(32)}>
          Delete stage
        </button>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            margin: "14px -18px -18px",
            padding: "10px 18px",
            background: "#fff",
            borderTop: "1px solid #F1F5F9",
            boxShadow: "0 -6px 20px rgba(2,12,27,.06)",
            borderRadius: "0 0 12px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 5,
          }}
        >
          <div style={{ flex: 1 }} />
          <button onClick={() => setConfirmDiscard(true)} style={ghostBtn(36)}>
            Discard changes
          </button>
          <button onClick={() => save()} style={{ ...primaryBtn(36), minWidth: 118 }}>
            {saving && <Spinner size={13} />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}

      {/* Modals */}
      {aiUpload && (
        <StageAiUploadModal
          stage={stage}
          stageEmpty={stageEmpty}
          initialFiles={aiUpload.files}
          onClose={() => setAiUpload(null)}
          onApply={applyAi}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          width={420}
          title="Delete this stage?"
          body="This stage will be removed from the timeline. This action will be logged in the project's edit history."
          onClose={() => setConfirmDel(false)}
          actions={
            <>
              <button onClick={() => setConfirmDel(false)} style={ghostBtn(36)}>
                Cancel
              </button>
              <button onClick={doDelStage} style={dangerBtn(36)}>
                Delete Stage
              </button>
            </>
          }
        />
      )}

      {confirmDiscard && (
        <ConfirmModal
          width={420}
          title="Discard your changes?"
          body="Any edits since the last save will be lost."
          onClose={() => setConfirmDiscard(false)}
          actions={
            <>
              <button onClick={() => setConfirmDiscard(false)} style={ghostBtn(36)}>
                Cancel
              </button>
              <button onClick={doDiscard} style={dangerBtn(36)}>
                Discard
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
