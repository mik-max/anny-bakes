export const CURRENCY = "cad" as const; // Canadian dollars (confirmed by the client)

// All drop times are entered and shown in the bakery's local time.
// The bakery is in Ottawa (Eastern Time).
export const BAKERY_TIMEZONE = "America/Toronto";
export const DEFAULT_PICKUP_WINDOW = "3–5pm";
// Shown in confirmation emails. TODO: get the pickup address from the client.
export const PICKUP_ADDRESS = "";

// Interac e-Transfer: where customers send payment, and how long they have.
// The address is from the client's T&Cs. TODO: confirm it's the one set up to receive e-Transfers.
export const ETRANSFER_EMAIL = "enjoy@annybakes.com";
export const ETRANSFER_PAYMENT_HOURS = 24;

// Contact + social links for the site menu. Anything left empty is hidden.
// TODO: get the contact email and social handles from the client.
export const CONTACT_EMAIL = "";
export const SOCIAL_LINKS = {
  instagram: "",
  tiktok: "",
  youtube: "",
} as const;
export const CURRENCY_SYMBOL = "$";

// Smallest order the bakery accepts (client's T&Cs: "The minimum order is $22.00").
export const MIN_ORDER_CENTS = 2200;

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
