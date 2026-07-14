import type { AdminBooking } from "./admin-api";
import { EVENT_TYPE_LABELS, EventType } from "./types";

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface CategoryRevenuePoint extends RevenuePoint {
  colorKey: string;
}

export function revenueOverTime(bookings: AdminBooking[]): RevenuePoint[] {
  const buckets = new Map<string, number>();
  for (const booking of bookings) {
    const date = new Date(booking.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + booking.totalAmount);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      return { label, value };
    });
}

// Only the first 8 event types get a dedicated categorical color slot (the
// palette caps at 8 CVD-safe hues); anything beyond that folds into "Other"
// rather than generating a 9th hue.
const CHARTED_EVENT_TYPES = Object.values(EventType).slice(0, 8);

export function revenueByEventType(bookings: AdminBooking[]): CategoryRevenuePoint[] {
  const totals = new Map<string, number>();
  for (const booking of bookings) {
    const key = CHARTED_EVENT_TYPES.includes(booking.eventType) ? booking.eventType : "OTHER_GROUP";
    totals.set(key, (totals.get(key) ?? 0) + booking.totalAmount);
  }
  return Array.from(totals.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      colorKey: key,
      label: key === "OTHER_GROUP" ? "Other" : EVENT_TYPE_LABELS[key as EventType],
      value,
    }));
}
