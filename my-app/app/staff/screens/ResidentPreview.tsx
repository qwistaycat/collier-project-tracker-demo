"use client";

// ================================================================
//  Resident preview — a read-only, in-app rendering of how the
//  selected project looks to residents, under a purple staff
//  banner. Reuses the resident Timeline component; interactions
//  (follow, comment, vote) show a "disabled in preview" toast.
// ================================================================

import React, { useState } from "react";
import Timeline from "@/app/components/Timeline";
import { useStaff } from "../lib/StaffContext";
import { CAT_FULL, pollPct, pollTotal, projectImage } from "../lib/utils";
import { Avatar, Card, SealAvatar } from "../components/ui";
import { DonutPie } from "../components/charts";

export default function ResidentPreview() {
  const { activeProject: p, exitPreview, toast } = useStaff();
  const [feedTab, setFeedTab] = useState<"forum" | "dm">("forum");

  if (!p) {
    return (
      <main className="mx-auto max-w-[900px] px-8 py-16 text-center text-sm text-[#64748B]">
        Project not found.
      </main>
    );
  }

  const readOnly = (what: string) => toast(`${what} is disabled in preview mode`);

  const publishedStages = p.stages.filter((s) => s.state === "Published");
  const timelineStages = publishedStages.map((st) => ({
    label: st.title,
    status:
      st.n < p.current ? ("completed" as const) : st.n === p.current ? ("current" as const) : ("future" as const),
    date: st.dates,
    description: st.desc,
    bullets: st.bullets,
  }));
  const poll = p.polls.find((pl) => pl.status !== "Draft") ?? null;

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Preview banner */}
      <div className="sticky top-0 z-[50] flex items-center gap-3 bg-[#6D28D9] px-6 py-2.5 text-white">
        <span className="text-xs font-semibold">
          👁 You are previewing &ldquo;{p.title}&rdquo; as a resident. Interactions like
          Follow, comment, and poll voting are read-only in preview mode.
        </span>
        <div className="flex-1" />
        <button
          onClick={exitPreview}
          className="h-8 shrink-0 cursor-pointer rounded-full border border-white/40 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/20"
        >
          Return to Staff View
        </button>
      </div>

      {/* Resident top bar (resident navy) */}
      <div className="flex h-[56px] items-center gap-3 bg-[#0d2240] px-8">
        <span className="text-sm font-semibold text-white">Collier Connect</span>
      </div>

      {/* Spotlight banner */}
      {p.spotlight && (
        <div className="flex flex-wrap items-center gap-3 bg-[#0d3266] px-8 py-3 text-white">
          <span className="text-lg">📣</span>
          <span className="flex-1 text-xs">{p.spotlight.msg}</span>
          <button
            onClick={() => readOnly("This action")}
            className="h-8 shrink-0 cursor-pointer rounded-full border-none bg-white px-4 text-xs font-semibold text-[#0d3266]"
          >
            {p.spotlight.cta}
          </button>
        </div>
      )}

      {/* Hero */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={projectImage(p.id)} alt={p.title} className="h-[260px] w-full object-cover" />

      <div className="mx-auto max-w-[800px] px-8">
        <div className="mt-6 text-[11px] font-semibold text-[#2563eb]">{CAT_FULL[p.cat]}</div>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-gray-900">{p.title}</h1>
        <div className="mt-1 text-xs text-[#6b7280]">{p.followers} residents following</div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            onClick={() => readOnly("Follow")}
            className="cursor-pointer rounded-full border-2 border-[#2563eb] bg-white px-[22px] py-[10px] text-[13px] font-semibold text-[#2563eb]"
          >
            + Follow Project
          </button>
          <span className="text-[13px] italic text-[#6b7280]">Last updated {p.edited}</span>
        </div>

        <p className="mt-5 text-[13px] leading-[1.7] text-[#374151]">{p.desc}</p>

        {/* Meta cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {(
            [
              ["Sponsor", p.sponsor],
              ["Duration", p.duration],
              ["Total Cost", p.cost],
            ] as Array<[string, string]>
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                {label}
              </div>
              <div className="mt-1 text-[13px] font-semibold text-[#111827]">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-[#e5e7eb] bg-white p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
            Funding
          </div>
          <div className="mt-1 text-[13px] text-[#374151]">{p.funding}</div>
        </div>

        {/* Timeline */}
        {timelineStages.length > 0 && (
          <div className="mt-10">
            <Timeline stages={timelineStages} />
          </div>
        )}

        {/* Feedback */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">Feedback</h2>
          <div className="mt-3 flex gap-1.5">
            <button
              onClick={() => setFeedTab("forum")}
              className={`cursor-pointer rounded-lg border-none px-4 py-2 text-xs font-semibold ${
                feedTab === "forum" ? "bg-[#0d2240] text-white" : "bg-white text-[#64748b]"
              }`}
            >
              Community Forum
            </button>
            <button
              onClick={() => setFeedTab("dm")}
              className={`cursor-pointer rounded-lg border-none px-4 py-2 text-xs font-semibold ${
                feedTab === "dm" ? "bg-[#0d2240] text-white" : "bg-white text-[#64748b]"
              }`}
            >
              Private Message to Township
            </button>
          </div>

          {feedTab === "forum" ? (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share your thoughts…"
                  onFocus={() => readOnly("Commenting")}
                  readOnly
                  className="h-10 flex-1 rounded-lg border border-[#e5e7eb] px-3 text-[13px] outline-none"
                />
                <button
                  onClick={() => readOnly("Commenting")}
                  className="h-10 cursor-pointer rounded-lg border-none bg-[#0d2240] px-4 text-xs font-semibold text-white"
                >
                  Post
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {p.public.length === 0 ? (
                  <p className="text-sm italic text-gray-400">
                    No comments yet. Be the first to share your thoughts.
                  </p>
                ) : (
                  p.public.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center gap-2">
                        <Avatar name={c.anon ? "Anonymous" : c.name} size={32} />
                        <span className="text-[13px] font-semibold text-[#111827]">
                          {c.anon ? "Anonymous" : c.name}
                        </span>
                        {c.verified && (
                          <span className="rounded bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-bold text-[#16A34A]">
                            Verified
                          </span>
                        )}
                        <span className="text-xs text-[#6b7280]">{c.time}</span>
                      </div>
                      <div className="ml-10 mt-1.5 rounded-md border border-[#e5e7eb] px-3.5 py-2.5 text-[13px] text-[#374151]">
                        {c.text}
                      </div>
                      {c.replies.map((r, ri) => (
                        <div
                          key={ri}
                          className="ml-16 mt-2 rounded-md border border-[#DBEAFE] bg-[#F0F7FF] px-3.5 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <SealAvatar size={22} />
                            <span className="text-xs font-semibold text-[#111827]">
                              {r.attr === "official" || !r.name ? "Township Staff" : r.name}
                            </span>
                            <span className="rounded bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold text-[#1D4ED8]">
                              Official
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">{r.time}</span>
                          </div>
                          <p className="mt-1 text-[13px] text-[#374151]">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-xs text-[#64748B]">
                Send a private message to the township about this project. Only staff will see
                it.
              </p>
              <textarea
                placeholder="Write your message…"
                readOnly
                onFocus={() => readOnly("Sending")}
                className="mt-2 min-h-[90px] w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] outline-none"
              />
              <button
                onClick={() => readOnly("Sending")}
                className="mt-2 h-10 cursor-pointer rounded-lg border-none bg-[#0d2240] px-5 text-xs font-semibold text-white"
              >
                Send message
              </button>
            </div>
          )}
        </div>

        {/* Community poll */}
        {poll && (
          <Card className="mt-10 p-5">
            <h3 className="text-base font-bold text-[#111827]">{poll.question}</h3>
            {poll.desc && <p className="mt-1 text-xs text-[#64748B]">{poll.desc}</p>}
            <div className="mt-1 text-[11px] text-[#94A3B8]">
              {pollTotal(poll.poll)} residents voted
            </div>
            <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-[140px_1fr]">
              <DonutPie
                size={130}
                centerLabel={String(pollTotal(poll.poll))}
                data={[
                  { value: poll.poll.support, color: "#16A34A" },
                  { value: poll.poll.oppose, color: "#DC2626" },
                  { value: poll.poll.neutral, color: "#94A3B8" },
                ]}
              />
              <div className="flex flex-col gap-2">
                {(
                  [
                    [poll.optSupport, poll.poll.support, "#DCFCE7", "#16A34A"],
                    [poll.optOppose, poll.poll.oppose, "#FEE2E2", "#DC2626"],
                    [poll.optNeutral, poll.poll.neutral, "#F1F5F9", "#475569"],
                  ] as Array<[string, number, string, string]>
                ).map(([label, v, bg, color]) => (
                  <button
                    key={label}
                    onClick={() => readOnly("Voting")}
                    style={{ backgroundColor: bg, color }}
                    className="flex cursor-pointer items-center justify-between rounded-full border-none px-4 py-2.5 text-xs font-semibold"
                  >
                    {label}
                    <span>
                      {v} · {pollPct(v, pollTotal(poll.poll))}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
