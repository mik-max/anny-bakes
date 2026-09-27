import type { OrderStatus } from "@/types";

/** Status changes an admin can make. Paid/expired are set by Stripe webhooks only. */
export const ADMIN_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: [],
  expired: [],
  paid: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
  refunded: [],
};
