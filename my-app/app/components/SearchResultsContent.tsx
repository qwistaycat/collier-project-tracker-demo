"use client";

// ================================================================
//  SearchResultsContent — the /search route's body.
//  Two-column layout: FilterSidebar (draft checkboxes + Apply/Reset)
//  on the left, results (chips + sort + grid) on the right. Reads
//  *committed* filters from SearchFilterContext — FilterSidebar and
//  AppliedFiltersBar are the only things that ever write to it.
//
//  Filter semantics: OR within a facet, AND across facets. Sort is
//  now a real sort against ProposalCard.updatedAt (an ISO date), not
//  a placeholder.
// ================================================================

import { proposalRegistry, type ProposalCard as ProposalCardType } from "@/app/data/proposals";
import ProposalCard from "./ProposalCard";
import { useSearchFilter, EMPTY_FILTERS } from "@/app/context/SearchFilterContext";
import { useFollowedProjects } from "@/app/hooks/useFollowedProjects";
import FilterSidebar from "./search/FilterSidebar";
import AppliedFiltersBar from "./search/AppliedFiltersBar";

export default function SearchResultsContent() {
  const { committedFilters, commitFilters } = useSearchFilter();
  const { followedIds, toggleFollow } = useFollowedProjects();
  const { keyword, category, department, region, sortBy } = committedFilters;

  const results: ProposalCardType[] = Object.values(proposalRegistry).filter((p) => {
    if (keyword) {
      const q = keyword.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (category.length > 0 && !category.includes(p.functionalCategory)) return false;
    if (department.length > 0 && !department.includes(p.department)) return false;
    if (region.length > 0 && !region.includes(p.region)) return false;
    return true;
  });

  const sortedResults = [...results].sort((a, b) => {
    const delta = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortBy === "newest" ? -delta : delta;
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-56px)]">
      <main className="w-full">
        <div className="flex gap-6 items-start px-4 pt-4 pb-14">
          <FilterSidebar />

          <div className="flex-1 min-w-0 px-4">
            <AppliedFiltersBar title="All Projects" resultCount={sortedResults.length} />

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
                {sortedResults.map((card) => (
                  <ProposalCard
                    key={card.id}
                    card={card}
                    isFollowing={followedIds.includes(card.id)}
                    onToggleFollow={toggleFollow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
