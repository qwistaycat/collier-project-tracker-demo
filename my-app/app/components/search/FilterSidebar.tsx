"use client";

// ================================================================
//  FilterSidebar — the left column of /search.
//
//  Owns *draft* facet selections (category/department/region) as
//  local state, separate from the *committed* filters in
//  SearchFilterContext. This mirrors the draft/commit split that used
//  to live in Navbar, just relocated here now that faceted filtering
//  is a page-level panel instead of a header dropdown.
//
//  Apply/Reset are derived, not hardcoded, from comparing draft vs.
//  committed (see wireframe states 3a/3c):
//    - Apply is disabled whenever draft === committed (nothing pending).
//    - Reset is disabled only when BOTH draft and committed are empty
//      (wireframe state 3a — the true "nothing selected" starting point).
//  Removing a chip in AppliedFiltersBar calls commitFilters directly,
//  bypassing Apply — the sync check below re-seeds the draft so the
//  checkboxes here stay in sync with that immediate change.
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

  const applyDisabled = !hasPending;
  const resetDisabled = !hasPending && !hasApplied;

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

  return (
    <aside className="w-64 flex-shrink-0">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Filters</h2>

      <FilterSection
        title="Category"
        options={FUNCTIONAL_CATEGORIES}
        selected={draft.category}
        onToggle={(v) => toggleCategory(v as FunctionalCategory)}
        defaultExpanded
      />
      <FilterSection
        title="Department"
        options={DEPARTMENTS}
        selected={draft.department}
        onToggle={(v) => toggleDepartment(v as Department)}
      />
      <FilterSection
        title="Region"
        options={REGIONS}
        selected={draft.region}
        onToggle={(v) => toggleRegion(v as Region)}
      />

      <div className="flex items-center justify-between pt-4 mt-2">
        <button
          onClick={handleReset}
          disabled={resetDisabled}
          className="text-sm font-medium text-red-500 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={applyDisabled}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </aside>
  );
}
