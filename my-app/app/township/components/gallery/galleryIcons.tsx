// ================================================================
//  Gallery-local icons — glyphs the shared icons.tsx lacks, defined
//  here to keep the gallery namespace self-contained (per the
//  foundation's no-shared-edits rule). Follows the IconProps pattern
//  from app/components/icons.tsx.
// ================================================================

import React from "react";
import type { Lifecycle } from "../../data";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** Filled star — spotlight badge / "Spotlighted only" toggle. */
export function StarFilledIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M12 2l2.92 6.26 6.58.57-5 4.4 1.5 6.5L12 16.9l-6 2.83 1.5-6.5-5-4.4 6.58-.57L12 2z" />
    </svg>
  );
}

/** Pencil — card "edit" overlay button. */
export function PencilIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      style={style}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
      />
    </svg>
  );
}

/** Speech bubble — comment counts / activity feed. */
export function CommentBubbleIcon({ size = 13, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      style={style}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      />
    </svg>
  );
}

/** Four-point sparkle — AI-assist affordances (violet accent). */
export function SparkleIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M12 2l2.2 5.9L20 10l-5.8 2.1L12 18l-2.2-5.9L4 10l5.8-2.1L12 2z" />
      <path d="M19 15l1.1 2.9L23 19l-2.9 1.1L19 23l-1.1-2.9L15 19l2.9-1.1L19 15z" />
    </svg>
  );
}

/** User-plus — "new followers" activity rows. */
export function UserPlusIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      style={style}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM20 8v6M23 11h-6"
      />
    </svg>
  );
}

/** Right arrow — stage-update activity rows. */
export function StageArrowIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      style={style}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Trend chevron — engagement panel (paths from the prototype). */
export function TrendIcon({
  dir,
  size = 14,
  style,
}: IconProps & { dir: "up" | "down" | "flat" }) {
  const d = dir === "up" ? "M5 15l7-7 7 7" : dir === "down" ? "M5 9l7 7 7-7" : "M5 12h14";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      style={style}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/** Busy spinner (SMIL rotation — no CSS keyframes needed). */
export function SpinnerIcon({ size = 12, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path
        d="M12 2a10 10 0 019.95 9"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

/** Lifecycle-pill glyphs keyed by lifecycle (per the prototype's LC_ICON). */
const LC_PATHS: Record<Lifecycle, string> = {
  draft: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  pending: "M6 2h12M6 22h12M8 2v4l4 4 4-4V2M8 22v-4l4-4 4 4v4",
  published:
    "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  unpublished:
    "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  completed: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  archived: "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14",
};

export function LcGlyph({ lc, size = 11, style }: IconProps & { lc: Lifecycle }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      style={style}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={LC_PATHS[lc]} />
    </svg>
  );
}
