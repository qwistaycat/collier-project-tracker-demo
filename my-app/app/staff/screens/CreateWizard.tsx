"use client";

// ================================================================
//  Create wizard — six steps:
//    0 choose start (AI documents / scratch / duplicate)
//    1 upload documents (+ samples, AI context)
//    2 AI extraction split view (document glow + progressive fields)
//    3 review fields (confidence badges + view-source)
//    4 build timeline (templates, stage cards, validation)
//    5 preview & publish (desktop/mobile, compliance checklist)
//  plus the publish-success screen.
// ================================================================

import React, { useEffect, useRef, useState } from "react";
import { useStaff } from "../lib/StaffContext";
import type {
  Confidence,
  CreateFields,
  CreateStage,
  ExtractData,
  ExtractField,
  Project,
  StaffCategory,
} from "../lib/types";
import { SAMPLES, STAGE_TEMPLATES, roadExtract, synthExtract } from "../lib/data";
import { CAT_FULL, STAFF_NAME, detectDocType, plainRewrite } from "../lib/utils";
import { AiChip, Card, Modal, SectionLabel } from "../components/ui";

const EMPTY_FIELDS: CreateFields = {
  title: "",
  category: "Roads",
  desc: "",
  funding: "",
  cost: "",
  sponsor: "",
  duration: "",
};

export default function CreateWizard() {
  const { nav, aiMode, dept, toast, setProjects, openProj, projects } = useStaff();

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<Array<{ name: string; type: string }>>([]);
  const [sampleKey, setSampleKey] = useState<string | null>(null);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctx, setCtx] = useState("");
  const [fields, setFields] = useState<CreateFields>(EMPTY_FIELDS);
  const [stages, setStages] = useState<CreateStage[]>([]);
  const [ext, setExt] = useState<ExtractData | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [sourceView, setSourceView] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [compliance, setCompliance] = useState({ rtk: false, acc: false });
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<{ title: string; id: string } | null>(null);

  // Extraction animation state
  const [revealedFields, setRevealedFields] = useState<string[]>([]);
  const [revealedStages, setRevealedStages] = useState(0);
  const [glowPara, setGlowPara] = useState<string | null>(null);
  const [extPct, setExtPct] = useState(0);
  const [extRunning, setExtRunning] = useState(false);
  const [extDone, setExtDone] = useState(false);
  const [confetti, setConfetti] = useState<Array<React.CSSProperties>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docPaneRef = useRef<HTMLDivElement>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    []
  );

  // Auto-scroll the glowing paragraph into view during extraction
  useEffect(() => {
    if (!glowPara || !docPaneRef.current) return;
    const el = docPaneRef.current.querySelector(`[data-pid="${glowPara}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [glowPara]);

  const cancelCreate = () => {
    if (step > 1 || files.length > 0 || fields.title) setDiscardOpen(true);
    else nav("projects");
  };

  // ── Extraction flow ────────────────────────────────────────────

  const startExtract = () => {
    const sample = SAMPLES.find((s) => s.key === sampleKey);
    const data = sampleKey === "road" || !sample ? roadExtract() : synthExtract(sample, dept);
    setExt(data);
    setRevealedFields([]);
    setRevealedStages(0);
    setExtPct(0);
    setExtRunning(true);
    setExtDone(false);
    setConfetti([]);
    setGlowPara(data.events[0]?.para ?? null);
    setStep(2);
    runExtractStep(0, data);
  };

  const runExtractStep = (idx: number, data: ExtractData) => {
    if (idx >= data.events.length) {
      finishExtract();
      return;
    }
    const evt = data.events[idx];
    setExtPct(Math.round(((idx + 1) / data.events.length) * 100));
    setGlowPara(evt.para);
    if (evt.kind === "field" && evt.key) setRevealedFields((prev) => [...prev, evt.key!]);
    else setRevealedStages((prev) => prev + 1);
    timerRef.current = setTimeout(() => runExtractStep(idx + 1, data), evt.dur);
  };

  const skipExtract = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!ext) return;
    setRevealedFields(Object.keys(ext.fields));
    setRevealedStages(ext.stages.length);
    setExtPct(100);
    setExtRunning(false);
    setExtDone(true);
    setGlowPara(null);
  };

  const finishExtract = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExtPct(100);
    setExtRunning(false);
    setExtDone(true);
    setGlowPara(null);
    const cols = ["#7C3AED", "#16A34A", "#2563EB", "#D97706", "#EC4899", "#A78BFA"];
    setConfetti(
      Array.from({ length: 38 }).map((_, i) => {
        const size = 6 + Math.random() * 7;
        return {
          position: "absolute" as const,
          top: -18,
          left: `${Math.random() * 100}%`,
          width: size,
          height: size * 0.5,
          backgroundColor: cols[i % cols.length],
          borderRadius: 2,
          transform: `rotate(${Math.random() * 90}deg)`,
          animation: `confFall ${1 + Math.random() * 0.9}s ease-in ${Math.random() * 0.5}s forwards`,
        };
      })
    );
  };

  const continueToReview = () => {
    if (!ext) return;
    setFields({
      title: ext.fields.title?.value ?? "",
      category: (ext.fields.category?.value as StaffCategory) ?? "Roads",
      desc: ext.fields.desc?.value ?? "",
      funding: ext.fields.funding?.value ?? "",
      cost: ext.fields.cost?.value ?? "",
      sponsor: ext.fields.sponsor?.value ?? "",
      duration: ext.fields.duration?.value ?? "",
    });
    setStages(
      ext.stages.map((st, i) => ({
        n: i + 1,
        title: st.title,
        start: st.start,
        end: st.end,
        singleDate: !st.end,
        summary: st.summary,
        bullets: [...st.bullets],
        status: "draft",
        docs: [],
        docsOpen: false,
        ai: true,
        rewritten: st.rewritten,
        rewriteFrom: st.rewriteFrom,
      }))
    );
    setStep(3);
  };

  // ── Build & publish ────────────────────────────────────────────

  const buildProject = (lc: "draft" | "published"): Project => {
    const visible = stages.filter((s) => s.status !== "hidden");
    const firstPub = visible.findIndex((s) => s.status === "published");
    const id = `new-${Date.now()}`;
    return {
      id,
      title: fields.title || "Untitled Project",
      cat: fields.category,
      deptShort: dept,
      dept,
      status: lc === "published" ? "Active" : "Draft",
      cost: fields.cost || "—",
      funding: fields.funding || "—",
      edited: "just now",
      followers: 0,
      current: firstPub >= 0 ? firstPub + 1 : 1,
      desc: fields.desc,
      sponsor: fields.sponsor,
      duration: fields.duration,
      stages: visible.map((s, i) => ({
        n: i + 1,
        title: s.title,
        dates: s.end && s.end !== s.start ? `${s.start} – ${s.end}` : s.start || "—",
        desc: s.summary,
        bullets: s.bullets.filter((b) => b.trim()),
        state: s.status === "published" ? "Published" : "Draft",
        ai: s.ai,
      })),
      polls: [],
      sentiment: { supportive: 0, mixed: 0, concerns: 0 },
      themes: [],
      privateMsgs: [],
      public: [],
      hidden: [],
      rejected: [],
      lc,
      modMode: "post",
      spotlight: null,
      log: [{ who: STAFF_NAME, when: "just now", what: lc === "published" ? "Published project to residents" : "Created project draft" }],
      docs: ext?.docs.map((d) => ({ name: d.name })),
    };
  };

  const saveDraft = () => {
    setProjects((prev) => [buildProject("draft"), ...prev]);
    toast("Saved as draft. Only staff can see this project.");
    nav("projects");
  };

  const confirmPublish = () => {
    const proj = buildProject("published");
    setProjects((prev) => [proj, ...prev]);
    setPublishConfirm(false);
    setPublishSuccess({ title: proj.title, id: proj.id });
    successTimer.current = setTimeout(() => openProj(proj.id), 5000);
  };

  const gotoPublish = () => {
    let hasErr = false;
    setStages((prev) =>
      prev.map((s) => {
        const err = !s.title.trim() || !s.start.trim();
        if (err) hasErr = true;
        return { ...s, err };
      })
    );
    if (hasErr) {
      toast("Fix the highlighted stages");
      return;
    }
    if (stages.length === 0) {
      toast("Please add at least one stage");
      return;
    }
    setStep(5);
  };

  const unreviewedAi = aiMode && stages.some((s) => s.ai && s.status !== "hidden");

  // ── Publish success screen ─────────────────────────────────────
  if (publishSuccess) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-[#16A34A]">
          ✓
        </div>
        <h1 className="mt-4 text-xl font-bold text-[#111827]">Published to residents</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          <strong>{publishSuccess.title}</strong> is now live at{" "}
          <span className="font-semibold text-[#2563EB]">collier-connect.vercel.app</span>
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              if (successTimer.current) clearTimeout(successTimer.current);
              openProj(publishSuccess.id);
            }}
            className="h-10 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-5 text-xs font-semibold text-white hover:bg-[#152a45]"
          >
            View live project ↗
          </button>
          <button
            onClick={() => {
              if (successTimer.current) clearTimeout(successTimer.current);
              nav("projects");
            }}
            className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-5 text-xs font-semibold text-[#475569]"
          >
            Return to Projects
          </button>
        </div>
        <p className="mt-4 text-[11px] text-[#94A3B8]">Opening the project automatically…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-8 py-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={cancelCreate}
          className="cursor-pointer border-none bg-transparent text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F]"
        >
          ← Cancel
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Step {step + 1} of 6
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
            <div style={{ width: `${((step + 1) / 6) * 100}%` }} className="h-full bg-[#1E3A5F]" />
          </div>
        </div>
      </div>

      {/* ── Step 0: choose start ── */}
      {step === 0 && (
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[#1E3A5F]">Create a new project</h1>
          <p className="mb-8 text-xs text-gray-500">
            Choose how you want to start. In {dept}.
          </p>
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {aiMode && (
              <StartCard
                icon="✦"
                iconBg="bg-purple-50 text-[#7C3AED]"
                title="Read Documents with AI"
                sub="Upload project specifications, RFPs, or board meeting minutes. AI will read them and pre-fill the project details and timeline stages automatically."
                rec
                onClick={() => setStep(1)}
                hoverBorder="hover:border-[#7C3AED]"
              />
            )}
            <StartCard
              icon="+"
              iconBg="bg-slate-50 text-[#475569]"
              title="Start from Scratch"
              sub="Create a blank draft project and fill in all the details, location, funding, and timeline milestones manually."
              onClick={() => {
                setFields({ ...EMPTY_FIELDS });
                setStages([
                  {
                    n: 1,
                    title: "Initial Planning",
                    start: "Upcoming",
                    end: "",
                    singleDate: true,
                    summary: "Describe what will happen in this stage.",
                    bullets: ["Key detail bullet"],
                    status: "draft",
                    docs: [],
                    docsOpen: false,
                    ai: false,
                  },
                ]);
                setExt(null);
                setStep(3);
              }}
              hoverBorder="hover:border-[#1E3A5F]"
            />
            <StartCard
              icon="⧉"
              iconBg="bg-blue-50 text-[#1E3A5F]"
              title="Duplicate an Existing Project"
              sub="Start by cloning an existing project's structure, timeline stages, and settings. Ideal for recurring annual programs."
              onClick={() => {
                const src = projects[0];
                setFields({
                  title: "Road Paving 2027",
                  category: src.cat,
                  desc: src.desc,
                  funding: src.funding,
                  cost: src.cost,
                  sponsor: src.sponsor,
                  duration: "Mar 2027 – Nov 2027",
                });
                setStages(
                  src.stages.map((st, i) => ({
                    n: i + 1,
                    title: st.title,
                    start: st.dates.split("–")[0]?.trim() ?? st.dates,
                    end: st.dates.split("–")[1]?.trim() ?? "",
                    singleDate: !st.dates.includes("–"),
                    summary: st.desc,
                    bullets: [...st.bullets],
                    status: "draft",
                    docs: [],
                    docsOpen: false,
                    ai: false,
                  }))
                );
                setExt(null);
                setStep(3);
                toast(`Duplicated from ${src.title}`);
              }}
              hoverBorder="hover:border-[#1E3A5F]"
            />
            {!aiMode && (
              <div className="flex flex-col justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center">
                <div className="text-xs font-semibold text-[#64748B]">
                  Turn on AI Assistance to build a project from uploaded documents.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 1: upload ── */}
      {step === 1 && (
        <div className="mx-auto max-w-[720px] pb-10">
          <h1 className="mb-1 text-2xl font-bold text-[#1E3A5F]">Upload project documents</h1>
          <p className="mb-6 text-xs leading-relaxed text-gray-500">
            AI will read your documents and pre-fill the project details and timeline stages
            in the next step. You can review and adjust everything before publishing.
          </p>

          <div
            onClick={() => {
              const names = [
                "Board_Minutes_Jun2026.pdf",
                "Cook_School_Rd_RFP.docx",
                "Culvert_Budget.pdf",
              ];
              setFiles(names.map((n) => ({ name: n, type: detectDocType(n) })));
              setSampleKey(null);
              toast("3 sample files loaded");
            }}
            className="mb-4 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/20 p-8 text-center transition-colors hover:border-purple-400"
          >
            <div className="text-xs font-bold text-gray-700">
              Drop your documents here, or click to load sample files
            </div>
            <div className="mt-1 text-[10px] text-gray-400">
              PDF, DOCX, or TXT files. Up to 10 files, 20MB each.
            </div>
          </div>

          {/* Sample dataset menu */}
          <div className="relative mb-4">
            <button
              onClick={() => setSampleMenuOpen((v) => !v)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
            >
              Try a sample project ▼
            </button>
            {sampleMenuOpen && (
              <div className="absolute left-0 top-10 z-50 w-[280px] rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl">
                {SAMPLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setFiles(s.files.map(([name, type]) => ({ name, type })));
                      setSampleKey(s.key);
                      setSampleMenuOpen(false);
                      toast(`${s.files.length} ${s.label} sample files loaded`);
                    }}
                    className="block w-full cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-2 text-left text-xs text-[#475569] hover:bg-slate-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="mb-5">
              <SectionLabel>Files ready to process</SectionLabel>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-xs"
                >
                  <span className="text-[#7C3AED]">📄</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-gray-700">
                    {f.name}
                  </span>
                  <span className="shrink-0 rounded bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-[#7C3AED]">
                    {f.type}
                  </span>
                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, xi) => xi !== i))}
                    className="shrink-0 cursor-pointer border-none bg-transparent px-1 text-base font-bold text-[#94A3B8] hover:text-[#DC2626]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
            <button
              onClick={() => setCtxOpen((v) => !v)}
              className="flex w-full cursor-pointer items-center gap-2 border-none bg-slate-50 p-3.5 text-left"
            >
              <span className="text-xs font-bold text-[#334155]">
                Add context for AI (optional)
              </span>
              <span className="flex-1" />
              <span className="text-xs text-[#94A3B8]">{ctxOpen ? "▲" : "▼"}</span>
            </button>
            {ctxOpen && (
              <div className="p-4">
                <textarea
                  value={ctx}
                  onChange={(e) => setCtx(e.target.value)}
                  placeholder="e.g., 'This is a recurring annual paving project' or 'Focus on the community engagement timeline'"
                  className="min-h-[64px] w-full rounded-lg border border-[#E2E8F0] p-3 text-xs outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3">
            <button
              onClick={() => setStep(0)}
              className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-slate-600"
            >
              Back
            </button>
            {files.length > 0 && (
              <button
                onClick={startExtract}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border-none bg-[#7C3AED] px-5 text-xs font-semibold text-white hover:bg-[#6b21a8]"
              >
                ✦ Read Documents with AI
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: extraction split view ── */}
      {step === 2 && ext && (
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#7C3AED]">
              ✦
            </div>
            <div className="text-lg font-bold text-gray-900">
              {extDone ? "Extraction complete — review below" : "Analyzing documents…"}
            </div>
          </div>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-purple-100">
            <div
              style={{ width: `${extPct}%` }}
              className="h-full bg-[#7C3AED] transition-all duration-300"
            />
          </div>
          <div className="mb-5 text-xs font-semibold text-[#7C6FA6]">
            {extRunning
              ? `AI has read ${revealedFields.length + revealedStages} of ${ext.events.length} sections · about ${Math.max(1, Math.round((ext.events.length - revealedFields.length - revealedStages) * 1.6))}s remaining`
              : "Done"}{" "}
            ({extPct}%)
          </div>

          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {/* Document pane */}
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#F1F5F9] bg-slate-50 p-3">
                <span className="text-[#7C3AED]">📄</span>
                <span className="text-xs font-semibold text-[#475569]">
                  {ext.docs[0]?.name ?? "Scanning document sources…"}
                </span>
                <div className="flex-1" />
                {extRunning && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-[#7C3AED]">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#7C3AED]" />
                    Reading
                  </span>
                )}
              </div>
              <div ref={docPaneRef} className="h-[460px] overflow-y-auto p-5">
                {ext.paras.map((para) => (
                  <div
                    key={para.id}
                    data-pid={para.id}
                    style={{
                      backgroundColor:
                        glowPara === para.id ? "rgba(124, 58, 237, 0.08)" : "transparent",
                      borderLeft:
                        glowPara === para.id ? "3px solid #7C3AED" : "3px solid transparent",
                    }}
                    className={`mb-2 rounded px-2 py-1 text-[11px] leading-relaxed transition-colors duration-300 ${
                      para.kind === "h1"
                        ? "text-[13px] font-bold text-gray-900"
                        : para.kind === "h2"
                        ? "font-bold text-gray-700"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="mr-2 text-[9px] uppercase tracking-wide text-gray-400">
                      P.{para.page}
                    </span>
                    {para.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Fields pane */}
            <div className="flex h-[500px] flex-col gap-3 overflow-y-auto pr-1">
              {Object.entries(ext.fields).map(([k, fd]) => {
                const shown = revealedFields.includes(k);
                if (!shown) {
                  return (
                    <div key={k} className="rounded-xl border border-dashed border-[#E2E8F0] bg-slate-50 p-3">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {fd.label}
                      </div>
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-200/50" />
                    </div>
                  );
                }
                return (
                  <div key={k} className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-xs">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {fd.label}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ConfBadge conf={fd.conf} />
                        <AiChip />
                      </span>
                    </div>
                    <div className="text-xs font-semibold leading-relaxed text-gray-900">
                      {fd.value}
                    </div>
                  </div>
                );
              })}

              {revealedStages > 0 && (
                <div className="mt-2">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5B21B6]">
                      ✦ Timeline being built ({revealedStages})
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {ext.stages.slice(0, revealedStages).map((st, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-xs"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFF3F8] text-xs font-bold text-[#1E3A5F]">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-bold text-gray-900">
                              {st.title}
                            </span>
                            <ConfBadge conf={st.conf} />
                            {st.rewritten && <AiChip label="Plain language" />}
                          </div>
                          <div className="text-[10px] font-semibold text-gray-400">
                            {st.start}
                            {st.end ? ` – ${st.end}` : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {confetti.length > 0 && (
            <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
              {confetti.map((style, i) => (
                <div key={i} style={style} />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setStep(1);
              }}
              className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            {extRunning && (
              <button
                onClick={skipExtract}
                className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600"
              >
                Skip to End
              </button>
            )}
            <button
              disabled={!extDone}
              onClick={continueToReview}
              className={`h-10 rounded-lg border-none px-5 text-xs font-semibold ${
                extDone
                  ? "cursor-pointer bg-[#7C3AED] text-white hover:bg-[#6b21a8]"
                  : "cursor-not-allowed bg-purple-100 text-purple-300"
              }`}
            >
              Continue to Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: review fields ── */}
      {step === 3 && (
        <div className="mx-auto max-w-[760px]">
          <h1 className="mb-1 text-2xl font-bold text-[#1E3A5F]">Review project details</h1>
          {aiMode && ext ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-purple-600">
                AI drafted the following based on your documents. Every field is editable —
                review each one carefully.
              </p>
              <AiChip label="AI-suggested throughout" />
            </div>
          ) : ext ? (
            <p className="mb-6 text-xs text-gray-500">
              AI-generated content is preserved. Toggle AI Assistance on to access source
              references.
            </p>
          ) : (
            <p className="mb-6 text-xs text-gray-500">Fill in the project details.</p>
          )}

          <div className="flex flex-col gap-5">
            <FieldRow
              label="Project Title"
              fieldKey="title"
              ext={ext}
              aiSrc={aiMode && !!ext}
              sourceView={sourceView}
              setSourceView={setSourceView}
            >
              <input
                type="text"
                value={fields.title}
                onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Road Paving 2026"
                className="h-11 w-full rounded-xl border border-[#E2E8F0] px-3 text-sm font-semibold outline-none"
              />
            </FieldRow>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldRow
                label="Category"
                fieldKey="category"
                ext={ext}
                aiSrc={aiMode && !!ext}
                sourceView={sourceView}
                setSourceView={setSourceView}
              >
                <select
                  value={fields.category}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, category: e.target.value as StaffCategory }))
                  }
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-2 text-xs outline-none"
                >
                  {(Object.keys(CAT_FULL) as string[])
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {CAT_FULL[c]}
                      </option>
                    ))}
                </select>
              </FieldRow>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Department</label>
                <input
                  type="text"
                  disabled
                  value={dept}
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-slate-100 px-3 text-xs text-slate-400 outline-none"
                />
              </div>
            </div>

            <FieldRow
              label="Description"
              fieldKey="desc"
              ext={ext}
              aiSrc={aiMode && !!ext}
              sourceView={sourceView}
              setSourceView={setSourceView}
            >
              <textarea
                value={fields.desc}
                onChange={(e) => setFields((f) => ({ ...f, desc: e.target.value }))}
                placeholder="Write a public summary description of this project..."
                className="min-h-[80px] w-full rounded-xl border border-[#E2E8F0] p-3 text-xs leading-relaxed outline-none"
              />
            </FieldRow>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldRow label="Funding Source" fieldKey="funding" ext={ext} aiSrc={aiMode && !!ext} sourceView={sourceView} setSourceView={setSourceView}>
                <input
                  type="text"
                  value={fields.funding}
                  onChange={(e) => setFields((f) => ({ ...f, funding: e.target.value }))}
                  placeholder="e.g., Township General Budget"
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] px-3 text-xs outline-none"
                />
              </FieldRow>
              <FieldRow label="Total Project Cost" fieldKey="cost" ext={ext} aiSrc={aiMode && !!ext} sourceView={sourceView} setSourceView={setSourceView}>
                <input
                  type="text"
                  value={fields.cost}
                  onChange={(e) => setFields((f) => ({ ...f, cost: e.target.value }))}
                  placeholder="e.g., $150,000"
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] px-3 text-xs outline-none"
                />
              </FieldRow>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldRow label="Project Sponsor / Admin" fieldKey="sponsor" ext={ext} aiSrc={aiMode && !!ext} sourceView={sourceView} setSourceView={setSourceView}>
                <input
                  type="text"
                  value={fields.sponsor}
                  onChange={(e) => setFields((f) => ({ ...f, sponsor: e.target.value }))}
                  placeholder="e.g., Public Works Department"
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] px-3 text-xs outline-none"
                />
              </FieldRow>
              <FieldRow label="Project Duration / Dates" fieldKey="duration" ext={ext} aiSrc={aiMode && !!ext} sourceView={sourceView} setSourceView={setSourceView}>
                <input
                  type="text"
                  value={fields.duration}
                  onChange={(e) => setFields((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g., Mar 2026 – Sep 2026"
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] px-3 text-xs outline-none"
                />
              </FieldRow>
            </div>
          </div>

          {ext && (
            <Card className="mt-6 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[#7C3AED]">📄</span>
                <span className="text-xs font-bold text-gray-700">Source Documents</span>
                <span className="text-[10px] text-[#94A3B8]">
                  — click any field&apos;s &ldquo;View source&rdquo; to see where it came from
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ext.docs.map((d, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#334155]"
                  >
                    <span className="max-w-[220px] truncate">{d.name}</span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[#94A3B8]">
                These documents are saved with the project for reference. Residents will not
                see them unless you attach them to specific stages.
              </p>
            </Card>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(ext ? 1 : 0)}
              className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-slate-600"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="h-10 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-5 text-xs font-semibold text-white hover:bg-[#152a45]"
            >
              Continue to Timeline →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: timeline builder ── */}
      {step === 4 && (
        <div className="mx-auto max-w-[820px]">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">Build the timeline</h1>
              <p className="mt-1 text-xs text-gray-500">
                Review the steps for this project. Insert or reorder milestones to build the
                public timeline.
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setTemplateMenuOpen((v) => !v)}
                className="flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
              >
                Load a template ▼
              </button>
              {templateMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-[220px] rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-lg">
                  <div className="p-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Common project types
                  </div>
                  {Object.entries(STAGE_TEMPLATES).map(([name, tmplStages]) => (
                    <button
                      key={name}
                      onClick={() => {
                        setStages(
                          tmplStages.map((t, i) => ({
                            n: i + 1,
                            title: t.title,
                            start: t.start,
                            end: t.end ?? "",
                            singleDate: !t.end,
                            summary: t.summary,
                            bullets: [...t.bullets],
                            status: t.status === "published" ? "published" : "draft",
                            docs: [],
                            docsOpen: false,
                            ai: false,
                          }))
                        );
                        setTemplateMenuOpen(false);
                        toast(`Loaded '${name}' template`);
                      }}
                      className="block w-full cursor-pointer rounded border-none bg-transparent p-2 text-left text-xs text-[#0f172a] hover:bg-slate-50"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {stages.map((st, idx) => (
              <StageCard
                key={idx}
                st={st}
                aiMode={aiMode}
                onPatch={(part) =>
                  setStages((prev) =>
                    prev.map((s, si) => (si === idx ? { ...s, ...part, ai: part.ai ?? false } : s))
                  )
                }
                onInsertBefore={() =>
                  setStages((prev) => {
                    const next = [...prev];
                    next.splice(idx, 0, {
                      n: 0,
                      title: "",
                      start: "",
                      end: "",
                      singleDate: true,
                      summary: "",
                      bullets: [],
                      status: "draft",
                      docs: [],
                      docsOpen: false,
                      ai: false,
                    });
                    return next.map((s, i) => ({ ...s, n: i + 1 }));
                  })
                }
                onDelete={() => {
                  setStages((prev) =>
                    prev.filter((_, si) => si !== idx).map((s, i) => ({ ...s, n: i + 1 }))
                  );
                  toast("Stage removed");
                }}
                onMove={(dir) =>
                  setStages((prev) => {
                    const to = idx + dir;
                    if (to < 0 || to >= prev.length) return prev;
                    const next = [...prev];
                    const [moved] = next.splice(idx, 1);
                    next.splice(to, 0, moved);
                    return next.map((s, i) => ({ ...s, n: i + 1 }));
                  })
                }
                onRewrite={() => {
                  setStages((prev) =>
                    prev.map((s, si) =>
                      si === idx
                        ? {
                            ...s,
                            summary: plainRewrite(s.summary),
                            rewritten: true,
                            rewriteFrom: s.summary,
                          }
                        : s
                    )
                  );
                  toast("AI rewrote the summary — review it");
                }}
              />
            ))}
          </div>

          <button
            onClick={() =>
              setStages((prev) => [
                ...prev,
                {
                  n: prev.length + 1,
                  title: `Stage ${prev.length + 1}`,
                  start: "Upcoming",
                  end: "",
                  singleDate: true,
                  summary: "Describe what will happen in this stage.",
                  bullets: [],
                  status: "draft",
                  docs: [],
                  docsOpen: false,
                  ai: false,
                },
              ])
            }
            className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            + Add Stage
          </button>
          <p className="mt-2 text-center text-[10px] text-[#94A3B8]">
            Add as many stages as this project needs. Most projects have 3 to 11 stages.
          </p>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-slate-600"
            >
              Back
            </button>
            <button
              onClick={gotoPublish}
              className="h-10 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-5 text-xs font-semibold text-white hover:bg-[#152a45]"
            >
              Preview &amp; Publish →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: preview & publish ── */}
      {step === 5 && (
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[#1E3A5F]">Preview &amp; Publish</h1>
          <p className="mb-6 text-xs text-gray-500">
            This is exactly what residents will see. Review carefully, complete the compliance
            checklist, then publish.
          </p>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Resident preview */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:col-span-2">
              <div className="flex items-center justify-between bg-[#0D2240] p-3 text-xs text-white">
                <span className="font-semibold">Resident view</span>
                <div className="flex gap-2">
                  {(["desktop", "mobile"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPreviewMode(m)}
                      className={`cursor-pointer rounded border-none px-2 py-0.5 text-[10px] font-bold capitalize ${
                        previewMode === m ? "bg-white text-[#0D2240]" : "bg-transparent text-white/60"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {unreviewedAi && (
                <div className="border-b border-[#FDE68A] bg-[#FFFBEB] px-4 py-2.5 text-[11px] text-[#92400E]">
                  ⚠ This project contains AI-suggested content that hasn&apos;t been reviewed.
                  Open each stage and confirm its content before publishing.
                </div>
              )}

              <div className="max-h-[560px] overflow-y-auto bg-white">
                <div
                  style={{
                    maxWidth: previewMode === "mobile" ? 390 : "100%",
                    margin: "0 auto",
                    border: previewMode === "mobile" ? "8px solid #0F172A" : "none",
                    borderRadius: previewMode === "mobile" ? 20 : 0,
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://picsum.photos/seed/paving-preview/1200/400"
                    alt="Preview hero"
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-6">
                    <div className="text-[11px] font-semibold text-[#2563eb]">
                      {CAT_FULL[fields.category]}
                    </div>
                    <h2 className="mt-1 text-xl font-bold leading-tight text-gray-900">
                      {fields.title || "Untitled Project"}
                    </h2>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="rounded-full border-2 border-[#2563eb] bg-white px-4 py-1.5 text-xs font-semibold text-[#2563eb]">
                        + Follow Project
                      </span>
                      <span className="text-xs italic text-gray-400">Last updated just now</span>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-gray-600">
                      {fields.desc || "No description provided."}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-xs">
                      {(
                        [
                          ["Sponsor", fields.sponsor],
                          ["Duration", fields.duration],
                          ["Total Cost", fields.cost],
                        ] as Array<[string, string]>
                      ).map(([label, value]) => (
                        <div key={label}>
                          <div className="text-[10px] font-bold uppercase text-gray-400">
                            {label}
                          </div>
                          <div className="mt-0.5 font-semibold text-gray-800">{value || "—"}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-slate-600">
                      <strong>Funding:</strong> {fields.funding || "—"}
                    </div>

                    <h3 className="mt-6 text-sm font-bold text-gray-900">Project Timeline</h3>
                    {stages.filter((s) => s.status === "published").length === 0 ? (
                      <p className="mt-2 text-xs italic text-gray-400">
                        No published stages yet. Set stages to Published on the previous step.
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-col gap-2.5">
                        {stages
                          .filter((s) => s.status !== "hidden")
                          .map((s, i) => (
                            <div
                              key={i}
                              className={`rounded-xl border p-3 ${
                                s.status === "published"
                                  ? "border-[#e2e8f0] bg-white"
                                  : "border-dashed border-[#CBD5E1] bg-slate-50 opacity-70"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF3F8] text-[10px] font-bold text-[#1E3A5F]">
                                  {i + 1}
                                </span>
                                <span className="text-xs font-bold text-[#0f2d59]">
                                  {s.title || "(untitled)"}
                                </span>
                                <span className="text-[10px] text-[#94a3b8]">
                                  {s.start}
                                  {s.end && !s.singleDate ? ` – ${s.end}` : ""}
                                </span>
                                {s.status === "draft" && (
                                  <span className="rounded bg-slate-200 px-1.5 text-[8px] font-bold uppercase text-slate-600">
                                    Draft — staff only
                                  </span>
                                )}
                              </div>
                              {s.summary && (
                                <p className="mt-1.5 text-[11px] leading-relaxed text-[#374151]">
                                  {s.summary}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    <div className="mt-6 rounded-xl border border-dashed border-[#CBD5E1] bg-slate-50 p-4 text-center text-[11px] text-[#94A3B8]">
                      The private message and community forum will be available to residents
                      once this project is published.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish checklist */}
            <Card className="sticky top-[76px] p-5">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#1E3A5F]">
                Ready to publish?
              </h3>
              <div className="flex flex-col gap-4 text-xs text-gray-700">
                <label className="flex cursor-pointer select-none items-start gap-2.5 leading-normal">
                  <input
                    type="checkbox"
                    checked={compliance.rtk}
                    onChange={(e) => setCompliance((c) => ({ ...c, rtk: e.target.checked }))}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span>
                    <strong>Right-to-Know Act reviewed.</strong>
                    <br />
                    Confirm all content in this project is appropriate for public release under
                    Pennsylvania&apos;s Right-to-Know Act.
                  </span>
                </label>
                <label className="flex cursor-pointer select-none items-start gap-2.5 leading-normal">
                  <input
                    type="checkbox"
                    checked={compliance.acc}
                    onChange={(e) => setCompliance((c) => ({ ...c, acc: e.target.checked }))}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span>
                    <strong>Content reviewed for accuracy.</strong>
                    <br />
                    Confirm all facts, dates, funding amounts, and names are correct.
                  </span>
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={saveDraft}
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-[#1E3A5F] hover:bg-slate-200"
                >
                  Save as Draft
                </button>
                <button
                  disabled={!compliance.rtk || !compliance.acc}
                  onClick={() => setPublishConfirm(true)}
                  className={`h-10 w-full rounded-lg border-none text-xs font-bold text-white ${
                    compliance.rtk && compliance.acc
                      ? "cursor-pointer bg-[#16A34A] hover:bg-[#11803a]"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  Publish to Residents
                </button>
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-[#94A3B8]">
                You can move any project to Draft or edit it at any time from the Projects
                page.
              </p>
            </Card>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setStep(4)}
              className="h-10 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-slate-600"
            >
              ← Back to timeline
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {discardOpen && (
        <Modal onClose={() => setDiscardOpen(false)} width={440}>
          <h3 className="mb-2 text-base font-bold text-gray-900">You have unsaved changes</h3>
          <p className="mb-5 text-xs leading-relaxed text-gray-500">
            Discard this project draft, or save it so you can pick up where you left off?
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setDiscardOpen(false)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-slate-600"
            >
              Continue editing
            </button>
            <button
              onClick={() => {
                setDiscardOpen(false);
                nav("projects");
              }}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#DC2626] px-3.5 text-xs font-semibold text-white"
            >
              Discard changes
            </button>
            <button
              onClick={() => {
                setDiscardOpen(false);
                saveDraft();
              }}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-3.5 text-xs font-semibold text-white"
            >
              Save as draft
            </button>
          </div>
        </Modal>
      )}

      {publishConfirm && (
        <Modal onClose={() => setPublishConfirm(false)} width={440}>
          <h3 className="mb-2 text-base font-bold text-gray-900">
            Publish &ldquo;{fields.title || "Untitled Project"}&rdquo; to residents?
          </h3>
          <p className="mb-5 text-xs leading-relaxed text-gray-500">
            The project will appear on the public resident portal immediately. Residents
            following this category will be notified.
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setPublishConfirm(false)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmPublish}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#16A34A] px-4 text-xs font-semibold text-white hover:bg-[#11803a]"
            >
              Confirm and Publish
            </button>
          </div>
        </Modal>
      )}

      {/* Source viewer */}
      {sourceView && ext?.fields[sourceView] && (
        <SourceViewerModal
          field={ext.fields[sourceView]}
          onClose={() => setSourceView(null)}
          onReject={() => {
            setFields((f) => ({ ...f, [sourceView]: "" }));
            setSourceView(null);
            toast("Suggestion cleared — add this field manually.");
          }}
        />
      )}
    </main>
  );
}

// ── Pieces ───────────────────────────────────────────────────────

function StartCard({
  icon,
  iconBg,
  title,
  sub,
  rec,
  onClick,
  hoverBorder,
}: {
  icon: string;
  iconBg: string;
  title: string;
  sub: string;
  rec?: boolean;
  onClick: () => void;
  hoverBorder: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md ${hoverBorder}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconBg}`}>
          {icon}
        </div>
        {rec && <AiChip label="Recommended" />}
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-bold text-[#1E3A5F]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

function ConfBadge({ conf }: { conf: Confidence }) {
  if (conf === "high") {
    return (
      <span
        title="AI is confident about this field"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DCFCE7] text-[9px] font-bold text-[#16A34A]"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      title="AI is less certain — review carefully"
      className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FEF3C7] text-[9px] font-bold text-[#B45309]"
    >
      !
    </span>
  );
}

function FieldRow({
  label,
  fieldKey,
  ext,
  aiSrc,
  sourceView,
  setSourceView,
  children,
}: {
  label: string;
  fieldKey: string;
  ext: ExtractData | null;
  aiSrc: boolean;
  sourceView: string | null;
  setSourceView: (v: string | null) => void;
  children: React.ReactNode;
}) {
  const fd = ext?.fields[fieldKey];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
          {label}
          {aiSrc && fd && <ConfBadge conf={fd.conf} />}
        </label>
        {aiSrc && fd && (
          <button
            onClick={() => setSourceView(sourceView === fieldKey ? null : fieldKey)}
            className="flex cursor-pointer items-center gap-1 rounded border-none bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-[#7C3AED]"
          >
            👁 View source
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function SourceViewerModal({
  field,
  onClose,
  onReject,
}: {
  field: ExtractField;
  onClose: () => void;
  onReject: () => void;
}) {
  const { toast } = useStaff();
  const confMeta =
    field.conf === "high"
      ? { label: "High confidence", color: "#16A34A", bg: "#DCFCE7" }
      : field.conf === "med"
      ? { label: "Medium confidence", color: "#B45309", bg: "#FEF3C7" }
      : { label: "Low confidence — review carefully", color: "#B45309", bg: "#FEF3C7" };

  return (
    <Modal onClose={onClose} width={560}>
      <h3 className="mb-1 text-base font-bold text-[#111827]">{field.label}</h3>
      <div className="mb-3 text-xs text-[#64748B]">
        <strong>{field.doc}</strong> · Page {field.page} · {field.section}
      </div>
      <div
        style={{ color: confMeta.color, backgroundColor: confMeta.bg }}
        className="mb-3 rounded-lg p-3 text-xs"
      >
        <strong>{confMeta.label}.</strong> {field.reasoning}
      </div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        Text passage from the document
      </div>
      <div className="mb-3 border-l-4 border-[#F59E0B] bg-[#FFFBEB] p-3 text-xs italic leading-relaxed text-[#374151]">
        &ldquo;{field.passage}&rdquo;
      </div>
      {field.multi && (
        <div className="mb-3 flex flex-col gap-1.5">
          {field.multi.map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-[#475569]">
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                {m.maps}
              </span>
              <span className="italic">&ldquo;{m.passage}&rdquo;</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2.5 border-t border-[#F1F5F9] pt-3">
        <button
          onClick={onReject}
          className="h-9 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
        >
          Reject this suggestion
        </button>
        <button
          onClick={() => toast("Opening document at this section…")}
          className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#475569]"
        >
          Open document at this section
        </button>
      </div>
    </Modal>
  );
}

function StageCard({
  st,
  aiMode,
  onPatch,
  onInsertBefore,
  onDelete,
  onMove,
  onRewrite,
}: {
  st: CreateStage;
  aiMode: boolean;
  onPatch: (part: Partial<CreateStage> & { ai?: boolean }) => void;
  onInsertBefore: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onRewrite: () => void;
}) {
  return (
    <div className="group relative">
      {/* insert-before affordance */}
      <button
        onClick={onInsertBefore}
        className="absolute -top-3 left-1/2 z-10 hidden -translate-x-1/2 cursor-pointer rounded-full border border-[#CBD5E1] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#475569] shadow-sm group-hover:block"
      >
        + Insert stage here
      </button>
      <div
        className={`rounded-2xl border bg-white p-5 shadow-xs ${
          st.err ? "border-[#FCA5A5]" : "border-slate-200"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF3F8] text-xs font-bold text-[#1E3A5F]">
            {st.n}
          </span>
          {st.ai && <AiChip />}
          {st.rewritten && <AiChip label="Rewritten in plain language" />}
          <div className="flex-1" />
          <button
            onClick={() => onMove(-1)}
            title="Move up"
            className="cursor-pointer border-none bg-transparent px-1 text-xs text-[#94A3B8] hover:text-[#1E3A5F]"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            title="Move down"
            className="cursor-pointer border-none bg-transparent px-1 text-xs text-[#94A3B8] hover:text-[#1E3A5F]"
          >
            ↓
          </button>
          {aiMode && (
            <button
              onClick={onRewrite}
              className="h-7 cursor-pointer rounded border-none bg-purple-50 px-3 text-[10px] font-bold text-[#7C3AED]"
            >
              ✦ Rewrite (AI)
            </button>
          )}
          <button
            onClick={onDelete}
            className="cursor-pointer border-none bg-transparent px-1 text-xs font-bold text-red-600"
          >
            Delete
          </button>
        </div>

        {st.err && (
          <div className="mb-3 text-[11px] font-semibold text-[#DC2626]">
            ⚠ Add a title and a start date
          </div>
        )}

        <div className="mb-3">
          <SectionLabel>Stage Title</SectionLabel>
          <input
            type="text"
            value={st.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            placeholder="e.g., Road Condition Assessment"
            className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-semibold outline-none"
          />
          <p className="mt-1 text-[10px] text-[#94A3B8]">
            Short and descriptive. Residents see this in the timeline.
          </p>
        </div>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Timeframe
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onPatch({ singleDate: false })}
                className={`cursor-pointer rounded border-none px-2 py-0.5 text-[10px] font-bold ${
                  !st.singleDate ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                Date range
              </button>
              <button
                onClick={() => onPatch({ singleDate: true })}
                className={`cursor-pointer rounded border-none px-2 py-0.5 text-[10px] font-bold ${
                  st.singleDate ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                Single date
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={st.start}
              onChange={(e) => onPatch({ start: e.target.value })}
              placeholder="Start — e.g., Winter 2025"
              className="h-9 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
            />
            {!st.singleDate && (
              <input
                type="text"
                value={st.end}
                onChange={(e) => onPatch({ end: e.target.value })}
                placeholder="End — e.g., Late 2026"
                className="h-9 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
              />
            )}
          </div>
          <p className="mt-1 text-[10px] text-[#94A3B8]">
            Accepts specific dates or general timeframes like &ldquo;Winter 2025&rdquo; or
            &ldquo;Late 2026.&rdquo;
          </p>
        </div>

        <div className="mb-3">
          <SectionLabel>Summary Sentence</SectionLabel>
          <textarea
            value={st.summary}
            onChange={(e) => onPatch({ summary: e.target.value })}
            placeholder="e.g., Public Works evaluates every Township-owned road and scores its condition from 1 (minimal work) to 5 (most in need of work)."
            className="min-h-[50px] w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs leading-relaxed outline-none"
          />
        </div>

        <div className="mb-3">
          <SectionLabel>Key details (3 to 5 recommended)</SectionLabel>
          {st.bullets.map((b, bi) => (
            <div key={bi} className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <input
                type="text"
                value={b}
                onChange={(e) =>
                  onPatch({ bullets: st.bullets.map((x, xi) => (xi === bi ? e.target.value : x)) })
                }
                placeholder="Add a short detail residents can scan"
                className="h-8 flex-1 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
              />
              <button
                onClick={() => onPatch({ bullets: st.bullets.filter((_, xi) => xi !== bi) })}
                className="cursor-pointer border-none bg-transparent px-1 text-lg font-bold text-[#94A3B8] hover:text-[#DC2626]"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onPatch({ bullets: [...st.bullets, ""] })}
            className="mt-1 cursor-pointer border-none bg-transparent text-[11px] font-bold text-[#1E3A5F]"
          >
            + Add a bullet
          </button>
        </div>

        <div>
          <SectionLabel>Publish status for this stage</SectionLabel>
          <div className="flex max-w-[280px] gap-1 rounded-lg bg-slate-100 p-1">
            {(["draft", "published", "hidden"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onPatch({ status: s })}
                className={`flex-1 cursor-pointer rounded border-none py-1 text-[10px] font-bold uppercase ${
                  st.status === s ? "bg-white text-[#1e3a5f] shadow-xs" : "bg-transparent text-slate-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-[#94A3B8]">
            Draft stages are visible only to staff. Published stages are visible to residents.
            Hidden stages are removed from the resident timeline.
          </p>
        </div>
      </div>
    </div>
  );
}
