"use client";

// ================================================================
//  Projects gallery — the staff home. Category + status filter
//  chips, "Spotlighted only" toggle, the Manager's Office pending-
//  review queue, and project cards grouped by functional category
//  (mirroring the resident dashboard sections). The Navbar search
//  keyword filters this gallery live.
// ================================================================

import React, { useState } from "react";
import { useStaff } from "../lib/StaffContext";
import type { Project } from "../lib/types";
import { CAT, CATEGORIES, CAT_FULL, projectImage } from "../lib/utils";
import { EmptyState, FilterPill, LcPill } from "../components/ui";

const STATUS_FILTERS = ["All", "Draft", "Pending Review", "Published", "Completed"];

const LC_BY_FILTER: Record<string, Project["lc"][]> = {
  Draft: ["draft"],
  "Pending Review": ["pending"],
  Published: ["published"],
  Completed: ["completed", "archived"],
};

export default function ProjectsGallery({
  catFilter,
  setCatFilter,
}: {
  catFilter: string;
  setCatFilter: (c: string) => void;
}) {
  const { projects, dept, openProj, openPreview, nav, searchQuery, setSearchQuery } = useStaff();
  const [statusFilter, setStatusFilter] = useState<string[]>(["All"]);
  const [spotlightOnly, setSpotlightOnly] = useState(false);

  const toggleStatus = (label: string) => {
    if (label === "All") return setStatusFilter(["All"]);
    setStatusFilter((prev) => {
      const withoutAll = prev.filter((s) => s !== "All");
      const next = withoutAll.includes(label)
        ? withoutAll.filter((s) => s !== label)
        : [...withoutAll, label];
      return next.length ? next : ["All"];
    });
  };

  const clearFilters = () => {
    setCatFilter("All");
    setStatusFilter(["All"]);
    setSpotlightOnly(false);
    setSearchQuery("");
  };

  const q = searchQuery.trim().toLowerCase();
  const visible = projects
    .filter((p) => p.lc !== "trash")
    .filter((p) => catFilter === "All" || p.cat === catFilter)
    .filter(
      (p) =>
        statusFilter.includes("All") ||
        statusFilter.some((s) => LC_BY_FILTER[s]?.includes(p.lc))
    )
    .filter((p) => !spotlightOnly || !!p.spotlight)
    .filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.dept.toLowerCase().includes(q)
    );

  const urgRank = { High: 3, Standard: 2, Low: 1 } as const;
  const pending = projects
    .filter((p) => p.lc === "pending")
    .sort((a, b) => (urgRank[b.urgency ?? "Standard"] ?? 2) - (urgRank[a.urgency ?? "Standard"] ?? 2));
  const showPendingRow =
    dept === "Manager's Office" &&
    pending.length > 0 &&
    (statusFilter.includes("All") || statusFilter.includes("Pending Review"));

  const hasActiveFilter =
    catFilter !== "All" || !statusFilter.includes("All") || spotlightOnly || !!q;

  return (
    <main className="mx-auto w-full max-w-[1240px] px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Projects</h1>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Create, publish, and moderate resident engagement.
          </p>
        </div>
        <button
          onClick={() => nav("create")}
          className="h-10 cursor-pointer rounded-lg border-none bg-[#1E3A5F] px-4 text-xs font-semibold text-white hover:bg-[#152a45]"
        >
          + New Project
        </button>
      </div>

      {/* Category chips */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <FilterPill
            key={c}
            label={CAT_FULL[c]}
            active={catFilter === c}
            onClick={() => setCatFilter(c)}
          />
        ))}
      </div>

      {/* Status chips + spotlight toggle */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-4">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Status
        </span>
        {STATUS_FILTERS.map((s) => (
          <FilterPill
            key={s}
            label={s}
            active={statusFilter.includes(s)}
            onClick={() => toggleStatus(s)}
          />
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setSpotlightOnly((v) => !v)}
          className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
            spotlightOnly
              ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
              : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
          }`}
        >
          ★ Spotlighted only
        </button>
      </div>

      {/* Search summary */}
      {q && (
        <div className="mb-5 flex items-center gap-3">
          <span className="text-sm text-[#475569]">
            {visible.length} project{visible.length === 1 ? "" : "s"} matching{" "}
            <strong>&ldquo;{searchQuery.trim()}&rdquo;</strong>
          </span>
          <button
            onClick={() => setSearchQuery("")}
            className="cursor-pointer rounded-full border border-[#bfdbfe] bg-[#dbeafe] px-2.5 py-0.5 text-xs font-medium text-[#1d4ed8]"
          >
            Clear search ✕
          </button>
        </div>
      )}

      {/* Pending review queue (Manager's Office) */}
      {showPendingRow && (
        <div className="mb-8 rounded-xl border border-[#F59E0B] bg-[#FEF3C7]/60 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#92400E]">
              Pending Review
            </span>
            <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold text-white">
              {pending.length}
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setStatusFilter(["Pending Review"])}
              className="cursor-pointer border-none bg-transparent text-[11px] font-semibold text-[#92400E] hover:underline"
            >
              Review all →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {pending.map((p) => (
              <div
                key={p.id}
                className="min-w-[300px] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#F59E0B] bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    style={{ color: CAT[p.cat].color, backgroundColor: CAT[p.cat].bg }}
                    className="rounded px-2 py-0.5 text-[10px] font-bold"
                  >
                    {CAT_FULL[p.cat]}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      p.urgency === "High"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.urgency ?? "Standard"} Priority
                  </span>
                </div>
                <h4 className="mb-1 text-sm font-bold text-[#1E3A5F]">{p.title}</h4>
                <p className="mb-3 text-[11px] text-[#94A3B8]">
                  By {p.submittedBy} · {p.submittedDept} · {p.submittedDate}
                </p>
                <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-[#64748B]">
                  {p.desc}
                </p>
                <button
                  onClick={() => openProj(p.id, { tab: "details", review: true })}
                  className="h-8 w-full cursor-pointer rounded-lg border-none bg-[#1E3A5F] text-xs font-semibold text-white hover:bg-[#152a45]"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped project sections */}
      {visible.length === 0 ? (
        <EmptyState
          title="No projects match your filters."
          action={
            hasActiveFilter ? (
              <button
                onClick={clearFilters}
                className="cursor-pointer rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        CATEGORIES.map((cat) => {
          const group = visible.filter((p) => p.cat === cat);
          if (!group.length) return null;
          return (
            <section key={cat} className="mb-10">
              <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-2">
                <span
                  style={{ backgroundColor: CAT[cat].color }}
                  className="h-3 w-3 rounded-sm"
                />
                <h2 className="text-xl font-bold text-gray-900">{CAT_FULL[cat]}</h2>
                <span className="text-sm text-gray-400">{group.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {group.map((p) => (
                  <StaffProjectCard
                    key={p.id}
                    p={p}
                    onOpen={() => openProj(p.id)}
                    onPreview={() => openPreview(p.id)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}

function StaffProjectCard({
  p,
  onOpen,
  onPreview,
}: {
  p: Project;
  onOpen: () => void;
  onPreview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const commentCount = p.public.length + p.privateMsgs.length;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-white transition-all duration-150 ${
        hovered ? "border-[#2563eb] shadow-md" : "border-[#e5e7eb] shadow-xs"
      } ${p.spotlight ? "ring-2 ring-[#BFDBFE]" : ""}`}
    >
      <div>
        {/* Image area with hover overlay — same idiom as ProposalCard */}
        <div className="relative h-[130px] w-full overflow-hidden bg-[#f3f4f6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={projectImage(p.id)}
            alt={p.title}
            className={`h-full w-full object-cover transition-transform duration-300 ${
              hovered ? "scale-105" : "scale-100"
            } ${p.lc === "completed" ? "opacity-70 saturate-50" : ""}`}
          />
          {p.spotlight && (
            <span
              title={`Spotlighted: ${p.spotlight.reason} · through ${p.spotlight.end}`}
              className="absolute left-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs text-white shadow"
            >
              ★
            </span>
          )}
          {hovered && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#0d2240]/55 p-3 transition-opacity duration-150">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
                className="h-7 cursor-pointer rounded-full border border-white/40 bg-white/10 px-3 text-[11px] font-semibold text-white hover:bg-white/20"
              >
                Preview as resident
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                className="h-7 cursor-pointer rounded-full border-none bg-white px-3 text-[11px] font-semibold text-[#0d2240]"
              >
                Open
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-[14px]">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span
              style={{ color: CAT[p.cat].color }}
              className="text-[11px] font-semibold"
            >
              {CAT_FULL[p.cat]}
            </span>
            <span className="text-[11px] text-[#9ca3af]">·</span>
            <span className="max-w-[120px] truncate text-[11px] font-medium text-[#6b7280]" title={p.dept}>
              {p.deptShort}
            </span>
            <span className="text-[11px] text-[#9ca3af]">·</span>
            <span className="text-[11px] text-[#9ca3af]">{p.edited}</span>
          </div>
          <h3 className="mb-1.5 line-clamp-2 text-[15px] font-semibold leading-5 text-[#111827]">
            {p.title}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-[18px] text-[#6b7280]">{p.desc}</p>
        </div>
      </div>

      {/* Staff footer */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#e5e7eb] bg-[#f8fafc] px-[14px] py-2.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <LcPill lc={p.lc} />
            {p.spotlight && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                ★ Spotlighted
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-[#94a3b8]">
            {p.followers} following · {commentCount} comment{commentCount === 1 ? "" : "s"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="h-7 cursor-pointer rounded-lg border-none bg-[#1e3a5f] px-2.5 text-xs font-semibold text-white hover:bg-[#152a45]"
        >
          Manage
        </button>
      </div>
    </div>
  );
}
