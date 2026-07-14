"use client";

import { useMemo, useState } from "react";

import { formatNaira } from "@/lib/format";
import { SEQUENTIAL_BLUE_DARK, SEQUENTIAL_BLUE_LIGHT } from "@/lib/chart-palette";
import { usePrefersDark } from "@/lib/use-prefers-dark";
import type { RevenuePoint } from "@/lib/revenue-utils";

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 5, 10];
  for (const step of steps) {
    if (value <= step * magnitude) return step * magnitude;
  }
  return 10 * magnitude;
}

export function RevenueLineChart({ data }: { data: RevenuePoint[] }) {
  const prefersDark = usePrefersDark();
  const lineColor = prefersDark ? SEQUENTIAL_BLUE_DARK : SEQUENTIAL_BLUE_LIGHT;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = useMemo(() => niceMax(Math.max(...data.map((d) => d.value), 0)), [data]);

  const points = useMemo(
    () =>
      data.map((d, i) => {
        const x = PADDING.left + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth);
        const y = PADDING.top + plotHeight - (d.value / maxValue) * plotHeight;
        return { ...d, x, y };
      }),
    [data, maxValue, plotWidth, plotHeight]
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${PADDING.top + plotHeight} L${points[0].x},${
          PADDING.top + plotHeight
        } Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxValue * t));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Revenue over time">
        {yTicks.map((tick) => {
          const y = PADDING.top + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
              />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
                {tick >= 1_000_000 ? `${(tick / 1_000_000).toFixed(1)}M` : `${Math.round(tick / 1000)}K`}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={lineColor} opacity={0.1} />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill={lineColor}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
            <rect
              x={p.x - plotWidth / (points.length * 2)}
              y={PADDING.top}
              width={plotWidth / points.length || plotWidth}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <text x={p.x} y={HEIGHT - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-md border bg-popover px-2 py-1 text-xs shadow-md"
          style={{
            left: `${(points[hoverIndex].x / WIDTH) * 100}%`,
            top: `${(points[hoverIndex].y / HEIGHT) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <p className="font-medium">{formatNaira(points[hoverIndex].value)}</p>
          <p className="text-muted-foreground">{points[hoverIndex].label}</p>
        </div>
      )}
    </div>
  );
}
