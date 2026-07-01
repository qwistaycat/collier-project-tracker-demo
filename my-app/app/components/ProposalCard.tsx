"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { ProposalCard as ProposalCardType } from "@/app/data/proposals";
import { ExternalLinkIcon } from "./icons";

interface ProposalCardProps {
  card: ProposalCardType;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
}

export default function ProposalCard({
  card,
  isFollowing,
  onToggleFollow,
}: ProposalCardProps) {
  const [hoveringBadge, setHoveringBadge] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBadgeEnter = useCallback(() => {
    if (!isFollowing) {
      setHoveringBadge(true);
      return;
    }
    hoverTimer.current = setTimeout(() => {
      setHoveringBadge(true);
    }, 180);
  }, [isFollowing]);

  const handleBadgeLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveringBadge(false);
  }, []);

  const handleFollowClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleFollow(card.id);
    },
    [card.id, onToggleFollow]
  );

  return (
    <Link href={card.link} className="card cursor-pointer group block">
      <div className="overflow-hidden rounded" style={{ position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image}
          alt={card.title}
          className="card-img w-full h-44 object-cover transition-all duration-200"
        />

        {/* Follow / Following pill */}
        <button
          className={`card-follow-btn${isFollowing ? " is-following" : ""}`}
          onClick={handleFollowClick}
          onMouseEnter={handleBadgeEnter}
          onMouseLeave={handleBadgeLeave}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            borderRadius: 9999,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "opacity 0.15s, background 0.18s",
            opacity: isFollowing ? 1 : 0,
            background: isFollowing
              ? hoveringBadge
                ? "#fef2f2"
                : "#2563eb"
              : hoveringBadge
                ? "#f3f4f6"
                : "white",
            color: isFollowing
              ? hoveringBadge
                ? "#dc2626"
                : "white"
              : "#111827",
            border: isFollowing
              ? hoveringBadge
                ? "1.5px solid #dc2626"
                : "1.5px solid #2563eb"
              : hoveringBadge
                ? "1.5px solid #d1d5db"
                : "1.5px solid #e5e7eb",
          }}
        >
          {isFollowing
            ? hoveringBadge
              ? "✕ Unfollow"
              : "✓ Following"
            : "+ Follow"}
        </button>
      </div>

      <div className="mt-2.5">
        {/* Dual tags: functional category + department */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold text-blue-600">
            {card.functionalCategory}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs font-medium text-gray-500">
            {card.department}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-400">Updated {card.updated}</span>
        </div>
        <div className="flex items-start justify-between gap-2 mt-1">
          <h3 className="card-title text-sm font-semibold text-gray-900 transition-colors duration-150">
            {card.title}
          </h3>
          <ExternalLinkIcon
            size={16}
            className="text-gray-400 mt-0.5 flex-shrink-0"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {card.description}
        </p>
      </div>
    </Link>
  );
}
