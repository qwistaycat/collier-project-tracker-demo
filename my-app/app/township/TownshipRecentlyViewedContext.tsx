"use client";

// ================================================================
//  TownshipRecentlyViewedContext
//  Staff-side mirror of app/context/RecentlyViewedContext: tracks
//  the last few projects a staff member opened so the header search
//  panel's "Recently Viewed Projects" pane has something real to
//  show. Separate localStorage key from the resident list so the
//  two apps don't push each other's entries out.
//
//  Backed by a tiny external store read via useSyncExternalStore
//  (instead of the resident's hydrate-in-effect approach): the
//  server snapshot is empty, and React re-reads localStorage right
//  after hydration — no SSR mismatch and no setState-in-effect.
// ================================================================

import { createContext, useContext, useSyncExternalStore, ReactNode } from "react";

const STORAGE_KEY = "collier_township_recently_viewed";
const MAX_ITEMS = 6;

const EMPTY: string[] = [];
let cachedIds: string[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): string[] {
  if (cachedIds === null) {
    try {
      cachedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      cachedIds = [];
    }
  }
  return cachedIds ?? EMPTY;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Records a view — moves the id to the front, dedupes, caps at MAX_ITEMS. */
function recordView(id: string) {
  cachedIds = [id, ...getSnapshot().filter((x) => x !== id)].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedIds));
  listeners.forEach((l) => l());
}

interface TownshipRecentlyViewedContextValue {
  /** Project ids, most-recently-viewed first. */
  recentIds: string[];
  recordView: (id: string) => void;
}

const TownshipRecentlyViewedContext = createContext<TownshipRecentlyViewedContextValue | null>(
  null
);

export function TownshipRecentlyViewedProvider({ children }: { children: ReactNode }) {
  const recentIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <TownshipRecentlyViewedContext.Provider value={{ recentIds, recordView }}>
      {children}
    </TownshipRecentlyViewedContext.Provider>
  );
}

export function useTownshipRecentlyViewed() {
  const ctx = useContext(TownshipRecentlyViewedContext);
  if (!ctx) {
    throw new Error(
      "useTownshipRecentlyViewed must be used within a TownshipRecentlyViewedProvider"
    );
  }
  return ctx;
}
