import { EventType } from "./types";

// Validated categorical palette (fixed order = CVD-safety mechanism; never
// cycled or reassigned by rank). See dataviz skill references/palette.md.
export const CATEGORICAL_SLOTS_LIGHT = [
  "#2a78d6", // 1 blue
  "#1baf7a", // 2 aqua
  "#eda100", // 3 yellow
  "#008300", // 4 green
  "#4a3aa7", // 5 violet
  "#e34948", // 6 red
  "#e87ba4", // 7 magenta
  "#eb6834", // 8 orange
];

export const CATEGORICAL_SLOTS_DARK = [
  "#3987e5",
  "#199e70",
  "#c98500",
  "#008300",
  "#9085e9",
  "#e66767",
  "#d55181",
  "#d95926",
];

const OTHER_COLOR_LIGHT = "#898781";
const OTHER_COLOR_DARK = "#898781";

const eventTypeSlotIndex = new Map<string, number>(
  Object.values(EventType)
    .slice(0, 8)
    .map((type, index) => [type, index])
);

export function colorForCategory(colorKey: string, mode: "light" | "dark"): string {
  const slots = mode === "light" ? CATEGORICAL_SLOTS_LIGHT : CATEGORICAL_SLOTS_DARK;
  const index = eventTypeSlotIndex.get(colorKey);
  if (index === undefined) {
    return mode === "light" ? OTHER_COLOR_LIGHT : OTHER_COLOR_DARK;
  }
  return slots[index];
}

export const SEQUENTIAL_BLUE_LIGHT = "#2a78d6";
export const SEQUENTIAL_BLUE_DARK = "#3987e5";
