import "server-only";
import { ObjectId, type WithId } from "mongodb";
import { getDb } from "@/backend/db";
import { getProductsByIds } from "@/backend/products";
import { getDropStatus, remainingUnits } from "@/lib/drops";
import type { DropItem, StorefrontDrop, WeeklyDrop } from "@/types";

export interface DropInput {
  name: string;
  opens_at: Date;
  closes_at: Date;
  pickup_date: string;
  pickup_window: string;
  items: { product_id: string; quantity: number }[];
}

interface DropDoc {
  name: string;
  opens_at: Date;
  closes_at: Date;
  pickup_date: string;
  pickup_window: string;
  items: DropItem[];
  created_at: Date;
}

/** A rule violation the admin can fix — safe to show as-is. */
export class DropError extends Error {}

async function collection() {
  return (await getDb()).collection<DropDoc>("drops");
}

function toDrop({ _id, opens_at, closes_at, created_at, ...rest }: WithId<DropDoc>): WeeklyDrop {
  return {
    ...rest,
    id: _id.toString(),
    opens_at: opens_at.toISOString(),
    closes_at: closes_at.toISOString(),
    created_at: created_at.toISOString(),
  };
}

export async function getAllDrops(): Promise<WeeklyDrop[]> {
  const docs = await (await collection()).find().sort({ opens_at: -1 }).toArray();
  return docs.map(toDrop);
}

export async function getDropById(id: string): Promise<WeeklyDrop | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await (await collection()).findOne({ _id: new ObjectId(id) });
  return doc ? toDrop(doc) : null;
}

/** The open drop if there is one, otherwise the next scheduled drop. */
export async function getCurrentDrop(now = new Date()): Promise<WeeklyDrop | null> {
  const col = await collection();
  const open = await col.findOne({ opens_at: { $lte: now }, closes_at: { $gt: now } });
  if (open) return toDrop(open);

  const [next] = await col.find({ opens_at: { $gt: now } }).sort({ opens_at: 1 }).limit(1).toArray();
  return next ? toDrop(next) : null;
}

/** getCurrentDrop joined with product details, ready for the home page. */
export async function getStorefrontDrop(now = new Date()): Promise<StorefrontDrop | null> {
  const drop = await getCurrentDrop(now);
  if (!drop) return null;

  const status = getDropStatus(drop, now);
  if (status === "closed") return null;

  const products = await getProductsByIds(drop.items.map((i) => i.product_id));
  const byId = new Map(products.map((p) => [p.id, p]));

  return {
    id: drop.id,
    name: drop.name,
    status,
    opens_at: drop.opens_at,
    closes_at: drop.closes_at,
    pickup_date: drop.pickup_date,
    pickup_window: drop.pickup_window,
    items: drop.items.flatMap((item) => {
      const product = byId.get(item.product_id);
      return product ? [{ product, remaining: remainingUnits(item) }] : [];
    }),
  };
}

/** True if the product is in a drop that hasn't closed yet. */
export async function isProductInUpcomingDrop(productId: string): Promise<boolean> {
  const doc = await (await collection()).findOne({
    closes_at: { $gt: new Date() },
    "items.product_id": productId,
  });
  return doc !== null;
}

// Only one drop may be open at a time, so drop windows must not overlap.
async function assertNoOverlap(input: DropInput, excludeId?: ObjectId) {
  const clash = await (await collection()).findOne({
    opens_at: { $lt: input.closes_at },
    closes_at: { $gt: input.opens_at },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });
  if (clash) {
    throw new DropError(
      `These dates overlap with "${clash.name}". Only one drop can be open at a time.`
    );
  }
}

/** Product names by id; throws if any of `requiredIds` no longer exists. */
async function productNames(
  requiredIds: string[],
  extraIds: string[] = []
): Promise<Map<string, string>> {
  const products = await getProductsByIds([...requiredIds, ...extraIds]);
  const names = new Map(products.map((p) => [p.id, p.name]));
  if (requiredIds.some((id) => !names.has(id))) {
    throw new DropError("One or more products no longer exist. Reload and try again.");
  }
  return names;
}

export async function createDrop(input: DropInput): Promise<WeeklyDrop> {
  await assertNoOverlap(input);
  await productNames(input.items.map((i) => i.product_id));

  const doc: DropDoc = {
    ...input,
    items: input.items.map((i) => ({ ...i, reserved: 0 })),
    created_at: new Date(),
  };
  const { insertedId } = await (await collection()).insertOne(doc);
  return toDrop({ ...doc, _id: insertedId });
}

export async function updateDrop(id: string, input: DropInput): Promise<void> {
  if (!ObjectId.isValid(id)) throw new DropError("Drop not found.");
  const _id = new ObjectId(id);
  const col = await collection();

  await assertNoOverlap(input, _id);

  // Checkouts update `reserved` concurrently. Merge against the latest counts and
  // only write if they haven't changed since we read them; retry otherwise.
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await col.findOne({ _id });
    if (!existing) throw new DropError("Drop not found.");

    const names = await productNames(
      input.items.map((i) => i.product_id),
      existing.items.map((i) => i.product_id)
    );
    const nameOf = (pid: string) => names.get(pid) ?? "an item";

    const requested = new Map(input.items.map((i) => [i.product_id, i.quantity]));
    for (const item of existing.items) {
      if (item.reserved > 0 && !requested.has(item.product_id)) {
        throw new DropError(
          `Can't remove ${nameOf(item.product_id)}: ${item.reserved} already ordered.`
        );
      }
    }

    const reservedOf = new Map(existing.items.map((i) => [i.product_id, i.reserved]));
    const items: DropItem[] = input.items.map((i) => {
      const reserved = reservedOf.get(i.product_id) ?? 0;
      if (i.quantity < reserved) {
        throw new DropError(
          `${nameOf(i.product_id)} already has ${reserved} ordered — its count can't go below that.`
        );
      }
      return { product_id: i.product_id, quantity: i.quantity, reserved };
    });

    const { matchedCount } = await col.updateOne(
      { _id, items: existing.items },
      {
        $set: {
          name: input.name,
          opens_at: input.opens_at,
          closes_at: input.closes_at,
          pickup_date: input.pickup_date,
          pickup_window: input.pickup_window,
          items,
        },
      }
    );
    if (matchedCount === 1) return;
  }

  throw new DropError("Orders are coming in for this drop right now. Please try saving again.");
}

export async function deleteDrop(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new DropError("Drop not found.");
  const _id = new ObjectId(id);
  const col = await collection();

  const { deletedCount } = await col.deleteOne({
    _id,
    items: { $not: { $elemMatch: { reserved: { $gt: 0 } } } },
  });
  if (deletedCount === 1) return;

  const exists = await col.countDocuments({ _id });
  throw new DropError(
    exists ? "This drop already has orders and can't be deleted." : "Drop not found."
  );
}

/** Ends an open drop immediately. */
export async function closeDropNow(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new DropError("Drop not found.");
  const now = new Date();
  const { matchedCount } = await (await collection()).updateOne(
    { _id: new ObjectId(id), opens_at: { $lte: now }, closes_at: { $gt: now } },
    { $set: { closes_at: now } }
  );
  if (matchedCount === 0) throw new DropError("This drop isn't open.");
}
