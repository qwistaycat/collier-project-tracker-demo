"use client";

// ================================================================
//  AppliedFiltersBar — sits above the results grid on /search.
//  Row 1: removable chips for every committed category/department/
//  region value, plus the (now-live) Sort dropdown.
//  Row 2: result count.
//
//  Removing a chip writes straight to committedFilters via
//  commitFilters — it does NOT go through FilterSidebar's draft/Apply
//  flow, so the grid re-filters immediately. FilterSidebar's own
//  useEffect re-seeds its checkboxes from committedFilters, so the
//  two stay in sync.
// ================================================================

import { useSearchFilter, type SortOption } from "@/app/context/SearchFilterContext";
import FilterChip from "./FilterChip";

interface AppliedFiltersBarProps {
  resultCount: number;
}

export default function AppliedFiltersBar({ resultCount }: AppliedFiltersBarProps) {
  const { committedFilters, commitFilters } = useSearchFilter();
  const { category, department, region, sortBy } = committedFilters;

  const chips = [
    ...category.map((value) => ({
      key: `category-${value}`,
      label: value,
      onRemove: () =>
        commitFilters({ ...committedFilters, category: category.filter((v) => v !== value) }),
    })),
    ...department.map((value) => ({
      key: `department-${value}`,
      label: value,
      onRemove: () =>
        commitFilters({
          ...committedFilters,
          department: department.filter((v) => v !== value),
        }),
    })),
    ...region.map((value) => ({
      key: `region-${value}`,
      label: value,
      onRemove: () =>
        commitFilters({ ...committedFilters, region: region.filter((v) => v !== value) }),
    })),
  ];

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
          <span className="sr-only">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) =>
              commitFilters({ ...committedFilters, sortBy: e.target.value as SortOption })
            }
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        {resultCount} {resultCount === 1 ? "result" : "results"} found
      </p>
    </div>
  );
}
