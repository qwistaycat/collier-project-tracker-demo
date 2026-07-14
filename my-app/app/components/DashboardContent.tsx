"use client";

import {
  proposalRegistry,
  dashboardSections,
  type ProposalCard as ProposalCardType,
  type DashboardSection,
} from "@/app/data/proposals";
import ProposalCard from "./ProposalCard";
import { useFollowedProjects } from "@/app/hooks/useFollowedProjects";

// Search + filter + sort now live in the Navbar's search panel and the
// dedicated /search results route (see app/components/Navbar.tsx and
// app/components/SearchResultsContent.tsx). This component just renders
// the default, unfiltered dashboard view: your followed projects, plus
// one section per functional category.

export default function DashboardContent() {
  const { followedIds, toggleFollow } = useFollowedProjects();

  const renderSection = (section: DashboardSection, idx: number) => {
    const cards: ProposalCardType[] = section.dynamic
      ? followedIds.map((id) => proposalRegistry[id]).filter(Boolean)
      : section.cards || [];

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

      {dashboardSections.map((section, idx) => renderSection(section, idx))}
    </main>
  );
}
