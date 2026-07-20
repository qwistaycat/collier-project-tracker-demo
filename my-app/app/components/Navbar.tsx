"use client";

// ================================================================
//  Navbar — global header + keyword search entry (right-aligned).
//
//  The search box lives on the header's right side, before the
//  bell/avatar. Clicking its icon, or focusing the input, expands
//  SearchDropdownPanel below the header — a mega-menu with quick
//  single-click Category/Department/Region shortcuts (left) and a
//  Recently Viewed Projects panel (right). Typing a keyword and
//  pressing Enter (or clicking the icon while there's text) still
//  runs a keyword search and lands on /search directly, closing the
//  panel either way.
//
//  Full faceted filtering (multi-select, Apply/Reset) still lives
//  entirely in FilterSidebar on the /search page itself — this panel
//  is a fast browse/jump-in entry point, not a second copy of that UI.
// ================================================================

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchIcon, CloseIcon } from "./icons";
import { useSearchFilter } from "@/app/context/SearchFilterContext";
import NotificationBell from "./NotificationBell";
import SearchDropdownPanel from "./search/SearchDropdownPanel";
import Image from "next/image";

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

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const closePanel = () => setIsPanelOpen(false);

  // Close the panel on any route change (Home link, a pill/card inside
  // the panel, Enter-to-search — all of these navigate). Synced during
  // render like the keyword above, and like TownshipNavbar does.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (isPanelOpen) setIsPanelOpen(false);
  }

  // Escape closes the panel even when focus isn't on the input itself
  // (e.g. after clicking into the panel body).
  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPanelOpen]);

  const runSearch = () => {
    setKeyword(inputValue.trim());
    router.push("/search");
    closePanel();
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
        position: "relative",
        backgroundColor: "#0d2240",
        height: 56,
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        zIndex: 30,
      }}
    >
      {/* Left: brand mark + site name */}
      <Link
        href="/dashboard"
        style={{
          color: "white",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 15,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <Image src="/logo.png" alt="Collier Blueprint Logo" width={28} height={28} />
        <span>Collier Blueprint</span>
      </Link>

      {/* Right: search entry + bell + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexShrink: 0 }}>
        <div style={{ width: 300, position: "relative" }}>
          <button
            onClick={() => setIsPanelOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={isPanelOpen}
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
            onFocus={() => setIsPanelOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
              if (e.key === "Escape") closePanel();
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

        <NotificationBell />

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

      {isPanelOpen && (
        <>
          {/* Dimmed backdrop — sits below the header, above the page; click to close */}
          <div
            onClick={closePanel}
            style={{
              position: "fixed",
              top: 56,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          />
          <SearchDropdownPanel onClose={closePanel} />
        </>
      )}
    </nav>
  );
}
