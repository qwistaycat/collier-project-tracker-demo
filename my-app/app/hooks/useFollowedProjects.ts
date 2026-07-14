"use client";

// ================================================================
//  useFollowedProjects
//  Extracted from DashboardContent so both the dashboard and the new
//  /search results page can read/toggle the same localStorage-backed
//  "followed" list without duplicating the logic.
// ================================================================

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "collier_followed";

function readFollowedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFollowedProjects() {
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setFollowedIds(readFollowedIds());
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { followedIds, toggleFollow };
}
