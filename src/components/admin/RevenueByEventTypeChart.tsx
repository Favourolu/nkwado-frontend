"use client";

import { useMemo, useState } from "react";

import { formatNaira } from "@/lib/format";
import { colorForCategory } from "@/lib/chart-palette";
import { usePrefersDark } from "@/lib/use-prefers-dark";
import type { CategoryRevenuePoint } from "@/lib/revenue-utils";

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 40, left: 56 };
const BAR_MAX_THICKNESS = 40;
const BAR_GAP = 2;
const CORNER_RADIUS = 4;

// Rounded top corners, square baseline: never a fully-rounded rect.
function topRoundedBarPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height);
  return `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${
    x + width
  },${y} ${x + width},${y + r} L${x + width},${y + height} Z`;
}

export function RevenueByEventTypeChart({ data }: { data: CategoryRevenuePoint[] }) {
  const prefersDark = usePrefersDark();
  const mode = prefersDark ? "dark" : "light";
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  const slotWidth = data.length > 0 ? plotWidth / data.length : plotWidth;
  const barWidth = Math.min(BAR_MAX_THICKNESS, slotWidth - BAR_GAP * 2);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Revenue by event type">
        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={PADDING.top + plotHeight}
          y2={PADDING.top + plotHeight}
          className="stroke-border"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * plotHeight;
          const slotX = PADDING.left + i * slotWidth;
          const barX = slotX + (slotWidth - barWidth) / 2;
          const barY = PADDING.top + plotHeight - barHeight;
          const color = colorForCategory(d.colorKey, mode);
          const labelFits = barHeight > 20;

          return (
            <g key={d.label}>
              <path
                d={topRoundedBarPath(barX, barY, barWidth, Math.max(barHeight, 1), CORNER_RADIUS)}
                fill={color}
                opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.5}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {labelFits && (
                <text
                  x={barX + barWidth / 2}
                  y={barY - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatNaira(d.value)}
                </text>
              )}
              <text
                x={slotX + slotWidth / 2}
                y={HEIGHT - 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-md border bg-popover px-2 py-1 text-xs shadow-md"
          style={{
            left: `${((PADDING.left + hoverIndex * slotWidth + slotWidth / 2) / WIDTH) * 100}%`,
            top: "0%",
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-medium">{formatNaira(data[hoverIndex].value)}</p>
          <p className="text-muted-foreground">{data[hoverIndex].label}</p>
        </div>
      )}
    </div>
  );
}
