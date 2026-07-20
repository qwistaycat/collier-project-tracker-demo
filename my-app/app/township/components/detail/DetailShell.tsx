"use client";

// ================================================================
//  DetailShell — the staff project-detail screen shell: back link,
//  hero strip, sticky header (title / lifecycle pill / actions /
//  kebab), the Details·Feedback·Poll Results tab bar, lifecycle
//  banners, and lifecycle modals. Renders the active tab body.
//
//  Route: /township/project/[id]?tab=details|feedback|polls
//  Extra params: ?stage=N (deep-link a stage), ?review=1 (open in
//  review mode for pending projects), ?sub=… (consumed by the
//  Feedback tab itself).
// ================================================================

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MoreIcon, EyeIcon } from "@/app/components/icons";
import { useTownship } from "../../TownshipContext";
import { lcMeta, STAFF_NAME, type StaffProject } from "../../data";
import {
  ghostBtn,
  primaryBtn,
  dangerOutlineBtn,
  amberOutlineBtn,
  patchProject,
  ConfirmModal,
  Spinner,
  LcIcon,
  StarIcon,
  PeopleIcon,
  PencilIcon,
  ChatIcon,
  BarsIcon,
  CheckCircleIcon,
  NEIGHBORHOOD_DEFAULT,
  type XProject,
} from "./shared";
import DetailsTab from "./DetailsTab";
import ResidentPreview from "./ResidentPreview";
import FeedbackTab from "./FeedbackTab";
import PollsTab from "./PollsTab";
import type { StageEditorHandle } from "./StageEditor";
import {
  SubmitReviewModal,
  SpotlightModal,
  ReviewActionModal,
  DeleteConfirmModal,
  EditHistoryDrawer,
} from "./LifecycleModals";

type TabKey = "details" | "feedback" | "polls";

interface Snapshot {
  desc: string;
  funding: string;
  cost: string;
  sponsor: string;
  duration: string;
  neighborhoods: string;
}

// Session-unique suffix for duplicated-project ids
let dupCounter = 0;

export default function DetailShell() {
  const params = useParams<{ id: string }>();
  const id = String(params.id ?? "");
  const router = useRouter();
  const search = useSearchParams();
  const { getProject, updateProject, setProjects, projects, aiMode, dept, toast } = useTownship();

  const project = getProject(id) as XProject | undefined;

  const rawTab = search.get("tab");
  let tab: TabKey = rawTab === "feedback" ? "feedback" : rawTab === "polls" ? "polls" : "details";
  if (project?.lc === "pending") tab = "details";

  const [reviewMode, setReviewMode] = useState(() => search.get("review") === "1");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [histOpen, setHistOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveDraftOpen, setMoveDraftOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<null | "reject" | "changes">(null);

  const [editAll, setEditAll] = useState(false);
  const snapRef = useRef<Snapshot | null>(null);

  // Editing ↔ Resident Preview toggle for the Details tab. Preview
  // renders the resident page in place (no navigation away).
  const [preview, setPreview] = useState(false);

  const [selStage, setSelStage] = useState<number>(() => {
    const s = Number(search.get("stage"));
    if (Number.isFinite(s) && s > 0) return s;
    return getProject(id)?.current ?? 1;
  });
  const [stageDirty, setStageDirty] = useState(false);
  const editorHandleRef = useRef<StageEditorHandle | null>(null);
  const [navGuard, setNavGuard] = useState<null | { pending: () => void }>(null);
  const [guardSaving, setGuardSaving] = useState(false);

  // Kebab: outside-click close
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  // Keep stage selection valid when stages are added/removed —
  // adjusted during render (React's "derive state" pattern).
  if (
    project &&
    project.stages.length > 0 &&
    !project.stages.some((s) => s.n === selStage)
  ) {
    setSelStage(project.stages[0].n);
  }

  if (!project) {
    return (
      <div
        style={{
          maxWidth: 640,
          margin: "60px auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          Project not found
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
          This project may have been deleted, or the link is incorrect.
        </div>
        <Link
          href="/township/projects"
          style={{ color: "#2563eb", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const lc = project.lc;
  const lcM = lcMeta(lc);

  const patch = (fields: Partial<XProject>, logText?: string) =>
    patchProject(updateProject, id, fields, logText);

  const goGallery = () => router.push("/township/projects");

  const requestNav = (fn: () => void) => {
    if (stageDirty && tab === "details") setNavGuard({ pending: fn });
    else fn();
  };

  const setTab = (t: TabKey) =>
    requestNav(() => {
      if (t !== "details") setPreview(false);
      router.replace(`/township/project/${id}?tab=${t}`, { scroll: false });
    });

  // ── Editing ↔ Resident Preview ─────────────────────────────────
  const enterPreview = () =>
    requestNav(() => {
      if (tab !== "details") router.replace(`/township/project/${id}?tab=details`, { scroll: false });
      setPreview(true);
    });

  const exitPreview = () => {
    if (tab !== "details") router.replace(`/township/project/${id}?tab=details`, { scroll: false });
    setPreview(false);
  };

  // ── Edit All ───────────────────────────────────────────────────
  const enterEditAll = () => {
    snapRef.current = {
      desc: project.desc,
      funding: project.funding,
      cost: project.cost,
      sponsor: project.sponsor,
      duration: project.duration,
      neighborhoods: project.neighborhoods ?? NEIGHBORHOOD_DEFAULT,
    };
    setEditAll(true);
  };

  const editHeader = () =>
    requestNav(() => {
      router.replace(`/township/project/${id}?tab=details`, { scroll: false });
      setPreview(false);
      enterEditAll();
    });

  const discardEditAll = () => {
    if (snapRef.current) patch(snapRef.current);
    setEditAll(false);
    toast("Changes discarded");
  };

  const saveEditAll = () => {
    patch({ edited: "just now" }, "Edited project details");
    setEditAll(false);
    toast("All changes saved");
  };

  // ── Lifecycle actions ──────────────────────────────────────────
  const publishProject = () => {
    patch({ lc: "published", status: "Active", edited: "just now" });
    toast("Project published — now live for residents");
  };

  const recallSubmission = () => {
    patch({ lc: "draft", status: "Draft", submittedBy: undefined });
    toast("Submission recalled — back to Draft");
  };

  const markCompleted = () => {
    patch(
      { lc: "completed", status: "Completed", completedDate: "Jul 2026" },
      "marked this project as completed"
    );
    toast("Marked as completed");
  };

  const reopenProject = () => {
    patch(
      { reopenedDate: "Jul 14, 2026", reopenedBy: STAFF_NAME, lc: "published", status: "Active" },
      "reopened this project"
    );
    toast("Project reopened");
  };

  const moveToDraft = () => {
    patch(
      {
        prevPublishedDate: "Jul 14, 2026",
        prevPublishedBy: STAFF_NAME,
        lc: "draft",
        status: "Draft",
      },
      "moved this project to Draft"
    );
    setMoveDraftOpen(false);
    toast("Moved to Draft — hidden from residents");
  };

  const duplicateProject = () => {
    const copyId = `dup-${++dupCounter}`;
    const copy = {
      ...project,
      id: copyId,
      title: project.title + " (Copy)",
      status: "Draft",
      lc: "draft",
      edited: "just now",
      followers: 0,
      stages: project.stages.map((s) => ({ ...s, bullets: [...s.bullets] })),
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
      log: [],
      spotlight: null,
      submittedBy: undefined,
      submittedDept: undefined,
      submittedDate: undefined,
      reviewer: undefined,
      urgency: undefined,
      srNote: undefined,
      reviewFeedback: null,
      rejectedSub: false,
    } as StaffProject;
    setProjects((ps) => [...ps, copy]);
    toast("Project duplicated");
    router.push(`/township/project/${copyId}?tab=details`);
  };

  const doDelete = () => {
    patch({ prevLc: lc, lc: "trash", trashedDate: "just now" }, "Moved to Trash");
    setDeleteOpen(false);
    toast("Moved to Trash — restore within 30 days");
    goGallery();
  };

  const doSubmitReview = (reviewer: string, urgency: string, note: string) => {
    patch(
      {
        lc: "pending",
        status: "In Review",
        submittedBy: STAFF_NAME,
        submittedDept: dept,
        submittedDate: "just now",
        reviewer,
        urgency,
        srNote: note,
        rejectedSub: false,
      },
      `Submitted for review to ${reviewer}`
    );
    setSubmitOpen(false);
    toast(`Sent to ${reviewer} for review`);
  };

  const reviewApprove = () => {
    const by = project.submittedBy ?? "the creator";
    patch(
      { lc: "published", status: "Active", edited: "just now" },
      `Approved and published (review by ${STAFF_NAME})`
    );
    setReviewMode(false);
    toast(`Approved & published — ${by} notified`);
    goGallery();
  };

  const doReviewAction = (mode: "reject" | "changes", note: string) => {
    const by = project.submittedBy ?? "the creator";
    if (mode === "changes") {
      patch(
        {
          lc: "draft",
          status: "Draft",
          rejectedSub: false,
          reviewFeedback: { type: "changes", by: STAFF_NAME, note, when: "just now" },
        },
        "Requested changes"
      );
      toast(`Changes requested — ${by} notified`);
    } else {
      patch(
        {
          rejectedSub: true,
          reviewFeedback: { type: "reject", by: STAFF_NAME, note, when: "just now" },
        },
        "Rejected submission"
      );
      toast(`Project rejected — ${by} notified`);
    }
    setReviewAction(null);
    setReviewMode(false);
    goGallery();
  };

  // ── Spotlight ──────────────────────────────────────────────────
  const spotCount = projects.filter((p) => p.lc === "published" && p.spotlight).length;

  const doSaveSpotlight = (sp: {
    reason: string;
    msg: string;
    end: string;
    priority: "Standard" | "High";
  }) => {
    const isNew = !project.spotlight;
    if (isNew && spotCount >= 5) {
      toast("You already have 5 projects spotlighted");
      return;
    }
    patch(
      {
        spotlight: {
          reason: sp.reason,
          msg: sp.msg,
          end: sp.end,
          priority: sp.priority,
          by: STAFF_NAME,
          cta: sp.reason === "Upcoming meeting" ? "View Meeting Info" : "Share Your Input",
        },
      },
      "Spotlighted project"
    );
    setSpotlightOpen(false);
    toast("Project spotlighted");
  };

  const removeSpotlight = () => {
    patch({ spotlight: null }, "Removed spotlight");
    setSpotlightOpen(false);
    toast("Spotlight removed");
  };

  // ── Stages (shell-owned pieces) ────────────────────────────────
  const addStage = () =>
    requestNav(() => {
      const n = Math.max(0, ...project.stages.map((s) => s.n)) + 1;
      updateProject(id, (p) => ({
        ...p,
        stages: [...p.stages, { n, title: "New Stage", dates: "—", desc: "", bullets: [], state: "Draft" }],
        log: [{ text: `Added Stage ${n}`, time: "just now", by: STAFF_NAME }, ...p.log],
      }));
      setSelStage(n);
      toast("Stage added");
    });

  const selectStage = (n: number) => {
    if (n === selStage) return;
    requestNav(() => setSelStage(n));
  };

  const guardDiscard = () => {
    editorHandleRef.current?.discard();
    const fn = navGuard?.pending;
    setNavGuard(null);
    fn?.();
  };

  const guardSave = async () => {
    setGuardSaving(true);
    await editorHandleRef.current?.save(700);
    setGuardSaving(false);
    const fn = navGuard?.pending;
    setNavGuard(null);
    fn?.();
  };

  // ── Derived header data ────────────────────────────────────────
  const needsResp =
    project.public.filter((c) => c.replies.length === 0).length +
    project.privateMsgs.filter((c) => c.replies.length === 0).length;
  const pollCount =
    project.poll.support + project.poll.oppose + project.poll.neutral > 0 ? 1 : 0;
  const headerDirty = stageDirty && tab === "details";
  const selStageTitle = project.stages.find((s) => s.n === selStage)?.title ?? "this stage";

  const lcMetaLine =
    lc === "draft" && project.prevPublishedDate
      ? `Previously published on ${project.prevPublishedDate}${project.prevPublishedBy ? ` by ${project.prevPublishedBy}` : ""}`
      : lc === "completed" && project.completedDate
        ? `Completed on ${project.completedDate}`
        : lc === "published" && project.reopenedDate
          ? `Reopened on ${project.reopenedDate}${project.reopenedBy ? ` by ${project.reopenedBy}` : ""}`
          : null;

  // ── Kebab items ────────────────────────────────────────────────
  const kebabItems: { label: string; danger?: boolean; onClick: () => void }[] = [
    { label: "View Edit History", onClick: () => setHistOpen(true) },
  ];
  if (lc === "draft") {
    kebabItems.push(
      { label: "Submit for Review", onClick: () => setSubmitOpen(true) },
      { label: "Publish", onClick: publishProject }
    );
  }
  if (lc === "pending") kebabItems.push({ label: "Recall Submission", onClick: recallSubmission });
  if (lc === "published") {
    kebabItems.push(
      {
        label: project.spotlight ? "Edit Spotlight" : "Spotlight this project",
        onClick: () => setSpotlightOpen(true),
      },
      { label: "Mark as Completed", onClick: markCompleted },
      { label: "Move to Draft", onClick: () => setMoveDraftOpen(true) }
    );
  }
  if (lc === "completed") kebabItems.push({ label: "Reopen", onClick: reopenProject });
  kebabItems.push({ label: "Duplicate Project", onClick: duplicateProject });
  if (lc !== "trash") {
    kebabItems.push({ label: "Delete", danger: true, onClick: () => setDeleteOpen(true) });
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] =
    lc === "pending"
      ? [{ key: "details", label: "Project Details", icon: <PencilIcon size={14} /> }]
      : [
          { key: "details", label: "Project Details", icon: <PencilIcon size={14} /> },
          { key: "feedback", label: "Feedback", icon: <ChatIcon size={14} /> },
          { key: "polls", label: "Poll Results", icon: <BarsIcon size={14} /> },
        ];

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 60 }}>
      {/* Back link */}
      <div style={{ padding: "16px 28px 0" }}>
        <button
          onClick={() => requestNav(goGallery)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: 13,
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Back to Projects
        </button>
      </div>

      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 56,
          zIndex: 20,
          background: "#f9fafb",
          padding: "14px 28px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Left cluster */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#111827",
                  letterSpacing: -0.3,
                  margin: 0,
                }}
              >
                {project.title}
              </h1>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: lcM.c,
                  background: lcM.bg,
                  borderRadius: 20,
                  padding: "2px 9px 2px 7px",
                }}
              >
                <LcIcon lc={lc} size={12} />
                {lcM.label}
              </span>
              {project.spotlight && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#2563EB",
                    background: "#EFF6FF",
                    borderRadius: 20,
                    padding: "2px 9px 2px 7px",
                  }}
                >
                  <StarIcon size={11} filled />
                  Spotlighted
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 12.5,
                color: "#94A3B8",
                marginTop: 5,
                flexWrap: "wrap",
              }}
            >
              <span>
                Last updated {project.edited} by {STAFF_NAME} · {project.deptShort}
              </span>
              {headerDirty && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#B45309",
                    background: "#FEF3C7",
                    borderRadius: 20,
                    padding: "2px 8px",
                  }}
                >
                  Unsaved changes
                </span>
              )}
            </div>
            {lcMetaLine && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{lcMetaLine}</div>
            )}
          </div>

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 500,
                color: "#475569",
                whiteSpace: "nowrap",
              }}
            >
              <PeopleIcon size={14} color="#94A3B8" />
              {project.followers} following
            </span>
            {/* Editing ↔ Resident Preview segmented toggle */}
            <div
              role="group"
              aria-label="View mode"
              style={{
                display: "inline-flex",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 9999,
                padding: 3,
                gap: 2,
              }}
            >
              {(
                [
                  { on: !preview, label: "Editing", onClick: exitPreview, icon: null },
                  {
                    on: preview,
                    label: "Resident Preview",
                    onClick: enterPreview,
                    icon: <EyeIcon size={13} />,
                  },
                ] as const
              ).map((seg) => (
                <button
                  key={seg.label}
                  onClick={seg.onClick}
                  aria-pressed={seg.on}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 28,
                    padding: "0 12px",
                    borderRadius: 9999,
                    border: "none",
                    fontSize: 12.5,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background: seg.on ? "#0d2240" : "transparent",
                    color: seg.on ? "#fff" : "#475569",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                >
                  {seg.icon}
                  {seg.label}
                </button>
              ))}
            </div>
            <button onClick={editHeader} style={ghostBtn(34)}>
              Edit Header
            </button>
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More actions"
                style={{ ...ghostBtn(34), width: 34, padding: 0 }}
              >
                <MoreIcon size={15} />
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 40,
                    right: 0,
                    zIndex: 40,
                    width: 220,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 16px 40px rgba(2,12,27,.16)",
                    padding: 6,
                  }}
                >
                  {kebabItems.map((item) => (
                    <button
                      key={item.label}
                      className="township-menu-item"
                      style={item.danger ? { color: "#DC2626" } : { color: "#0F172A" }}
                      onClick={() => {
                        setMenuOpen(false);
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab row */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginTop: 14 }}>
          {tabs.map((t) => {
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${on ? "#0d2240" : "transparent"}`,
                  color: on ? "#0d2240" : "#94A3B8",
                  cursor: "pointer",
                  transition: "color 0.15s ease, border-color 0.15s ease",
                }}
              >
                {t.icon}
                {t.label}
                {t.key === "feedback" && needsResp > 0 && (
                  <span
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      fontSize: 10.5,
                      fontWeight: 700,
                      borderRadius: 9,
                      padding: "1px 6px",
                    }}
                  >
                    {needsResp}
                  </span>
                )}
                {t.key === "feedback" && aiMode && project.hidden.length > 0 && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C3AED" }} />
                )}
                {t.key === "polls" && pollCount > 0 && (
                  <span
                    style={{
                      background: "#EEF2F6",
                      color: "#475569",
                      fontSize: 10.5,
                      fontWeight: 700,
                      borderRadius: 9,
                      padding: "1px 6px",
                    }}
                  >
                    {pollCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content column */}
      <div style={{ padding: "22px 28px 0", maxWidth: 960, margin: "0 auto" }}>
        {/* Review-mode banner */}
        {reviewMode && lc === "pending" && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#92400E" }}>
              <CheckCircleIcon size={16} color="#B45309" />
              You are reviewing this project for publishing approval
            </div>
            <div style={{ fontSize: 12.5, color: "#92400E", marginTop: 4 }}>
              Submitted by {project.submittedBy ?? "—"} · {project.submittedDate ?? "—"}
            </div>
            {project.srNote && (
              <div style={{ fontSize: 12.5, color: "#92400E", marginTop: 4, fontStyle: "italic" }}>
                “{project.srNote}”
              </div>
            )}
            <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => setReviewMode(false)} style={ghostBtn(36)}>
                Exit review
              </button>
              <button onClick={() => setReviewAction("reject")} style={dangerOutlineBtn(36)}>
                Reject
              </button>
              <button onClick={() => setReviewAction("changes")} style={amberOutlineBtn(36)}>
                Request Changes
              </button>
              <button
                onClick={reviewApprove}
                style={{ ...ghostBtn(36), background: "#16A34A", border: "1px solid #16A34A", color: "#fff" }}
              >
                Approve &amp; Publish
              </button>
            </div>
          </div>
        )}

        {/* Pending status card (creator view) */}
        {lc === "pending" && !reviewMode && (
          <div
            style={{
              background: "#FFFDF7",
              border: "1px solid #FDE68A",
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: project.rejectedSub ? "#B91C1C" : "#92400E" }}>
              {project.rejectedSub
                ? "This submission was not approved"
                : `This project is with ${project.reviewer ?? "a reviewer"} for review`}
            </div>
            <div style={{ fontSize: 12.5, color: "#92400E", marginTop: 4 }}>
              Submitted {project.submittedDate ?? "recently"} · Expected response within 2 business
              days
            </div>
            {project.reviewFeedback && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #FED7AA",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 12.5,
                  color: "#7C2D12",
                  marginTop: 10,
                }}
              >
                Note from {project.reviewFeedback.by}: “{project.reviewFeedback.note}”
              </div>
            )}
            <button onClick={recallSubmission} style={{ ...ghostBtn(36), marginTop: 12 }}>
              Recall to edit
            </button>
          </div>
        )}

        {/* Changes-requested banner */}
        {lc === "draft" && project.reviewFeedback && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#B91C1C" }}>
              Changes requested by {project.reviewFeedback.by}
            </div>
            <div style={{ fontSize: 13, color: "#7F1D1D", marginTop: 3 }}>
              “{project.reviewFeedback.note}”
            </div>
          </div>
        )}

        {/* Spotlight active note */}
        {project.spotlight && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 12,
              padding: "12px 15px",
              marginBottom: 16,
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
              fontSize: 12.5,
              color: "#1E40AF",
            }}
          >
            <span style={{ marginTop: 1 }}>
              <StarIcon size={14} color="#2563EB" filled />
            </span>
            <span>
              <strong>Spotlighted for residents.</strong> {project.spotlight.msg}
            </span>
          </div>
        )}

        {/* Tab bodies */}
        {tab === "details" && preview && <ResidentPreview project={project} />}
        {tab === "details" && !preview && (
          <DetailsTab
            project={project}
            editAll={editAll}
            onEnterEditAll={enterEditAll}
            onDiscardEditAll={discardEditAll}
            onSaveEditAll={saveEditAll}
            selStage={selStage}
            stageDirty={stageDirty}
            onSelectStage={selectStage}
            onAddStage={addStage}
            onStageDirtyChange={setStageDirty}
            editorHandleRef={editorHandleRef}
          />
        )}
        {tab === "feedback" && <FeedbackTab projectId={id} />}
        {tab === "polls" && <PollsTab projectId={id} />}
      </div>

      {/* ── Modals & drawers ── */}
      {submitOpen && (
        <SubmitReviewModal
          project={project}
          onClose={() => setSubmitOpen(false)}
          onSubmit={doSubmitReview}
        />
      )}

      {spotlightOpen && (
        <SpotlightModal
          project={project}
          spotCount={spotCount}
          onClose={() => setSpotlightOpen(false)}
          onSave={doSaveSpotlight}
          onRemove={removeSpotlight}
        />
      )}

      {reviewAction && (
        <ReviewActionModal
          mode={reviewAction}
          onClose={() => setReviewAction(null)}
          onSend={(note) => doReviewAction(reviewAction, note)}
        />
      )}

      {deleteOpen && (
        <DeleteConfirmModal
          project={project}
          onClose={() => setDeleteOpen(false)}
          onDelete={() => doDelete()}
        />
      )}

      {moveDraftOpen && (
        <ConfirmModal
          width={440}
          title="Move this project to Draft?"
          body="This project will no longer be visible to residents. Following residents will see a placeholder message. You can publish it again anytime after making changes."
          onClose={() => setMoveDraftOpen(false)}
          actions={
            <>
              <button onClick={() => setMoveDraftOpen(false)} style={ghostBtn(38)}>
                Cancel
              </button>
              <button onClick={moveToDraft} style={primaryBtn(38)}>
                Move to Draft
              </button>
            </>
          }
        />
      )}

      {navGuard && (
        <ConfirmModal
          width={460}
          title={`You have unsaved changes to ${selStageTitle}`}
          body="Save before leaving this stage?"
          onClose={() => setNavGuard(null)}
          actions={
            <>
              <button onClick={() => setNavGuard(null)} style={ghostBtn(38)}>
                Cancel
              </button>
              <button onClick={guardDiscard} style={dangerOutlineBtn(38)}>
                Discard and continue
              </button>
              <button onClick={guardSave} style={{ ...primaryBtn(38), minWidth: 148 }}>
                {guardSaving && <Spinner size={13} />}
                {guardSaving ? "Saving…" : "Save and continue"}
              </button>
            </>
          }
        />
      )}

      {histOpen && <EditHistoryDrawer project={project} onClose={() => setHistOpen(false)} />}
    </div>
  );
}
