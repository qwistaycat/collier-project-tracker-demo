"use client";

// ================================================================
//  TownshipAppliedFiltersBar — staff mirror of the resident
//  AppliedFiltersBar (app/components/search/): the header row above
//  the results grid on /township/search. Reuses FilterChip verbatim.
//    Row 1: page title + result count (left) ... Sort pill (right)
//    Row 2 (only if filters are active): removable chips for the
//      keyword plus every committed category/department/status value
//
//  Removing a chip writes straight to committedFilters — it does NOT
//  go through TownshipFilterSidebar's draft/Apply flow, so the grid
//  re-filters immediately and the sidebar re-seeds its checkboxes.
// ================================================================

import type { ReactNode } from "react";
import FilterChip from "@/app/components/search/FilterChip";
import { SearchIcon } from "@/app/components/icons";
import {
  useTownshipSearchFilter,
  type SortOption,
} from "../../TownshipSearchFilterContext";

interface TownshipAppliedFiltersBarProps {
  title: string;
  resultCount: number;
}

interface Chip {
  key: string;
  label: string;
  icon?: ReactNode;
  onRemove: () => void;
}

export default function TownshipAppliedFiltersBar({
  title,
  resultCount,
}: TownshipAppliedFiltersBarProps) {
  const { committedFilters, commitFilters } = useTownshipSearchFilter();
  const { keyword, category, department, status, sortBy } = committedFilters;

  const chips: Chip[] = [
    ...(keyword
      ? [
          {
            key: "keyword",
            label: `"${keyword}"`,
            icon: <SearchIcon size={11} className="text-blue-400" />,
            onRemove: () => commitFilters({ ...committedFilters, keyword: "" }),
          },
        ]
      : []),
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
    ...status.map((value) => ({
      key: `status-${value}`,
      label: value,
      onRemove: () =>
        commitFilters({ ...committedFilters, status: status.filter((v) => v !== value) }),
    })),
  ];

  const resultCountText = `${resultCount} ${resultCount === 1 ? "result" : "results"} found`;

  return (
    <div className="pb-4 mb-[22px] border-b border-gray-900/10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">{title}</h1>
          <span className="text-sm text-gray-900/55">{resultCountText}</span>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full border border-gray-900/12 bg-white pl-4 pr-3.5 py-1.5 text-[13.5px] text-gray-800 flex-shrink-0">
          Sort by:
          <select
            value={sortBy}
            onChange={(e) =>
              commitFilters({ ...committedFilters, sortBy: e.target.value as SortOption })
            }
            className="appearance-none bg-transparent border-none pr-5 text-[13.5px] font-medium text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              icon={chip.icon}
              onRemove={chip.onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
