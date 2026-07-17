"use client";

// ================================================================
//  Feedback — township-wide comment stream across all projects.
//  Tabs: All Comments / Awaiting Response / (AI) Awaiting
//  Moderation, with AI sentiment filters. Each row jumps into the
//  owning project's feedback tab.
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../lib/StaffContext";
import type { Comment, Project } from "../lib/types";
import { agoHours, sentMeta } from "../lib/utils";
import { Avatar, Card, EmptyState, SentChip } from "../components/ui";

type FeedTab = "all" | "response" | "moderation";

interface FeedRow {
  c: Comment;
  p: Project;
  kind: "public" | "private" | "hidden";
}

export default function FeedbackCenter() {
  const { projects, aiMode, openProj } = useStaff();
  const [tab, setTab] = useState<FeedTab>("all");
  const [sentFilter, setSentFilter] = useState("All");

  const rows: FeedRow[] = [];
  projects
    .filter((p) => p.lc !== "trash")
    .forEach((p) => {
      p.public.forEach((c) => rows.push({ c, p, kind: "public" }));
      p.privateMsgs.forEach((c) => rows.push({ c, p, kind: "private" }));
      if (aiMode) p.hidden.forEach((c) => rows.push({ c, p, kind: "hidden" }));
    });

  const filtered = rows
    .filter((r) => {
      if (tab === "response") return r.kind !== "hidden" && !r.c.replies.length;
      if (tab === "moderation") return r.kind === "hidden";
      return true;
    })
    .filter((r) => !aiMode || sentFilter === "All" || sentMeta(r.c.sent).label === sentFilter)
    .sort((a, b) => agoHours(a.c.time) - agoHours(b.c.time))
    .slice(0, 24);

  const tabs: Array<{ key: FeedTab; label: string }> = [
    { key: "all", label: "All Comments" },
    { key: "response", label: "Awaiting Response" },
    ...(aiMode ? [{ key: "moderation" as FeedTab, label: "Awaiting Moderation" }] : []),
  ];

  return (
    <main className="mx-auto w-full max-w-[1000px] px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827]">Feedback</h1>
      <p className="mb-6 mt-0.5 text-xs text-[#64748B]">
        Monitor and respond to public comments and private messages township-wide.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`h-8 cursor-pointer rounded-full border px-3.5 text-xs font-semibold transition-colors ${
              tab === t.key
                ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
        {aiMode && (
          <>
            <span className="ml-3 text-[11px] font-semibold text-[#94A3B8]">Sentiment:</span>
            {["All", "Supportive", "Mixed", "Concerns"].map((s) => (
              <button
                key={s}
                onClick={() => setSentFilter(s)}
                className={`h-7 cursor-pointer rounded-full border px-2.5 text-[11px] font-semibold ${
                  sentFilter === s
                    ? "border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]"
                    : "border-[#E2E8F0] bg-white text-[#475569]"
                }`}
              >
                {s}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="mb-3 text-xs text-[#64748B]">
        {filtered.length} comment{filtered.length === 1 ? "" : "s"}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No comments match the current filters." />
      ) : (
        <Card>
          {filtered.map((r, i) => (
            <div
              key={`${r.p.id}-${r.kind}-${r.c.id}`}
              className={`flex items-start gap-3 p-4 ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}
            >
              <Avatar name={r.c.anon ? "Anonymous" : r.c.name} size={30} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#1E3A5F]">
                    {r.c.anon ? "Anonymous" : r.c.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      r.c.verified
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {r.c.verified ? "Verified" : "Unverified"}
                  </span>
                  {r.kind === "private" && (
                    <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[9px] font-bold text-[#2563EB]">
                      Private message
                    </span>
                  )}
                  {r.kind === "hidden" && (
                    <span className="rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[9px] font-bold text-[#7C3AED]">
                      Awaiting moderation
                    </span>
                  )}
                  {aiMode && <SentChip sent={r.c.sent} />}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#374151]">{r.c.text}</p>
                <div className="mt-1.5 text-[11px] text-[#94A3B8]">
                  <button
                    onClick={() =>
                      openProj(r.p.id, {
                        tab: "feedback",
                        feedbackSub:
                          r.kind === "hidden"
                            ? "moderation"
                            : r.kind === "private"
                            ? "private"
                            : "public",
                      })
                    }
                    className="cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold text-[#2563EB] hover:underline"
                  >
                    {r.p.title}
                  </button>{" "}
                  · {r.c.time}
                </div>
              </div>
              <button
                onClick={() =>
                  openProj(r.p.id, {
                    tab: "feedback",
                    feedbackSub:
                      r.kind === "hidden"
                        ? "moderation"
                        : r.kind === "private"
                        ? "private"
                        : "public",
                  })
                }
                className="h-8 shrink-0 cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 text-[11px] font-semibold text-[#1E3A5F] hover:bg-slate-50"
              >
                {r.kind === "hidden" ? "Review" : "Reply"}
              </button>
            </div>
          ))}
        </Card>
      )}
    </main>
  );
}
