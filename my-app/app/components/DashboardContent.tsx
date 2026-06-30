"use client";

import { useState, useCallback, useEffect } from "react";
import {
  proposalRegistry,
  dashboardSections,
  CATEGORIES,
  NEIGHBORHOODS,
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
  const [sortBy, setSortBy] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

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
      ? followedIds
        .map((id) => proposalRegistry[id])
        .filter(Boolean)
      : section.cards || [];

    // Filter cards
    cards = cards.filter((card) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery === "" ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category Filter
      const matchesCategory =
        selectedCategory === "" || card.category === selectedCategory;

      // 3. Neighborhood Filter
      const matchesNeighborhood =
        selectedNeighborhood === "" || card.neighborhood === selectedNeighborhood;

      // 4. Archive Filter
      const matchesArchived = includeArchived ? true : !card.isArchived;

      return matchesSearch && matchesCategory && matchesNeighborhood && matchesArchived;
    });

    // Sort cards
    if (sortBy !== "") {
      cards = [...cards].sort((a, b) => {
        if (sortBy === "Newest First") {
          return b.createdDate.localeCompare(a.createdDate);
        }
        if (sortBy === "Deadline Approaching") {
          const aDeadline = a.daysUntilDeadline ?? 9999;
          const bDeadline = b.daysUntilDeadline ?? 9999;
          return aDeadline - bDeadline;
        }
        if (sortBy === "Most Discussed") {
          return (b.commentsCount ?? 0) - (a.commentsCount ?? 0);
        }
        if (sortBy === "Most Viewed") {
          return (b.viewsCount ?? 0) - (a.viewsCount ?? 0);
        }
        return 0;
      });
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
        Project Tracking
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
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-10 flex-wrap">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sort By</option>
          <option value="Newest First">Newest First</option>
          <option value="Deadline Approaching">Deadline Approaching</option>
          <option value="Most Discussed">Most Discussed</option>
          <option value="Most Viewed">Most Viewed</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedNeighborhood}
          onChange={(e) => setSelectedNeighborhood(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Neighborhood</option>
          {NEIGHBORHOODS.map((nh) => (
            <option key={nh} value={nh}>
              {nh}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
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
