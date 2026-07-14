"use client";

// ================================================================
//  AppliedFiltersBar — the header row above the results grid on
//  /search. Matches the reference layout: sits directly on the page's
//  gray background (no card wrapper, no breadcrumb) with a bottom
//  border as the only divider between it and the grid.
//    Row 1: page title + result count (left) ... Sort pill (right)
//    Row 2 (only if filters are active): removable chips for the
//      keyword plus every committed category/department/region value
//
//  Removing a chip writes straight to committedFilters via
//  commitFilters — it does NOT go through FilterSidebar's draft/Apply
//  flow, so the grid re-filters immediately. The keyword chip's
//  removal is picked up by Navbar the same way (it re-syncs its input
//  from committedFilters.keyword). FilterSidebar's own sync check
//  re-seeds its checkboxes from committedFilters, so all three stay
//  in sync with each other.
// ================================================================

import type { ReactNode } from "react";
import { useSearchFilter, type SortOption } from "@/app/context/SearchFilterContext";
import { SearchIcon } from "../icons";
import FilterChip from "./FilterChip";

interface AppliedFiltersBarProps {
  title: string;
  resultCount: number;
}

interface Chip {
  key: string;
  label: string;
  icon?: ReactNode;
  onRemove: () => void;
}

export default function AppliedFiltersBar({ title, resultCount }: AppliedFiltersBarProps) {
  const { committedFilters, commitFilters } = useSearchFilter();
  const { keyword, category, department, region, sortBy } = committedFilters;

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
    ...region.map((value) => ({
      key: `region-${value}`,
      label: value,
      onRemove: () =>
        commitFilters({ ...committedFilters, region: region.filter((v) => v !== value) }),
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
