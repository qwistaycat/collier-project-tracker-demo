"use client";

// ================================================================
//  ResidentPreview — in-page rendering of the resident proposal
//  view for one staff project, shown when the detail screen's
//  Editing / Resident Preview toggle is set to preview. Reuses the
//  actual resident components (ProjectMapCard, Timeline,
//  Discussion) with the staff project's data adapted into their
//  prop shapes — so what staff see here is exactly what the
//  resident page renders. Only Published stages appear, matching
//  what residents would actually get.
// ================================================================

import ProjectMapCard from "@/app/components/ProjectMapCard";
import Timeline from "@/app/components/Timeline";
import Discussion from "@/app/components/Discussion";
import { EyeIcon, ExternalLinkIcon, PlusIcon } from "@/app/components/icons";
import {
  discussionData,
  type ProposalDetail,
  type TimelineStage,
  type DiscussionData,
} from "@/app/data/proposals";
import { avatarColor, catHeroImage } from "../../data";
import type { XProject } from "./shared";

// ── Adapters: StaffProject → resident prop shapes ────────────────

function toProposalDetail(p: XProject): ProposalDetail {
  return {
    id: p.id,
    title: p.title,
    heroImage: catHeroImage(p.cat, p.id),
    photos: ["a", "b", "c", "d"].map(
      (s) => `https://picsum.photos/seed/${p.id}-${s}/900/600`
    ),
    lastUpdated: p.edited,
    projectLink: "#",
    meetingLink: "#",
    description: p.desc,
    funding: p.funding,
    details: "",
    metadata: [
      { label: "Project Sponsor", value: p.sponsor },
      { label: "Duration", value: p.duration },
      { label: "Total Project Cost", value: p.cost },
    ],
  };
}

function toTimelineStages(p: XProject): TimelineStage[] {
  return p.stages.map((s) => ({
    label: s.title,
    status:
      s.n < p.current ? "completed" : s.n === p.current ? "current" : "future",
    date: s.dates,
    description: s.desc,
    bullets: s.bullets,
  }));
}

function toDiscussionData(p: XProject): DiscussionData {
  return {
    private: { ...discussionData.private, pastFeedback: [] },
    public: {
      ...discussionData.public,
      viewCount: p.followers,
      comments: p.public.map((c) => ({
        user: c.anon ? "Anonymous Resident" : c.name,
        avatarColor: avatarColor(c.name),
        timeAgo: c.time,
        message: c.text,
        replies: c.replies.map((r) => ({
          user: r.attr === "name" && r.name ? r.name : "Township Staff",
          isOfficial: true,
          avatarColor: "#0d2240",
          timeAgo: r.time,
          message: r.text,
        })),
      })),
    },
  };
}

// ── Component ────────────────────────────────────────────────────

const linkPill: React.CSSProperties = {
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
};

export default function ResidentPreview({ project: p }: { project: XProject }) {
  const detail = toProposalDetail(p);
  const stages = toTimelineStages(p);
  // undefined = demo default ("#"), null = removed by staff
  const projectLink = p.projectLink === null ? null : (p.projectLink ?? "#");
  const meetingLink = p.meetingLink === null ? null : (p.meetingLink ?? "#");

  return (
    <div>
      {/* Status strip — keeps staff oriented (visibility of system status) */}
      <div
        style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 12.5,
          color: "#1E40AF",
        }}
      >
        <EyeIcon size={14} />
        <span>
          <strong>Resident Preview.</strong>{" "}
          This is the project as residents see it — staff tools are hidden, and
          interactions here aren&apos;t saved.
        </span>
      </div>

      {/* Hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={detail.heroImage}
        alt={p.title}
        style={{
          width: "100%",
          height: 260,
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 className="text-2xl font-bold text-gray-900" style={{ margin: "28px 0 0 0" }}>
          {p.title}
        </h1>

        {/* Follow + Last updated — Follow is display-only in preview */}
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
          <button
            disabled
            title="Residents can follow this project — preview only"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              borderRadius: 9999,
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 600,
              background: "white",
              color: "#2563eb",
              border: "2px solid #2563eb",
              cursor: "default",
            }}
          >
            <PlusIcon size={14} /> Follow Project
          </button>
          <span style={{ fontSize: 13, fontStyle: "italic", color: "#6b7280" }}>
            Last updated {p.edited}
          </span>
        </div>

        {/* Description */}
        <p style={{ marginTop: 20, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
          {p.desc}
        </p>

        {/* Funding */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr",
            gap: "14px 20px",
            marginTop: 16,
            alignItems: "start",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Funding:</span>
          <div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: "0 0 12px 0" }}>
              {p.funding}
            </p>
            {(projectLink !== null || meetingLink !== null) && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {projectLink !== null && (
                  <a href={projectLink || "#"} style={linkPill}>
                    <ExternalLinkIcon size={15} /> Link to Project
                  </a>
                )}
                {meetingLink !== null && (
                  <a href={meetingLink || "#"} style={linkPill}>
                    <ExternalLinkIcon size={15} /> Link to Meeting Notes
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project info + Map/Photos card, with any highlighted locations */}
        <ProjectMapCard p={detail} pins={p.pins} area={p.area} />

        {/* Timeline */}
        <div style={{ marginTop: "2.5rem" }}>
          {stages.length > 0 ? (
            <Timeline stages={stages} />
          ) : (
            <p style={{ fontSize: 13, fontStyle: "italic", color: "#9ca3af" }}>
              No stages yet — residents will see the project timeline here once
              stages are added.
            </p>
          )}
        </div>

        {/* Discussion */}
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <Discussion data={toDiscussionData(p)} />
        </div>
      </div>
    </div>
  );
}
