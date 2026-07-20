"use client";

import {
  proposalRegistry,
  dashboardSections,
  getFeaturedBannerCards,
  type ProposalCard as ProposalCardType,
  type DashboardSection,
} from "@/app/data/proposals";
import ProposalCard from "./ProposalCard";
import HomeBanner from "./HomeBanner";
import MiniProjectCard from "./MiniProjectCard";
import { useFollowedProjects } from "@/app/hooks/useFollowedProjects";
import { useRecentlyViewed } from "@/app/context/RecentlyViewedContext";

// Search + filter + sort now live in the Navbar's search panel and the
// dedicated /search results route (see app/components/Navbar.tsx and
// app/components/SearchResultsContent.tsx). This component just renders
// the default, unfiltered dashboard view: your followed projects, plus
// one section per functional category.

export default function DashboardContent() {
  const { followedIds, toggleFollow } = useFollowedProjects();
  const { recordView } = useRecentlyViewed();
  const featuredCards = getFeaturedBannerCards();

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

    // "Your Followed Projects" gets a banded treatment: a tinted container
    // (same outer width as the plain section grids below — it's just
    // another direct child of <main>, no extra max-width of its own) that
    // holds a single row of compact photo cards. That row never wraps:
    // however many projects someone follows, they stay on one line and
    // overflow into horizontal scroll instead of pushing the container
    // taller with a second row.
    if (section.dynamic) {
      return (
        <section key={idx} className="mb-10">
          <div className="bg-blue-50 rounded-xl p-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              {section.title}
            </h2>
            <div className="flex flex-nowrap gap-4 overflow-x-auto pb-1">
              {cards.map((card) => (
                <MiniProjectCard
                  key={card.id}
                  card={card}
                  showFollowingBadge
                  onOpen={() => recordView(card.id)}
                  className="w-[190px] flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </section>
      );
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
              onPress={() => recordView(card.id)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-10">
      <HomeBanner cards={featuredCards} />

      {dashboardSections.map((section, idx) => renderSection(section, idx))}
    </main>
  );
}
