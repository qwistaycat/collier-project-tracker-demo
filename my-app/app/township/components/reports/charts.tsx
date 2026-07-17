"use client";

// ================================================================
//  Reports — tiny inline-SVG chart primitives (no chart library).
//  Ports of the prototype's multiLine / stackCols / areaStack.
// ================================================================

const W = 660;

export interface LineSeries {
  color: string;
  pts: number[];
}

/** Multi-line chart with hairline gridlines; optional dashed compare twins (×0.78). */
export function MultiLineChart({
  series,
  height = 200,
  compare = false,
}: {
  series: LineSeries[];
  height?: number;
  compare?: boolean;
}) {
  const all = series.flatMap((s) => s.pts);
  const ymax = Math.max(...(all.length ? all : [1]), 1) * 1.1;
  const line = (pts: number[]) =>
    pts
      .map(
        (v, i) =>
          `${(i / Math.max(pts.length - 1, 1)) * W},${height - (v / ymax) * height}`
      )
      .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block" }}
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={W}
          y1={height * f}
          y2={height * f}
          stroke="#F1F5F9"
          strokeWidth={1}
        />
      ))}
      {compare &&
        series.map((s, i) => (
          <polyline
            key={`c${i}`}
            fill="none"
            stroke={s.color}
            strokeWidth={2.4}
            opacity={0.5}
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={line(s.pts.map((v) => Math.round(v * 0.78)))}
          />
        ))}
      {series.map((s, i) => (
        <polyline
          key={i}
          fill="none"
          stroke={s.color}
          strokeWidth={2.4}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line(s.pts)}
        />
      ))}
    </svg>
  );
}

/** Per-quarter stacked columns with x-labels below. */
export function StackedColumnChart({
  rows,
  colors,
  labels,
  height = 190,
}: {
  rows: number[][];
  colors: string[];
  labels: string[];
  height?: number;
}) {
  const n = Math.max(rows.length, 1);
  const gap = Math.min(16, 240 / n);
  const barW = (W - gap * (n + 1)) / n;
  const ymax = Math.max(...rows.map((r) => r.reduce((a, b) => a + b, 0)), 1) * 1.05;
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block" }}
      >
        {rows.map((r, i) => {
          let y = height;
          const x = gap + i * (barW + gap);
          return r.map((v, j) => {
            const seg = (v / ymax) * height;
            y -= seg;
            return (
              <rect key={`${i}-${j}`} x={x} y={y} width={barW} height={seg} fill={colors[j]} />
            );
          });
        })}
      </svg>
      <div style={{ display: "flex", marginTop: 6, padding: `0 ${gap / 2}px` }}>
        {labels.map((l) => (
          <span
            key={l}
            style={{ flex: 1, textAlign: "center", fontSize: 10.5, color: "#9ca3af" }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 100%-stacked area chart for sentiment (green bottom / amber middle / red top). */
export function AreaStackChart({
  data,
  height = 170,
}: {
  data: { s: number; m: number; c: number }[];
  height?: number;
}) {
  const n = data.length;
  if (!n) return null;
  const xs = data.map((_, i) => (n > 1 ? (i / (n - 1)) * W : 0));
  const y1 = data.map((d) => {
    const t = d.s + d.m + d.c || 1;
    return height - (d.s / t) * height;
  });
  const y2 = data.map((d) => {
    const t = d.s + d.m + d.c || 1;
    return height - ((d.s + d.m) / t) * height;
  });
  const band = (top: number[], bottom: number[]) =>
    xs.map((x, i) => `${x},${top[i]}`).join(" ") +
    " " +
    xs
      .map((x, i) => `${x},${bottom[i]}`)
      .reverse()
      .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block" }}
    >
      <polygon points={band(y1, xs.map(() => height))} fill="#16A34A" opacity={0.85} />
      <polygon points={band(y2, y1)} fill="#D97706" opacity={0.85} />
      <polygon points={band(xs.map(() => 0), y2)} fill="#DC2626" opacity={0.85} />
    </svg>
  );
}
