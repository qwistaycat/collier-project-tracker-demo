"use client";

// ================================================================
//  Navbar — global header + persistent keyword search entry.
//
//  This used to also own an expandable Category/Department filter
//  panel with its own draft/Apply state. That's been removed: full
//  faceted filtering (Category/Department/Region, multi-select) now
//  lives entirely in FilterSidebar on the /search page itself, so
//  there's a single source of truth for filter state instead of two
//  UIs that had to stay in sync. The Navbar's job is just: type a
//  keyword, hit Enter (or click the icon), land on /search.
// ================================================================

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { BellIcon, HomeIcon, SearchIcon, CloseIcon } from "./icons";
import { useSearchFilter } from "@/app/context/SearchFilterContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { committedFilters, setKeyword } = useSearchFilter();

  // Local typing state, resynced from the committed keyword whenever it
  // changes elsewhere (e.g. a chip removal or Reset on /search clears it).
  // Synced during render (not in a useEffect) — React's documented
  // pattern for "adjust state when a prop-like value changes" without
  // triggering an extra render pass.
  const [inputValue, setInputValue] = useState(committedFilters.keyword);
  const [syncedKeyword, setSyncedKeyword] = useState(committedFilters.keyword);
  if (syncedKeyword !== committedFilters.keyword) {
    setSyncedKeyword(committedFilters.keyword);
    setInputValue(committedFilters.keyword);
  }

  const runSearch = () => {
    setKeyword(inputValue.trim());
    router.push("/search");
  };

  const clearInput = () => {
    setInputValue("");
    // If we're already on /search, clear immediately (same "no Apply
    // needed" behavior as removing a chip) instead of leaving stale
    // results up until the next Enter press.
    if (pathname === "/search") {
      setKeyword("");
    }
  };

  return (
    <nav
      style={{
        backgroundColor: "#0d2240",
        height: 56,
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}
    >
      {/* Left: logo icon + site name */}
      <Link
        href="/dashboard"
        style={{
          color: "white",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <HomeIcon />
        <span>Home</span>
      </Link>

      {/* Center: persistent keyword search entry */}
      <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
        <button
          onClick={runSearch}
          aria-label="Search"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 12,
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <SearchIcon size={15} />
        </button>
        <input
          type="text"
          value={inputValue}
          placeholder="Search projects by name or keyword"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: "100%",
            padding: "8px 34px 8px 34px",
            borderRadius: 9999,
            border: "1px solid transparent",
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        />
        {inputValue && (
          <button
            onClick={clearInput}
            aria-label="Clear search"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 10,
              display: "flex",
              alignItems: "center",
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      {/* Right: bell + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
        <button
          style={{
            position: "relative",
            color: "white",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <BellIcon />
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              background: "#ef4444",
              borderRadius: "50%",
            }}
          />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            C
          </div>
          <span style={{ color: "white", fontSize: 14 }}>Hi, Christy</span>
        </div>
      </div>
    </nav>
  );
}
