"use client";

// ================================================================
//  TownshipSearchFilterContext
//  Staff-side mirror of app/context/SearchFilterContext: holds the
//  *committed* search/filter selection for /township/search. Lives
//  above the router outlet (see app/township/layout.tsx) so it
//  survives navigation into the search page from anywhere in the
//  staff app without needing URL query params.
//
//  Facets follow the staff data model: Category (full display
//  names), Department (short names as shown on cards), and Status
//  (lifecycle labels) — multi-select, OR within a facet, AND across
//  facets. Draft state (checkboxes ticked but not yet Applied)
//  lives locally in TownshipFilterSidebar, not here.
// ================================================================

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  catFull,
  STAFF_CATEGORIES,
  type Lifecycle,
  type StaffProject,
} from "./data";

export type SortOption = "newest" | "oldest";

export interface CommittedFilters {
  keyword: string;
  category: string[];
  department: string[];
  status: string[];
  sortBy: SortOption;
}

export const EMPTY_FILTERS: CommittedFilters = {
  keyword: "",
  category: [],
  department: [],
  status: [],
  sortBy: "newest",
};

/** Category facet values — the same full names the cards display. */
export const CATEGORY_OPTIONS: string[] = STAFF_CATEGORIES.map((c) => catFull(c));

/** Status facet values, mapped onto project lifecycle states. */
export const STATUS_OPTIONS = [
  "Draft",
  "Pending Review",
  "Published",
  "Completed",
  "Archived",
] as const;

export const STATUS_TO_LC: Record<string, Lifecycle> = {
  Draft: "draft",
  "Pending Review": "pending",
  Published: "published",
  Completed: "completed",
  Archived: "archived",
};

/** Department facet values — unique card-facing short names, seed order. */
export function departmentOptions(projects: StaffProject[]): string[] {
  return Array.from(
    new Set(projects.filter((p) => p.lc !== "trash").map((p) => p.deptShort))
  );
}

/**
 * Recency rank for sorting: StaffProject.edited is a relative string
 * ("4 hours ago", "2 days ago", "1 week ago", "completed Dec 2024"),
 * so convert it to approximate days-ago. Month/year forms are anchored
 * to the seed data's fictional "now" (July 2026). Unparsable values
 * ("—") sort last under "Newest First".
 */
export function editedDaysAgo(edited: string): number {
  const rel = edited.match(/(\d+)\s*(hour|day|week|month)/);
  if (rel) {
    const n = parseInt(rel[1], 10);
    switch (rel[2]) {
      case "hour":
        return n / 24;
      case "day":
        return n;
      case "week":
        return n * 7;
      case "month":
        return n * 30;
    }
  }
  const abs = edited.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/);
  if (abs) {
    const month =
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(
        abs[1]
      ) + 1;
    const year = parseInt(abs[2], 10);
    return (2026 - year) * 365 + (7 - month) * 30;
  }
  return 99999;
}

interface TownshipSearchFilterContextValue {
  /** The last filters the user actually confirmed (Apply, or a chip removal). */
  committedFilters: CommittedFilters;
  /** Commits a whole new filter set — called on Apply from TownshipFilterSidebar. */
  commitFilters: (filters: CommittedFilters) => void;
  /** Convenience setter for the navbar's keyword-only search box. */
  setKeyword: (keyword: string) => void;
}

const TownshipSearchFilterContext = createContext<TownshipSearchFilterContextValue | null>(null);

export function TownshipSearchFilterProvider({ children }: { children: ReactNode }) {
  const [committedFilters, setCommittedFilters] = useState<CommittedFilters>(EMPTY_FILTERS);

  const commitFilters = useCallback((filters: CommittedFilters) => {
    setCommittedFilters(filters);
  }, []);

  const setKeyword = useCallback((keyword: string) => {
    setCommittedFilters((prev) => ({ ...prev, keyword }));
  }, []);

  return (
    <TownshipSearchFilterContext.Provider value={{ committedFilters, commitFilters, setKeyword }}>
      {children}
    </TownshipSearchFilterContext.Provider>
  );
}

export function useTownshipSearchFilter() {
  const ctx = useContext(TownshipSearchFilterContext);
  if (!ctx) {
    throw new Error("useTownshipSearchFilter must be used within a TownshipSearchFilterProvider");
  }
  return ctx;
}
