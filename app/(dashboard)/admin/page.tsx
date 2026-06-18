import Link from "next/link";
import { mockOrders } from "@/data/orders";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { CURRENCY_SYMBOL } from "@/constants";
import { Order } from "@/types";

const FILTER_TABS = [
  { label: "All",       value: "all" },
  { label: "Paid",      value: "paid" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready",     value: "ready" },
  { label: "Pending",   value: "pending" },
  { label: "Fulfilled", value: "fulfilled" },
] as const;

function formatCents(cents: number) {
  return `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;

  const filtered =
    status === "all" ? mockOrders : mockOrders.filter((o) => o.status === status);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      {/* Page heading */}
      <div className="mb-5">
        <h1 className="font-sans text-2xl font-semibold text-stone-900">Orders</h1>
        <p className="mt-0.5 font-sans text-sm text-stone-500">
          {mockOrders.length} order{mockOrders.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filter tabs — scrollable on mobile, wrap on desktop */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? mockOrders.length
              : mockOrders.filter((o) => o.status === tab.value).length;
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin?status=${tab.value}`}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-stone-200 text-stone-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-stone-100 bg-white p-12 text-center">
          <p className="font-sans text-sm text-stone-400">No orders found</p>
        </div>
      ) : (
        <>
          {/* ── Mobile: card list ── */}
          <div className="space-y-3 sm:hidden">
            {sorted.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* ── Desktop: table ── */}
          <div className="hidden overflow-hidden rounded-xl border border-stone-100 bg-white sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">Order</th>
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">Customer</th>
                  <th className="hidden px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400 md:table-cell">Total</th>
                  <th className="hidden px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400 lg:table-cell">Fulfilment</th>
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">Status</th>
                  <th className="hidden px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400 xl:table-cell">Placed</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {sorted.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-stone-50/50">
                    <td className="px-4 py-3.5 font-sans text-sm font-medium text-stone-900">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-sm text-stone-900">{order.customer_name}</p>
                      <p className="font-sans text-xs text-stone-400">{order.email}</p>
                    </td>
                    <td className="hidden px-4 py-3.5 font-sans text-sm text-stone-900 md:table-cell">
                      {formatCents(order.total)}
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 font-sans text-xs capitalize text-stone-600">
                        {order.fulfilment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="hidden px-4 py-3.5 font-sans text-xs text-stone-400 xl:table-cell">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-sans text-xs font-semibold text-stone-500 transition-colors hover:text-stone-900"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Mobile order card ────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items?.length ?? 0;

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block rounded-xl border border-stone-100 bg-white p-4 transition-colors hover:border-stone-200 active:bg-stone-50"
    >
      {/* Top row: order number + status */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-sm font-semibold text-stone-900">
          {order.order_number}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Customer name */}
      <p className="mt-1.5 font-sans text-sm text-stone-700">{order.customer_name}</p>

      {/* Bottom row: meta + total */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-50 pt-3">
        <p className="font-sans text-xs text-stone-400 capitalize">
          {order.fulfilment_method} &middot; {itemCount} item{itemCount !== 1 ? "s" : ""} &middot; {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <span className="font-sans text-sm font-semibold text-stone-900">
          {`${CURRENCY_SYMBOL}${(order.total / 100).toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
}
