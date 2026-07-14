"use client";

// ================================================================
//  FilterSidebar — the left column of /search.
//
//  One card (rounded, bordered, shadowed, overflow-hidden) with a
//  header ("Selected Filters" + one dynamic action button) and a body
//  (Category / Department / Region checkbox groups, always expanded —
//  no collapse affordance).
//
//  Owns *draft* facet selections (category/department/region) as
//  local state, separate from the *committed* filters in
//  SearchFilterContext. This mirrors the draft/commit split that used
//  to live in Navbar, just relocated here now that faceted filtering
//  is a page-level panel instead of a header dropdown.
//
//  Reset and Apply used to be two separate buttons; they're now one
//  button that swaps label/action based on state:
//    - Any unapplied checkbox change (draft !== committed) → "Apply",
//      enabled.
//    - No pending change, but something is currently applied
//      (draft === committed, committed non-empty) → "Reset", enabled.
//    - Nothing pending and nothing applied → "Apply", disabled.
//  Removing a chip in AppliedFiltersBar calls commitFilters directly,
//  bypassing this button — the sync check below re-seeds the draft so
//  the checkboxes here stay in sync with that immediate change.
// ================================================================

import { useState } from "react";
import {
  FUNCTIONAL_CATEGORIES,
  DEPARTMENTS,
  REGIONS,
  type FunctionalCategory,
  type Department,
  type Region,
} from "@/app/data/proposals";
import { useSearchFilter } from "@/app/context/SearchFilterContext";
import FilterSection from "./FilterSection";

interface DraftFacets {
  category: FunctionalCategory[];
  department: Department[];
  region: Region[];
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
    sameSet(a.region, b.region)
  );
}

export default function FilterSidebar() {
  const { committedFilters, commitFilters } = useSearchFilter();

  const committedFacets: DraftFacets = {
    category: committedFilters.category,
    department: committedFilters.department,
    region: committedFilters.region,
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
    syncedFacets.region !== committedFacets.region
  ) {
    setSyncedFacets(committedFacets);
    setDraft(committedFacets);
  }

  const hasPending = !facetsEqual(draft, committedFacets);
  const hasApplied =
    committedFacets.category.length > 0 ||
    committedFacets.department.length > 0 ||
    committedFacets.region.length > 0;

  const toggleCategory = (value: FunctionalCategory) => {
    setDraft((prev) => ({
      ...prev,
      category: prev.category.includes(value)
        ? prev.category.filter((v) => v !== value)
        : [...prev.category, value],
    }));
  };

  const toggleDepartment = (value: Department) => {
    setDraft((prev) => ({
      ...prev,
      department: prev.department.includes(value)
        ? prev.department.filter((v) => v !== value)
        : [...prev.department, value],
    }));
  };

  const toggleRegion = (value: Region) => {
    setDraft((prev) => ({
      ...prev,
      region: prev.region.includes(value)
        ? prev.region.filter((v) => v !== value)
        : [...prev.region, value],
    }));
  };

  const handleApply = () => {
    commitFilters({ ...committedFilters, ...draft });
  };

  const handleReset = () => {
    const cleared: DraftFacets = { category: [], department: [], region: [] };
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
          options={FUNCTIONAL_CATEGORIES}
          selected={draft.category}
          onToggle={(v) => toggleCategory(v as FunctionalCategory)}
        />

        <div className="border-t border-gray-900/10 pt-[18px]">
          <FilterSection
            title="Department"
            options={DEPARTMENTS}
            selected={draft.department}
            onToggle={(v) => toggleDepartment(v as Department)}
          />
        </div>

        <div className="border-t border-gray-900/10 pt-[18px]">
          <FilterSection
            title="Region"
            options={REGIONS}
            selected={draft.region}
            onToggle={(v) => toggleRegion(v as Region)}
          />
        </div>
      </div>
    </aside>
  );
}
