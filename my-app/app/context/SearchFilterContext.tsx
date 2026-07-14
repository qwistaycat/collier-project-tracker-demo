"use client";

// ================================================================
//  SearchFilterContext
//  Holds the *committed* search/filter selection for the /search
//  page. This lives above the router outlet (see app/layout.tsx) so
//  it survives navigation into /search from anywhere without needing
//  URL query params.
//
//  category / department / region are now multi-select (OR within a
//  facet, AND across facets — see SearchResultsContent's filtering
//  logic). sortBy is wired to ProposalCard.updatedAt, which is a real
//  ISO date now, so "Newest First" / "Oldest First" are live sorts,
//  not placeholders.
//
//  Draft state (checkboxes ticked but not yet Applied) lives locally
//  in FilterSidebar, not here — this context only ever holds what's
//  actually been committed (via Apply, or via removing a chip, which
//  commits immediately).
// ================================================================

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { FunctionalCategory, Department, Region } from "@/app/data/proposals";

export type SortOption = "newest" | "oldest";

export interface CommittedFilters {
  keyword: string;
  category: FunctionalCategory[];
  department: Department[];
  region: Region[];
  sortBy: SortOption;
}

export const EMPTY_FILTERS: CommittedFilters = {
  keyword: "",
  category: [],
  department: [],
  region: [],
  sortBy: "newest",
};

interface SearchFilterContextValue {
  /** The last filters the user actually confirmed (Apply, or a chip removal). */
  committedFilters: CommittedFilters;
  /** Commits a whole new filter set — called on Apply from FilterSidebar. */
  commitFilters: (filters: CommittedFilters) => void;
  /** Convenience setter for the Navbar's keyword-only search box. */
  setKeyword: (keyword: string) => void;
}

const SearchFilterContext = createContext<SearchFilterContextValue | null>(null);

export function SearchFilterProvider({ children }: { children: ReactNode }) {
  const [committedFilters, setCommittedFilters] = useState<CommittedFilters>(EMPTY_FILTERS);

  const commitFilters = useCallback((filters: CommittedFilters) => {
    setCommittedFilters(filters);
  }, []);

  const setKeyword = useCallback((keyword: string) => {
    setCommittedFilters((prev) => ({ ...prev, keyword }));
  }, []);

  return (
    <SearchFilterContext.Provider value={{ committedFilters, commitFilters, setKeyword }}>
      {children}
    </SearchFilterContext.Provider>
  );
}

export function useSearchFilter() {
  const ctx = useContext(SearchFilterContext);
  if (!ctx) {
    throw new Error("useSearchFilter must be used within a SearchFilterProvider");
  }
  return ctx;
}
