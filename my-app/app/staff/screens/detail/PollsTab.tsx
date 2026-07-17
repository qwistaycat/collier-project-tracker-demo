"use client";

// ================================================================
//  Poll Results tab — the project's single resident poll: donut
//  chart, verified/unverified split, vote trend, close/reopen,
//  and the create/edit poll modal.
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../../lib/StaffContext";
import type { PollRec, Project } from "../../lib/types";
import { pollPct, pollTotal } from "../../lib/utils";
import { Card, EmptyState, Modal } from "../../components/ui";
import { DonutPie, TrendLine } from "../../components/charts";

export default function PollsTab() {
  const { activeProject, updateProject, addLog, toast, setProjTab, setFeedbackSub } = useStaff();
  const p = activeProject as Project;
  const [formOpen, setFormOpen] = useState<{ edit: boolean } | null>(null);

  const poll = p.polls[0] ?? null;

  const setStatus = (status: "Active" | "Closed") => {
    if (!poll) return;
    updateProject(p.id, (proj) => ({
      ...proj,
      polls: proj.polls.map((pl) => (pl.id === poll.id ? { ...pl, status } : pl)),
    }));
    addLog(p.id, status === "Closed" ? "Closed the poll" : "Reopened the poll");
    toast(status === "Closed" ? "Poll closed" : "Poll reopened");
  };

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Poll Results
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Each project has a single resident poll. Results are visible to residents
            alongside the poll.
          </p>
        </div>
        {!poll && (
          <button
            onClick={() => setFormOpen({ edit: false })}
            className="h-9 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-4 text-xs font-semibold text-white hover:bg-[#152a45]"
          >
            + Create Poll
          </button>
        )}
      </div>

      {poll ? (
        <PollCard
          poll={poll}
          onEdit={() => setFormOpen({ edit: true })}
          onStatus={setStatus}
          onExport={() => toast("Exporting results as CSV…")}
        />
      ) : (
        <EmptyState
          title="This project has no poll yet"
          body="Create one poll for this project to give residents a quick way to signal support or concerns."
          action={
            <button
              onClick={() => setFormOpen({ edit: false })}
              className="h-9 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-4 text-xs font-semibold text-white"
            >
              + Create Poll for This Project
            </button>
          }
        />
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4 text-xs leading-relaxed text-[#9A3412]">
        Poll results reflect the residents who chose to participate, not the full township.
        Read the comments alongside these numbers to understand the reasoning behind them.{" "}
        <button
          onClick={() => {
            setFeedbackSub("public");
            setProjTab("feedback");
          }}
          className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#C2410C] underline"
        >
          View comments on this project →
        </button>
      </div>

      {formOpen && (
        <PollFormModal
          existing={formOpen.edit ? poll : null}
          projectTitle={p.title}
          onClose={() => setFormOpen(null)}
          onSave={(rec) => {
            updateProject(p.id, (proj) => ({
              ...proj,
              polls: formOpen.edit && poll
                ? proj.polls.map((pl) => (pl.id === poll.id ? { ...pl, ...rec } : pl))
                : [
                    {
                      id: `p${Date.now()}`,
                      opened: "Opened just now",
                      poll: { support: 0, oppose: 0, neutral: 0, verified: { s: 0, o: 0, n: 0 }, trend: [] },
                      ...rec,
                    } as PollRec,
                  ],
            }));
            addLog(p.id, formOpen.edit ? "Edited the poll" : "Created a poll");
            toast(formOpen.edit ? "Poll updated" : "Poll created");
            setFormOpen(null);
          }}
        />
      )}
    </div>
  );
}

function PollCard({
  poll,
  onEdit,
  onStatus,
  onExport,
}: {
  poll: PollRec;
  onEdit: () => void;
  onStatus: (s: "Active" | "Closed") => void;
  onExport: () => void;
}) {
  const counts = poll.poll;
  const total = pollTotal(counts);
  const uv = {
    s: counts.support - counts.verified.s,
    o: counts.oppose - counts.verified.o,
    n: counts.neutral - counts.verified.n,
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-bold text-[#111827]">{poll.question}</h4>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
            poll.status === "Active"
              ? "bg-[#DCFCE7] text-[#16A34A]"
              : poll.status === "Closed"
              ? "bg-slate-100 text-slate-600"
              : "bg-[#F1F5F9] text-[#475569]"
          }`}
        >
          {poll.status}
        </span>
      </div>
      {poll.desc && <p className="mt-1 text-xs text-[#64748B]">{poll.desc}</p>}
      <div className="mt-1 text-[11px] text-[#94A3B8]">
        {poll.opened} · Closes {poll.end} · {total} votes
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-6 md:grid-cols-[160px_1fr]">
        <DonutPie
          size={150}
          centerLabel={`${total}`}
          data={[
            { value: counts.support, color: "#16A34A" },
            { value: counts.oppose, color: "#DC2626" },
            { value: counts.neutral, color: "#94A3B8" },
          ]}
        />
        <div className="flex flex-col gap-3">
          {(
            [
              [poll.optSupport, counts.support, counts.verified.s, uv.s, "#16A34A"],
              [poll.optOppose, counts.oppose, counts.verified.o, uv.o, "#DC2626"],
              [poll.optNeutral, counts.neutral, counts.verified.n, uv.n, "#94A3B8"],
            ] as Array<[string, number, number, number, string]>
          ).map(([label, v, ver, unver, color]) => (
            <div key={label} className="flex items-center gap-3">
              <span style={{ backgroundColor: color }} className="h-3 w-3 shrink-0 rounded-full" />
              <span className="w-40 text-xs font-semibold text-[#111827]">{label}</span>
              <span className="text-sm font-bold" style={{ color }}>
                {v}
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                · {pollPct(v, total)}% · {ver} verified / {Math.max(unver, 0)} unverified
              </span>
            </div>
          ))}
        </div>
      </div>

      {counts.trend.length > 1 && (
        <div className="mt-5 border-t border-[#F1F5F9] pt-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Vote trend over time
          </div>
          <TrendLine points={counts.trend} color="#1E3A5F" width={420} height={72} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-4">
        <button
          onClick={onEdit}
          className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
        >
          Edit Poll
        </button>
        {poll.status === "Active" ? (
          <button
            onClick={() => onStatus("Closed")}
            className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
          >
            Close Poll
          </button>
        ) : (
          <button
            onClick={() => onStatus("Active")}
            className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
          >
            Reopen Poll
          </button>
        )}
        <button
          onClick={onExport}
          className="h-8 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-slate-50"
        >
          Export Results
        </button>
      </div>
    </Card>
  );
}

function PollFormModal({
  existing,
  projectTitle,
  onClose,
  onSave,
}: {
  existing: PollRec | null;
  projectTitle: string;
  onClose: () => void;
  onSave: (rec: Pick<PollRec, "question" | "desc" | "end" | "status" | "optSupport" | "optOppose" | "optNeutral">) => void;
}) {
  const [question, setQuestion] = useState(existing?.question ?? `Do you support the ${projectTitle}?`);
  const [desc, setDesc] = useState(existing?.desc ?? "");
  const [end, setEnd] = useState(existing?.end ?? "30 days from creation");
  const [publish, setPublish] = useState(existing ? existing.status !== "Draft" : true);
  const [optSupport, setOptSupport] = useState(existing?.optSupport ?? "I support");
  const [optOppose, setOptOppose] = useState(existing?.optOppose ?? "I do not support");
  const [optNeutral, setOptNeutral] = useState(existing?.optNeutral ?? "Neutral / Unsure");

  return (
    <Modal onClose={onClose} width={520}>
      <h3 className="mb-1 text-base font-bold text-[#111827]">
        {existing ? "Edit Poll" : "Create Poll"}
      </h3>
      <p className="mb-4 text-xs text-[#64748B]">
        One poll per project. Residents choose from three fixed options — you can rename them.
      </p>

      <div className="mb-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Poll question
        </div>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Do you support this proposal?"
          className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-semibold outline-none"
        />
      </div>
      <div className="mb-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Description (optional)
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="min-h-[48px] w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs outline-none"
        />
      </div>

      <div className="mb-3 flex flex-col gap-2">
        {(
          [
            ["#16A34A", optSupport, setOptSupport],
            ["#DC2626", optOppose, setOptOppose],
            ["#94A3B8", optNeutral, setOptNeutral],
          ] as Array<[string, string, (v: string) => void]>
        ).map(([color, value, set], i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span style={{ backgroundColor: color }} className="h-3 w-3 shrink-0 rounded-full" />
            <input
              type="text"
              value={value}
              onChange={(e) => set(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
            />
          </div>
        ))}
        <p className="text-[10px] text-[#94A3B8]">
          You can rename these, but not add or remove options.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 items-end gap-3">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            End date
          </div>
          <input
            type="text"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-1 text-xs text-[#475569]">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
          />
          {publish ? "Published — residents can vote" : "Draft — staff only"}
        </label>
      </div>

      <div className="flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-9 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-semibold text-[#475569]"
        >
          Cancel
        </button>
        <button
          disabled={!question.trim()}
          onClick={() =>
            onSave({
              question: question.trim(),
              desc: desc.trim() || undefined,
              end,
              status: publish ? "Active" : "Draft",
              optSupport,
              optOppose,
              optNeutral,
            })
          }
          className={`h-9 rounded-lg border-none px-4 text-xs font-semibold text-white ${
            question.trim() ? "cursor-pointer bg-[#1E3A5F] hover:bg-[#152a45]" : "cursor-not-allowed bg-slate-300"
          }`}
        >
          {existing ? "Save Poll" : "Create Poll"}
        </button>
      </div>
    </Modal>
  );
}
