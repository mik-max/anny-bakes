"use server";

import type { FulfilmentMethod } from "@/types";

export interface CheckoutInput {
  customerName: string;
  email: string;
  phone: string;
  fulfilmentMethod: FulfilmentMethod;
  deliveryAddress?: string;
  note?: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface CheckoutResult {
  /** Stripe Checkout URL — redirect the customer here when available */
  url: string | null;
  error: string | null;
}

export async function createCheckoutSession(
  input: CheckoutInput
): Promise<CheckoutResult> {
  // TODO: look up each product by id server-side and verify prices
  //       (never trust amounts sent by the client)

  // TODO: calculate delivery fee server-side based on fulfilment method + subtotal threshold

  // TODO: create a Stripe Checkout Session with verified line items
  //       e.g. const session = await stripe.checkout.sessions.create({ ... })

  // TODO: create a pending Order record in the database with:
  //       customer details, fulfilment info, stripe_session_id, status = "pending"

  // TODO: return session.url so the client can redirect to Stripe
  //       return { url: session.url, error: null }

  // Stub — backend not yet provisioned
  console.log("[checkout] createCheckoutSession called:", input);
  return { url: null, error: null };
}
