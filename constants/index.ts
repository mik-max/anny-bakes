export const CURRENCY = "usd" as const;

// All drop times are entered and shown in the bakery's local time.
// TODO: confirm the bakery's city with the client (see DECISIONS.md).
export const BAKERY_TIMEZONE = "America/Toronto";
export const DEFAULT_PICKUP_WINDOW = "3–5pm";
// Shown in confirmation emails. TODO: get the pickup address from the client.
export const PICKUP_ADDRESS = "";
export const CURRENCY_SYMBOL = "$";

export const ORDER_STATUSES = [
  "pending",
  "expired",
  "paid",
  "preparing",
  "ready",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

// Menu sections, in display order.
export const PRODUCT_CATEGORIES = [
  "Sourdough",
  "Focaccia",
  "Babka",
  "Muffins",
  "Bread",
  "Buns",
  "Croissants",
  "Donuts",
  "Cakes",
  "Cookies",
] as const;
