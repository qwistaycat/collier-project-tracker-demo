"use client";

// ================================================================
//  Project Details tab — source documents, editable overview /
//  metadata / location cards ("Edit All Fields" mode with snapshot
//  + save/discard), and the stage timeline: a numbered stage rail
//  on the left and a draft-based stage editor on the right with
//  dirty-state guards, resident preview drawer, and an AI
//  document-upload flow for filling a stage (AI Assistance on).
// ================================================================

import React, { useEffect, useState } from "react";
import { useStaff } from "../../lib/StaffContext";
import type { Project, Stage } from "../../lib/types";
import {
  STAGE_UP_DOC_PARAS,
  STAGE_UP_RESULT,
  STAGE_UP_SAMPLE_FILE,
} from "../../lib/data";
import { CAT_FULL, plainRewrite } from "../../lib/utils";
import { AiChip, Card, ConfirmModal, Modal, SectionLabel } from "../../components/ui";

interface StageDraft {
  title: string;
  start: string;
  end: string;
  ongoing: boolean;
  summary: string;
  bullets: string[];
  status: "Published" | "Draft" | "Hidden";
}

function draftFromStage(st: Stage): StageDraft {
  const ongoing = /ongoing/i.test(st.dates);
  const parts = st.dates.replace(/–\s*ongoing/i, "").split("–").map((s) => s.trim());
  return {
    title: st.title,
    start: parts[0] ?? "",
    end: parts[1] ?? "",
    ongoing,
    summary: st.desc,
    bullets: [...st.bullets],
    status: st.state,
  };
}

function fmtDates(d: StageDraft): string {
  if (d.ongoing) return `${d.start} – ongoing`;
  if (d.end && d.end !== d.start) return `${d.start} – ${d.end}`;
  return d.start || "—";
}

function sameDraft(a: StageDraft, b: StageDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function DetailsTab({
  onDirtyChange,
}: {
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { activeProject, updateProject, addLog, toast, aiMode } = useStaff();
  const p = activeProject as Project;

  const [editAll, setEditAll] = useState(false);
  const [snapshot, setSnapshot] = useState<Partial<Project> | null>(null);

  const [selStage, setSelStage] = useState(p.current || 1);
  const [draft, setDraft] = useState<StageDraft | null>(() => {
    const st = p.stages.find((s) => s.n === (p.current || 1));
    return st ? draftFromStage(st) : null;
  });
  const [saving, setSaving] = useState(false);
  const [navGuard, setNavGuard] = useState<{ nextStage: number } | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [delStageOpen, setDelStageOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const stage = p.stages.find((s) => s.n === selStage) ?? p.stages[0];
  const clean = stage ? draftFromStage(stage) : null;
  const dirty = !!(draft && clean && !sameDraft(draft, clean));

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const patch = (part: Partial<StageDraft>) =>
    setDraft((d) => (d ? { ...d, ...part } : d));

  const selectStage = (n: number) => {
    if (n === selStage) return;
    if (dirty) {
      setNavGuard({ nextStage: n });
      return;
    }
    gotoStage(n);
  };

  const gotoStage = (n: number) => {
    setSelStage(n);
    const st = p.stages.find((s) => s.n === n);
    setDraft(st ? draftFromStage(st) : null);
  };

  const commitStage = (after?: () => void) => {
    if (!draft || !stage) return;
    setSaving(true);
    setTimeout(() => {
      updateProject(p.id, (proj) => ({
        ...proj,
        edited: "just now",
        stages: proj.stages.map((s) =>
          s.n === stage.n
            ? {
                ...s,
                title: draft.title,
                dates: fmtDates(draft),
                desc: draft.summary,
                bullets: draft.bullets.filter((b) => b.trim()),
                state: draft.status,
                ai: false,
              }
            : s
        ),
      }));
      addLog(p.id, `Updated Stage ${stage.n} — ${draft.title}`);
      toast("Stage saved");
      setSaving(false);
      // Re-sync the draft from the committed stage so the editor reads clean
      setDraft(
        draftFromStage({
          ...stage,
          title: draft.title,
          dates: fmtDates(draft),
          desc: draft.summary,
          bullets: draft.bullets.filter((b) => b.trim()),
          state: draft.status,
        })
      );
      after?.();
    }, 700);
  };

  const addStage = () => {
    if (dirty) {
      toast("Save or discard your stage changes first");
      return;
    }
    const nextN = p.stages.length + 1;
    updateProject(p.id, (proj) => ({
      ...proj,
      stages: [
        ...proj.stages,
        {
          n: nextN,
          title: `Stage ${nextN}`,
          dates: "Upcoming",
          desc: "Describe what will happen in this stage.",
          bullets: [],
          state: "Draft",
        },
      ],
    }));
    toast("Stage added");
    gotoStage(nextN);
  };

  const deleteStage = () => {
    if (!stage) return;
    updateProject(p.id, (proj) => ({
      ...proj,
      stages: proj.stages
        .filter((s) => s.n !== stage.n)
        .map((s, i) => ({ ...s, n: i + 1 })),
      current: Math.min(proj.current, Math.max(proj.stages.length - 1, 1)),
    }));
    addLog(p.id, `Deleted Stage ${stage.n} — ${stage.title}`);
    toast("Stage deleted");
    setDelStageOpen(false);
    gotoStage(1);
  };

  const enterEditAll = () => {
    setSnapshot({
      desc: p.desc,
      funding: p.funding,
      cost: p.cost,
      sponsor: p.sponsor,
      duration: p.duration,
      neighborhoods: p.neighborhoods,
    });
    setEditAll(true);
  };

  const saveEditAll = () => {
    updateProject(p.id, (proj) => ({ ...proj, edited: "just now" }));
    addLog(p.id, "Edited project details");
    toast("Project details saved");
    setEditAll(false);
    setSnapshot(null);
  };

  const discardEditAll = () => {
    if (snapshot) updateProject(p.id, (proj) => ({ ...proj, ...snapshot }));
    setEditAll(false);
    setSnapshot(null);
  };

  const setField = (field: keyof Project, value: string) =>
    updateProject(p.id, (proj) => ({ ...proj, [field]: value }));

  const inputCls =
    "w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:text-[#374151]";

  return (
    <div className="mt-6">
      {/* Edit-all control */}
      <div className="mb-4 flex items-center justify-end gap-2">
        {editAll ? (
          <span className="text-[11px] font-semibold text-[#7C3AED]">
            Editing — changes apply as you type
          </span>
        ) : (
          <button
            onClick={enterEditAll}
            className="h-9 cursor-pointer rounded-full border border-[#e5e7eb] bg-white px-4 text-xs font-semibold text-[#475569] hover:bg-slate-50"
          >
            ✎ Edit All Fields
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {/* Source documents */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Source Documents</SectionLabel>
            <button
              onClick={() => toast("Document upload is simulated in this demo")}
              className="cursor-pointer border-none bg-transparent text-xs font-semibold text-[#2563EB] hover:underline"
            >
              + Add documents
            </button>
          </div>
          {p.docs?.length ? (
            <div className="flex flex-wrap gap-2">
              {p.docs.map((d, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#334155]"
                >
                  <DocGlyph /> {d.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">
              No documents attached yet. Add meeting minutes or proposals — AI can suggest
              updates from them.
            </p>
          )}
        </Card>

        {/* Overview */}
        <Card className="p-5">
          <SectionLabel>Overview</SectionLabel>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700">Description</label>
            {aiMode && editAll && (
              <button
                onClick={() => {
                  setField("desc", plainRewrite(p.desc));
                  toast("AI rewrote the description — review it");
                }}
                className="cursor-pointer border-none bg-transparent text-[10px] font-bold text-[#7C3AED] hover:underline"
              >
                ✦ Rewrite in plain language
              </button>
            )}
          </div>
          <textarea
            value={p.desc}
            readOnly={!editAll}
            onChange={(e) => setField("desc", e.target.value)}
            className={`min-h-[72px] w-full rounded-lg border p-2.5 text-xs leading-relaxed outline-none ${
              editAll ? "border-[#CBD5E1]" : "border-transparent bg-transparent p-0 text-[#374151]"
            }`}
          />
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#F1F5F9] pt-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">Funding</label>
              <input
                type="text"
                value={p.funding}
                disabled={!editAll}
                onChange={(e) => setField("funding", e.target.value)}
                className={`h-9 ${inputCls}`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">Category</label>
              <div className="flex h-9 items-center text-xs text-[#374151]">
                {CAT_FULL[p.cat]}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6b7280]">
              Link to Project
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6b7280]">
              Link to Meeting Notes
            </span>
          </div>
        </Card>

        {/* Metadata */}
        <Card className="p-5">
          <SectionLabel>Metadata</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(
              [
                ["Project Sponsor", "sponsor"],
                ["Duration", "duration"],
                ["Total Project Cost", "cost"],
              ] as Array<[string, "sponsor" | "duration" | "cost"]>
            ).map(([label, field]) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-bold text-gray-700">{label}</label>
                <input
                  type="text"
                  value={p[field]}
                  disabled={!editAll}
                  onChange={(e) => setField(field, e.target.value)}
                  className={`h-9 ${inputCls}`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Location */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Location</SectionLabel>
            <button
              onClick={() => toast("Opening map picker…")}
              className="cursor-pointer border-none bg-transparent text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Edit location
            </button>
          </div>
          <div className="relative flex h-[150px] items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-slate-100">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute left-0 right-0 top-1/3 h-2 -rotate-3 bg-slate-300/70" />
            <div className="absolute bottom-1/4 left-0 right-0 h-1.5 rotate-2 bg-slate-300/50" />
            <span className="absolute left-1/3 top-1/2 text-lg">📍</span>
            <span className="absolute right-1/3 top-1/4 text-lg text-blue-600">📍</span>
            <span className="absolute bottom-2 right-3 rounded bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
              Collier Township, PA
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#475569]">
            <span className="shrink-0 font-semibold">This project affects</span>
            <input
              type="text"
              value={p.neighborhoods ?? ""}
              disabled={!editAll}
              placeholder="Township-Wide"
              onChange={(e) => setField("neighborhoods", e.target.value)}
              className={`h-8 flex-1 ${inputCls}`}
            />
          </div>
        </Card>

        {/* Timeline */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Project Timeline
            </h3>
            <button
              onClick={addStage}
              className="h-8 cursor-pointer rounded-lg border-none bg-[#1e3a5f] px-3 text-xs font-semibold text-white hover:bg-[#152a45]"
            >
              + Add Stage
            </button>
          </div>

          {p.stages.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-sm font-semibold text-[#475569]">
                This project has no stages yet
              </div>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Add stages to build the timeline residents will follow.
              </p>
              <button
                onClick={addStage}
                className="mt-4 h-9 cursor-pointer rounded-lg border-none bg-[#1e3a5f] px-4 text-xs font-semibold text-white"
              >
                + Add Your First Stage
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_1fr]">
              {/* Stage rail */}
              <div className="flex flex-col gap-1.5">
                {p.stages.map((st) => {
                  const isSel = st.n === selStage;
                  const dotColor =
                    st.state === "Published"
                      ? "#16A34A"
                      : st.state === "Hidden"
                      ? "#94A3B8"
                      : "#D97706";
                  return (
                    <button
                      key={st.n}
                      onClick={() => selectStage(st.n)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSel
                          ? "border-[#2563eb] bg-white shadow-sm"
                          : "border-[#E2E8F0] bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          st.n === p.current
                            ? "bg-[#1E3A5F] text-white"
                            : "bg-[#EFF3F8] text-[#1E3A5F]"
                        }`}
                      >
                        {st.n}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[#111827]">
                          {st.title}
                        </span>
                        <span className="block text-[10px] text-[#94A3B8]">{st.dates}</span>
                      </span>
                      {isSel && dirty && (
                        <span title="Unsaved changes" className="h-2 w-2 rounded-full bg-[#D97706]" />
                      )}
                      <span
                        title={st.state}
                        style={{ backgroundColor: dotColor }}
                        className="h-2 w-2 shrink-0 rounded-full"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Stage editor */}
              {stage && draft && (
                <Card className="p-5">
                  <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    {stage.n === p.current && (
                      <span className="rounded bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8]">
                        Current stage
                      </span>
                    )}
                    {stage.ai && <AiChip />}
                    {dirty && (
                      <span className="text-[11px] font-semibold text-[#B45309]">
                        You have unsaved changes
                      </span>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
                    >
                      👁 Preview this stage
                    </button>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#475569]">
                      <input
                        type="checkbox"
                        checked={stage.n === p.current}
                        onChange={() => {
                          updateProject(p.id, (proj) => ({ ...proj, current: stage.n }));
                          addLog(p.id, `Marked Stage ${stage.n} as current`);
                          toast(`Stage ${stage.n} marked as current`);
                        }}
                      />
                      Mark as Current
                    </label>
                  </div>

                  {stage.aiFilled?.length ? (
                    <div className="mb-4 rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] p-3 text-xs text-[#5B21B6]">
                      ✦ <strong>AI filled: {stage.aiFilled.join(", ")}.</strong> Review each
                      field before saving the stage.
                    </div>
                  ) : null}

                  {/* Title */}
                  <div className="mb-4">
                    <SectionLabel>Stage title</SectionLabel>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => patch({ title: e.target.value })}
                      placeholder="e.g., Road Condition Assessment"
                      className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-semibold outline-none"
                    />
                    <p className="mt-1 text-[10px] text-[#94A3B8]">
                      Short and descriptive. Residents see this in the timeline.
                    </p>
                  </div>

                  {/* Timeframe */}
                  <div className="mb-4">
                    <SectionLabel>Timeframe</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={draft.start}
                        onChange={(e) => patch({ start: e.target.value })}
                        placeholder="Start — e.g., Winter 2025"
                        className="h-9 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={draft.ongoing ? "ongoing" : draft.end}
                        disabled={draft.ongoing}
                        onChange={(e) => patch({ end: e.target.value })}
                        placeholder="End — e.g., Late 2026"
                        className="h-9 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-[11px] text-[#475569]">
                      <input
                        type="checkbox"
                        checked={draft.ongoing}
                        onChange={(e) => patch({ ongoing: e.target.checked })}
                      />
                      Mark ongoing (no end date)
                    </label>
                    <p className="mt-1 text-[10px] text-[#94A3B8]">
                      Accepts specific dates or general timeframes like &ldquo;Winter
                      2025&rdquo; or &ldquo;Late 2026.&rdquo; Residents see this next to the
                      stage title.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <SectionLabel>Summary sentence</SectionLabel>
                    <textarea
                      value={draft.summary}
                      onChange={(e) => patch({ summary: e.target.value })}
                      className="min-h-[56px] w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs leading-relaxed outline-none"
                    />
                    {aiMode && (
                      <button
                        onClick={() => {
                          patch({ summary: plainRewrite(draft.summary) });
                          toast("AI rewrote the summary — review before saving");
                        }}
                        className="mt-1 cursor-pointer rounded border-none bg-[#F5F3FF] px-2.5 py-1 text-[10px] font-bold text-[#7C3AED]"
                      >
                        ✦ Rewrite in plain language
                      </button>
                    )}
                  </div>

                  {/* Bullets */}
                  <div className="mb-4">
                    <SectionLabel>Key details (3 to 5 recommended)</SectionLabel>
                    {draft.bullets.map((b, i) => (
                      <div key={i} className="mb-1.5 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        <input
                          type="text"
                          value={b}
                          onChange={(e) =>
                            patch({
                              bullets: draft.bullets.map((x, xi) =>
                                xi === i ? e.target.value : x
                              ),
                            })
                          }
                          placeholder="Add a short detail residents can scan"
                          className="h-8 flex-1 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
                        />
                        <button
                          onClick={() =>
                            patch({ bullets: draft.bullets.filter((_, xi) => xi !== i) })
                          }
                          className="cursor-pointer border-none bg-transparent px-1 text-base font-bold text-[#94A3B8] hover:text-[#DC2626]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => patch({ bullets: [...draft.bullets, ""] })}
                      className="mt-1 cursor-pointer border-none bg-transparent text-[11px] font-bold text-[#1E3A5F]"
                    >
                      + Add a bullet
                    </button>
                  </div>

                  {/* AI stage-fill promo */}
                  {aiMode && (
                    <div className="mb-4 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-3.5">
                      <div className="text-xs font-bold text-[#5B21B6]">
                        ✦ Use AI to fill this stage from documents
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#7C6FA6]">
                        Upload documents relevant to this stage. AI will suggest content for
                        the fields above.
                      </p>
                      <button
                        onClick={() => setUploadOpen(true)}
                        className="mt-2 h-8 cursor-pointer rounded-lg border-none bg-[#7C3AED] px-3 text-xs font-semibold text-white hover:bg-[#6b21a8]"
                      >
                        Upload documents for this stage
                      </button>
                    </div>
                  )}

                  {/* Publish status */}
                  <div className="mb-4">
                    <SectionLabel>Publish status</SectionLabel>
                    <div className="flex max-w-[300px] gap-1 rounded-lg bg-slate-100 p-1">
                      {(["Draft", "Published", "Hidden"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => patch({ status: s })}
                          className={`flex-1 cursor-pointer rounded border-none py-1 text-[10px] font-bold uppercase ${
                            draft.status === s
                              ? "bg-white text-[#1e3a5f] shadow-xs"
                              : "bg-transparent text-slate-500"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-[#94A3B8]">
                      Draft stages are visible only to staff. Published stages are visible to
                      residents. Hidden stages are removed from the resident timeline.
                    </p>
                  </div>

                  {/* Save bar */}
                  {dirty && (
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFDF7] p-3">
                      <span className="text-[11px] text-[#92400E]">{changesText(draft, clean!)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDiscardOpen(true)}
                          className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
                        >
                          Discard changes
                        </button>
                        <button
                          onClick={() => commitStage()}
                          disabled={saving}
                          className="h-8 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3 text-xs font-semibold text-white hover:bg-[#152a45]"
                        >
                          {saving ? "Saving…" : "Save changes"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Danger zone */}
                  <div className="border-t border-[#F1F5F9] pt-3">
                    <button
                      onClick={() => setDelStageOpen(true)}
                      className="h-8 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                    >
                      Delete stage
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky edit-all footer */}
      {editAll && (
        <div className="sticky bottom-4 z-30 mt-6 flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-xl">
          <span className="text-xs text-[#64748B]">
            Editing project fields — changes apply as you type.
          </span>
          <div className="flex gap-2">
            <button
              onClick={discardEditAll}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
            >
              Discard changes
            </button>
            <button
              onClick={saveEditAll}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#16A34A] px-4 text-xs font-semibold text-white hover:bg-green-700"
            >
              Save all changes
            </button>
          </div>
        </div>
      )}

      {/* Nav guard: unsaved stage changes */}
      {navGuard && draft && (
        <Modal onClose={() => setNavGuard(null)} width={440}>
          <h3 className="mb-2 text-base font-bold text-[#111827]">
            You have unsaved changes to {draft.title || "this stage"}
          </h3>
          <p className="mb-5 text-xs text-[#64748B]">
            Save or discard your changes before switching stages.
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setNavGuard(null)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const n = navGuard.nextStage;
                setNavGuard(null);
                gotoStage(n);
              }}
              className="h-9 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-4 text-xs font-semibold text-[#DC2626]"
            >
              Discard and continue
            </button>
            <button
              onClick={() => {
                const n = navGuard.nextStage;
                setNavGuard(null);
                commitStage(() => gotoStage(n));
              }}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-4 text-xs font-semibold text-white"
            >
              Save and continue
            </button>
          </div>
        </Modal>
      )}

      {/* Discard stage confirm */}
      {discardOpen && (
        <ConfirmModal
          title="Discard your changes?"
          body="Your edits to this stage will be lost."
          confirmLabel="Discard"
          danger
          onCancel={() => setDiscardOpen(false)}
          onConfirm={() => {
            setDiscardOpen(false);
            if (stage) setDraft(draftFromStage(stage));
          }}
        />
      )}

      {/* Delete stage confirm */}
      {delStageOpen && (
        <ConfirmModal
          title="Delete this stage?"
          body="The stage will be removed from the timeline. This action is logged in the project's edit history."
          confirmLabel="Delete Stage"
          danger
          onCancel={() => setDelStageOpen(false)}
          onConfirm={deleteStage}
        />
      )}

      {/* Stage resident preview drawer */}
      {previewOpen && draft && (
        <div className="fixed inset-0 z-[100]" onClick={() => setPreviewOpen(false)}>
          <div className="absolute inset-0 bg-[#0F172A]/40" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 right-0 top-0 w-[420px] overflow-y-auto border-l border-[#E2E8F0] bg-white p-5 shadow-2xl"
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                Resident preview: {draft.title}
              </h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="cursor-pointer border-none bg-transparent text-sm font-bold text-[#94A3B8]"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-[11px] text-[#94A3B8]">
              This is what residents see for this stage.
            </p>
            {dirty && (
              <div className="mb-3 rounded-lg border border-[#FDE68A] bg-[#FFFDF7] p-2.5 text-[11px] text-[#92400E]">
                Showing unsaved changes. Save the stage to publish these updates to residents.
              </div>
            )}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-bold text-[#0f2d59]">{draft.title}</span>
                {stage?.n === p.current && (
                  <span className="rounded bg-[#0d2240] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    Current
                  </span>
                )}
              </div>
              <div className="mb-2 text-[11px] text-[#64748b]">{fmtDates(draft)}</div>
              <p className="text-xs leading-relaxed text-[#374151]">{draft.summary}</p>
              {draft.bullets.filter((b) => b.trim()).length > 0 && (
                <ul className="mt-2 flex list-none flex-col gap-1 p-0">
                  {draft.bullets
                    .filter((b) => b.trim())
                    .map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                        <span className="mt-1 text-[#22c55e]">✓</span> {b}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage AI upload modal */}
      {uploadOpen && draft && (
        <StageUploadModal
          stageN={stage?.n ?? 1}
          stageTitle={draft.title}
          onClose={() => setUploadOpen(false)}
          onApply={(result, filled, attach) => {
            patch({
              title: draft.title.trim() && !/^Stage \d+$/.test(draft.title) ? draft.title : result.title,
              start: draft.start && draft.start !== "Upcoming" ? draft.start : result.start,
              end: draft.end || result.end,
              summary: result.summary,
              bullets: result.bullets,
            });
            updateProject(p.id, (proj) => ({
              ...proj,
              stages: proj.stages.map((s) =>
                s.n === (stage?.n ?? 1)
                  ? {
                      ...s,
                      ai: true,
                      aiFilled: filled,
                      docs: attach
                        ? [...(s.docs ?? []), { name: STAGE_UP_SAMPLE_FILE.name }]
                        : s.docs,
                    }
                  : s
              ),
            }));
            toast(`AI filled ${filled.length} fields — review before saving`);
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}

function changesText(draft: StageDraft, clean: StageDraft): string {
  const parts: string[] = [];
  if (draft.title !== clean.title) parts.push("title");
  if (draft.start !== clean.start || draft.end !== clean.end || draft.ongoing !== clean.ongoing)
    parts.push("timeframe");
  if (draft.summary !== clean.summary) parts.push("summary");
  if (JSON.stringify(draft.bullets) !== JSON.stringify(clean.bullets)) parts.push("bullets");
  if (draft.status !== clean.status) parts.push("status");
  return parts.length ? `Saving: ${parts.join(", ")}` : "No changes yet";
}

// ── Stage-level AI upload modal ──────────────────────────────────

const UPLOAD_ROWS = ["Stage title", "Timeframe", "Summary", "Key details"];

function StageUploadModal({
  stageN,
  stageTitle,
  onClose,
  onApply,
}: {
  stageN: number;
  stageTitle: string;
  onClose: () => void;
  onApply: (
    result: typeof STAGE_UP_RESULT,
    filled: string[],
    attach: boolean
  ) => void;
}) {
  const [phase, setPhase] = useState<"upload" | "extract">("upload");
  const [files, setFiles] = useState<Array<{ name: string; type: string }>>([]);
  const [note, setNote] = useState("");
  const [attach, setAttach] = useState(true);
  const [revealed, setRevealed] = useState(0);
  // "done" is derived — the reveal timer simply stops once every row is shown
  const done = phase === "extract" && revealed >= UPLOAD_ROWS.length;

  useEffect(() => {
    if (phase !== "extract" || revealed >= UPLOAD_ROWS.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, revealed]);

  return (
    <Modal onClose={onClose} width={760}>
      <h3 className="mb-1 text-base font-bold text-[#111827]">Add documents to this stage</h3>
      <p className="mb-4 text-xs text-[#64748B]">
        AI will read these documents and suggest content for Stage {stageN}: {stageTitle || "(untitled)"}.
      </p>

      {phase === "upload" && (
        <>
          <div
            onClick={() => setFiles([STAGE_UP_SAMPLE_FILE])}
            className="mb-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/20 p-6 text-center transition-colors hover:border-purple-400"
          >
            <div className="text-xs font-bold text-gray-700">
              Drag documents here to upload, or click to try the sample document
            </div>
            <div className="mt-1 text-[10px] text-gray-400">Accepted: PDF, DOCX, TXT</div>
          </div>
          {files.map((f, i) => (
            <div
              key={i}
              className="mb-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3"
            >
              <DocGlyph />
              <span className="flex-1 truncate text-xs font-bold text-gray-700">{f.name}</span>
              <span className="rounded bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-[#7C3AED]">
                {f.type}
              </span>
              <button
                onClick={() => setFiles([])}
                className="cursor-pointer border-none bg-transparent font-bold text-[#94A3B8] hover:text-[#DC2626]"
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note for AI (optional) — e.g., 'Focus on the vote outcome'"
            className="mb-3 h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
          />
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-xs text-[#475569]">
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
            Also attach these documents to this stage so residents can see them
          </label>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
            >
              Cancel
            </button>
            <button
              disabled={!files.length}
              onClick={() => {
                setRevealed(0);
                setPhase("extract");
              }}
              className={`h-9 rounded-lg border-none px-4 text-xs font-semibold text-white ${
                files.length ? "cursor-pointer bg-[#7C3AED] hover:bg-[#6b21a8]" : "cursor-not-allowed bg-purple-200"
              }`}
            >
              ✦ Read Documents with AI
            </button>
          </div>
        </>
      )}

      {phase === "extract" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Document pane */}
            <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FBFCFD] p-4">
              {STAGE_UP_DOC_PARAS.map((para, i) => (
                <p
                  key={i}
                  className={`mb-2.5 text-[11px] leading-relaxed ${
                    i === 0 ? "font-bold text-gray-800" : "text-gray-600"
                  }`}
                >
                  {para.mark ? (
                    <mark className="rounded bg-[#FEF08A] px-0.5">{para.text}</mark>
                  ) : (
                    para.text
                  )}
                </p>
              ))}
            </div>
            {/* Suggestions pane */}
            <div className="flex flex-col gap-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Suggested content for this stage
              </div>
              {UPLOAD_ROWS.map((label, i) => {
                const shown = i < revealed;
                const value =
                  label === "Stage title"
                    ? STAGE_UP_RESULT.title
                    : label === "Timeframe"
                    ? STAGE_UP_RESULT.datesLabel
                    : label === "Summary"
                    ? STAGE_UP_RESULT.summary
                    : STAGE_UP_RESULT.bullets.join(" · ");
                return (
                  <div
                    key={label}
                    className={`rounded-xl border p-3 ${
                      shown
                        ? "border-[#E2E8F0] bg-white"
                        : "border-dashed border-[#E2E8F0] bg-slate-50"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {label}
                      </span>
                      {shown && <AiChip />}
                    </div>
                    {shown ? (
                      <div className="text-xs font-medium leading-relaxed text-gray-900">
                        {value}
                      </div>
                    ) : (
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-200/60" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-[#7C6FA6]">
              {!done
                ? "Reading documents and drafting stage content…"
                : `✦ AI drafted ${UPLOAD_ROWS.length} fields from ${files[0]?.name ?? "the document"}`}
            </span>
            <div className="flex gap-2.5">
              {!done && (
                <button
                  onClick={() => setRevealed(UPLOAD_ROWS.length)}
                  className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
                >
                  Skip to results
                </button>
              )}
              <button
                onClick={onClose}
                className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
              >
                Cancel
              </button>
              {done && (
                <button
                  onClick={() =>
                    onApply(STAGE_UP_RESULT, ["title", "timeframe", "summary", "bullets"], attach)
                  }
                  className="h-9 cursor-pointer rounded-lg border-none bg-[#7C3AED] px-4 text-xs font-semibold text-white hover:bg-[#6b21a8]"
                >
                  Apply to Stage
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function DocGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
