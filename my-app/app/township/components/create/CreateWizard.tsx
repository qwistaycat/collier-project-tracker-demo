"use client";

// ================================================================
//  CreateWizard — the create-a-new-project flow (steps 0–5 plus
//  the publish-success terminal state). Owns all wizard state and
//  the project build; step screens live alongside in this folder.
//
//  Prototype-jank fixes carried from the spec:
//  · Back from Review returns to Upload (AI path) or Start
//    (scratch/duplicate), never to the dead extraction view.
//  · Compliance is two checkboxes that truly gate the publish
//    button ("requires both items").
// ================================================================

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CREATE_SAMPLES,
  STAFF_NAME,
  type Lifecycle,
  type StaffProject,
  type StaffStage,
} from "../../data";
import { useTownship } from "../../TownshipContext";
import ExtractStep from "./ExtractStep";
import PublishStep, { type Compliance } from "./PublishStep";
import ReviewStep from "./ReviewStep";
import SourceModal from "./SourceModal";
import StartStep, { type StartKey } from "./StartStep";
import TimelineStep from "./TimelineStep";
import UploadStep from "./UploadStep";
import {
  btnDangerOutline,
  btnPrimary,
  btnSecondary,
  deptShortOf,
  emptyFields,
  FIELD_LABELS,
  mkStage,
  overlayStyle,
  synthExtract,
  WizardKeyframes,
  type ExtractMeta,
  type FieldKey,
  type SourceView,
  type WizardFields,
  type WizardStage,
} from "./shared";

type Origin = "upload" | "scratch" | "duplicate";

export default function CreateWizard() {
  const router = useRouter();
  const { projects, setProjects, dept, toast } = useTownship();

  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<Origin>("scratch");
  const [files, setFiles] = useState<string[]>([]);
  const [fields, setFields] = useState<WizardFields>(emptyFields);
  const [stages, setStages] = useState<WizardStage[]>([]);
  const [extract, setExtract] = useState<ExtractMeta | null>(null);
  const [sourceDocs, setSourceDocs] = useState<[string, string][]>([]);
  const [stageErrors, setStageErrors] = useState<Record<number, string>>({});
  const [compliance, setCompliance] = useState<Compliance>({ rtk: false, acc: false });
  const [previewStage, setPreviewStage] = useState(0);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [source, setSource] = useState<SourceView | null>(null);
  const [success, setSuccess] = useState<{ title: string; id: string } | null>(null);

  const isManager = dept.replace(/’/g, "'") === "Manager's Office";

  const updField = <K extends keyof WizardFields>(k: K, v: WizardFields[K]) =>
    setFields((f) => ({ ...f, [k]: v }));

  // ── Navigation ─────────────────────────────────────────────────

  const goProjects = () => router.push("/township/projects");

  const cancelCreate = () => {
    if (step > 2 || files.length > 0) setDiscardOpen(true);
    else goProjects();
  };

  const chooseStart = (key: StartKey) => {
    if (key === "upload") {
      setOrigin("upload");
      setStep(1);
    } else if (key === "duplicate") {
      const src = projects.find((p) => p.id === "road-paving") ?? projects[0];
      setOrigin("duplicate");
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
        src.stages.map((st) => {
          const [d1, d2] = st.dates.split(" – ");
          return mkStage({
            title: st.title,
            start: d1 || "",
            end: d2 || "",
            singleDate: !d2,
            summary: st.desc,
            bullets: [...st.bullets],
            status: "draft",
          });
        })
      );
      setExtract(null);
      setSourceDocs([]);
      toast("Duplicated from Road Paving 2026");
      setStep(3);
    } else {
      setOrigin("scratch");
      setFields(emptyFields());
      setStages([mkStage()]);
      setExtract(null);
      setSourceDocs([]);
      setStep(3);
    }
    window.scrollTo(0, 0);
  };

  const readDocuments = (sampleKey: string | null) => {
    const sample = sampleKey
      ? (CREATE_SAMPLES.find((s) => s.key === sampleKey) ?? null)
      : null;
    if (sample) setFiles(sample.files.map((f) => f[0]));
    setExtract(synthExtract(sample, dept));
    setStep(2);
    window.scrollTo(0, 0);
  };

  const continueToReview = () => {
    if (!extract) return;
    setFields({
      title: extract.fields.title.value,
      category: fieldsCategory(extract),
      desc: extract.fields.desc.value,
      funding: extract.fields.funding.value,
      cost: extract.fields.cost.value,
      sponsor: extract.fields.sponsor.value,
      duration: extract.fields.duration.value,
    });
    setStages(
      extract.stages.map((s) =>
        mkStage({
          title: s.title,
          start: s.start,
          end: s.end,
          singleDate: !s.end,
          summary: s.summary,
          bullets: [...s.bullets],
          status: "draft",
          ai: true,
        })
      )
    );
    setSourceDocs(extract.docs);
    setStep(3);
    window.scrollTo(0, 0);
  };

  const backFromReview = () => setStep(origin === "upload" ? 1 : 0);

  const gotoPublish = () => {
    if (stages.length === 0) {
      toast("Add at least one stage");
      return;
    }
    const errs: Record<number, string> = {};
    stages.forEach((s, i) => {
      const parts: string[] = [];
      if (!s.title.trim()) parts.push("a title");
      if (!s.start.trim()) parts.push("a start date");
      if (parts.length) errs[i] = "Add " + parts.join(" and ");
    });
    if (Object.keys(errs).length > 0) {
      setStageErrors(errs);
      toast("Fix the highlighted stages");
      return;
    }
    setStageErrors({});
    const visible = stages.filter((s) => s.status !== "hidden");
    const fp = visible.findIndex((s) => s.status === "published");
    setPreviewStage(fp >= 0 ? fp : 0);
    setStep(5);
    window.scrollTo(0, 0);
  };

  // ── Build & save ───────────────────────────────────────────────

  const buildProject = (lc: Lifecycle): StaffProject => {
    const title = fields.title.trim() || "Untitled Project";
    const visible = stages.filter((s) => s.status !== "hidden");
    const fp = visible.findIndex((s) => s.status === "published");
    const slugBase =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled";
    const id = `${slugBase}-${Date.now().toString(36)}`;
    const staffStages: StaffStage[] = visible.map((s, i) => ({
      n: i + 1,
      title: s.title.trim() || "Untitled stage",
      dates:
        s.singleDate || !s.end.trim()
          ? s.start.trim() || "—"
          : `${s.start.trim()} – ${s.end.trim()}`,
      desc: s.summary.trim(),
      bullets: s.bullets.map((b) => b.trim()).filter(Boolean),
      state: s.status === "published" ? "Published" : "Draft",
    }));
    return {
      id,
      title,
      cat: fields.category,
      deptShort: deptShortOf(dept),
      dept,
      status: lc === "published" ? "Active" : lc === "pending" ? "In Review" : "Draft",
      cost: fields.cost.trim() || "—",
      funding: fields.funding.trim() || "—",
      edited: "just now",
      followers: 0,
      current: fp >= 0 ? fp + 1 : 1,
      desc: fields.desc.trim(),
      sponsor: fields.sponsor.trim() || dept,
      duration: fields.duration.trim() || "—",
      stages: staffStages.length
        ? staffStages
        : [{ n: 1, title: "Planning", dates: "—", desc: "", bullets: [], state: "Draft" }],
      poll: {
        support: 0,
        oppose: 0,
        neutral: 0,
        verified: { s: 0, o: 0, n: 0 },
        trend: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      sentiment: { supportive: 0, mixed: 0, concerns: 0 },
      themes: [],
      privateMsgs: [],
      public: [],
      hidden: [],
      rejected: [],
      deletedC: [],
      log: [
        {
          text:
            lc === "published"
              ? "Published to residents"
              : lc === "pending"
                ? "Submitted for review"
                : "Saved as draft",
          time: "just now",
          by: STAFF_NAME,
        },
      ],
      lc,
      modMode: "post",
      spotlight: null,
      ...(lc === "pending"
        ? {
            submittedBy: STAFF_NAME,
            submittedDept: dept,
            submittedDate: "just now",
            reviewer: "George Macino",
            urgency: "Standard",
          }
        : {}),
    };
  };

  const saveDraft = () => {
    const p = buildProject("draft");
    setProjects((ps) => [p, ...ps]);
    toast("Saved as draft. Only staff can see this project.");
    goProjects();
  };

  const confirmPublish = () => {
    if (isManager) {
      const p = buildProject("published");
      setProjects((ps) => [p, ...ps]);
      setSuccess({ title: p.title, id: p.id });
      window.scrollTo(0, 0);
    } else {
      const p = buildProject("pending");
      setProjects((ps) => [p, ...ps]);
      toast("Submitted for review");
      router.push(`/township/project/${p.id}?tab=details`);
    }
  };

  // ── View source ────────────────────────────────────────────────

  const viewSource = (key: string) => {
    if (!extract) return;
    if (key.startsWith("stage:")) {
      const idx = Number(key.slice(6));
      const st = stages[idx];
      const es = extract.stages.find((e) => e.title === st?.title);
      if (!es) return;
      setSource({
        label: `Source for stage: ${es.title}`,
        doc: extract.docs[0]?.[0] ?? "Document.pdf",
        page: extract.paras.find((p) => p.id === es.paraId)?.page ?? 1,
        section: es.section,
        conf: es.conf,
        reasoning: es.reasoning,
        passage: es.passage,
        fieldKey: null,
      });
    } else {
      const k = key as FieldKey;
      const fm = extract.fields[k];
      if (!fm) return;
      const clearable =
        k === "title" || k === "desc" || k === "funding" || k === "cost" || k === "sponsor" || k === "duration";
      setSource({
        label: `Source for: ${FIELD_LABELS[k]}`,
        doc: extract.docs[0]?.[0] ?? "Document.pdf",
        page: extract.paras.find((p) => p.id === fm.paraId)?.page ?? 1,
        section: fm.section,
        conf: fm.conf,
        reasoning: fm.reasoning,
        passage: fm.passage,
        fieldKey: clearable ? k : null,
      });
    }
  };

  const rejectSource = () => {
    if (source?.fieldKey) {
      updField(source.fieldKey, "");
      toast("Suggestion cleared — add this field manually.");
    }
    setSource(null);
  };

  // ── Render ─────────────────────────────────────────────────────

  const wrapWidth = success ? 900 : step === 5 ? 1240 : step === 2 ? 1180 : 900;

  return (
    <div style={{ maxWidth: wrapWidth, margin: "0 auto", padding: "26px 28px 60px" }}>
      <WizardKeyframes />

      {!success && (
        <div style={{ marginBottom: 16 }}>
          <span
            onClick={cancelCreate}
            style={{ fontSize: 13, color: "#64748B", cursor: "pointer" }}
          >
            ← Cancel
          </span>
        </div>
      )}

      {success ? (
        <SuccessScreen title={success.title} id={success.id} />
      ) : step === 0 ? (
        <StartStep onChoose={chooseStart} />
      ) : step === 1 ? (
        <UploadStep files={files} setFiles={setFiles} onBack={() => setStep(0)} onRead={readDocuments} />
      ) : step === 2 && extract ? (
        <ExtractStep extract={extract} onContinue={continueToReview} />
      ) : step === 3 ? (
        <ReviewStep
          fields={fields}
          updField={updField}
          extract={extract}
          sourceDocs={sourceDocs}
          onViewSource={viewSource}
          onBack={backFromReview}
          onContinue={() => {
            setStep(4);
            window.scrollTo(0, 0);
          }}
        />
      ) : step === 4 ? (
        <TimelineStep
          stages={stages}
          setStages={setStages}
          stageErrors={stageErrors}
          setStageErrors={setStageErrors}
          extract={extract}
          onViewSource={viewSource}
          onBack={() => setStep(3)}
          onContinue={gotoPublish}
        />
      ) : (
        <PublishStep
          fields={fields}
          stages={stages}
          compliance={compliance}
          setCompliance={setCompliance}
          previewStage={previewStage}
          setPreviewStage={setPreviewStage}
          isManager={isManager}
          onSaveDraft={saveDraft}
          onConfirmPublish={confirmPublish}
          onBack={() => setStep(4)}
        />
      )}

      {/* View-source modal */}
      {source && <SourceModal sv={source} onClose={() => setSource(null)} onReject={rejectSource} />}

      {/* Discard modal */}
      {discardOpen && (
        <div style={overlayStyle} onClick={() => setDiscardOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 460, maxWidth: "100%", background: "#fff", borderRadius: 12, padding: 24 }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              You have unsaved changes
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55, marginBottom: 20 }}>
              Save this project as a draft or discard your changes?
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setDiscardOpen(false)} style={btnSecondary}>
                Continue editing
              </button>
              <button
                onClick={() => {
                  setDiscardOpen(false);
                  goProjects();
                }}
                style={btnDangerOutline}
              >
                Discard changes
              </button>
              <button
                onClick={() => {
                  setDiscardOpen(false);
                  saveDraft();
                }}
                style={btnPrimary}
              >
                Save as draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Category can be typed loosely in extract data — normalize to a StaffCategory. */
function fieldsCategory(extract: ExtractMeta): WizardFields["category"] {
  const v = extract.fields.category.value;
  return (["Roads", "Parks", "Infrastructure", "Plan/Dev", "Public Safety"] as const).includes(
    v as WizardFields["category"]
  )
    ? (v as WizardFields["category"])
    : "Roads";
}

function SuccessScreen({ title, id }: { title: string; id: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push(`/township/project/${id}?tab=details`), 5000);
    return () => clearTimeout(t);
  }, [id, router]);

  return (
    <div style={{ textAlign: "center", padding: "70px 20px" }}>
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: "50%",
          background: "#DCFCE7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Published to residents</div>
      <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>
        <span style={{ fontWeight: 700 }}>{title}</span> is now live at collier-connect.vercel.app
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => router.push(`/township/project/${id}?tab=details`)}
          style={btnPrimary}
        >
          View live project ↗
        </button>
        <button onClick={() => router.push("/township/projects")} style={btnSecondary}>
          Return to Projects
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 18 }}>
        Returning to the project automatically…
      </div>
    </div>
  );
}
