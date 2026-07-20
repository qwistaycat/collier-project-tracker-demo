"use client";

import { useRef, useState } from "react";
import type { ProposalDetail } from "@/app/data/proposals";
import {
  MapPinIcon,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./icons";

type ViewMode = "map" | "photos";

/** Optional read-only location highlights layered over the map view.
 *  Coordinates are percentages of the map pane. */
export interface MapHighlightPin {
  x: number;
  y: number;
  label?: string;
}
export interface MapHighlightArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

function findMeta(p: ProposalDetail, match: (label: string) => boolean) {
  return p.metadata.find((m) => match(m.label.toLowerCase()))?.value ?? "";
}

export default function ProjectMapCard({
  p,
  pins,
  area,
}: {
  p: ProposalDetail;
  pins?: MapHighlightPin[];
  area?: MapHighlightArea | null;
}) {
  const [view, setView] = useState<ViewMode>("map");
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const dept = findMeta(p, (l) => l.includes("sponsor"));
  const duration = findMeta(p, (l) => l.includes("duration"));
  const budget = findMeta(p, (l) => l.includes("cost"));

  const photoCount = p.photos.length;
  const goTo = (i: number) => setPhotoIndex(((i % photoCount) + photoCount) % photoCount);
  const prev = () => goTo(photoIndex - 1);
  const next = () => goTo(photoIndex + 1);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 8,
    border: active ? "1px solid #0d2240" : "1px solid #e5e7eb",
    background: active ? "#0d2240" : "white",
    color: active ? "white" : "#6b7280",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        minHeight: 360,
      }}
    >
      {/* Left info column */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          padding: "24px 22px",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {p.title}
        </h3>

        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: "#9ca3af",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            Responsible Dept
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "pre-line" }}>
            {dept}
          </p>
        </div>

        <div style={{ marginTop: 18 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: "#9ca3af",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            Duration
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
            {duration}
          </p>
        </div>

        <div style={{ marginTop: 18 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: "#9ca3af",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            Budget
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
            {budget}
          </p>
        </div>

        {/* Map / Photos toggle */}
        <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", gap: 8 }}>
          <button
            aria-label="Show map"
            onClick={() => setView("map")}
            style={toggleBtnStyle(view === "map")}
          >
            <MapPinIcon size={16} />
          </button>
          <button
            aria-label="Show photos"
            onClick={() => setView("photos")}
            style={toggleBtnStyle(view === "photos")}
          >
            <ImageIcon size={16} />
          </button>
        </div>
      </div>

      {/* Right map / photo carousel panel */}
      <div style={{ flex: 1, position: "relative", background: "#f3f4f6" }}>
        {view === "map" ? (
          <>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-80.18%2C40.32%2C-79.98%2C40.42&layer=mapnik"
              style={{
                width: "100%",
                height: "100%",
                minHeight: 360,
                border: "none",
                display: "block",
              }}
              title="Project Location Map"
            />
            {area && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.w}%`,
                  height: `${area.h}%`,
                  border: "2px solid #2563eb",
                  background: "rgba(37, 99, 235, 0.12)",
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
              />
            )}
            {(pins ?? []).map((pin, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: "translate(-50%, -100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <span style={{ color: "#DC2626", display: "flex" }}>
                  <MapPinIcon size={26} />
                </span>
                {pin.label && (
                  <span
                    style={{
                      marginTop: 2,
                      background: "rgba(255,255,255,0.94)",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    }}
                  >
                    {pin.label}
                  </span>
                )}
              </div>
            ))}
          </>
        ) : (
          <div
            style={{ position: "relative", width: "100%", height: "100%", minHeight: 360 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.photos[photoIndex]}
              alt={`${p.title} photo ${photoIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 360,
                objectFit: "cover",
                display: "block",
              }}
            />

            {photoCount > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  onClick={prev}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 34,
                    height: 34,
                    borderRadius: 9999,
                    border: "none",
                    background: "rgba(255,255,255,0.85)",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <ChevronLeftIcon size={18} />
                </button>
                <button
                  aria-label="Next photo"
                  onClick={next}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 34,
                    height: 34,
                    borderRadius: 9999,
                    border: "none",
                    background: "rgba(255,255,255,0.85)",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <ChevronRightIcon size={18} />
                </button>

                {/* Dot indicators */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 6,
                  }}
                >
                  {p.photos.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to photo ${i + 1}`}
                      onClick={() => goTo(i)}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 9999,
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        background:
                          i === photoIndex ? "white" : "rgba(255,255,255,0.5)",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
