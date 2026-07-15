"use client";

// ================================================================
//  MiniProjectCard — the one shared "small photo card" tile.
//
//  Before this, the dashboard's "Your Followed Projects" row and the
//  navbar search panel's "Recently Viewed Projects" grid each had their
//  own hand-rolled version of this same idea (photo + category + title
//  + "Updated..." caption), with different image heights, paddings and
//  font sizes. That's why they looked inconsistent side by side. This
//  is the single definition both should use.
//
//  The card's size is fixed on its own terms (a min-height baked into
//  this component), not adaptive to whatever its tallest row/grid
//  sibling happens to be. Order is category, then title (up to 2
//  lines), then the "Updated..." caption pinned to the bottom of that
//  fixed-height body via mt-auto — so "Updated..." always lands on the
//  same bottom edge no matter how many lines the title above it takes.
// ================================================================

import Link from "next/link";
import type { ProposalCard as ProposalCardType } from "@/app/data/proposals";

export interface MiniProjectCardProps {
  card: ProposalCardType;
  /** Fires on click, before navigation — e.g. recordView, closing a panel. */
  onOpen?: () => void;
  /** Shows the "✓ Following" pill over the photo. */
  showFollowingBadge?: boolean;
  /** Controls sizing — e.g. a fixed width for a scrolling row, or left
   *  empty to fill a grid column. */
  className?: string;
}

export default function MiniProjectCard({
  card,
  onOpen,
  showFollowingBadge = false,
  className = "",
}: MiniProjectCardProps) {
  return (
    <Link
      href={card.link}
      onClick={onOpen}
      className={`group block bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all ${className}`}
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {showFollowingBadge && (
          <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
            ✓ Following
          </span>
        )}
      </div>
      {/* Fixed min-height (not stretched to match siblings) + flex-col so
          "Updated..." can sit on mt-auto and always land on the same
          bottom edge regardless of whether the title above took 1 or 2
          lines. */}
      <div className="p-2.5 flex flex-col min-h-[92px]">
        <p className="text-[10.5px] font-semibold text-blue-600 mb-1 truncate">
          {card.functionalCategory}
        </p>
        <p
          className="text-xs font-bold text-gray-900 leading-snug mb-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.title}
        </p>
        <p className="text-[10.5px] text-gray-400 mt-auto">{card.updated}</p>
      </div>
    </Link>
  );
}
