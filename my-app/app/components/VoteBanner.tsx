"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PieChartIcon, MinimizeIcon, DragHandleIcon } from "./icons";

type VoteChoice = "agree" | "disagree" | "neutral";

interface VoteState {
  agree: number;
  disagree: number;
  neutral: number;
  userVote: VoteChoice | null;
}

const MORPH_DUR = 480;

export default function VoteBanner({
  discussionRef,
}: {
  discussionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  const [panel, setPanel] = useState<"voting" | "results" | "chip">("voting");
  const [voteState, setVoteState] = useState<VoteState>({
    agree: 2,
    disagree: 3,
    neutral: 8,
    userVote: null,
  });

  const bannerRef = useRef<HTMLDivElement>(null);

  const [yOffset, setYOffset] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startYOffset = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    e.stopPropagation();

    isDragging.current = true;
    startY.current = e.clientY;
    startYOffset.current = yOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaY = moveEvent.clientY - startY.current;
      const proposedYOffset = startYOffset.current + deltaY;
      const proposedBottom = 28 - proposedYOffset;
      
      const minBottom = 10;
      const maxBottom = window.innerHeight - 150;
      const constrainedBottom = Math.max(minBottom, Math.min(maxBottom, proposedBottom));
      
      setYOffset(28 - constrainedBottom);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [yOffset]);

  // Show banner when discussion section is scrolled near the top of the screen
  useEffect(() => {
    const disc = discussionRef.current;
    if (!disc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        // Shrink the viewport interaction box from the bottom by 80% so that
        // the intersection only triggers when the discussion section is scrolled
        // into the top 20% of the viewport.
        rootMargin: "0px 0px -80% 0px",
        threshold: 0,
      }
    );
    observer.observe(disc);
    return () => observer.disconnect();
  }, [discussionRef]);

  const total = voteState.agree + voteState.disagree + voteState.neutral;
  const pct = (key: VoteChoice) => Math.round((voteState[key] / total) * 100);

  const castVote = useCallback((choice: VoteChoice) => {
    setVoteState((prev) => ({
      ...prev,
      [choice]: prev[choice] + 1,
      userVote: choice,
    }));
    setPanel("results");
  }, []);

  const editVote = useCallback(() => {
    setVoteState((prev) => {
      if (!prev.userVote) return prev;
      return {
        ...prev,
        [prev.userVote]: prev[prev.userVote] - 1,
        userVote: null,
      };
    });
    setPanel("voting");
  }, []);

  const closeBanner = useCallback(() => {
    setPanel("chip");
  }, []);

  const reopenBanner = useCallback(() => {
    setPanel(voteState.userVote ? "results" : "voting");
  }, [voteState.userVote]);

  // ── Pie chart SVG ──

  const buildPie = () => {
    const cx = 60,
      cy = 60,
      r = 50;
    const segments: {
      key: VoteChoice;
      color: string;
      label: string;
    }[] = [
        { key: "neutral", color: "#a8d8ea", label: "Neutral / Unsure" },
        { key: "disagree", color: "#f97316", label: "Disagree" },
        { key: "agree", color: "#22c55e", label: "Agree" },
      ];

    const toXY = (angleDeg: number, radius: number) => {
      const rad = ((angleDeg - 90) * Math.PI) / 180;
      return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
    };

    let angle = 0;
    const paths = segments.map((seg) => {
      const sweep = (voteState[seg.key] / total) * 360;
      const [x1, y1] = toXY(angle, r);
      const [x2, y2] = toXY(angle + sweep, r);
      const large = sweep > 180 ? 1 : 0;
      const [lx, ly] = toXY(angle + sweep / 2, r * 0.58);
      const p = pct(seg.key);
      const isUser = seg.key === voteState.userVote;

      const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;

      angle += sweep;
      return (
        <g key={seg.key}>
          <path d={d} fill={seg.color} stroke="#0d3266" strokeWidth="2" />
          {isUser ? (
            <>
              <text
                x={lx}
                y={ly - 7}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#111"
              >
                {p}%
              </text>
              <text
                x={lx}
                y={ly + 9}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#111"
              >
                (You)
              </text>
            </>
          ) : (
            <text
              x={lx}
              y={ly + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#111"
            >
              {p}%
            </text>
          )}
        </g>
      );
    });

    return { paths, segments };
  };

  if (!visible) return null;

  // Chip state (minimized pill)
  if (panel === "chip") {
    return (
      <div
        ref={bannerRef}
        onClick={reopenBanner}
        style={{
          position: "fixed",
          bottom: 28 - yOffset,
          right: 32,
          zIndex: 1000,
          width: 198,
          height: 44,
          background: "#0d3266",
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(13,50,102,0.28)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "0 16px 0 28px",
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          className="custom-tooltip-wrap"
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "ns-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 2px",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <DragHandleIcon size={14} />
          <span className="custom-tooltip-text">Drag up/down</span>
        </div>
        <PieChartIcon size={14} className="text-white" />
        <span
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {voteState.userVote ? "See poll results" : "Vote in poll"}
        </span>
      </div>
    );
  }

  const { paths: piePaths, segments: pieSegments } = buildPie();

  return (
    <div
      ref={bannerRef}
      className={visible ? "vote-banner-visible" : ""}
      style={{
        position: "fixed",
        bottom: 28 - yOffset,
        right: 32,
        zIndex: 1000,
        width: 380,
        background: "#0d3266",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        overflow: "visible",
      }}
    >
      {/* Drag handle — positioned in the top-left corner */}
      <div
        onMouseDown={handleMouseDown}
        className="custom-tooltip-wrap"
        style={{
          position: "absolute",
          left: 16,
          top: 14,
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          color: "rgba(255, 255, 255, 0.35)",
          zIndex: 10,
        }}
      >
        <DragHandleIcon size={16} />
        <span className="custom-tooltip-text">Drag up/down</span>
      </div>
      {/* Minimize button — always visible on voting and results panels */}
      <button
        onClick={closeBanner}
        className="custom-tooltip-wrap tooltip-align-right"
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.55)",
          cursor: "pointer",
          padding: 4,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Minimize"
      >
        <MinimizeIcon size={16} />
        <span className="custom-tooltip-text">Minimize</span>
      </button>

      {/* Panel A: Vote prompt */}
      {panel === "voting" && (
        <div style={{ padding: 24 }}>
          <h2
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              margin: "16px 0 8px 0",
            }}
          >
            Poll Voting
          </h2>
          <p
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              margin: "0 0 4px 0",
            }}
          >
            Your input shapes what the Township decides.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              lineHeight: 1.6,
              margin: "0 0 20px 0",
            }}
          >
            The more residents weigh in here, the clearer the signal becomes
            when commissioners make their final vote.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <button
              onClick={() => castVote("agree")}
              style={{
                width: "100%",
                padding: 11,
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                background: "#22c55e",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              I support this
            </button>
            <button
              onClick={() => castVote("disagree")}
              style={{
                width: "100%",
                padding: 11,
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                background: "#f87171",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              I do not support this
            </button>
            <button
              onClick={() => castVote("neutral")}
              style={{
                width: "100%",
                padding: 11,
                borderRadius: 9999,
                border: "1.5px solid rgba(255,255,255,0.6)",
                cursor: "pointer",
                background: "transparent",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Neutral/Unsure
            </button>
          </div>
        </div>
      )}

      {/* Panel B: Results */}
      {panel === "results" && (
        <div style={{ padding: 24 }}>
          <h2
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              margin: "16px 0 12px 0",
              paddingRight: 24,
            }}
          >
            Poll Results
          </h2>

          {/* Pie + legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {total} votes
              </div>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {piePaths}
              </svg>
            </div>
            <div style={{ lineHeight: 1.9, flex: 1 }}>
              {pieSegments.map((seg) => {
                const p = pct(seg.key);
                const isUser = seg.key === voteState.userVote;
                return (
                  <div
                    key={seg.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: seg.color,
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: isUser ? 700 : 400,
                      }}
                    >
                      {p}% {seg.label}
                      {isUser ? " (You)" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              lineHeight: 1.6,
              margin: "0 0 16px 0",
            }}
          >
            The township will consider this poll alongside other inputs when
            making decisions. These numbers are not a binding vote.
          </p>

          <button
            onClick={editVote}
            style={{
              width: "100%",
              padding: 11,
              borderRadius: 9999,
              border: "1.5px solid white",
              cursor: "pointer",
              background: "white",
              color: "#0d3266",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Edit my vote
          </button>
        </div>
      )}
    </div>
  );
}
