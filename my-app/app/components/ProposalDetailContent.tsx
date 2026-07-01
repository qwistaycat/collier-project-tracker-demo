"use client";

import { useState, useEffect, useRef } from "react";
import {
  proposalData,
  timelineStages,
  discussionData,
} from "@/app/data/proposals";
import Sidebar from "./Sidebar";
import Timeline from "./Timeline";
import Discussion from "./Discussion";
import VoteBanner from "./VoteBanner";
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
}

// ── Component ───────────────────────────────────────────────────

export default function ProposalDetailContent() {
  const [following, setFollowing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const discussionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFollowing(getFollowedIds().includes(proposalData.id));
  }, []);

  const toggleFollow = () => {
    const next = !following;
    setFollowed(proposalData.id, next);
    setFollowing(next);
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
                <div className="follow-tooltip-wrap" style={{ position: "relative" }}>
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
                          ? "#fef2f2"
                          : "#0d2240"
                        : hovering
                          ? "#eff6ff"
                          : "white",
                      color: following
                        ? hovering
                          ? "#dc2626"
                          : "white"
                        : "#2563eb",
                      border: following
                        ? hovering
                          ? "2px solid #dc2626"
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
                  <span className="follow-tooltip-text">
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

              {/* Metadata strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                {p.metadata.map((m, i) => {
                  const borderRight =
                    i < p.metadata.length - 1
                      ? "1px solid #e5e7eb"
                      : undefined;
                  const padding =
                    i === 0
                      ? "0 2rem 0 0"
                      : i === p.metadata.length - 1
                        ? "0 0 0 2rem"
                        : "0 2rem";

                  return (
                    <div
                      key={i}
                      style={{ padding, borderRight }}
                    >
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#111827",
                          lineHeight: 1.35,
                          margin: "0 0 6px 0",
                        }}
                      >
                        {m.value.split("\n").map((line, li) => (
                          <span key={li}>
                            {li > 0 && <br />}
                            {line}
                          </span>
                        ))}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          margin: 0,
                        }}
                      >
                        {m.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Map */}
              <div
                style={{
                  marginTop: 24,
                  overflow: "hidden",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                }}
              >
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-80.18%2C40.32%2C-79.98%2C40.42&layer=mapnik"
                  style={{
                    width: "100%",
                    height: 360,
                    border: "none",
                    display: "block",
                  }}
                  title="Project Location Map"
                />
              </div>

              {/* Timeline */}
              <div style={{ marginTop: "2.5rem" }}>
                <Timeline stages={timelineStages} />
              </div>

              {/* Discussion */}
              <div
                ref={discussionRef}
                style={{ marginTop: "2rem", marginBottom: "2rem" }}
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
