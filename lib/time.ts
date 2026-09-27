import { BAKERY_TIMEZONE } from "@/constants";

// Small timezone helpers built on Intl, so drop times can be entered and shown
// in the bakery's local time regardless of where the server runs.

/** Milliseconds the given timezone's wall clock is ahead of UTC at `date`. */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const wallClockAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  const wholeSeconds = Math.floor(date.getTime() / 1000) * 1000;
  return wallClockAsUtc - wholeSeconds;
}

/** Bakery-local "YYYY-MM-DDTHH:mm" → UTC Date, or null if malformed. */
export function bakeryLocalToUtc(local: string, timeZone = BAKERY_TIMEZONE): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const naive = new Date(`${local}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;

  // First guess uses the offset at the naive instant; the second pass corrects
  // it when a daylight-saving change falls between the two.
  const guess = new Date(naive.getTime() - zoneOffsetMs(naive, timeZone));
  return new Date(naive.getTime() - zoneOffsetMs(guess, timeZone));
}

/** UTC Date → bakery-local "YYYY-MM-DDTHH:mm" (the format datetime-local inputs use). */
export function utcToBakeryLocal(date: Date, timeZone = BAKERY_TIMEZONE): string {
  return new Date(date.getTime() + zoneOffsetMs(date, timeZone)).toISOString().slice(0, 16);
}

/** "YYYY-MM-DD" shifted by whole days. */
export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** e.g. "Wed, Oct 7, 12:00 PM" in bakery time. */
export function formatBakeryDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: BAKERY_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2026-10-12" → "Mon, Oct 12". */
export function formatPickupDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
