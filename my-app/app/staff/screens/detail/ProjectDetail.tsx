"use client";

// ================================================================
//  Project detail — staff management view for a single project.
//  Header (lifecycle pill, spotlight, actions + kebab menu),
//  contextual banners (review mode, pending-review status, change
//  requests, spotlight note), and the three tabs: Project Details,
//  Feedback, and Poll Results.
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../../lib/StaffContext";
import type { Spotlight } from "../../lib/types";
import {
  CAT,
  CAT_FULL,
  REVIEWERS,
  SPOTLIGHT_PRIORITIES,
  SPOTLIGHT_REASONS,
  STAFF_NAME,
  URGENCIES,
  projectImage,
} from "../../lib/utils";
import { ConfirmModal, LcPill, Modal } from "../../components/ui";
import DetailsTab from "./DetailsTab";
import FeedbackTab from "./FeedbackTab";
import PollsTab from "./PollsTab";

export default function ProjectDetail() {
  const {
    activeProject: p,
    nav,
    projTab,
    setProjTab,
    reviewMode,
    setReviewMode,
    aiMode,
    openPreview,
    publishProject,
    moveToDraft,
    markCompleted,
    reopenProject,
    recallSubmission,
    deleteToTrash,
    duplicateProject,
    submitForReview,
    reviewApprove,
    reviewSendBack,
    saveSpotlight,
    removeSpotlight,
  } = useStaff();

  const [kebabOpen, setKebabOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [histFilter, setHistFilter] = useState("All");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [srReviewer, setSrReviewer] = useState("");
  const [srUrgency, setSrUrgency] = useState("Standard");
  const [srNote, setSrNote] = useState("");
  const [spotlightModal, setSpotlightModal] = useState(false);
  const [spReason, setSpReason] = useState(SPOTLIGHT_REASONS[0]);
  const [spMsg, setSpMsg] = useState("");
  const [spEnd, setSpEnd] = useState("");
  const [spPriority, setSpPriority] = useState<"Standard" | "High">("Standard");
  const [spNotify, setSpNotify] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notifyOnDelete, setNotifyOnDelete] = useState(true);
  const [moveDraftOpen, setMoveDraftOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"changes" | "reject" | null>(null);
  const [reviewActionNote, setReviewActionNote] = useState("");
  const [stageDirty, setStageDirty] = useState(false);

  if (!p) {
    return (
      <main className="mx-auto max-w-[900px] px-8 py-16 text-center text-sm text-[#64748B]">
        Project not found.{" "}
        <button
          onClick={() => nav("projects")}
          className="cursor-pointer border-none bg-transparent font-semibold text-[#2563EB]"
        >
          Back to Projects
        </button>
      </main>
    );
  }

  // Reviewer sees only the Details tab while a project awaits review
  const tabsLocked = p.lc === "pending";
  const awaiting =
    p.public.filter((c) => !c.replies.length).length +
    p.privateMsgs.filter((c) => !c.replies.length).length;
  const modCount = p.hidden.length;

  const openSpotlightModal = () => {
    setSpReason(p.spotlight?.reason ?? SPOTLIGHT_REASONS[0]);
    setSpMsg(p.spotlight?.msg ?? "");
    setSpEnd(p.spotlight?.end ?? "");
    setSpPriority(p.spotlight?.priority ?? "Standard");
    setSpotlightModal(true);
    setKebabOpen(false);
  };

  const kebabActions: Array<{ label: string; danger?: boolean; onClick: () => void }> = [
    { label: "Preview as Resident", onClick: () => { setKebabOpen(false); openPreview(p.id); } },
    { label: "View Edit History", onClick: () => { setKebabOpen(false); setHistOpen(true); } },
  ];
  if (p.lc === "draft") {
    kebabActions.push(
      { label: "Submit for Review", onClick: () => { setKebabOpen(false); setSrReviewer(recReviewer(p.cat)); setSubmitOpen(true); } },
      { label: "Publish", onClick: () => { setKebabOpen(false); publishProject(p.id); } }
    );
  }
  if (p.lc === "pending") {
    kebabActions.push({ label: "Recall Submission", onClick: () => { setKebabOpen(false); recallSubmission(p.id); } });
  }
  if (p.lc === "published") {
    kebabActions.push(
      { label: p.spotlight ? "Edit Spotlight" : "Spotlight this project", onClick: openSpotlightModal },
      { label: "Mark as Completed", onClick: () => { setKebabOpen(false); markCompleted(p.id); } },
      { label: "Move to Draft", onClick: () => { setKebabOpen(false); setMoveDraftOpen(true); } }
    );
  }
  if (p.lc === "completed") {
    kebabActions.push({ label: "Reopen", onClick: () => { setKebabOpen(false); reopenProject(p.id); } });
  }
  kebabActions.push(
    { label: "Duplicate Project", onClick: () => { setKebabOpen(false); duplicateProject(p.id); } },
    { label: "Delete", danger: true, onClick: () => { setKebabOpen(false); setDeleteOpen(true); } }
  );

  const history = [
    ...p.log,
    { who: STAFF_NAME, when: p.edited, what: `Updated Stage ${p.current} description and dates` },
    { who: STAFF_NAME, when: "1 week ago", what: "Published project to residents" },
    { who: "George Macino", when: "2 weeks ago", what: "Approved compliance checklist" },
    { who: STAFF_NAME, when: "3 weeks ago", what: "Created project" },
  ];

  return (
    <div className="pb-16">
      {/* Hero band */}
      <div className="relative h-[110px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={projectImage(p.id)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2240]/60 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-8">
        {/* Back link */}
        <button
          onClick={() => nav("projects")}
          className="mb-2 mt-4 cursor-pointer border-none bg-transparent text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F]"
        >
          ← Back to Projects
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold leading-tight text-gray-900">{p.title}</h1>
              <LcPill lc={p.lc} />
              {p.spotlight && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  ★ Spotlighted
                </span>
              )}
              {stageDirty && (
                <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#B45309]">
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="mt-1.5 text-xs text-[#64748B]">
              <span style={{ color: CAT[p.cat].color }} className="font-semibold">
                {CAT_FULL[p.cat]}
              </span>{" "}
              · Last updated {p.edited} by {STAFF_NAME} · {p.deptShort}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
              <PeopleGlyph /> {p.followers} following
            </span>
            <button
              onClick={() => openPreview(p.id)}
              className="h-9 cursor-pointer rounded-full border border-[#e5e7eb] bg-white px-4 text-xs font-semibold text-[#475569] hover:bg-slate-50"
            >
              Preview as Resident
            </button>
            <div className="relative">
              <button
                onClick={() => setKebabOpen((v) => !v)}
                className="h-9 w-9 cursor-pointer rounded-full border border-[#e5e7eb] bg-white text-sm font-bold text-[#475569] hover:bg-slate-50"
              >
                ⋯
              </button>
              {kebabOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-2xl">
                  {kebabActions.map((a) => (
                    <button
                      key={a.label}
                      onClick={a.onClick}
                      className={`block w-full cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-2 text-left text-xs ${
                        a.danger
                          ? "mt-1 border-t border-slate-100 font-semibold text-[#DC2626] hover:bg-red-50"
                          : "text-[#475569] hover:bg-slate-50"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Contextual banners ── */}
        {reviewMode && p.lc === "pending" && (
          <div className="mt-5 rounded-xl border border-[#F59E0B] bg-[#FFFBEB] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#92400E]">
                  You are reviewing this project for publishing approval
                </div>
                <div className="mt-0.5 text-[11px] text-[#B45309]">
                  Submitted by {p.submittedBy} · {p.submittedDate}
                  {p.srNote ? ` — "${p.srNote}"` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setReviewMode(false)}
                  className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
                >
                  Exit review
                </button>
                <button
                  onClick={() => { setReviewAction("reject"); setReviewActionNote(""); }}
                  className="h-8 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => { setReviewAction("changes"); setReviewActionNote(""); }}
                  className="h-8 cursor-pointer rounded-lg border border-[#FDE68A] bg-[#FEF3C7] px-3 text-xs font-semibold text-[#B45309]"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => reviewApprove(p.id)}
                  className="h-8 cursor-pointer rounded-lg border-none bg-[#16A34A] px-3 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Approve &amp; Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {!reviewMode && p.lc === "pending" && (
          <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-4">
            <div className="text-xs font-bold text-[#111827]">
              {p.rejectedSub
                ? "This submission was not approved"
                : `This project is with ${p.reviewer} for review`}
            </div>
            <div className="mt-0.5 text-[11px] text-[#64748B]">
              Submitted {p.submittedDate} · Expected response within 2 business days
            </div>
            {p.reviewFeedback && (
              <div className="mt-2 rounded-lg border border-[#FDE68A] bg-[#FFFDF7] p-2.5 text-[11px] text-[#92400E]">
                Note from {p.reviewFeedback.by}: &ldquo;{p.reviewFeedback.note}&rdquo;
              </div>
            )}
            <button
              onClick={() => recallSubmission(p.id)}
              className="mt-3 h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
            >
              Recall to edit
            </button>
          </div>
        )}

        {p.lc === "draft" && p.reviewFeedback?.type === "changes" && (
          <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <div className="text-xs font-bold text-[#DC2626]">
              Changes requested by {p.reviewFeedback.by}
            </div>
            <div className="mt-1 text-[11px] italic text-[#7F1D1D]">
              &ldquo;{p.reviewFeedback.note}&rdquo;
            </div>
          </div>
        )}

        {p.spotlight && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
            <div className="text-xs text-[#1D4ED8]">
              <strong>Spotlighted for residents.</strong> {p.spotlight.msg}
            </div>
            <div className="flex gap-2">
              <button
                onClick={openSpotlightModal}
                className="h-8 cursor-pointer rounded-lg border border-[#BFDBFE] bg-white px-3 text-xs font-semibold text-[#2563EB]"
              >
                Edit spotlight
              </button>
              <button
                onClick={() => removeSpotlight(p.id)}
                className="h-8 cursor-pointer rounded-lg border-none bg-transparent px-2 text-xs font-semibold text-[#64748B] hover:text-[#DC2626]"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* ── Tab bar ── */}
        <div className="mt-6 flex gap-1.5 border-b border-[#E2E8F0]">
          <TabButton
            label="Project Details"
            active={projTab === "details"}
            onClick={() => setProjTab("details")}
          />
          {!tabsLocked && (
            <>
              <TabButton
                label="Feedback"
                active={projTab === "feedback"}
                onClick={() => setProjTab("feedback")}
                badge={awaiting > 0 ? String(awaiting) : undefined}
                dot={aiMode && modCount > 0}
              />
              <TabButton
                label="Poll Results"
                active={projTab === "polls"}
                onClick={() => setProjTab("polls")}
                grayBadge={p.polls.length ? String(p.polls.length) : undefined}
              />
            </>
          )}
        </div>

        {/* ── Tab content ── */}
        {projTab === "details" && <DetailsTab onDirtyChange={setStageDirty} />}
        {projTab === "feedback" && !tabsLocked && <FeedbackTab />}
        {projTab === "polls" && !tabsLocked && <PollsTab />}
      </div>

      {/* ── Edit history drawer ── */}
      {histOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setHistOpen(false)}>
          <div className="absolute inset-0 bg-[#0F172A]/40" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 right-0 top-0 w-[380px] overflow-y-auto border-l border-[#E2E8F0] bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111827]">Edit History</h3>
              <button
                onClick={() => setHistOpen(false)}
                className="cursor-pointer border-none bg-transparent text-sm font-bold text-[#94A3B8] hover:text-[#475569]"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {["All", "Project Details", "Feedback", "Polls"].map((f) => (
                <button
                  key={f}
                  onClick={() => setHistFilter(f)}
                  className={`h-7 cursor-pointer rounded-full border px-2.5 text-[11px] font-semibold ${
                    histFilter === f
                      ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                      : "border-[#E2E8F0] bg-white text-[#475569]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-col">
              {history.map((h, i) => (
                <div key={i} className="border-l-2 border-[#E2E8F0] py-2.5 pl-4">
                  <div className="text-xs font-semibold text-[#111827]">{h.what}</div>
                  <div className="mt-0.5 text-[11px] text-[#94A3B8]">
                    {h.who} · {h.when}
                  </div>
                  <button className="mt-1 cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold text-[#2563EB] hover:underline">
                    Revert to this version
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Submit for Review modal ── */}
      {submitOpen && (
        <Modal onClose={() => setSubmitOpen(false)} width={480}>
          <h3 className="mb-1 text-base font-bold text-[#111827]">Submit for Review</h3>
          <p className="mb-4 text-xs text-[#64748B]">
            Choose who should review this project before publishing.
          </p>
          <div className="mb-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Reviewer
            </div>
            <div className="flex gap-2">
              {REVIEWERS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSrReviewer(r)}
                  className={`h-9 flex-1 cursor-pointer rounded-lg border px-3 text-xs font-semibold ${
                    srReviewer === r
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E3A5F]"
                      : "border-[#E2E8F0] bg-white text-[#475569]"
                  }`}
                >
                  {r}
                  {r === recReviewer(p.cat) && (
                    <span className="ml-1 text-[9px] font-bold text-[#2563EB]">· Suggested</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Urgency
            </div>
            <div className="flex gap-2">
              {URGENCIES.map((u) => (
                <button
                  key={u}
                  onClick={() => setSrUrgency(u)}
                  className={`h-9 flex-1 cursor-pointer rounded-lg border px-3 text-xs font-semibold ${
                    srUrgency === u
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E3A5F]"
                      : "border-[#E2E8F0] bg-white text-[#475569]"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Notes for the reviewer (optional)
            </div>
            <textarea
              value={srNote}
              onChange={(e) => setSrNote(e.target.value)}
              className="min-h-[64px] w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setSubmitOpen(false)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                submitForReview(p.id, srReviewer || REVIEWERS[0], srUrgency, srNote);
                setSubmitOpen(false);
              }}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-4 text-xs font-semibold text-white hover:bg-[#152a45]"
            >
              Submit for Review
            </button>
          </div>
        </Modal>
      )}

      {/* ── Spotlight modal ── */}
      {spotlightModal && (
        <Modal onClose={() => setSpotlightModal(false)} width={520}>
          <h3 className="mb-1 text-base font-bold text-[#111827]">
            ★ {p.spotlight ? "Edit Spotlight" : "Spotlight this project"}
          </h3>
          <p className="mb-4 text-xs text-[#64748B]">
            Boost this project on the resident home with a call to action.
          </p>
          <div className="mb-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Reason
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SPOTLIGHT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSpReason(r)}
                  className={`h-9 cursor-pointer rounded-lg border px-3 text-left text-xs font-semibold ${
                    spReason === r
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E3A5F]"
                      : "border-[#E2E8F0] bg-white text-[#475569]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Message shown to residents (optional)
            </div>
            <textarea
              value={spMsg}
              onChange={(e) => setSpMsg(e.target.value)}
              placeholder="e.g. Public hearing on July 22. Your voice matters."
              className="min-h-[56px] w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs outline-none"
            />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                End date
              </div>
              <input
                type="text"
                value={spEnd}
                onChange={(e) => setSpEnd(e.target.value)}
                placeholder="e.g. Aug 1, 2026"
                className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
              />
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Priority
              </div>
              <div className="flex gap-2">
                {SPOTLIGHT_PRIORITIES.map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setSpPriority(pr)}
                    className={`h-9 flex-1 cursor-pointer rounded-lg border px-2 text-xs font-semibold ${
                      spPriority === pr
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E3A5F]"
                        : "border-[#E2E8F0] bg-white text-[#475569]"
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-xs text-[#475569]">
            <input
              type="checkbox"
              checked={spNotify}
              onChange={(e) => setSpNotify(e.target.checked)}
            />
            Notify following residents (push + email)
          </label>
          <div className="flex items-center justify-between">
            {p.spotlight ? (
              <button
                onClick={() => {
                  removeSpotlight(p.id);
                  setSpotlightModal(false);
                }}
                className="h-9 cursor-pointer rounded-lg border border-[#FECACA] bg-white px-3 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
              >
                Remove spotlight
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2.5">
              <button
                onClick={() => setSpotlightModal(false)}
                className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const sp: Spotlight = {
                    reason: spReason,
                    msg: spMsg || "Key milestones updated. Read the latest progress report.",
                    end: spEnd || "Aug 15, 2026",
                    priority: spPriority,
                    by: STAFF_NAME,
                    cta: spReason === "Upcoming meeting" ? "View Meeting Info" : "Share Your Input",
                  };
                  if (saveSpotlight(p.id, sp)) setSpotlightModal(false);
                }}
                className="h-9 cursor-pointer rounded-lg border-none bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-blue-700"
              >
                {p.spotlight ? "Save changes" : "Spotlight this project"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm ── */}
      {deleteOpen && (
        <ConfirmModal
          title={`Delete "${p.title}"?`}
          body={
            p.lc === "published"
              ? `This project is live and has ${p.followers} following residents. It will move to Trash and disappear from the resident portal. You can restore it within 30 days.`
              : "The project will move to Trash. You can restore it within 30 days."
          }
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => {
            setDeleteOpen(false);
            deleteToTrash(p.id);
          }}
        >
          {p.lc === "published" && (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#475569]">
              <input
                type="checkbox"
                checked={notifyOnDelete}
                onChange={(e) => setNotifyOnDelete(e.target.checked)}
              />
              Notify following residents that this project was removed
            </label>
          )}
        </ConfirmModal>
      )}

      {/* ── Move to Draft confirm ── */}
      {moveDraftOpen && (
        <ConfirmModal
          title="Move this project to Draft?"
          body="It will no longer be visible to residents. Following residents will see a placeholder message until it is republished."
          confirmLabel="Move to Draft"
          onCancel={() => setMoveDraftOpen(false)}
          onConfirm={() => {
            setMoveDraftOpen(false);
            moveToDraft(p.id);
          }}
        />
      )}

      {/* ── Review action modal (reject / request changes) ── */}
      {reviewAction && (
        <Modal onClose={() => setReviewAction(null)} width={460}>
          <h3 className="mb-1 text-base font-bold text-[#111827]">
            {reviewAction === "reject" ? "Reject this project" : "Request changes"}
          </h3>
          <p className="mb-3 text-xs text-[#64748B]">
            The creator will be notified and can see your notes at the top of the project.
          </p>
          <textarea
            value={reviewActionNote}
            onChange={(e) => setReviewActionNote(e.target.value)}
            placeholder="Notes for the creator (required)…"
            className="min-h-[80px] w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs outline-none"
          />
          <div className="mt-4 flex justify-end gap-2.5">
            <button
              onClick={() => setReviewAction(null)}
              className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
            >
              Cancel
            </button>
            <button
              disabled={!reviewActionNote.trim()}
              onClick={() => {
                reviewSendBack(p.id, reviewAction, reviewActionNote.trim());
                setReviewAction(null);
              }}
              className={`h-9 rounded-lg border-none px-4 text-xs font-semibold text-white ${
                reviewActionNote.trim()
                  ? "cursor-pointer bg-[#B45309] hover:bg-[#92400E]"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              Send to creator
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function recReviewer(cat: string): string {
  return cat === "Plan/Dev" || cat === "Infrastructure" ? "George Macino" : "Amy Medway";
}

function TabButton({
  label,
  active,
  onClick,
  badge,
  grayBadge,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
  grayBadge?: string;
  dot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px flex cursor-pointer items-center gap-1.5 border-x-0 border-b-2 border-t-0 bg-transparent px-4 py-2.5 text-xs font-semibold transition-colors ${
        active
          ? "border-b-[#1E3A5F] text-[#1E3A5F]"
          : "border-b-transparent text-[#64748B] hover:text-[#1E3A5F]"
      }`}
    >
      {label}
      {badge && (
        <span className="rounded-full bg-[#ef4444] px-1.5 py-0.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
      {grayBadge && (
        <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
          {grayBadge}
        </span>
      )}
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />}
    </button>
  );
}

function PeopleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
