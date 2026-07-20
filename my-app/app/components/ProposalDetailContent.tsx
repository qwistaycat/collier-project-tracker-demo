"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import {
  proposalData,
  timelineStages,
  discussionData,
} from "@/app/data/proposals";
import Sidebar from "./Sidebar";
import Timeline from "./Timeline";
import Discussion from "./Discussion";
import VoteBanner from "./VoteBanner";
import ProjectMapCard from "./ProjectMapCard";
import { ExternalLinkIcon, PlusIcon, CheckIcon, CloseIcon } from "./icons";

// ── Follow helpers ──────────────────────────────────────────────

const FOLLOW_KEY = "collier_followed";

function getFollowedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
  } catch {
    return [];
  }
}

function setFollowed(id: string, follow: boolean) {
  const list = getFollowedIds();
  const idx = list.indexOf(id);
  if (follow && idx === -1) list.push(id);
  if (!follow && idx !== -1) list.splice(idx, 1);
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
  followListeners.forEach((l) => l());
}

// Follow state is read via useSyncExternalStore (server snapshot:
// not following) — no hydrate-in-effect pass needed.
const followListeners = new Set<() => void>();
function subscribeFollow(listener: () => void) {
  followListeners.add(listener);
  return () => followListeners.delete(listener);
}

// ── Component ───────────────────────────────────────────────────

export default function ProposalDetailContent() {
  const following = useSyncExternalStore(
    subscribeFollow,
    () => getFollowedIds().includes(proposalData.id),
    () => false
  );
  const [hovering, setHovering] = useState(false);
  const discussionRef = useRef<HTMLDivElement>(null);

  const toggleFollow = () => {
    setFollowed(proposalData.id, !following);
  };

  const p = proposalData;

  return (
    <>
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 56px)",
          position: "relative",
        }}
      >
        <Sidebar currentProposalId={proposalData.id} />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Hero image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.heroImage}
            alt={p.title}
            style={{
              width: "100%",
              height: 260,
              objectFit: "cover",
              display: "block",
            }}
          />

          <div style={{ padding: "0 2rem 2rem 2rem" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              {/* Title */}
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ margin: "28px 0 0 0" }}
              >
                {p.title}
              </h1>

              {/* Follow + Last updated */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                <div className="custom-tooltip-wrap" style={{ position: "relative" }}>
                  <button
                    onClick={toggleFollow}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      borderRadius: 9999,
                      padding: "10px 22px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.15s, color 0.15s",
                      background: following
                        ? hovering
                          ? "#FBF0EA"
                          : "#0d2240"
                        : hovering
                          ? "#eff6ff"
                          : "white",
                      color: following
                        ? hovering
                          ? "#CD481B"
                          : "white"
                        : "#2563eb",
                      border: following
                        ? hovering
                          ? "2px solid #CD481B"
                          : "2px solid #0d2240"
                        : "2px solid #2563eb",
                      boxShadow:
                        following && !hovering
                          ? "0 1px 4px rgba(0,0,0,0.18)"
                          : "none",
                    }}
                  >
                    {following ? (
                      hovering ? (
                        <>
                          <CloseIcon size={14} /> Unfollow
                        </>
                      ) : (
                        <>
                          <CheckIcon size={14} /> Following
                        </>
                      )
                    ) : (
                      <>
                        <PlusIcon size={14} /> Follow Project
                      </>
                    )}
                  </button>
                  <span className="custom-tooltip-text">
                    Get notifications and saves to Your Following Projects in home page
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontStyle: "italic",
                    color: "#6b7280",
                  }}
                >
                  Last updated {p.lastUpdated}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  marginTop: 20,
                  fontSize: 13,
                  color: "#374151",
                  lineHeight: 1.7,
                }}
              >
                {p.description}
              </p>

              {/* Funding + Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr",
                  gap: "14px 20px",
                  marginTop: 16,
                  alignItems: "start",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#111827",
                  }}
                >
                  Funding:
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {p.funding}
                </p>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#111827",
                  }}
                >
                  Details:
                </span>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#374151",
                      lineHeight: 1.7,
                      margin: "0 0 12px 0",
                    }}
                  >
                    {p.details}
                  </p>
                  <div
                    style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                  >
                    <a
                      href={p.projectLink}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        border: "1px solid #e5e7eb",
                        borderRadius: 9999,
                        padding: "6px 14px",
                        color: "#6b7280",
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: "none",
                        background: "white",
                      }}
                    >
                      <ExternalLinkIcon size={15} /> Link to Project
                    </a>
                    <a
                      href={p.meetingLink}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        border: "1px solid #e5e7eb",
                        borderRadius: 9999,
                        padding: "6px 14px",
                        color: "#6b7280",
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: "none",
                        background: "white",
                      }}
                    >
                      <ExternalLinkIcon size={15} /> Link to Meeting Notes
                    </a>
                  </div>
                </div>
              </div>

              {/* Project info + Map/Photos card */}
              <ProjectMapCard p={p} />

              {/* Timeline — anchor target for stage notifications */}
              <div id="timeline" style={{ marginTop: "2.5rem", scrollMarginTop: 70 }}>
                <Timeline stages={timelineStages} />
              </div>

              {/* Discussion — anchor target for reply notifications */}
              <div
                id="discussion"
                ref={discussionRef}
                style={{ marginTop: "2rem", marginBottom: "2rem", scrollMarginTop: 70 }}
              >
                <Discussion data={discussionData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating vote banner */}
      <VoteBanner discussionRef={discussionRef} />
    </>
  );
}
