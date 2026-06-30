"use client";

import { useState } from "react";
import Link from "next/link";
import type { SidebarProposal } from "@/app/data/proposals";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface SidebarProps {
  proposals: SidebarProposal[];
}

export default function Sidebar({ proposals }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

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
        {/* Sidebar inner (fixed 280px so content doesn't squish during animation) */}
        <div
          style={{
            width: 280,
            padding: 16,
            flex: 1,
            overflowY: "auto",
          }}
        >
          {/* Header: back arrow + close */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                color: "#6b7280",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <ChevronLeftIcon />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: 18,
                lineHeight: 1,
                padding: "4px 6px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Proposal list */}
          {proposals.map((p, i) => (
            <Link
              key={i}
              href={p.link}
              className="sidebar-card"
              style={{
                display: "block",
                textDecoration: "none",
                background: p.isCurrent ? "#0d2240" : "#e5e7eb",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: 5,
                  color: p.isCurrent ? "white" : "#1f2937",
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: p.isCurrent ? "#93c5fd" : "#6b7280",
                }}
              >
                Last updated {p.updated}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Reopen button (shown when sidebar is collapsed) */}
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
