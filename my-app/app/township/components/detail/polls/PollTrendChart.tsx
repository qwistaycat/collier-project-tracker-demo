"use client";

// ================================================================
//  PollTrendChart — pure SVG cumulative-vote line + area, ported
//  from the prototype's line() builder. Stretches to card width
//  via preserveAspectRatio="none". No axes/ticks/labels by design.
// ================================================================

export default function PollTrendChart({
  points,
  width = 300,
  height = 80,
  color = "#2563EB",
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const pts = points.length ? points : [0, 0];
  const max = Math.max(...pts) * 1.1 || 1;
  const step = width / Math.max(pts.length - 1, 1);
  const coords = pts.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const lineD = `M${coords.join(" L")}`;
  const areaD = `${lineD} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block" }}
      role="img"
      aria-label="Vote trend over time"
    >
      <path d={areaD} fill={color} opacity={0.1} />
      <path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
