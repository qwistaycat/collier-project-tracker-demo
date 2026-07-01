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
  const [openCategory, setOpenCategory] = useState<FunctionalCategory>(
    currentProposal?.functionalCategory ?? FUNCTIONAL_CATEGORIES[0]
  );

  // Group all proposals by functional category
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
          width: isOpen ? 280 : 0,
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
        <div
          style={{
            width: 280,
            padding: 16,
            flex: 1,
            overflowY: "auto",
          }}
        >
          {/* Header: back to dashboard + close */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                color: "#6b7280",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <ChevronLeftIcon size={16} />
              All Projects
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: 18,
                lineHeight: 1,
                padding: "4px 6px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Category accordion */}
          {FUNCTIONAL_CATEGORIES.map((cat) => {
            const isExpanded = openCategory === cat;
            const proposals = byCategory[cat] ?? [];
            const hasCurrentInCategory = proposals.some(
              (p) => p.id === currentProposalId
            );

            return (
              <div key={cat} style={{ marginBottom: 4 }}>
                {/* Category header button */}
                <button
                  onClick={() => setOpenCategory(cat)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: isExpanded ? "#0d2240" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isExpanded ? "white" : "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      lineHeight: 1.3,
                      flex: 1,
                      paddingRight: 8,
                    }}
                  >
                    {cat}
                    {/* Dot indicator when this category has the current proposal but isn't expanded */}
                    {hasCurrentInCategory && !isExpanded && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          marginLeft: 6,
                          verticalAlign: "middle",
                          marginBottom: 1,
                        }}
                      />
                    )}
                  </span>
                  <span
                    style={{
                      color: isExpanded ? "white" : "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <ChevronDownIcon size={14} />
                  </span>
                </button>

                {/* Proposal list (only when expanded) */}
                {isExpanded && (
                  <div style={{ marginTop: 4, paddingLeft: 4 }}>
                    {proposals.map((p) => {
                      const isCurrent = p.id === currentProposalId;
                      return (
                        <Link
                          key={p.id}
                          href={p.link}
                          className="sidebar-card"
                          style={{
                            display: "block",
                            textDecoration: "none",
                            background: isCurrent ? "#1e3a5f" : "#e5e7eb",
                            borderRadius: 8,
                            padding: "11px 13px",
                            marginBottom: 6,
                            borderLeft: isCurrent
                              ? "3px solid #60a5fa"
                              : "3px solid transparent",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: isCurrent ? 700 : 500,
                              lineHeight: 1.35,
                              marginBottom: 4,
                              color: isCurrent ? "white" : "#1f2937",
                            }}
                          >
                            {p.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: isCurrent ? "#93c5fd" : "#6b7280",
                            }}
                          >
                            Updated {p.updated}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
