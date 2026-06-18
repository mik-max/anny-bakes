import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/data/orders";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { updateOrderStatus } from "@/app/(dashboard)/admin/actions";
import { CURRENCY_SYMBOL } from "@/constants";
import { OrderStatus } from "@/types";

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending:   ["cancelled"],
  paid:      ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready:     ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
  refunded:  [],
};

const STATUS_BUTTON_LABELS: Partial<Record<OrderStatus, string>> = {
  preparing: "Mark as Preparing",
  ready:     "Mark as Ready",
  fulfilled: "Mark as Fulfilled",
  cancelled: "Cancel Order",
};

function formatCents(cents: number) {
  return `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  const nextStatuses = NEXT_STATUSES[order.status];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="font-sans text-sm text-stone-400 transition-colors hover:text-stone-700"
        >
          ← Orders
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-stone-900">{order.order_number}</h1>
          <p className="mt-0.5 font-sans text-sm text-stone-500">
            Placed {formatDateLong(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left — items + note + actions */}
        <div className="space-y-4 lg:col-span-2">

          {/* Items */}
          <section className="rounded-xl border border-stone-100 bg-white">
            <div className="border-b border-stone-100 px-5 py-4">
              <h2 className="font-sans text-sm font-semibold text-stone-700">Items</h2>
            </div>
            <ul className="divide-y divide-stone-50">
              {order.items?.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-sans text-sm text-stone-900">{item.product_name}</p>
                    <p className="font-sans text-xs text-stone-400">
                      {formatCents(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-sans text-sm font-medium text-stone-900">
                    {formatCents(item.unit_price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-stone-100 px-5 py-4">
              <div className="flex justify-between font-sans text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{formatCents(order.subtotal)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between font-sans text-sm text-stone-500">
                  <span>Delivery</span>
                  <span>{formatCents(order.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-100 pt-1.5 font-sans text-sm font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatCents(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Order note */}
          {order.note && (
            <section className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
              <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-amber-700">
                Order Note
              </p>
              <p className="font-sans text-sm text-amber-900">{order.note}</p>
            </section>
          )}

          {/* Status transition actions */}
          {nextStatuses.length > 0 && (
            <section className="rounded-xl border border-stone-100 bg-white px-5 py-4">
              <p className="mb-3 font-sans text-sm font-semibold text-stone-700">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((next) => {
                  const isDestructive = next === "cancelled";
                  return (
                    <form key={next} action={updateOrderStatus.bind(null, order.id, next)}>
                      <button
                        type="submit"
                        className={`rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                          isDestructive
                            ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "bg-stone-900 text-white hover:bg-stone-700"
                        }`}
                      >
                        {STATUS_BUTTON_LABELS[next] ?? next}
                      </button>
                    </form>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right — customer + fulfilment + payment */}
        <div className="space-y-4">
          <section className="rounded-xl border border-stone-100 bg-white px-5 py-4">
            <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
              Customer
            </p>
            <p className="font-sans text-sm font-semibold text-stone-900">{order.customer_name}</p>
            <p className="mt-0.5 font-sans text-sm text-stone-500">{order.email}</p>
            <p className="font-sans text-sm text-stone-500">{order.phone}</p>
          </section>

          <section className="rounded-xl border border-stone-100 bg-white px-5 py-4">
            <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
              Fulfilment
            </p>
            <p className="font-sans text-sm font-semibold capitalize text-stone-900">
              {order.fulfilment_method}
            </p>
            {order.delivery_address && (
              <p className="mt-1 font-sans text-sm text-stone-500">{order.delivery_address}</p>
            )}
          </section>

          {order.stripe_payment_intent && (
            <section className="rounded-xl border border-stone-100 bg-white px-5 py-4">
              <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
                Payment
              </p>
              <p className="break-all font-mono text-xs text-stone-500">
                {order.stripe_payment_intent}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
