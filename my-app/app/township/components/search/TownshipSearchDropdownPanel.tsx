"use client";

// ================================================================
//  TownshipSearchDropdownPanel — staff mirror of the resident
//  SearchDropdownPanel (app/components/search/): the mega-menu that
//  expands from the navbar's search entry.
//
//  Left column: Category / Department / Status quick-browse pills —
//  clicking one replaces whatever's committed with just that facet
//  value and jumps straight to /township/search (full multi-select
//  filtering lives in TownshipFilterSidebar on the results page).
//  Right column: Recently Viewed Projects from
//  TownshipRecentlyViewedContext.
//
//  This component only ever navigates + calls onClose; open/close
//  state lives in TownshipNavbar.
// ================================================================

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTownship } from "../../TownshipContext";
import {
  useTownshipSearchFilter,
  EMPTY_FILTERS,
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  departmentOptions,
} from "../../TownshipSearchFilterContext";
import { useTownshipRecentlyViewed } from "../../TownshipRecentlyViewedContext";
import { catFull, catHeroImage, updatedLabel } from "../../data";

type Facet = "category" | "department" | "status";

interface TownshipSearchDropdownPanelProps {
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
      <div className="text-[12px] font-bold text-gray-900/45 uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="flex flex-col">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onPick(option)}
            className="text-left py-1.5 text-[13.5px] text-gray-700 hover:text-blue-600 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TownshipSearchDropdownPanel({
  onClose,
}: TownshipSearchDropdownPanelProps) {
  const router = useRouter();
  const { commitFilters } = useTownshipSearchFilter();
  const { recentIds, recordView } = useTownshipRecentlyViewed();
  const { projects } = useTownship();

  const goToFilter = (facet: Facet, value: string) => {
    commitFilters({
      ...EMPTY_FILTERS,
      [facet]: [value],
    });
    router.push("/township/search");
    onClose();
  };

  const viewAll = () => {
    commitFilters(EMPTY_FILTERS);
    router.push("/township/search");
    onClose();
  };

  const recentCards = recentIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p) => p !== undefined)
    .slice(0, 3);

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
              options={CATEGORY_OPTIONS}
              onPick={(v) => goToFilter("category", v)}
            />
            <TextList
              title="Search by Department"
              options={departmentOptions(projects)}
              onPick={(v) => goToFilter("department", v)}
            />
          </div>
          <div className="w-[220px] flex flex-col gap-6">
            <TextList
              title="Search by Status"
              options={[...STATUS_OPTIONS]}
              onPick={(v) => goToFilter("status", v)}
            />
          </div>
        </div>

        {/* Right: recently viewed */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-gray-900/45 uppercase tracking-wide">
              Recently Viewed Projects
            </h3>
            <button
              onClick={viewAll}
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </button>
          </div>

          {recentCards.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              You haven&apos;t viewed any projects yet. Open a project to see it here.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {recentCards.map((p) => (
                <Link
                  key={p.id}
                  href={`/township/project/${p.id}?tab=details`}
                  onClick={() => {
                    recordView(p.id);
                    onClose();
                  }}
                  className="group block rounded-lg overflow-hidden border border-gray-900/10 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="h-24 w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={catHeroImage(p.cat, p.id)}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10.5px] font-semibold text-blue-600 mb-1 truncate">
                      {catFull(p.cat)}
                    </div>
                    <div className="text-[12.5px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
                      {p.title}
                    </div>
                    <div className="text-[10.5px] text-gray-400">{updatedLabel(p.edited)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
