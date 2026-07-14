export type Role = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export const BudgetRange = {
  ZERO_TO_500K: "ZERO_TO_500K",
  FROM_500K_TO_1M: "FROM_500K_TO_1M",
  FROM_1M_TO_3M: "FROM_1M_TO_3M",
  FROM_3M_TO_5M: "FROM_3M_TO_5M",
  ABOVE_5M: "ABOVE_5M",
} as const;
export type BudgetRange = (typeof BudgetRange)[keyof typeof BudgetRange];

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  ZERO_TO_500K: "₦0 - ₦500k",
  FROM_500K_TO_1M: "₦500k - ₦1m",
  FROM_1M_TO_3M: "₦1m - ₦3m",
  FROM_3M_TO_5M: "₦3m - ₦5m",
  ABOVE_5M: "₦5m+",
};

export const BUDGET_RANGE_MAX: Record<BudgetRange, number> = {
  ZERO_TO_500K: 500_000,
  FROM_500K_TO_1M: 1_000_000,
  FROM_1M_TO_3M: 3_000_000,
  FROM_3M_TO_5M: 5_000_000,
  ABOVE_5M: Infinity,
};

export const EventType = {
  BIRTHDAY: "BIRTHDAY",
  WEDDING: "WEDDING",
  ANNIVERSARY: "ANNIVERSARY",
  CORPORATE: "CORPORATE",
  GRADUATION: "GRADUATION",
  ENGAGEMENT: "ENGAGEMENT",
  BABY_SHOWER: "BABY_SHOWER",
  CONCERT: "CONCERT",
  CONFERENCE: "CONFERENCE",
  OTHER: "OTHER",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  BIRTHDAY: "Birthday",
  WEDDING: "Wedding",
  ANNIVERSARY: "Anniversary",
  CORPORATE: "Corporate",
  GRADUATION: "Graduation",
  ENGAGEMENT: "Engagement",
  BABY_SHOWER: "Baby Shower",
  CONCERT: "Concert",
  CONFERENCE: "Conference",
  OTHER: "Other",
};

export const VendorCategory = {
  CATERING: "CATERING",
  VENUE: "VENUE",
  DJ: "DJ",
  LIVE_BAND: "LIVE_BAND",
  DRESSES: "DRESSES",
  SUITS: "SUITS",
  DECORATION: "DECORATION",
  PHOTOGRAPHY: "PHOTOGRAPHY",
  VIDEOGRAPHY: "VIDEOGRAPHY",
  TRANSPORTATION: "TRANSPORTATION",
  FLORIST: "FLORIST",
  PLANNER: "PLANNER",
} as const;
export type VendorCategory = (typeof VendorCategory)[keyof typeof VendorCategory];
