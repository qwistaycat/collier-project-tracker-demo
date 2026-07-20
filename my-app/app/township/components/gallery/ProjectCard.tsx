"use client";

// ================================================================
//  ProjectCard — one gallery card, a direct port of the resident
//  ProposalCard (shared/components/ProposalCard.tsx): same tokens,
//  layout, meta line, hover overlay, and hover border. The staff
//  affordance is a single "Edit" pill sitting where the resident
//  Follow button sits, styled with the Follow button's tokens.
// ================================================================

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTownshipRecentlyViewed } from "../../TownshipRecentlyViewedContext";
import { catFull, catHeroImage, updatedLabel, type StaffProject } from "../../data";
import { PencilIcon } from "./galleryIcons";

const clamp2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export default function ProjectCard({ project: p }: { project: StaffProject }) {
  const router = useRouter();
  const { recordView } = useTownshipRecentlyViewed();
  const [cardHovered, setCardHovered] = useState(false);
  const [editHovered, setEditHovered] = useState(false);

  const open = () => {
    recordView(p.id);
    router.push(`/township/project/${p.id}?tab=details`);
  };

  return (
    <div
      onClick={open}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => {
        setCardHovered(false);
        setEditHovered(false);
      }}
      style={{
        position: "relative",
        background: "#ffffff",
        border: `1px solid ${cardHovered ? "#2563eb" : "#e5e7eb"}`,
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: cardHovered
          ? "0 6px 12px -3px rgba(0, 0, 0, 0.08), 0 3px 5px -2px rgba(0, 0, 0, 0.04)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        transition:
          "background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: 160, background: "#f3f4f6" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={catHeroImage(p.cat, p.id)}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* Hover overlay – dims only the photo area */}
        {cardHovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              background: "rgba(13, 34, 64, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: "#ffffff",
                textAlign: "center",
                letterSpacing: 0.3,
                opacity: 0.6,
              }}
            >
              Click To View Project Detail
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: 14, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#2563eb" }}>
            {catFull(p.cat)}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6, marginRight: 6 }}>·</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#6b7280",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexShrink: 1,
            }}
          >
            {p.deptShort}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6, marginRight: 6 }}>·</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{updatedLabel(p.edited)}</span>
        </div>

        <div
          style={{
            ...clamp2,
            fontSize: 15,
            fontWeight: 600,
            color: "#111827",
            lineHeight: "20px",
            marginBottom: 6,
          }}
        >
          {p.title}
        </div>

        <div style={{ ...clamp2, fontSize: 13, color: "#6b7280", lineHeight: "18px" }}>
          {p.desc}
        </div>
      </div>

      {/* Edit pill – Follow button position, tokens, and hover behavior */}
      {cardHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          onMouseEnter={() => setEditHovered(true)}
          onMouseLeave={() => setEditHovered(false)}
          aria-label="Edit project"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 9999,
            padding: "6px 14px",
            border: `1px solid ${editHovered ? "#2563eb" : "#e5e7eb"}`,
            background: editHovered ? "#eff6ff" : "#ffffff",
            fontSize: 12,
            fontWeight: 600,
            color: editHovered ? "#2563eb" : "#111827",
            cursor: "pointer",
            transition: "background-color 0.15s ease, border-color 0.15s ease",
          }}
        >
          <PencilIcon size={12} />
          Edit
        </button>
      )}
    </div>
  );
}
