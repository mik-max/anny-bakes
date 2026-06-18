import Link from "next/link";
import { mockOrders } from "@/data/orders";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { CURRENCY_SYMBOL } from "@/constants";

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
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold text-stone-900">Orders</h1>
        <p className="mt-0.5 font-sans text-sm text-stone-500">
          {mockOrders.length} order{mockOrders.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${
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
        <div className="overflow-hidden rounded-xl border border-stone-100 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">Order</th>
                <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">Customer</th>
                <th className="hidden px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400 sm:table-cell">Items</th>
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
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <p className="font-sans text-sm text-stone-600">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell font-sans text-sm text-stone-900">
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
                  <td className="hidden px-4 py-3.5 xl:table-cell font-sans text-xs text-stone-400">
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
      )}
    </div>
  );
}
