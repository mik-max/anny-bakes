import Link from "next/link";
import { getAllDrops } from "@/backend/drops";
import { DropStatusBadge } from "@/components/admin/DropStatusBadge";
import { getDropStatus } from "@/lib/drops";
import { formatBakeryDateTime, formatPickupDate } from "@/lib/time";
import type { WeeklyDrop } from "@/types";

export const dynamic = "force-dynamic";

function unitTotals(drop: WeeklyDrop) {
  return drop.items.reduce(
    (t, i) => ({ quantity: t.quantity + i.quantity, reserved: t.reserved + i.reserved }),
    { quantity: 0, reserved: 0 }
  );
}

export default async function AdminDropsPage() {
  const drops = await getAllDrops();

  return (
    <div>
      {/* Page heading */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-stone-900">Weekly Drops</h1>
          <p className="mt-0.5 font-sans text-sm text-stone-500">
            Only one drop can be open for orders at a time.
          </p>
        </div>
        <Link
          href="/admin/drops/new"
          className="rounded-lg bg-stone-900 px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700"
        >
          + New Drop
        </Link>
      </div>

      {drops.length === 0 ? (
        <div className="rounded-xl border border-stone-100 bg-white p-12 text-center">
          <p className="font-sans text-sm text-stone-400">No drops yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drops.map((drop) => {
            const totals = unitTotals(drop);
            return (
              <Link
                key={drop.id}
                href={`/admin/drops/${drop.id}`}
                className="block rounded-xl border border-stone-100 bg-white p-4 transition-colors hover:bg-stone-50/50 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-sans text-base font-semibold text-stone-900">{drop.name}</p>
                  <DropStatusBadge status={getDropStatus(drop)} />
                </div>
                <div className="mt-2 grid gap-1 font-sans text-sm text-stone-500 sm:grid-cols-3">
                  <p>
                    <span className="text-stone-400">Orders: </span>
                    {formatBakeryDateTime(drop.opens_at)} → {formatBakeryDateTime(drop.closes_at)}
                  </p>
                  <p>
                    <span className="text-stone-400">Pickup: </span>
                    {formatPickupDate(drop.pickup_date)}, {drop.pickup_window}
                  </p>
                  <p>
                    <span className="text-stone-400">Items: </span>
                    {drop.items.length} products · {totals.reserved}/{totals.quantity} ordered
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
