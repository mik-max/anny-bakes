export const CURRENCY = "usd" as const;
export const CURRENCY_SYMBOL = "$";

export const DELIVERY_FEE_CENTS = 500; // $5.00
export const FREE_DELIVERY_THRESHOLD_CENTS = 5000; // free delivery above $50.00

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "preparing",
  "ready",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;
