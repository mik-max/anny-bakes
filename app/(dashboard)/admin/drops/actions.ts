"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/backend/auth";
import {
  DropError,
  closeDropNow,
  createDrop,
  deleteDrop,
  updateDrop,
  type DropInput,
} from "@/backend/drops";
import { DEFAULT_PICKUP_WINDOW } from "@/constants";
import { bakeryLocalToUtc } from "@/lib/time";
import type { DropFormInput } from "@/types";

type ActionResult = { error?: string };

const MAX_QUANTITY = 10_000;

// Server actions receive whatever the client sends — rebuild the input from known fields.
function parseDropForm(data: DropFormInput): { input: DropInput } | { error: string } {
  const name = String(data.name ?? "").trim();
  if (!name) return { error: "Give the drop a name." };

  const opens_at = bakeryLocalToUtc(String(data.opens_at ?? ""));
  const closes_at = bakeryLocalToUtc(String(data.closes_at ?? ""));
  if (!opens_at || !closes_at) return { error: "Enter valid open and close times." };
  if (closes_at <= opens_at) return { error: "Orders must close after they open." };

  const pickup_date = String(data.pickup_date ?? "");
  const endOfPickupDay = bakeryLocalToUtc(`${pickup_date}T23:59`);
  if (!endOfPickupDay) return { error: "Enter a valid pickup date." };
  if (endOfPickupDay < closes_at) return { error: "Pickup can't be before orders close." };

  const items = new Map<string, number>();
  for (const item of Array.isArray(data.items) ? data.items : []) {
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
      return { error: `Counts must be whole numbers between 0 and ${MAX_QUANTITY}.` };
    }
    if (quantity > 0) items.set(String(item.product_id), quantity);
  }
  if (items.size === 0) return { error: "Add at least one product to the drop." };

  return {
    input: {
      name,
      opens_at,
      closes_at,
      pickup_date,
      pickup_window: String(data.pickup_window ?? "").trim() || DEFAULT_PICKUP_WINDOW,
      items: [...items].map(([product_id, quantity]) => ({ product_id, quantity })),
    },
  };
}

// Turns rule violations into form errors; anything unexpected still throws.
async function run(fn: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await fn();
  } catch (err) {
    if (err instanceof DropError) return { error: err.message };
    throw err;
  }
  revalidatePath("/admin/drops");
  revalidatePath("/");
  return {};
}

export async function createDropAction(data: DropFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseDropForm(data);
  if ("error" in parsed) return { error: parsed.error };
  return run(() => createDrop(parsed.input));
}

export async function updateDropAction(id: string, data: DropFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseDropForm(data);
  if ("error" in parsed) return { error: parsed.error };
  return run(() => updateDrop(id, parsed.input));
}

export async function deleteDropAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => deleteDrop(id));
}

export async function closeDropNowAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  return run(() => closeDropNow(id));
}
