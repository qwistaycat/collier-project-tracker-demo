"use client";

// ================================================================
//  HomeBanner — homepage hero carousel.
//
//  Spotlights the proposals whose public comment period is closing
//  soonest (see getFeaturedBannerCards in app/data/proposals), so
//  residents land on what needs their input right now. Purely a
//  visual/navigational entry point — clicking a slide (outside the
//  arrow buttons) opens that proposal's detail page.
//
//  Structural note: this is the banner only. The rest of the updated
//  homepage layout (Filter & Search button in the navbar, a "Your
//  Followed Projects" band, horizontally-scrolling category rows) is
//  intentionally out of scope for this pass.
// ================================================================

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalCard } from "@/app/data/proposals";
import { isClosingSoon } from "@/app/data/proposals";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "./icons";

export default function HomeBanner({ cards }: { cards: ProposalCard[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = cards.length;
  if (count === 0) return null;

  const goTo = (i: number) => setIndex(((i % count) + count) % count);
  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo(index - 1);
  };
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo(index + 1);
  };

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

  const card = cards[index];
  const closingSoon = isClosingSoon(card.commentDeadline);

  return (
    <div
      style={{ position: "relative", marginBottom: 40 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        onClick={() => router.push(card.link)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(card.link);
        }}
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          height: 400,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image}
          alt={card.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Bottom gradient scrim for text legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {closingSoon && (
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#dc2626",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              padding: "7px 14px",
              borderRadius: 9999,
            }}
          >
            <ClockIcon size={13} />
            Closing Soon
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 28,
            color: "white",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#93c5fd",
              margin: "0 0 6px 0",
            }}
          >
            {card.functionalCategory}
          </p>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              margin: "0 0 10px 0",
              lineHeight: 1.15,
            }}
          >
            {card.title}
          </h2>
          <p
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              maxWidth: 640,
              lineHeight: 1.5,
            }}
          >
            {card.description}
          </p>
        </div>

        {count > 1 && (
          <>
            <button
              aria-label="Previous featured project"
              onClick={prev}
              style={navButtonStyle("left")}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              aria-label="Next featured project"
              onClick={next}
              style={navButtonStyle("right")}
            >
              <ChevronRightIcon size={18} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          {cards.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to featured project ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 9999,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === index ? "#2563eb" : "#d1d5db",
                transition: "width 0.2s ease, background 0.2s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function navButtonStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 16,
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: 9999,
    border: "none",
    background: "rgba(255,255,255,0.9)",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
  };
}
