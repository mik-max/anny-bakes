"use server";

import { headers } from "next/headers";
import {
  CheckoutError,
  abandonCheckout,
  startCheckout,
  type CheckoutInput,
} from "@/backend/checkout";
import { STRIPE_SESSION_ID } from "@/lib/checkout";

export interface CheckoutFormInput {
  customerName: string;
  email: string;
  phone: string;
  note?: string;
  dropId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export type CheckoutResult =
  | { url: string; sessionId: string; error?: never }
  | { error: string };

const MAX_PER_ITEM = 50;

// Server actions receive whatever the client sends — rebuild the input from known fields.
function parseCheckout(data: CheckoutFormInput): { input: CheckoutInput } | { error: string } {
  const customer_name = String(data.customerName ?? "").trim().slice(0, 100);
  const email = String(data.email ?? "").trim().slice(0, 200);
  const phone = String(data.phone ?? "").trim().slice(0, 40);
  const note = String(data.note ?? "").trim().slice(0, 500) || null;

  if (!customer_name) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (!phone) return { error: "Please enter a phone number." };

  const items = new Map<string, number>();
  for (const item of Array.isArray(data.items) ? data.items : []) {
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_ITEM) {
      return { error: `Quantities must be between 1 and ${MAX_PER_ITEM}.` };
    }
    const productId = String(item.productId);
    items.set(productId, (items.get(productId) ?? 0) + quantity);
  }
  if (items.size === 0) return { error: "Your cart is empty." };

  return {
    input: {
      customer_name,
      email,
      phone,
      note,
      drop_id: String(data.dropId ?? ""),
      items: [...items].map(([product_id, quantity]) => ({ product_id, quantity })),
    },
  };
}

export async function createCheckoutSession(data: CheckoutFormInput): Promise<CheckoutResult> {
  const parsed = parseCheckout(data);
  if ("error" in parsed) return { error: parsed.error };

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ?? (await headers()).get("origin") ?? "http://localhost:3000";

  try {
    return await startCheckout(parsed.input, origin);
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message };
    console.error("[checkout] failed to start:", err);
    return { error: "Something went wrong starting checkout. Please try again." };
  }
}

/** Called when the customer returns from Stripe without paying. Best effort. */
export async function cancelCheckout(sessionId: string): Promise<void> {
  if (!STRIPE_SESSION_ID.test(String(sessionId))) return;
  try {
    await abandonCheckout(sessionId);
  } catch (err) {
    // The session will still expire on its own and release the stock.
    console.error("[checkout] failed to cancel session:", err);
  }
}
