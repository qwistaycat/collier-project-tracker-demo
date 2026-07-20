"use client";

// ================================================================
//  TownshipSearchResults — the /township/search route's body, a
//  staff mirror of the resident SearchResultsContent. Two-column
//  layout: TownshipFilterSidebar (draft checkboxes + Apply/Reset)
//  on the left, results (chips + sort + grid of gallery
//  ProjectCards) on the right. Reads *committed* filters from
//  TownshipSearchFilterContext.
//
//  Filter semantics: OR within a facet, AND across facets. Trash is
//  never searchable. Sort ranks StaffProject.edited via
//  editedDaysAgo (the relative strings mapped to approximate days).
// ================================================================

import { useTownship } from "../../TownshipContext";
import {
  useTownshipSearchFilter,
  EMPTY_FILTERS,
  STATUS_TO_LC,
  editedDaysAgo,
} from "../../TownshipSearchFilterContext";
import { catFull, type StaffProject } from "../../data";
import TownshipFilterSidebar from "./TownshipFilterSidebar";
import TownshipAppliedFiltersBar from "./TownshipAppliedFiltersBar";
import ProjectCard from "../gallery/ProjectCard";

export default function TownshipSearchResults() {
  const { committedFilters, commitFilters } = useTownshipSearchFilter();
  const { projects } = useTownship();
  const { keyword, category, department, status, sortBy } = committedFilters;

  const results: StaffProject[] = projects.filter((p) => {
    if (p.lc === "trash") return false;
    if (keyword) {
      const q = keyword.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.desc.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (category.length > 0 && !category.includes(catFull(p.cat))) return false;
    if (department.length > 0 && !department.includes(p.deptShort)) return false;
    if (status.length > 0 && !status.some((s) => STATUS_TO_LC[s] === p.lc)) return false;
    return true;
  });

  const sortedResults = [...results].sort((a, b) => {
    const delta = editedDaysAgo(a.edited) - editedDaysAgo(b.edited);
    return sortBy === "newest" ? delta : -delta;
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-56px)]">
      <main className="w-full">
        <div className="flex gap-6 items-start px-4 pt-4 pb-14">
          <TownshipFilterSidebar />

          <div className="flex-1 min-w-0 px-4">
            <TownshipAppliedFiltersBar title="All Projects" resultCount={sortedResults.length} />

            {sortedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No results found
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mb-5">
                  No projects match your current search or filter criteria. Try
                  adjusting your filters or searching with different keywords.
                </p>
                <button
                  onClick={() => commitFilters(EMPTY_FILTERS)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {sortedResults.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
