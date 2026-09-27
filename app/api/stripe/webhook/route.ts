import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/backend/stripe";
import { handleCheckoutCompleted, handleCheckoutExpired } from "@/backend/checkout";

// Stripe calls this after payment events. The signature check proves the request
// came from Stripe; handlers are idempotent because Stripe may retry or repeat.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Errors below return 500, so Stripe retries the event later.
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
