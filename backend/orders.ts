import "server-only";
import { ObjectId, type WithId } from "mongodb";
import { getDb } from "@/backend/db";
import { releaseUnits } from "@/backend/drops";
import type { Order, OrderStatus } from "@/types";

export type NewOrder = Omit<
  Order,
  "id" | "order_number" | "status" | "stripe_session_id" | "stripe_payment_intent" | "created_at" | "updated_at"
>;

interface OrderDoc extends Omit<Order, "id" | "created_at" | "updated_at"> {
  /** Set once the order's held units have been returned to the drop. */
  stock_released: boolean;
  created_at: Date;
  updated_at: Date;
}

async function collection() {
  return (await getDb()).collection<OrderDoc>("orders");
}

function toOrder({ _id, created_at, updated_at, stock_released, ...rest }: WithId<OrderDoc>): Order {
  void stock_released; // internal bookkeeping, not part of Order
  return {
    ...rest,
    id: _id.toString(),
    created_at: created_at.toISOString(),
    updated_at: updated_at.toISOString(),
  };
}

/** Human-friendly, sequential: AB-1001, AB-1002, … */
async function nextOrderNumber(): Promise<string> {
  const counter = await (await getDb())
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate(
      { _id: "order_number" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  return `AB-${1000 + (counter?.seq ?? 1)}`;
}

export async function createPendingOrder(data: NewOrder): Promise<Order> {
  const now = new Date();
  const doc: OrderDoc = {
    ...data,
    order_number: await nextOrderNumber(),
    status: "pending",
    stripe_session_id: null,
    stripe_payment_intent: null,
    stock_released: false,
    created_at: now,
    updated_at: now,
  };
  const { insertedId } = await (await collection()).insertOne(doc);
  return toOrder({ ...doc, _id: insertedId });
}

/** Orders for the admin, newest first. Abandoned checkouts are left out. */
export async function getAllOrders(): Promise<Order[]> {
  const docs = await (await collection())
    .find({ status: { $ne: "expired" } })
    .sort({ created_at: -1 })
    .toArray();
  return docs.map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await (await collection()).findOne({ _id: new ObjectId(id) });
  return doc ? toOrder(doc) : null;
}

export async function setStripeSession(orderId: string, sessionId: string): Promise<void> {
  await (await collection()).updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { stripe_session_id: sessionId, updated_at: new Date() } }
  );
}

/**
 * pending → paid. Idempotent: Stripe may deliver the same event more than once.
 * Returns true only the first time, so follow-ups (emails) run once.
 */
export async function markOrderPaid(orderId: string, paymentIntent: string | null): Promise<boolean> {
  if (!ObjectId.isValid(orderId)) return false;
  const { modifiedCount } = await (await collection()).updateOne(
    { _id: new ObjectId(orderId), status: "pending" },
    { $set: { status: "paid", stripe_payment_intent: paymentIntent, updated_at: new Date() } }
  );
  return modifiedCount === 1;
}

/** pending → expired, and give the held stock back. Idempotent. */
export async function expireOrder(orderId: string): Promise<void> {
  if (!ObjectId.isValid(orderId)) return;
  await (await collection()).updateOne(
    { _id: new ObjectId(orderId), status: "pending" },
    { $set: { status: "expired", updated_at: new Date() } }
  );
  await releaseOrderStock(orderId);
}

/** Admin status change. Cancelling returns the order's units to its drop. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!ObjectId.isValid(orderId)) return;
  await (await collection()).updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { status, updated_at: new Date() } }
  );
  if (status === "cancelled") await releaseOrderStock(orderId);
}

// Claims the release flag first, so units go back at most once even if an
// expiry webhook, a cancelled checkout, and an admin cancel all race.
async function releaseOrderStock(orderId: string): Promise<void> {
  const order = await (await collection()).findOneAndUpdate(
    {
      _id: new ObjectId(orderId),
      stock_released: false,
      status: { $in: ["expired", "cancelled"] },
    },
    { $set: { stock_released: true } }
  );
  if (!order) return;
  await releaseUnits(
    order.drop_id,
    order.items.map(({ product_id, quantity }) => ({ product_id, quantity }))
  );
}
