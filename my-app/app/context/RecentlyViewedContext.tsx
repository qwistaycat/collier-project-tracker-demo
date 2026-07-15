"use client";

// ================================================================
//  RecentlyViewedContext
//  Tracks the last few proposals a resident has opened, so the header
//  search panel's "Recently Viewed Projects" pane has something real
//  to show instead of static placeholder cards.
//
//  Lives above the router outlet (see app/layout.tsx) alongside
//  SearchFilterContext — a recordView() call from anywhere (Dashboard,
//  /search results, the panel itself) needs to be immediately visible
//  to the Navbar's panel, which is mounted at the same time on the
//  same page. A per-component hook (like useFollowedProjects) would
//  each own an independent copy of the list and only sync on
//  remount, which doesn't work here since Navbar and the page content
//  are mounted together.
//
//  Persisted to localStorage (key: "collier_recently_viewed") so the
//  list survives a refresh; the in-memory context state is the actual
//  source of truth while the app is running.
// ================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

const STORAGE_KEY = "collier_recently_viewed";
const MAX_ITEMS = 6;

function readRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

interface RecentlyViewedContextValue {
  /** Proposal ids, most-recently-viewed first. */
  recentIds: string[];
  /** Records a view — moves the id to the front, dedupes, caps at MAX_ITEMS. */
  recordView: (id: string) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setRecentIds(readRecentIds());
  }, []);

  const recordView = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentIds, recordView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return ctx;
}
