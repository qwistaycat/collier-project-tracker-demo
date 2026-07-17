"use client";

// ================================================================
//  ProjectCard — one gallery card. Whole card navigates to the
//  project detail (Details tab). Hero overlays: spotlight badge,
//  "Preview as resident" eye (new-tab /proposal), and a pencil
//  that also opens the detail screen. Lifecycle tints the card
//  background; spotlighted projects get the #BFDBFE border.
// ================================================================

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon } from "@/app/components/icons";
import { CAT_META, catHeroImage, lcMeta, type StaffProject } from "../../data";
import { StarFilledIcon, PencilIcon, CommentBubbleIcon, LcGlyph } from "./galleryIcons";

const CARD_BG: Partial<Record<string, string>> = {
  draft: "#FBFCFD",
  completed: "#F8FAFC",
  pending: "#FFFDF7",
};

const overlayChip: React.CSSProperties = {
  position: "absolute",
  top: 10,
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "rgba(255,255,255,.92)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0d2240",
  cursor: "pointer",
  padding: 0,
};

export default function ProjectCard({ project: p }: { project: StaffProject }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const meta = lcMeta(p.lc);
  const cat = CAT_META[p.cat];
  const unread = p.public.length + p.privateMsgs.length;

  const open = () => router.push(`/township/project/${p.id}?tab=details`);

  return (
    <div
      onClick={open}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: CARD_BG[p.lc] ?? "#fff",
        border: `1px solid ${p.spotlight ? "#BFDBFE" : "#e5e7eb"}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        opacity: p.lc === "archived" ? 0.82 : 1,
        boxShadow: hover ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
        transition: "box-shadow 0.15s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero strip */}
      <div style={{ position: "relative", height: 96, background: cat.bg, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={catHeroImage(p.cat, p.id)}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {p.spotlight && (
          <span
            title={`Spotlighted through ${p.spotlight.end} by ${p.spotlight.by}`}
            style={{
              ...overlayChip,
              left: 10,
              width: 26,
              height: 26,
              background: "rgba(255,255,255,.94)",
              color: "#2563eb",
              cursor: "default",
            }}
          >
            <StarFilledIcon size={15} />
          </span>
        )}
        <a
          href="/proposal"
          target="_blank"
          rel="noopener noreferrer"
          title="Preview as resident"
          aria-label="Preview as resident"
          onClick={(e) => e.stopPropagation()}
          style={{ ...overlayChip, right: 44 }}
        >
          <EyeIcon size={15} />
        </a>
        <button
          title="Manage project"
          aria-label="Manage project"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          style={{ ...overlayChip, right: 10 }}
        >
          <PencilIcon size={14} />
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "14px 15px",
          display: "flex",
          flexDirection: "column",
          gap: 7,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: cat.color,
              background: cat.bg,
              padding: "2px 7px",
              borderRadius: 5,
            }}
          >
            {p.cat}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#475569",
              background: "#F1F5F9",
              padding: "2px 7px",
              borderRadius: 5,
            }}
          >
            {p.deptShort}
          </span>
        </div>

        <div style={{ fontSize: 12, color: "#94A3B8" }}>Last edited {p.edited}</div>

        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
          {p.title}
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: "#475569",
            lineHeight: 1.45,
            height: 36,
            overflow: "hidden",
          }}
        >
          {p.desc}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              color: meta.c,
              background: meta.bg,
              padding: "2px 9px 2px 7px",
              borderRadius: 20,
            }}
          >
            <LcGlyph lc={p.lc} size={11} />
            {meta.label}
          </span>
          {p.spotlight && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#2563eb",
                background: "#EFF6FF",
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              Spotlighted
            </span>
          )}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#475569",
              marginLeft: "auto",
            }}
          >
            <CommentBubbleIcon size={13} style={{ color: "#94A3B8" }} />
            {unread}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          style={{
            width: "100%",
            height: 36,
            background: "#F8FAFC",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#0d2240",
            cursor: "pointer",
            marginTop: 5,
            transition: "background 0.15s ease",
          }}
        >
          Manage Project
        </button>
      </div>
    </div>
  );
}
