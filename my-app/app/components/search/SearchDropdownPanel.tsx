"use client";

// ================================================================
//  SearchDropdownPanel — the mega-menu that expands from the Navbar's
//  search entry when its icon or input is clicked.
//
//  Left column: Category / Department / Region, each rendered as
//  single-click pills (not checkboxes). Clicking a pill is a *quick
//  browse* shortcut — it replaces whatever's currently committed with
//  just that one facet value and jumps straight to /search, rather
//  than feeding into FilterSidebar's multi-select + Apply flow (which
//  still owns full faceted filtering once you're actually on the
//  results page).
//
//  Right column: Recently Viewed Projects, sourced from
//  RecentlyViewedContext (recordView is called wherever a
//  ProposalCard is clicked — see DashboardContent / SearchResultsContent).
//
//  This component only ever navigates + calls onClose; it doesn't own
//  its own open/close state — that lives in Navbar.
// ================================================================

import { useRouter } from "next/navigation";
import {
  FUNCTIONAL_CATEGORIES,
  DEPARTMENTS,
  REGIONS,
  proposalRegistry,
  type FunctionalCategory,
  type Department,
  type Region,
} from "@/app/data/proposals";
import { useSearchFilter, EMPTY_FILTERS } from "@/app/context/SearchFilterContext";
import { useRecentlyViewed } from "@/app/context/RecentlyViewedContext";
import MiniProjectCard from "@/app/components/MiniProjectCard";

type Facet = "category" | "department" | "region";

interface SearchDropdownPanelProps {
  onClose: () => void;
}

function TextList({
  title,
  options,
  onPick,
}: {
  title: string;
  options: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-[12.5px] font-bold text-gray-900 uppercase tracking-wider mb-2.5 pb-2 border-b border-gray-200">
        {title}
      </div>
      <div className="flex flex-col">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onPick(option)}
            className="text-left py-1.5 text-[14px] font-normal text-gray-500 hover:text-blue-600 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SearchDropdownPanel({ onClose }: SearchDropdownPanelProps) {
  const router = useRouter();
  const { commitFilters } = useSearchFilter();
  const { recentIds, recordView } = useRecentlyViewed();

  const goToFilter = (facet: Facet, value: string) => {
    commitFilters({
      ...EMPTY_FILTERS,
      [facet]: [value],
    });
    router.push("/search");
    onClose();
  };

  const viewAll = () => {
    commitFilters(EMPTY_FILTERS);
    router.push("/search");
    onClose();
  };

  const recentCards = recentIds
    .map((id) => proposalRegistry[id])
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div
      className="absolute left-0 right-0 top-full bg-white shadow-xl"
      style={{ zIndex: 50 }}
    >
      <div className="mx-auto max-w-7xl px-12 py-8 flex gap-16">
        {/* Left: quick-browse facets, two columns */}
        <div className="flex-shrink-0 flex gap-12">
          <div className="w-[220px] flex flex-col gap-6">
            <TextList
              title="Search by Category"
              options={FUNCTIONAL_CATEGORIES}
              onPick={(v) => goToFilter("category", v as FunctionalCategory)}
            />
            <TextList
              title="Search by Department"
              options={DEPARTMENTS}
              onPick={(v) => goToFilter("department", v as Department)}
            />
          </div>
          <div className="w-[220px] flex flex-col gap-6">
            <TextList
              title="Search by Region"
              options={REGIONS}
              onPick={(v) => goToFilter("region", v as Region)}
            />
          </div>
        </div>

        {/* Right: recently viewed */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-200">
            <h3 className="text-[12.5px] font-bold text-gray-900 uppercase tracking-wider">
              Recently Viewed Projects
            </h3>
            <button
              onClick={viewAll}
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-700"
            >
              View all projects
            </button>
          </div>

          {recentCards.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              You haven&apos;t viewed any projects yet. Open a project to see it here.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {recentCards.map((card) => (
                <MiniProjectCard
                  key={card.id}
                  card={card}
                  onOpen={() => {
                    recordView(card.id);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
