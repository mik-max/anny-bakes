import type { DropItem, DropStatus, WeeklyDrop } from "@/types";
import { DEFAULT_PICKUP_WINDOW } from "@/constants";
import { addDays, utcToBakeryLocal } from "@/lib/time";

export function getDropStatus(
  drop: Pick<WeeklyDrop, "opens_at" | "closes_at">,
  now = new Date()
): DropStatus {
  if (now < new Date(drop.opens_at)) return "scheduled";
  if (now < new Date(drop.closes_at)) return "open";
  return "closed";
}

export function remainingUnits(item: DropItem): number {
  return Math.max(0, item.quantity - item.reserved);
}

/**
 * Suggested times for a new drop, following the client's schedule:
 * opens now, closes next Wednesday at midday, pickup the Monday after.
 */
export function defaultDropTimes(now = new Date()) {
  const local = utcToBakeryLocal(now);
  const today = local.slice(0, 10);
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const closeDate = addDays(today, (3 - weekday + 7) % 7 || 7);

  return {
    opens_at: `${local.slice(0, 13)}:00`,
    closes_at: `${closeDate}T12:00`,
    pickup_date: addDays(closeDate, 5),
    pickup_window: DEFAULT_PICKUP_WINDOW,
  };
}
