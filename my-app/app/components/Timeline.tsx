"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { TimelineStage } from "@/app/data/proposals";

interface TimelineProps {
  stages: TimelineStage[];
}

// Fixed top offset (px) that a selected stage's card scrolls to.
// Gap between cards is always half of this, keeping the two consistent.
const TOP_OFFSET = 24;
const CARD_GAP = TOP_OFFSET / 2;

// Shared by the selected-card solid border AND the selected-future-card
// dashed border, so the two are always the exact same thickness.
const SELECTED_BORDER_WIDTH = 2;

function TimelineCircle({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#0d2240",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path
            d="M2.5 5.5l2 2L8.5 3.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  } else if (status === "current") {
    return (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#0d2240",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "white",
          }}
        />
      </div>
    );
  } else {
    return (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "2px solid #94a3b8",
          background: "#f1f5f9",
          flexShrink: 0,
        }}
      />
    );
  }
}

function tlLineStyle(isSolid: boolean): React.CSSProperties {
  return isSolid
    ? { width: 2, background: "#0d2240" }
    : {
      width: 2,
      background:
        "repeating-linear-gradient(to bottom,#94a3b8 0px,#94a3b8 5px,transparent 5px,transparent 10px)",
    };
}

export default function Timeline({ stages }: TimelineProps) {
  const initialIdx = Math.max(
    0,
    stages.findIndex((s) => s.status === "current")
  );
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const [selectedInView, setSelectedInView] = useState(true);
  // Mouse hover is tracked as state (not CSS :hover) because hovering
  // either side must highlight BOTH the left item and the right card —
  // a plain :hover pseudo-class can only affect the element under the
  // cursor, so it can't sync the other side.
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  // True while a free (non-click) scroll is actively in motion. While this
  // is true, hover is ignored for secondary-selected styling — otherwise
  // a stationary cursor left over some card would keep highlighting it at
  // the same time the scroll-tracked card is highlighted, showing two
  // "secondary" cards at once. Scrolling always wins.
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  // Keep a trailing spacer tall enough that ANY card — including the last —
  // can be scrolled to sit at exactly TOP_OFFSET from the top, instead of
  // getting clamped early because there isn't enough content below it.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const updateSpacer = () =>
      setSpacerHeight(Math.max(0, container.clientHeight - TOP_OFFSET));
    updateSpacer();
    const ro = new ResizeObserver(updateSpacer);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Scrolls a card to the fixed TOP_OFFSET position. Shared by the mount
  // effect (instant) and selectStage (smooth) so there's one place that
  // knows how a card gets positioned. Returns whether it actually scrolled
  // (refs may not be attached yet), so callers can decide whether to arm
  // the isScrollingRef guard.
  const scrollCardIntoPosition = useCallback(
    (idx: number, behavior: ScrollBehavior) => {
      const card = cardRefs.current[idx];
      const container = contentRef.current;
      if (!card || !container) return false;
      container.scrollTo({ top: card.offsetTop - TOP_OFFSET, behavior });
      return true;
    },
    []
  );

  // Scroll to current stage on mount
  useEffect(() => {
    scrollCardIntoPosition(initialIdx, "instant");
  }, [initialIdx, scrollCardIntoPosition]);

  // Scroll handler — update sidebar highlight based on scroll position
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    setIsUserScrolling(true);
    const container = contentRef.current;
    if (!container) return;
    const top = container.getBoundingClientRect().top;
    const bottom = container.getBoundingClientRect().bottom;
    let closest = activeIdx;
    let minDist = Infinity;
    stages.forEach((_, i) => {
      const card = cardRefs.current[i];
      if (!card) return;
      const dist = Math.abs(card.getBoundingClientRect().top - top);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIdx(closest);

    // Check if the selected card is still visible in the scroll container
    const selectedCard = cardRefs.current[selectedIdx];
    if (selectedCard) {
      const cardRect = selectedCard.getBoundingClientRect();
      const isVisible = cardRect.bottom > top + 20 && cardRect.top < bottom - 20;
      setSelectedInView(isVisible);
    }

    // Once a free (non-click) scroll settles — same moment the CSS
    // scroll-snap lands a card at TOP_OFFSET — that card becomes the
    // selection, exactly as if it had been clicked. This keeps "the card
    // pinned at top" and "the selected card" as always the same card.
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      setSelectedIdx(closest);
      setSelectedInView(true);
      setIsUserScrolling(false);
    }, 150);
  }, [stages, activeIdx, selectedIdx]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  const selectStage = (idx: number) => {
    setActiveIdx(idx);
    setSelectedIdx(idx);
    setSelectedInView(true);
    if (scrollCardIntoPosition(idx, "smooth")) {
      isScrollingRef.current = true;
      // Re-enable scroll handler after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  };

  // Selection state shared by both columns, computed once per stage index
  // instead of twice (left list + right cards independently re-deriving
  // the same isSelected/isSecondary logic) — that duplication is exactly
  // what let the two sides drift out of sync in earlier passes.
  const getSelectionState = (i: number) => {
    const isSelected = i === selectedIdx;
    const isHovered = !isUserScrolling && i === hoveredIdx;
    const isSecondary = !isSelected && (i === activeIdx || isHovered);
    return { isSelected, isHovered, isSecondary };
  };

  // Same hover-state writer used by both the left item and the right card,
  // so hovering either one updates hoveredIdx the same way.
  const handleHoverEnter = (i: number) => setHoveredIdx(i);
  const handleHoverLeave = (i: number) =>
    setHoveredIdx((cur) => (cur === i ? null : cur));

  // While a free scroll is in motion, neither side is meaningfully
  // "clickable" — cursor reflects that consistently on both sides.
  const idleCursor = isUserScrolling ? "default" : "pointer";

  return (
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        height: 480,
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Left: stage list */}
      <div
        style={{
          width: 244,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px 12px",
            flexShrink: 0,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0d2240",
              margin: 0,
            }}
          >
            Project Timeline
          </h3>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {stages.map((stage, i) => {
            const isFirst = i === 0;
            const isLast = i === stages.length - 1;
            // Selected = confirmed (click, or a scroll that has settled).
            // A border here would repeat the exact same border language the
            // right card already uses, right next to it — visually
            // redundant. So the left list marks "selected" through
            // typography instead: heavier weight + blue color on the
            // label, no border, no fill.
            // Secondary = real-time "tracking" while scrolling OR hovering
            // (either side), before it's confirmed. Styled like the nav's
            // category hover (flat tint only, no text-color change) so it
            // reads as a lighter step below the fully confirmed state. The
            // selected item still gets that same tint on hover, so it isn't
            // "dead" to the mouse just because it's already selected.
            const { isSelected, isHovered, isSecondary } = getSelectionState(i);
            const showTint = isSecondary || (isSelected && isHovered);

            const nameColor = isSelected
              ? "#1d4ed8"
              : stage.status === "future"
                ? "#94a3b8"
                : "#1e293b";
            const nameWeight = isSelected ? 800 : 600;
            const dateColor = isSelected ? "#2563eb" : "#94a3b8";
            const dateWeight = isSelected ? 700 : 400;
            const background = showTint ? "rgba(0, 0, 0, 0.05)" : "transparent";

            return (
              <div
                key={i}
                className="tl-item"
                onClick={() => selectStage(i)}
                onMouseEnter={() => handleHoverEnter(i)}
                onMouseLeave={() => handleHoverLeave(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  margin: "0 8px",
                  cursor: idleCursor,
                  borderRadius: 8,
                  alignSelf: "stretch",
                  background,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                    width: 24,
                    alignSelf: "stretch",
                  }}
                >
                  {/* Line above */}
                  {!isFirst ? (
                    <div
                      style={{
                        flex: "0 0 14px",
                        ...tlLineStyle(
                          stages[i - 1].status === "completed"
                        ),
                      }}
                    />
                  ) : (
                    <div style={{ flex: "0 0 14px" }} />
                  )}
                  <TimelineCircle status={stage.status} />
                  {/* Line below */}
                  {!isLast ? (
                    <div
                      style={{
                        flex: 1,
                        minHeight: 14,
                        ...tlLineStyle(stage.status === "completed"),
                      }}
                    />
                  ) : (
                    <div style={{ flex: "0 0 14px" }} />
                  )}
                </div>
                <div
                  style={{
                    padding: "10px 0 10px 10px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: nameWeight,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: nameColor,
                      transition: "color 0.3s ease, font-weight 0.15s ease",
                    }}
                  >
                    {stage.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: dateWeight,
                      margin: "3px 0 0 0",
                      color: dateColor,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {stage.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: scrollable cards */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="timeline-content"
        style={{
          flex: 1,
          overflowY: "scroll",
          padding: `${TOP_OFFSET}px 24px 0`,
          position: "relative",
          // Native scroll-snap: whenever a manual scroll (wheel/trackpad/
          // scrollbar drag) settles, the browser snaps to whichever card
          // is closest, aligned to its scroll-margin-top (TOP_OFFSET).
          scrollSnapType: "y mandatory",
        }}
      >
        {stages.map((stage, i) => {
          const isCurrent = stage.status === "current";
          const isFuture = stage.status === "future";
          const isLast = i === stages.length - 1;
          const { isSelected, isHovered, isSecondary } = getSelectionState(i);

          // Future stages have no border by default — they're distinguished
          // purely by muted (gray) text. A border only appears if a future
          // stage is selected, and even then it's dashed, never solid.
          // It's drawn via an SVG overlay (not CSS `dashed`, which renders
          // too fine) with no CSS border reserved, so the stroke sits flush
          // with the card's true edge instead of inset behind a border gap.
          const showFutureDash = isFuture && isSelected;
          const dashWidth = SELECTED_BORDER_WIDTH;
          // The confirmed-selected card keeps its own hover feedback too,
          // so it doesn't go "dead" to the mouse just because it's already
          // selected — but shadow only, no translateY shift. Shifting an
          // already-hovered element moves its own hit-test box out from
          // under a stationary cursor, which fires mouseleave, which drops
          // the shift, which moves the box back under the cursor and fires
          // mouseenter again — an infinite on/off loop. It's worst on the
          // future/dashed selected card because that one has no reserved
          // CSS border (border: none, the dash is a plain SVG overlay), so
          // its hit-test edge sits exactly on the visible dash line with
          // no buffer, and the cursor tends to rest right on that line.
          const showHoverShadow = isSecondary || (isSelected && isHovered);
          const border = isFuture
            ? "none"
            : isSelected
              ? `${SELECTED_BORDER_WIDTH}px solid rgba(37, 99, 235, ${selectedInView ? 1 : 0.35})`
              : "1px solid #e2e8f0";
          // Selected no longer changes the background — only the border and
          // headline color carry the confirmed-selected signal, so it reads
          // as a lighter-weight highlight instead of a heavy color block.
          const background = isFuture ? "#f8fafc" : "#ffffff";
          const headlineColor = isSelected ? "#1d4ed8" : isFuture ? "#94a3b8" : "#0d2240";
          const dateColor = isFuture ? "#94a3b8" : "#2563eb";
          const bodyColor = isFuture ? "#9ca3af" : "#374151";
          const dashOpacity = selectedInView ? 1 : 0.35;

          return (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => selectStage(i)}
              onMouseEnter={() => handleHoverEnter(i)}
              onMouseLeave={() => handleHoverLeave(i)}
              className="tl-card"
              style={{
                position: "relative",
                border,
                background,
                borderRadius: 10,
                padding: isSelected ? "20px 24px" : "21px 25px",
                marginBottom: isLast ? 0 : CARD_GAP,
                cursor: idleCursor,
                scrollSnapAlign: "start",
                scrollMarginTop: TOP_OFFSET,
                boxShadow: showHoverShadow ? "0 4px 10px rgba(0, 0, 0, 0.1)" : "none",
                transform: isSecondary ? "translateY(-1px)" : "none",
                transition:
                  "border 0.3s ease, background 0.3s ease, box-shadow 0.15s ease, transform 0.15s ease",
              }}
            >
              {showFutureDash && (
                <svg
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                >
                  <rect
                    x={dashWidth / 2}
                    y={dashWidth / 2}
                    width={`calc(100% - ${dashWidth}px)`}
                    height={`calc(100% - ${dashWidth}px)`}
                    rx={9}
                    ry={9}
                    fill="none"
                    stroke="#2563eb"
                    strokeOpacity={dashOpacity}
                    strokeWidth={dashWidth}
                    strokeDasharray="10 7"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: "0 0 4px 0",
                }}
              >
                <h4
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: headlineColor,
                    margin: 0,
                    transition: "color 0.3s ease",
                  }}
                >
                  {stage.label}
                </h4>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "white",
                      background: "#2563eb",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      lineHeight: "18px",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: dateColor,
                  margin: "0 0 10px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {stage.date}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: bodyColor,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {stage.description}
              </p>
              {stage.bullets.length > 0 && (
                <ul
                  style={{
                    margin: "10px 0 0 0",
                    paddingLeft: 20,
                    fontSize: 13,
                    color: bodyColor,
                    lineHeight: 1.8,
                  }}
                >
                  {stage.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
              {isFuture && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    margin: "10px 0 0 0",
                    fontStyle: "italic",
                  }}
                >
                  Details will be added as this stage approaches.
                </p>
              )}
            </div>
          );
        })}
        {/* Spacer so the last cards can still reach TOP_OFFSET when selected */}
        <div style={{ height: spacerHeight }} />
      </div>
    </div>
  );
}
