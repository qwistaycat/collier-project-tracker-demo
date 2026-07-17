"use client";

// ================================================================
//  StaffNavbar — top navigation for the township portal. Staff navy
//  (#1E3A5F) to stay visually distinct from the resident navy.
//
//  The search entry mirrors the resident Navbar pattern (pill input,
//  magnifier icon, clear button, dropdown panel below the header):
//  typing shows live project matches plus quick category jumps;
//  Enter commits the keyword and lands on the Projects screen with
//  the gallery filtered.
// ================================================================

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon, CloseIcon, EyeIcon, SearchIcon } from "@/app/components/icons";
import { useStaff, type StaffScreen } from "../lib/StaffContext";
import { CAT, CATEGORIES, CAT_FULL, DEPARTMENTS, STAFF_NAME } from "../lib/utils";
import { LcPill, Modal } from "./ui";

const NAV_TABS: Array<{ key: StaffScreen; label: string }> = [
  { key: "projects", label: "Projects" },
  { key: "feedback", label: "Feedback" },
  { key: "insights", label: "Insights" },
  { key: "reports", label: "Reports" },
];

export default function StaffNavbar({
  onCategoryPick,
}: {
  onCategoryPick: (cat: string) => void;
}) {
  const {
    screen,
    nav,
    projects,
    aiMode,
    toggleAi,
    dept,
    setDept,
    toast,
    searchQuery,
    setSearchQuery,
    openProj,
  } = useStaff();

  const [inputValue, setInputValue] = useState(searchQuery);
  const [panelOpen, setPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deptSwitchOpen, setDeptSwitchOpen] = useState(false);

  // Re-sync the input when the committed keyword changes elsewhere
  // (e.g. "Clear filters" on the gallery) — same pattern as the
  // resident Navbar.
  const [synced, setSynced] = useState(searchQuery);
  if (synced !== searchQuery) {
    setSynced(searchQuery);
    setInputValue(searchQuery);
  }

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panelOpen]);

  const runSearch = () => {
    setSearchQuery(inputValue.trim());
    setPanelOpen(false);
    nav("projects");
  };

  const clearInput = () => {
    setInputValue("");
    setSearchQuery("");
  };

  const trashCount = projects.filter((p) => p.lc === "trash").length;
  const q = inputValue.trim().toLowerCase();
  const matches = q
    ? projects
        .filter((p) => p.lc !== "trash")
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q) ||
            p.dept.toLowerCase().includes(q)
        )
        .slice(0, 6)
    : [];

  const isProjectsArea = screen === "projects" || screen === "detail" || screen === "create" || screen === "trash";

  return (
    <div className="sticky top-0 z-[40] flex h-[58px] items-center gap-4 bg-[#1E3A5F] px-6 shadow-md">
      {/* Brand */}
      <div
        onClick={() => nav("projects")}
        className="flex shrink-0 cursor-pointer items-center gap-2.5"
      >
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white text-sm font-bold text-[#1E3A5F]">
          CT
        </div>
        <span className="text-sm font-semibold text-white">
          Collier Connect <span className="font-normal text-[#94A3B8]">| Staff</span>
        </span>
      </div>

      {/* Nav tabs */}
      <div className="ml-2 flex gap-1">
        {NAV_TABS.map((t) => {
          const active = t.key === "projects" ? isProjectsArea : screen === t.key;
          return (
            <button
              key={t.key}
              onClick={() => nav(t.key)}
              className={`h-[34px] cursor-pointer rounded-lg border-none px-3 text-xs font-medium transition-colors ${
                active ? "bg-white/15 text-white" : "bg-transparent text-[#CBD5E1] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Search entry — mirrors the resident Navbar */}
      <div className="relative w-[280px] shrink-0">
        <button
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Search"
          className="absolute bottom-0 left-3 top-0 flex cursor-pointer items-center border-none bg-transparent p-0 text-[#6b7280]"
        >
          <SearchIcon size={15} />
        </button>
        <input
          type="text"
          value={inputValue}
          placeholder="Search projects"
          onChange={(e) => {
            setInputValue(e.target.value);
            setPanelOpen(true);
          }}
          onFocus={() => setPanelOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
            if (e.key === "Escape") setPanelOpen(false);
          }}
          className="w-full rounded-full border border-transparent bg-white py-2 pl-[34px] pr-[34px] text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputValue && (
          <button
            onClick={clearInput}
            aria-label="Clear search"
            className="absolute bottom-0 right-2.5 top-0 flex cursor-pointer items-center border-none bg-transparent text-[#9ca3af]"
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      {/* Preview Resident View — opens the real resident app */}
      <Link
        href="/dashboard"
        className="flex h-[34px] shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
      >
        <EyeIcon size={14} />
        Preview Resident View
      </Link>

      {/* AI Assistance toggle */}
      <button
        onClick={toggleAi}
        className={`flex h-[34px] shrink-0 cursor-pointer items-center gap-2 rounded-full border px-[14px] text-xs font-semibold transition-all ${
          aiMode
            ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
            : "border-white/20 bg-white/5 text-white"
        }`}
      >
        <span className={`h-2 w-2 rounded-full transition-colors ${aiMode ? "bg-[#C4B5FD]" : "bg-[#64748B]"}`} />
        AI Assistance: {aiMode ? "ON" : "OFF"}
      </button>

      {/* Notifications */}
      <button className="relative flex shrink-0 cursor-pointer border-none bg-transparent text-white">
        <BellIcon size={20} />
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9px] font-bold text-white">
          4
        </span>
      </button>

      {/* Profile */}
      <div className="relative shrink-0">
        <div
          onClick={() => setProfileOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-2 pl-1"
        >
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
            AM
          </div>
          <div className="hidden text-left lg:block">
            <div className="text-xs font-semibold text-white">{STAFF_NAME}</div>
            <div className="text-[10px] text-[#94A3B8]">{dept}</div>
          </div>
        </div>

        {profileOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-2xl">
            <div className="mb-1 border-b border-[#F1F5F9] p-2 pb-3">
              <div className="text-xs font-semibold text-[#0F172A]">{STAFF_NAME}</div>
              <div className="text-[11px] text-[#94A3B8]">{dept}</div>
            </div>
            <button
              onClick={() => {
                setProfileOpen(false);
                toast("Profile settings are managed by your administrator");
              }}
              className="w-full cursor-pointer rounded-lg border-none bg-transparent px-2 py-[7px] text-left text-xs text-[#475569] hover:bg-slate-50"
            >
              Profile Settings
            </button>
            <button
              onClick={() => {
                setDeptSwitchOpen(true);
                setProfileOpen(false);
              }}
              className="w-full cursor-pointer rounded-lg border-none bg-transparent px-2 py-[7px] text-left text-xs text-[#475569] hover:bg-slate-50"
            >
              Switch Department
            </button>
            <button
              onClick={() => {
                setProfileOpen(false);
                nav("trash");
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border-none bg-transparent px-2 py-[7px] text-left text-xs text-[#475569] hover:bg-slate-50"
            >
              Trash
              {trashCount > 0 && (
                <span className="rounded-full bg-[#FEE2E2] px-1.5 text-[10px] font-bold text-[#DC2626]">
                  {trashCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setProfileOpen(false);
                nav("login");
              }}
              className="mt-1 w-full cursor-pointer rounded-lg border-none border-t border-slate-50 bg-transparent px-2 py-[7px] pt-2 text-left text-xs font-semibold text-[#DC2626] hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Search dropdown panel — quick category jumps + live matches */}
      {panelOpen && (
        <>
          <div
            onClick={() => setPanelOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[58px] z-[45] bg-black/40"
          />
          <div className="absolute inset-x-0 top-full z-[50] bg-white shadow-xl">
            <div className="mx-auto flex max-w-6xl gap-14 px-10 py-7">
              <div className="w-[240px] shrink-0">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-900/45">
                  Browse by Category
                </div>
                <div className="flex flex-col">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCategoryPick(c);
                        setPanelOpen(false);
                        nav("projects");
                      }}
                      className="cursor-pointer border-none bg-transparent py-1.5 text-left text-[13.5px] text-gray-700 transition-colors hover:text-blue-600"
                    >
                      {CAT_FULL[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[12px] font-bold uppercase tracking-wide text-gray-900/45">
                    {q ? `Matching Projects` : "Type to search your projects"}
                  </div>
                  {q && (
                    <button
                      onClick={runSearch}
                      className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View all results
                    </button>
                  )}
                </div>
                {q && matches.length === 0 && (
                  <p className="text-sm italic text-gray-400">
                    No projects match &ldquo;{inputValue.trim()}&rdquo;.
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  {matches.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPanelOpen(false);
                        openProj(p.id);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-transparent p-2 text-left transition-all hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span
                        style={{ backgroundColor: CAT[p.cat].color }}
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-gray-900">
                          {p.title}
                        </span>
                        <span className="block truncate text-[11px] text-gray-400">
                          {CAT_FULL[p.cat]} · {p.deptShort} · edited {p.edited}
                        </span>
                      </span>
                      <LcPill lc={p.lc} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Switch Department modal */}
      {deptSwitchOpen && (
        <Modal onClose={() => setDeptSwitchOpen(false)} width={520}>
          <h3 className="mb-1 text-lg font-bold text-[#1E3A5F]">Posting Department</h3>
          <p className="mb-4 text-xs text-[#64748B]">
            You&apos;ll be posting as this department for all actions this session.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDept(d);
                  setDeptSwitchOpen(false);
                }}
                className={`cursor-pointer rounded-lg border p-3 text-left text-xs font-semibold transition-colors ${
                  d === dept
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100"
                }`}
              >
                <div className="text-[#1E3A5F]">{d}</div>
                <div className="mt-0.5 text-[10px] font-normal text-[#94A3B8]">
                  {d === dept ? "Current · Manager" : "Staff"}
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
