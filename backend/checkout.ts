import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/backend/stripe";
import {
  sendCustomerConfirmation,
  sendEtransferOrderEmails,
  sendOrderPaidEmails,
} from "@/backend/order-emails";
import { getDropById, releaseUnits, reserveUnits, type UnitRequest } from "@/backend/drops";
import { getProductsByIds } from "@/backend/products";
import {
  createPendingOrder,
  expireOrder,
  expireOverdueEtransfers,
  getOrderById,
  markEtransferReceived,
  markOrderPaid,
  setStripeSession,
  type NewOrder,
} from "@/backend/orders";
import { getDropStatus, remainingUnits } from "@/lib/drops";
import { CURRENCY, CURRENCY_SYMBOL, ETRANSFER_PAYMENT_HOURS, MIN_ORDER_CENTS } from "@/constants";
import { STRIPE_SESSION_ID } from "@/lib/checkout";
import type { Order } from "@/types";

// Stripe requires Checkout sessions to last at least 30 minutes; a minute of
// headroom avoids clock-skew rejections. Stock is held for this long.
const HOLD_SECONDS = 31 * 60;

/** A problem the customer can fix (e.g. something sold out) — safe to show. */
export class CheckoutError extends Error {}

export interface CheckoutInput {
  customer_name: string;
  email: string;
  phone: string;
  note: string | null;
  drop_id: string;
  items: UnitRequest[]; // one entry per product
}

/**
 * Shared by both payment methods: checks the drop, holds the stock and creates a
 * pending order. Prices and names come from the database, never from the client.
 */
async function holdStockAndCreateOrder(
  input: CheckoutInput,
  payment: Pick<NewOrder, "payment_method" | "payment_due_at">
): Promise<{ order: Order; accessToken: string }> {
  // Unpaid e-Transfer orders past their deadline give their stock back first.
  await expireOverdueEtransfers();

  const drop = await getDropById(input.drop_id);
  if (!drop || getDropStatus(drop) !== "open") {
    throw new CheckoutError("This drop is no longer taking orders. Please refresh the page.");
  }

  const products = new Map(
    (await getProductsByIds(input.items.map((i) => i.product_id))).map((p) => [p.id, p])
  );
  const lines = input.items.map((item) => {
    const product = products.get(item.product_id);
    const inDrop = drop.items.some((d) => d.product_id === item.product_id);
    if (!product || !inDrop || !product.in_stock) {
      throw new CheckoutError(
        `${product?.name ?? "An item in your cart"} isn't available in this drop. Please remove it and try again.`
      );
    }
    return { product, quantity: item.quantity };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  if (subtotal < MIN_ORDER_CENTS) {
    const money = (cents: number) => `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;
    throw new CheckoutError(
      `The minimum order is ${money(MIN_ORDER_CENTS)}. Add ${money(MIN_ORDER_CENTS - subtotal)} more to check out.`
    );
  }

  if (!(await reserveUnits(drop.id, input.items))) {
    throw new CheckoutError(await soldOutMessage(drop.id, input.items));
  }
  try {
    return await createPendingOrder({
      customer_name: input.customer_name,
      email: input.email,
      phone: input.phone,
      note: input.note,
      fulfilment_method: "pickup",
      delivery_address: null,
      drop_id: drop.id,
      pickup_date: drop.pickup_date,
      pickup_window: drop.pickup_window,
      items: lines.map(({ product, quantity }) => ({
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity,
      })),
      subtotal,
      delivery_fee: 0,
      total: subtotal,
      currency: CURRENCY,
      ...payment,
    });
  } catch (err) {
    await releaseUnits(drop.id, input.items); // no order was created, so give the stock back
    throw err;
  }
}

/** Card payment: holds stock, creates a pending order, and returns the Stripe Checkout session. */
export async function startCheckout(
  input: CheckoutInput,
  origin: string
): Promise<{ url: string; sessionId: string }> {
  const { order } = await holdStockAndCreateOrder(input, {
    payment_method: "card",
    payment_due_at: null,
  });

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Cards (incl. Apple/Google Pay) settle immediately, so "completed" means paid.
      payment_method_types: ["card"],
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: order.order_number },
      payment_intent_data: { metadata: { order_id: order.id } },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: item.unit_price,
          product_data: { name: item.product_name },
        },
      })),
      expires_at: Math.floor(Date.now() / 1000) + HOLD_SECONDS,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");

    await setStripeSession(order.id, session.id);
    return { url: session.url, sessionId: session.id };
  } catch (err) {
    // Don't leave stock held for a checkout that never started.
    await expireOrder(order.id);
    throw err;
  }
}

/**
 * Interac e-Transfer: holds stock and creates an order awaiting payment. The
 * customer gets instructions; an admin marks it paid when the money arrives.
 * Unpaid orders expire after ETRANSFER_PAYMENT_HOURS.
 */
export async function placeEtransferOrder(
  input: CheckoutInput
): Promise<{ orderId: string; accessToken: string }> {
  const dueAt = new Date(Date.now() + ETRANSFER_PAYMENT_HOURS * 3_600_000);
  const { order, accessToken } = await holdStockAndCreateOrder(input, {
    payment_method: "etransfer",
    payment_due_at: dueAt.toISOString(),
  });
  await sendEtransferOrderEmails(order, accessToken);
  return { orderId: order.id, accessToken };
}

/** An admin confirms the e-Transfer arrived; the customer gets their confirmation. */
export async function confirmEtransferReceived(orderId: string): Promise<boolean> {
  if (!(await markEtransferReceived(orderId))) return false;
  const order = await getOrderById(orderId);
  if (order) await sendCustomerConfirmation(order);
  return true;
}

async function soldOutMessage(dropId: string, items: UnitRequest[]): Promise<string> {
  const drop = await getDropById(dropId);
  if (!drop || getDropStatus(drop) !== "open") {
    return "This drop is no longer taking orders. Please refresh the page.";
  }
  const names = new Map(
    (await getProductsByIds(items.map((i) => i.product_id))).map((p) => [p.id, p.name])
  );
  for (const item of items) {
    const dropItem = drop.items.find((d) => d.product_id === item.product_id);
    const left = dropItem ? remainingUnits(dropItem) : 0;
    if (left < item.quantity) {
      const name = names.get(item.product_id) ?? "An item";
      return left === 0
        ? `${name} just sold out. Please remove it from your cart.`
        : `Only ${left} ${name} left. Please lower the quantity in your cart.`;
    }
  }
  return "Some items just sold out. Please review your cart.";
}

/**
 * The customer came back from Stripe without paying: end the session now so
 * the held stock is released immediately instead of when the session expires.
 */
export async function abandonCheckout(sessionId: string): Promise<void> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status !== "open") return;

  await stripe.checkout.sessions.expire(sessionId);
  const orderId = session.metadata?.order_id;
  if (orderId) await expireOrder(orderId); // the expiry webhook does this too; both are idempotent
}

/** For the success page: the order behind a Stripe session, and whether it's paid. */
export async function getOrderForSession(
  sessionId: string
): Promise<{ order: Order; paid: boolean } | null> {
  if (!STRIPE_SESSION_ID.test(sessionId)) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const order = session.metadata?.order_id ? await getOrderById(session.metadata.order_id) : null;
    // The webhook may not have landed yet, so trust Stripe's view of payment.
    return order ? { order, paid: session.payment_status === "paid" } : null;
  } catch {
    return null;
  }
}

// ── Webhook handlers ───────────────────────────────────────────────────────

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (!orderId || session.payment_status !== "paid") return;

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  // Only the first delivery of this event sends emails; retries and duplicates don't.
  if (!(await markOrderPaid(orderId, paymentIntent))) return;
  const order = await getOrderById(orderId);
  if (order) await sendOrderPaidEmails(order);
}

export async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (orderId) await expireOrder(orderId);
}
