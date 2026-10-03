import type { Order, OrderStatus } from "@/types";

/** Status changes an admin can make. Card payments become paid/expired via Stripe webhooks only. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: [],
  expired: [],
  paid: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
  refunded: [],
};

export function adminStatusTransitions(order: Pick<Order, "status" | "payment_method">): OrderStatus[] {
  // An unpaid e-Transfer order is confirmed (or cancelled) by hand once the bakery checks its inbox.
  if (order.status === "pending" && order.payment_method === "etransfer") return ["paid", "cancelled"];
  return TRANSITIONS[order.status];
}
