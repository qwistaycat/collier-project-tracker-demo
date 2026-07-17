"use client";

// ================================================================
//  TownshipFilterSidebar — staff mirror of the resident
//  FilterSidebar (app/components/search/): the left column of
//  /township/search. Reuses the resident FilterSection checkbox
//  groups verbatim; facets are Category / Department / Status.
//
//  Owns *draft* facet selections as local state, separate from the
//  *committed* filters in TownshipSearchFilterContext. One action
//  button that swaps label/action:
//    - Any unapplied checkbox change → "Apply", enabled.
//    - No pending change but something applied → "Reset", enabled.
//    - Nothing pending and nothing applied → "Apply", disabled.
//  Removing a chip in TownshipAppliedFiltersBar commits directly;
//  the sync check below re-seeds the draft so the checkboxes stay
//  in sync with that immediate change.
// ================================================================

import { useState } from "react";
import FilterSection from "@/app/components/search/FilterSection";
import { useTownship } from "../../TownshipContext";
import {
  useTownshipSearchFilter,
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  departmentOptions,
} from "../../TownshipSearchFilterContext";

interface DraftFacets {
  category: string[];
  department: string[];
  status: string[];
}

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((v) => set.has(v));
}

function facetsEqual(a: DraftFacets, b: DraftFacets) {
  return (
    sameSet(a.category, b.category) &&
    sameSet(a.department, b.department) &&
    sameSet(a.status, b.status)
  );
}

export default function TownshipFilterSidebar() {
  const { committedFilters, commitFilters } = useTownshipSearchFilter();
  const { projects } = useTownship();

  const committedFacets: DraftFacets = {
    category: committedFilters.category,
    department: committedFilters.department,
    status: committedFilters.status,
  };

  const [draft, setDraft] = useState<DraftFacets>(committedFacets);

  // Re-seed the draft whenever committedFilters changes from outside this
  // component (a chip removal, or Reset) — synced during render rather
  // than in a useEffect, per React's "adjust state when a value changes"
  // pattern, to avoid an extra effect-driven render pass.
  const [syncedFacets, setSyncedFacets] = useState<DraftFacets>(committedFacets);
  if (
    syncedFacets.category !== committedFacets.category ||
    syncedFacets.department !== committedFacets.department ||
    syncedFacets.status !== committedFacets.status
  ) {
    setSyncedFacets(committedFacets);
    setDraft(committedFacets);
  }

  const hasPending = !facetsEqual(draft, committedFacets);
  const hasApplied =
    committedFacets.category.length > 0 ||
    committedFacets.department.length > 0 ||
    committedFacets.status.length > 0;

  const toggleFacet = (facet: keyof DraftFacets, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [facet]: prev[facet].includes(value)
        ? prev[facet].filter((v) => v !== value)
        : [...prev[facet], value],
    }));
  };

  const handleApply = () => {
    commitFilters({ ...committedFilters, ...draft });
  };

  const handleReset = () => {
    const cleared: DraftFacets = { category: [], department: [], status: [] };
    setDraft(cleared);
    commitFilters({ ...committedFilters, ...cleared });
  };

  // One button, two personalities: it's "Reset" only when there's
  // something currently applied and nothing pending to apply on top of
  // it. Any pending change — even after something's already applied —
  // flips it back to "Apply".
  const isResetMode = !hasPending && hasApplied;
  const actionLabel = isResetMode ? "Reset" : "Apply";
  const actionDisabled = !isResetMode && !hasPending;
  const handleAction = isResetMode ? handleReset : handleApply;

  return (
    <aside className="w-[312px] flex-shrink-0 sticky top-6 bg-white rounded-xl border border-gray-900/10 shadow-sm overflow-hidden">
      <div className="px-[22px] py-5 border-b border-gray-900/10 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold text-gray-900">Selected Filters</h2>
        <button
          onClick={handleAction}
          disabled={actionDisabled}
          className={
            isResetMode
              ? "flex-shrink-0 text-center text-[13px] font-semibold rounded-[7px] px-4 py-1.5 bg-white border border-gray-900/10 text-gray-900/50 hover:text-gray-900/70 transition-colors"
              : "flex-shrink-0 text-center text-[13px] font-semibold rounded-[7px] px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/40 disabled:text-white/75 disabled:cursor-not-allowed transition-colors"
          }
        >
          {actionLabel}
        </button>
      </div>

      <div className="px-[22px] py-[18px] flex flex-col gap-5">
        <FilterSection
          title="Category"
          options={CATEGORY_OPTIONS}
          selected={draft.category}
          onToggle={(v) => toggleFacet("category", v)}
        />

        <div className="border-t border-gray-900/10 pt-[18px]">
          <FilterSection
            title="Department"
            options={departmentOptions(projects)}
            selected={draft.department}
            onToggle={(v) => toggleFacet("department", v)}
          />
        </div>

        <div className="border-t border-gray-900/10 pt-[18px]">
          <FilterSection
            title="Status"
            options={[...STATUS_OPTIONS]}
            selected={draft.status}
            onToggle={(v) => toggleFacet("status", v)}
          />
        </div>
      </div>
    </aside>
  );
}
