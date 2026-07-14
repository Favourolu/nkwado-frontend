import { VendorCategory } from "./types";

export interface FeatherColor {
  base: string;
  tip: string;
}

export const FEATHER_COLORS: FeatherColor[] = [
  { base: "#0f6e6e", tip: "#5eead4" }, // teal
  { base: "#065f46", tip: "#34d399" }, // emerald
  { base: "#1e3a8a", tip: "#60a5fa" }, // sapphire
  { base: "#5b21b6", tip: "#c4b5fd" }, // violet
  { base: "#86198f", tip: "#f0abfc" }, // magenta
  { base: "#92400e", tip: "#fbbf24" }, // gold
  { base: "#134e4a", tip: "#2dd4bf" }, // deep teal
  { base: "#312e81", tip: "#818cf8" }, // indigo
  { base: "#a16207", tip: "#fde047" }, // amber
];

export const CATEGORY_COLOR_MAP: Record<VendorCategory, FeatherColor> = {
  CATERING: FEATHER_COLORS[5],
  VENUE: FEATHER_COLORS[0],
  DJ: FEATHER_COLORS[3],
  LIVE_BAND: FEATHER_COLORS[4],
  DRESSES: FEATHER_COLORS[8],
  SUITS: FEATHER_COLORS[7],
  DECORATION: FEATHER_COLORS[1],
  PHOTOGRAPHY: FEATHER_COLORS[2],
  VIDEOGRAPHY: FEATHER_COLORS[6],
  TRANSPORTATION: FEATHER_COLORS[7],
  FLORIST: FEATHER_COLORS[1],
  PLANNER: FEATHER_COLORS[3],
};
