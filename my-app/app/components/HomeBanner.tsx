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
//  Slides sit in a horizontal flex track that we translateX to move
//  between them (not a hard image swap), so arrows/dots/auto-rotate/
//  swipe all produce the same sliding motion. A clone of the last
//  slide is prepended and a clone of the first slide is appended so
//  wrapping past either end still slides in the right direction; once
//  that slide-onto-a-clone transition finishes we snap (no transition)
//  back to the matching real slide — the standard infinite-carousel
//  trick, invisible to the user.
//
//  `index` (the real, always-bounded 0..count-1 slide) is the single
//  source of truth; `trackIndex` (the visual track position, including
//  the two clone slots) is only ever set to one of a fixed set of valid
//  values derived from it. This matters because a background/inactive
//  tab can throttle timers and CSS transitionend unreliably — an
//  earlier version incremented trackIndex forever and depended on
//  transitionend to fold it back into range, so a single missed fold
//  (very likely after being away for a while) left the track scrolled
//  past every real slide, i.e. a blank banner until a hard refresh.
//  Deriving trackIndex from a bounded index instead means the worst a
//  stalled snap can do is leave you parked one clone slide off (which
//  looks identical to the real one) — never off the rendered track.
//
//  Structural note: this is the banner only. The rest of the updated
//  homepage layout (Filter & Search button in the navbar, a "Your
//  Followed Projects" band, horizontally-scrolling category rows) is
//  intentionally out of scope for this pass.
// ================================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalCard } from "@/app/data/proposals";
import { isClosingSoon } from "@/app/data/proposals";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "./icons";

/** Auto-rotate interval, ms. */
const ROTATE_INTERVAL = 4000;
/** Slide transition duration — keep in sync with the transition CSS below. */
const SLIDE_MS = 600;

export default function HomeBanner({ cards }: { cards: ProposalCard[] }) {
  const router = useRouter();
  const count = cards.length;
  const canLoop = count > 1;

  // slides = the visual track. With >1 real card we bookend it with a
  // clone of the last card and a clone of the first card so a step past
  // either edge slides into a lookalike neighbor instead of jump-cutting.
  const slides = canLoop ? [cards[count - 1], ...cards, cards[0]] : cards;
  // Where the track sits when parked on real slide `i` (no clone offset
  // to account for when there's nothing to loop).
  const restingTrackIndex = (i: number) => (canLoop ? i + 1 : 0);

  // The real, always-bounded active slide (0..count-1). Single source of
  // truth — every navigation path (arrow/dot/swipe/auto-rotate) updates
  // this via plain modulo arithmetic, so it can never drift out of range
  // no matter how many ticks pile up while the tab is backgrounded.
  const [index, setIndex] = useState(0);
  // Visual track position, including the two clone slots. Only ever set
  // to restingTrackIndex(index) or, transiently, to a single clone slot
  // (0 or slides.length - 1) while animating across a wrap.
  const [trackIndex, setTrackIndex] = useState(restingTrackIndex(0));
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  // Bumped on any manual navigation (arrow, dot, swipe) so the auto-rotate
  // effect below tears down and restarts its timer — otherwise a manual
  // click right before the tick would get instantly overridden by it.
  const [manualNavCount, setManualNavCount] = useState(0);

  const indexRef = useRef(index);
  const touchStartX = useRef<number | null>(null);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Moves to real slide `nextIndex`, choosing whether to slide straight
  // there or via a bookend clone (when it's a wrap-around step), then
  // schedules the invisible snap back to the canonical resting position.
  const stepTo = (nextIndex: number) => {
    const cur = indexRef.current;
    const forwardWrap = canLoop && cur === count - 1 && nextIndex === 0;
    const backwardWrap = canLoop && cur === 0 && nextIndex === count - 1;

    setIndex(nextIndex);
    setWithTransition(true);

    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }

    if (!canLoop) {
      setTrackIndex(0);
      return;
    }

    if (forwardWrap) {
      setTrackIndex(slides.length - 1); // slide onto the clone-of-first
      snapTimeoutRef.current = setTimeout(() => {
        setWithTransition(false);
        setTrackIndex(restingTrackIndex(nextIndex));
      }, SLIDE_MS);
    } else if (backwardWrap) {
      setTrackIndex(0); // slide onto the clone-of-last
      snapTimeoutRef.current = setTimeout(() => {
        setWithTransition(false);
        setTrackIndex(restingTrackIndex(nextIndex));
      }, SLIDE_MS);
    } else {
      setTrackIndex(restingTrackIndex(nextIndex));
    }
  };

  const step = (delta: 1 | -1) => {
    const cur = indexRef.current;
    stepTo(((cur + delta) % count + count) % count);
  };

  // Auto-rotate: advances one slide every ROTATE_INTERVAL while there's
  // more than one card. Paused on hover so residents can actually read a
  // slide instead of racing the timer. Also stops outright while the tab
  // is hidden and restarts (with a defensive resync to the canonical
  // position) when it becomes visible again, instead of letting ticks
  // pile up silently in the background.
  useEffect(() => {
    if (!canLoop) return;

    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id !== null) return;
      id = setInterval(() => step(1), ROTATE_INTERVAL);
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      // Coming back from a while away: guarantee we're parked on a real
      // slide (never a stranded clone) before resuming.
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
      setWithTransition(false);
      setTrackIndex(restingTrackIndex(indexRef.current));
      if (!isPaused) start();
    };

    if (!isPaused && !document.hidden) start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoop, isPaused, manualNavCount, count]);

  // Clear any pending snap timeout on unmount.
  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };
  }, []);

  if (count === 0) return null;

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    step(-1);
    setManualNavCount((n) => n + 1);
  };
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    step(1);
    setManualNavCount((n) => n + 1);
  };
  const goToIndex = (i: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    stepTo(i);
    setManualNavCount((n) => n + 1);
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

  return (
    <div
      style={{ position: "relative", marginBottom: 40 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Card spans the full content width — same edges as the section
          card grid below. The arrows float outside that width via
          negative offsets rather than squeezing the card to make room. */}
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          height: 380,
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(100 / slides.length) * trackIndex}%)`,
            transition: withTransition
              ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : "none",
          }}
        >
          {slides.map((c, i) => (
            <BannerSlide
              key={i}
              card={c}
              widthPct={100 / slides.length}
              isActive={i === trackIndex}
              onOpen={() => router.push(c.link)}
            />
          ))}
        </div>
      </div>

      {canLoop && (
        <>
          <button
            aria-label="Previous featured project"
            onClick={prev}
            style={arrowButtonStyle("left")}
          >
            <ChevronLeftIcon size={18} />
          </button>
          <button
            aria-label="Next featured project"
            onClick={next}
            style={arrowButtonStyle("right")}
          >
            <ChevronRightIcon size={18} />
          </button>
        </>
      )}

      {canLoop && (
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
              onClick={(e) => goToIndex(i, e)}
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

function BannerSlide({
  card,
  widthPct,
  isActive,
  onOpen,
}: {
  card: ProposalCard;
  widthPct: number;
  isActive: boolean;
  onOpen: () => void;
}) {
  const closingSoon = isClosingSoon(card.commentDeadline);

  return (
    <div
      onClick={onOpen}
      role="link"
      tabIndex={isActive ? 0 : -1}
      aria-hidden={!isActive}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      style={{
        display: "flex",
        flex: `0 0 ${widthPct}%`,
        width: `${widthPct}%`,
        height: "100%",
        cursor: "pointer",
        background: "#ffffff",
      }}
    >
      {/* Left: photo pane. The container itself is a standard 4:3 box
          (sized off the card's height, not stretched to whatever width
          the flex split leaves over), and the photo fills it via a
          centered cover crop — so it reads as a normal photo, not a
          stretched banner strip. */}
      <div
        style={{
          flexShrink: 0,
          height: "100%",
          aspectRatio: "4 / 3",
          position: "relative",
          background: "#f3f4f6",
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
            objectPosition: "center",
            display: "block",
          }}
        />

        {closingSoon && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#CD481B",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              padding: "7px 14px",
              borderRadius: 9999,
              boxShadow: "0 6px 14px rgba(220, 38, 38, 0.35)",
            }}
          >
            <ClockIcon size={13} />
            Closing Soon
          </div>
        )}
      </div>

      {/* Right: text content. Takes whatever width the fixed-4:3 photo
          pane on the left doesn't use. */}
      <div
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "36px 44px 40px",
        }}
      >
        <div style={{ marginTop: "auto" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#2563eb",
              margin: "0 0 8px 0",
            }}
          >
            {card.functionalCategory}
          </p>
          <h2
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#0d2240",
              margin: "0 0 12px 0",
              lineHeight: 1.15,
            }}
          >
            {card.title}
          </h2>
          <p
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function arrowButtonStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    // Sits outside the card's own edge rather than shrinking the card to
    // make room, so the card stays exactly as wide as the section card
    // grid below it.
    [side]: -56,
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: 9999,
    border: "none",
    background: "#ffffff",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
    zIndex: 2,
  };
}
