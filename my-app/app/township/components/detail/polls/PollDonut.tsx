"use client";

// ================================================================
//  PollDonut — pure SVG donut chart, ported from the prototype's
//  pie() builder. Start at 12 o'clock, clockwise, inner radius at
//  58% of outer. Zero-vote polls render a neutral placeholder ring.
// ================================================================

export interface DonutSegment {
  value: number;
  color: string;
}

export default function PollDonut({
  segments,
  size = 150,
}: {
  segments: DonutSegment[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const ri = 0.58 * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const sum = total || 1;

  const paths: { d: string; color: string }[] = [];
  let angle = -Math.PI / 2; // 12 o'clock start
  const FULL = Math.PI * 2;

  for (const seg of segments) {
    if (seg.value <= 0) continue;
    // Clamp a full-circle sweep just under 360° so the arc renders.
    const sweep = Math.min((seg.value / sum) * FULL, FULL - 0.0001);
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const large = sweep > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + ri * Math.cos(a1);
    const y2 = cy + ri * Math.sin(a1);
    const x3 = cx + ri * Math.cos(a0);
    const y3 = cy + ri * Math.sin(a0);
    paths.push({
      d:
        `M${x0.toFixed(2)},${y0.toFixed(2)} ` +
        `A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} ` +
        `L${x2.toFixed(2)},${y2.toFixed(2)} ` +
        `A${ri},${ri} 0 ${large} 0 ${x3.toFixed(2)},${y3.toFixed(2)} Z`,
      color: seg.color,
    });
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
      role="img"
      aria-label="Poll results donut chart"
    >
      {total === 0 ? (
        <circle
          cx={cx}
          cy={cy}
          r={(r + ri) / 2}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={r - ri}
        />
      ) : (
        paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)
      )}
    </svg>
  );
}
