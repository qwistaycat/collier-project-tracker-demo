"use client";

// ================================================================
//  Lightweight inline-SVG charts for the staff portal — donut pie,
//  trend line, multi-series line, stacked columns, and a 100%
//  stacked sentiment area. No chart library; matches the flat,
//  hairline-bordered look of the design system.
// ================================================================

import React from "react";

export function DonutPie({
  data,
  size = 120,
  centerLabel,
}: {
  data: Array<{ value: number; color: string }>;
  size?: number;
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  const inner = r * 0.58;

  // Precompute each segment's angle range with a plain loop
  const segData: Array<{ color: string; frac: number; a0: number; a1: number }> = [];
  let acc = -Math.PI / 2;
  for (const d of data) {
    if (d.value <= 0) continue;
    const frac = d.value / total;
    segData.push({ color: d.color, frac, a0: acc, a1: acc + frac * Math.PI * 2 });
    acc += frac * Math.PI * 2;
  }

  const segs = segData.map((d, i) => {
    if (d.frac >= 0.9999) {
      return (
        <circle key={i} cx={r} cy={r} r={(r + inner) / 2} fill="none" stroke={d.color} strokeWidth={r - inner} />
      );
    }
    const large = d.a1 - d.a0 > Math.PI ? 1 : 0;
    const p = (a: number, rad: number) => `${r + rad * Math.cos(a)},${r + rad * Math.sin(a)}`;
    const path = [
      `M ${p(d.a0, r)}`,
      `A ${r} ${r} 0 ${large} 1 ${p(d.a1, r)}`,
      `L ${p(d.a1, inner)}`,
      `A ${inner} ${inner} 0 ${large} 0 ${p(d.a0, inner)}`,
      "Z",
    ].join(" ");
    return <path key={i} d={path} fill={d.color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={(r + inner) / 2} fill="none" stroke="#F1F5F9" strokeWidth={r - inner} />
      {segs}
      {centerLabel && (
        <text
          x={r}
          y={r}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.13}
          fontWeight={700}
          fill="#111827"
        >
          {centerLabel}
        </text>
      )}
    </svg>
  );
}

export function TrendLine({
  points,
  color = "#2563EB",
  width = 260,
  height = 64,
}: {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points) || 1;
  const pad = 4;
  const xy = points.map((v, i) => [
    pad + (i / (points.length - 1)) * (width - pad * 2),
    height - pad - (v / max) * (height - pad * 2),
  ]);
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`).join(" ");
  const area = `${line} L ${xy[xy.length - 1][0]},${height - pad} L ${xy[0][0]},${height - pad} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      <path d={area} fill={color} opacity={0.1} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r={3} fill={color} />
    </svg>
  );
}

export interface LineSeries {
  label: string;
  color: string;
  data: number[];
  dashed?: boolean;
}

export function MultiLine({
  series,
  labels,
  width = 640,
  height = 220,
}: {
  series: LineSeries[];
  labels: string[];
  width?: number;
  height?: number;
}) {
  const padL = 34;
  const padB = 22;
  const padT = 10;
  const padR = 10;
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const n = Math.max(...series.map((s) => s.data.length), labels.length);
  const x = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (width - padL - padR));
  const y = (v: number) => padT + (1 - v / max) * (height - padT - padB);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={y(t)} x2={width - padR} y2={y(t)} stroke="#F1F5F9" strokeWidth={1} />
          <text x={padL - 6} y={y(t)} textAnchor="end" dominantBaseline="central" fontSize={9} fill="#94A3B8">
            {t}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={9} fill="#94A3B8">
          {l}
        </text>
      ))}
      {series.map((s, si) => {
        const line = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)},${y(v)}`).join(" ");
        return (
          <path
            key={si}
            d={line}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            strokeLinecap="round"
            opacity={s.dashed ? 0.55 : 1}
          />
        );
      })}
    </svg>
  );
}

export function StackCols({
  cols,
  colors,
  labels,
  width = 640,
  height = 220,
}: {
  /** cols[i] = array of segment values for column i (bottom-up) */
  cols: number[][];
  colors: string[];
  labels: string[];
  width?: number;
  height?: number;
}) {
  const padL = 34;
  const padB = 22;
  const padT = 10;
  const padR = 10;
  const totals = cols.map((c) => c.reduce((s, v) => s + v, 0));
  const max = Math.max(1, ...totals);
  const innerW = width - padL - padR;
  const bw = Math.min(34, (innerW / Math.max(cols.length, 1)) * 0.6);
  const y = (v: number) => padT + (1 - v / max) * (height - padT - padB);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={padL} y1={y(max * f)} x2={width - padR} y2={y(max * f)} stroke="#F1F5F9" strokeWidth={1} />
      ))}
      {cols.map((col, ci) => {
        const cx = padL + ((ci + 0.5) / cols.length) * innerW;
        let acc = 0;
        return (
          <g key={ci}>
            {col.map((v, si) => {
              const y1 = y(acc + v);
              const h = y(acc) - y1;
              acc += v;
              return <rect key={si} x={cx - bw / 2} y={y1} width={bw} height={h} fill={colors[si]} rx={1} />;
            })}
            <text x={cx} y={height - 6} textAnchor="middle" fontSize={9} fill="#94A3B8">
              {labels[ci]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AreaStack({
  points,
  labels,
  width = 640,
  height = 200,
}: {
  /** 100%-stacked sentiment points: supportive / mixed / concerns */
  points: Array<{ s: number; m: number; c: number }>;
  labels: string[];
  width?: number;
  height?: number;
}) {
  const padL = 34;
  const padB = 22;
  const padT = 10;
  const padR = 10;
  const n = points.length;
  const x = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (width - padL - padR));
  const y = (pct: number) => padT + (1 - pct / 100) * (height - padT - padB);

  // cumulative boundaries: bottom band = supportive, middle = mixed, top = concerns
  const b1 = points.map((p) => p.s);
  const b2 = points.map((p) => p.s + p.m);

  const band = (lower: number[] | null, upper: number[], color: string) => {
    const top = upper.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)},${y(v)}`).join(" ");
    const bottomPts = lower
      ? [...lower].reverse().map((v, ri) => `L ${x(n - 1 - ri)},${y(v)}`)
      : [`L ${x(n - 1)},${y(0)}`, `L ${x(0)},${y(0)}`];
    return <path d={`${top} ${bottomPts.join(" ")} Z`} fill={color} opacity={0.75} />;
  };

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
      {[0, 50, 100].map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={width - padR} y2={y(t)} stroke="#F1F5F9" strokeWidth={1} />
          <text x={padL - 6} y={y(t)} textAnchor="end" dominantBaseline="central" fontSize={9} fill="#94A3B8">
            {t}%
          </text>
        </g>
      ))}
      {band(null, b1, "#16A34A")}
      {band(b1, b2, "#D97706")}
      {band(b2, points.map(() => 100), "#DC2626")}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={9} fill="#94A3B8">
          {l}
        </text>
      ))}
    </svg>
  );
}
