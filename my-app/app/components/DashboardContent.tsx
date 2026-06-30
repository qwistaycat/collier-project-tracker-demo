"use client";

import { useState, useCallback, useEffect } from "react";
import {
  proposalRegistry,
  dashboardSections,
  FUNCTIONAL_CATEGORIES,
  DEPARTMENTS,
  type ProposalCard as ProposalCardType,
  type DashboardSection,
} from "@/app/data/proposals";
import ProposalCard from "./ProposalCard";
import { SearchIcon, CloseIcon } from "./icons";

function getFollowedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("collier_followed") || "[]");
  } catch {
    return [];
  }
}

export default function DashboardContent() {
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Hydrate from localStorage after mount
  useEffect(() => {
    setFollowedIds(getFollowedIds());
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem("collier_followed", JSON.stringify(next));
      return next;
    });
  }, []);

  const renderSection = (section: DashboardSection, idx: number) => {
    // Dynamic: build followed cards from state
    let cards: ProposalCardType[] = section.dynamic
      ? followedIds.map((id) => proposalRegistry[id]).filter(Boolean)
      : section.cards || [];

    // Apply search + filters (skip for the followed section so it always shows what you follow)
    if (!section.dynamic) {
      // Category filter: sections ARE categories — hide entire section if title doesn't match
      if (filterCategory && section.title !== filterCategory) {
        return null;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        cards = cards.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        );
      }
      // Department filter: filter cards within the section
      if (filterDepartment) {
        cards = cards.filter((c) => c.department === filterDepartment);
      }
    }

    // Empty-state for followed section
    if (cards.length === 0) {
      if (section.dynamic) {
        return (
          <section key={idx} className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {section.title}
            </h2>
            <p className="text-sm text-gray-400 italic">
              You haven&apos;t followed any projects yet. Open a project and
              click <strong>Follow Project</strong> to track it here.
            </p>
          </section>
        );
      }
      return null;
    }

    return (
      <section key={idx} className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {section.title}
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {cards.map((card) => (
            <ProposalCard
              key={card.id}
              card={card}
              isFollowing={followedIds.includes(card.id)}
              onToggleFollow={toggleFollow}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-7">
        Policy Tracking
      </h1>

      {/* Search */}
      <div className="relative mb-5 w-60">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <SearchIcon size={16} />
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setSearchQuery("")}
          className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-600"
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-10 flex-wrap">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sort By</option>
          <option value="newest">Newest First</option>
          <option value="deadline">Deadline Approaching</option>
          <option value="discussed">Most Discussed</option>
          <option value="viewed">Most Viewed</option>
        </select>

        {/* Tag 1: Functional Category */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {FUNCTIONAL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Tag 2: Department */}
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Include Archived
        </label>
      </div>

      {/* Card sections */}
      {dashboardSections.map((section, idx) => renderSection(section, idx))}
    </main>
  );
}
