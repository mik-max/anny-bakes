import "server-only";
import { randomBytes } from "node:crypto";
import { ObjectId, type WithId } from "mongodb";
import { getDb } from "@/backend/db";
import { releaseUnits } from "@/backend/drops";
import type { Order, OrderStatus } from "@/types";

export type NewOrder = Omit<
  Order,
  "id" | "order_number" | "status" | "stripe_session_id" | "stripe_payment_intent" | "created_at" | "updated_at"
>;

interface OrderDoc extends Omit<Order, "id" | "payment_due_at" | "created_at" | "updated_at"> {
  /** Set once the order's held units have been returned to the drop. */
  stock_released: boolean;
  /** Secret in the customer's e-Transfer instructions link. */
  access_token: string;
  payment_due_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

async function collection() {
  return (await getDb()).collection<OrderDoc>("orders");
}

function toOrder({
  _id,
  created_at,
  updated_at,
  payment_due_at,
  stock_released,
  access_token,
  ...rest
}: WithId<OrderDoc>): Order {
  void stock_released; // internal bookkeeping, not part of Order
  void access_token; // never sent to the admin UI
  return {
    ...rest,
    payment_method: rest.payment_method ?? "card", // orders before e-Transfer existed
    payment_due_at: payment_due_at ? payment_due_at.toISOString() : null,
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

export async function createPendingOrder(
  data: NewOrder
): Promise<{ order: Order; accessToken: string }> {
  const now = new Date();
  const doc: OrderDoc = {
    ...data,
    payment_due_at: data.payment_due_at ? new Date(data.payment_due_at) : null,
    access_token: randomBytes(24).toString("base64url"),
    order_number: await nextOrderNumber(),
    status: "pending",
    stripe_session_id: null,
    stripe_payment_intent: null,
    stock_released: false,
    created_at: now,
    updated_at: now,
  };
  const { insertedId } = await (await collection()).insertOne(doc);
  return { order: toOrder({ ...doc, _id: insertedId }), accessToken: doc.access_token };
}

/** The order behind a customer's private link, or null if the token doesn't match. */
export async function getOrderByAccessToken(id: string, token: string): Promise<Order | null> {
  if (!ObjectId.isValid(id) || !token) return null;
  const doc = await (await collection()).findOne({ _id: new ObjectId(id), access_token: token });
  return doc ? toOrder(doc) : null;
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

/**
 * An admin confirms an e-Transfer arrived: pending → paid. Returns false if the
 * order isn't an unpaid e-Transfer order (e.g. it already expired).
 */
export async function markEtransferReceived(orderId: string): Promise<boolean> {
  if (!ObjectId.isValid(orderId)) return false;
  const { modifiedCount } = await (await collection()).updateOne(
    { _id: new ObjectId(orderId), status: "pending", payment_method: "etransfer" },
    { $set: { status: "paid", updated_at: new Date() } }
  );
  return modifiedCount === 1;
}

/**
 * Expires e-Transfer orders that weren't paid in time and releases their stock.
 * There's no scheduler: this runs wherever stock matters (checkout, storefront,
 * admin orders), so counts are always correct when someone looks.
 */
export async function expireOverdueEtransfers(now = new Date()): Promise<void> {
  const overdue = await (await collection())
    .find(
      { status: "pending", payment_method: "etransfer", payment_due_at: { $lt: now } },
      { projection: { _id: 1 } }
    )
    .toArray();
  for (const { _id } of overdue) await expireOrder(_id.toString());
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
