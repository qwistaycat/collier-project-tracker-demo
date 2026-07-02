"use client";

import { useState } from "react";
import Link from "next/link";
import {
  proposalRegistry,
  FUNCTIONAL_CATEGORIES,
  type FunctionalCategory,
  type ProposalCard,
} from "@/app/data/proposals";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "./icons";

interface SidebarProps {
  currentProposalId: string;
}

export default function Sidebar({ currentProposalId }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const currentProposal = proposalRegistry[currentProposalId];

  // Start with current proposal's category open; null = all collapsed
  const [openCategory, setOpenCategory] = useState<FunctionalCategory | null>(
    currentProposal?.functionalCategory ?? null
  );

  // Hover states
  const [hoveredCat, setHoveredCat] = useState<FunctionalCategory | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Toggle: clicking open category collapses it; clicking another switches
  const toggleCategory = (cat: FunctionalCategory) => {
    setOpenCategory((prev) => (prev === cat ? null : cat));
  };

  // Group proposals by category
  const byCategory = FUNCTIONAL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = Object.values(proposalRegistry).filter(
        (p) => p.functionalCategory === cat
      );
      return acc;
    },
    {} as Record<FunctionalCategory, ProposalCard[]>
  );

  return (
    <>
      <aside
        style={{
          width: isOpen ? 288 : 0,
          flexShrink: 0,
          background: "#f3f4f6",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          transition: "width 0.25s ease",
        }}
      >
        <div style={{ width: 288, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Nav utility row */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 10px",
              background: "#f3f4f6",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                color: "#9ca3af",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <ChevronLeftIcon size={14} />
              All Projects
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: 16,
                lineHeight: 1,
                padding: "4px 6px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Scrollable accordion body */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
            {FUNCTIONAL_CATEGORIES.map((cat) => {
              const isExpanded = openCategory === cat;
              const proposals = byCategory[cat] ?? [];
              const hasCurrentInCategory = proposals.some(p => p.id === currentProposalId);
              // Show indicator whenever this category contains the current proposal
              const showIndicator = hasCurrentInCategory;

              return (
                <div key={cat}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    onMouseEnter={() => setHoveredCat(cat)}
                    onMouseLeave={() => setHoveredCat(null)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px 10px",
                      border: "none",
                      borderLeft: showIndicator ? "3px solid #2563eb" : "3px solid transparent",
                      borderBottom: isExpanded
                        ? "1px solid rgba(0,0,0,0.07)"
                        : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      position: isExpanded ? "sticky" : "static",
                      top: 0,
                      zIndex: 2,
                      backgroundColor: hoveredCat === cat ? "#e8eaed" : "#f3f4f6",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: showIndicator ? "#2563eb" : "#0d2240",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        lineHeight: 1.3,
                        transition: "color 0.15s ease",
                      }}
                    >
                      {cat}
                    </span>
                    <span
                      style={{
                        color: "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <ChevronDownIcon size={14} />
                    </span>
                  </button>

                  {/* Proposal cards — animated with CSS grid trick */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isExpanded ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.25s ease",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: "10px 12px 14px",
                      }}
                    >
                      {proposals.map((p) => {
                        const isCurrent = p.id === currentProposalId;
                        return (
                          <Link
                            key={p.id}
                            href={p.link}
                            onMouseEnter={() => setHoveredCard(p.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                              textDecoration: "none",
                              borderRadius: 12,
                              padding: "6px 8px",
                              minHeight: 68,
                              border: isCurrent
                                ? "2px solid #2563eb"
                                : "1.5px solid rgba(0,0,0,0.08)",
                              background: isCurrent ? "#eff6ff" : "#ffffff",
                              boxShadow: hoveredCard === p.id
                                ? "0 4px 10px rgba(0,0,0,0.10)"
                                : "0 1px 2px rgba(16,24,40,.04)",
                              transform: hoveredCard === p.id ? "translateY(-1px)" : "none",
                              transition: "box-shadow 0.15s ease, transform 0.15s ease",
                            }}
                          >
                            {/* Thumbnail */}
                            <div
                              style={{
                                width: 72,
                                height: 72,
                                flexShrink: 0,
                                borderRadius: 8,
                                overflow: "hidden",
                                outline: isCurrent
                                  ? "2px solid #2563eb"
                                  : "none",
                                outlineOffset: -1,
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.image}
                                alt={p.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: isCurrent ? 700 : 600,
                                  color: isCurrent ? "#1d4ed8" : "#1f2937",
                                  lineHeight: 1.35,
                                  marginBottom: 3,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {p.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11.5,
                                  color: isCurrent ? "#3b82f6" : "#6b7280",
                                }}
                              >
                                Updated {p.updated}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Reopen button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            left: 0,
            top: 72,
            zIndex: 100,
            background: "#0d2240",
            color: "white",
            border: "none",
            borderRadius: "0 6px 6px 0",
            padding: "10px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronRightIcon />
        </button>
      )}
    </>
  );
}
