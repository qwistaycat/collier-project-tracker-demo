"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { TimelineStage } from "@/app/data/proposals";

interface TimelineProps {
  stages: TimelineStage[];
}

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
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to current stage on mount
  useEffect(() => {
    const card = cardRefs.current[initialIdx];
    const container = contentRef.current;
    if (card && container) {
      container.scrollTo({ top: card.offsetTop - 20, behavior: "instant" });
    }
  }, [initialIdx]);

  // Scroll handler — update sidebar highlight based on scroll position
  const handleScroll = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;
    const top = container.getBoundingClientRect().top;
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
  }, [stages, activeIdx]);

  const selectStage = (idx: number) => {
    setActiveIdx(idx);
    const card = cardRefs.current[idx];
    const container = contentRef.current;
    if (card && container) {
      container.scrollTo({ top: card.offsetTop - 20, behavior: "smooth" });
    }
  };

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
            const isActive = i === activeIdx;

            const nameColor = isActive
              ? "white"
              : stage.status === "future"
              ? "#94a3b8"
              : "#1e293b";
            const dateColor = isActive ? "#93c5fd" : "#94a3b8";

            return (
              <div
                key={i}
                className={`tl-item${isActive ? " tl-active" : ""}`}
                onClick={() => selectStage(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  margin: "0 8px",
                  cursor: "pointer",
                  borderRadius: 8,
                  alignSelf: "stretch",
                  background: isActive ? "#0d2240" : "transparent",
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
                      fontWeight: 600,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: nameColor,
                    }}
                  >
                    {stage.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      margin: "3px 0 0 0",
                      color: dateColor,
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
        style={{ flex: 1, overflowY: "scroll", padding: "20px 24px" }}
      >
        {stages.map((stage, i) => {
          const isCurrent = stage.status === "current";
          return (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                border: isCurrent
                  ? "2px solid #0d2240"
                  : "1px solid #e2e8f0",
                background: "white",
                borderRadius: 10,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0d2240",
                  margin: "0 0 4px 0",
                }}
              >
                {stage.label}
              </h4>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2563eb",
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
                  color: "#374151",
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
                    color: "#374151",
                    lineHeight: 1.8,
                  }}
                >
                  {stage.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
              {stage.status === "future" && (
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
      </div>
    </div>
  );
}
