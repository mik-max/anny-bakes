import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByAccessToken } from "@/backend/orders";
import ClearCart from "@/components/ClearCart";
import { CURRENCY_SYMBOL, ETRANSFER_EMAIL } from "@/constants";
import { formatBakeryDateTime, formatPickupDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Complete Your Order — Anny Bakes Cakes and Treats",
  robots: { index: false }, // private, per-order page
};

export const dynamic = "force-dynamic";

const money = (cents: number) => `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;

export default async function EtransferPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { order: orderId = "", token = "" } = await searchParams;
  const order = await getOrderByAccessToken(orderId, token);

  if (!order || order.payment_method !== "etransfer") {
    return (
      <Shell>
        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] leading-tight text-stone-900">
          Order not found
        </h1>
        <p className="mt-4 font-sans text-base text-stone-500">
          Please use the link from your order email.
        </p>
      </Shell>
    );
  }

  const awaiting = order.status === "pending";
  const released = order.status === "expired" || order.status === "cancelled";

  return (
    <Shell>
      {!released && <ClearCart />}

      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
        {awaiting ? "One last step" : released ? "Order released" : "Payment received"}
      </p>
      <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] leading-tight text-stone-900">
        {awaiting
          ? "Send your e-Transfer"
          : released
            ? "This order was released"
            : "Thank you for your order!"}
      </h1>
      <p className="mt-4 font-sans text-base text-stone-500">
        {awaiting
          ? `Your order is reserved${
              order.payment_due_at ? ` until ${formatBakeryDateTime(order.payment_due_at)}` : ""
            }. Send an Interac e-Transfer with these details to confirm it.`
          : released
            ? "Payment wasn't received in time, so the items were released. You're welcome to order again from this week's drop."
            : `We've received your e-Transfer. A confirmation is on its way to ${order.email}.`}
      </p>

      <div className="mt-8 rounded-2xl bg-white px-6 py-6 text-left shadow-sm sm:px-8">
        {awaiting && (
          <dl className="mb-5 space-y-3 border-b border-stone-100 pb-5 font-sans text-sm">
            <Row label="Send to" value={ETRANSFER_EMAIL} />
            <Row label="Amount" value={money(order.total)} />
            <Row label="Message" value={order.order_number} />
          </dl>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
              Order Number
            </p>
            <p className="mt-1 font-serif text-2xl text-stone-900">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
              Pickup
            </p>
            <p className="mt-1 font-sans text-sm font-semibold text-stone-900">
              {formatPickupDate(order.pickup_date)}
            </p>
            <p className="font-sans text-sm text-stone-500">{order.pickup_window}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2 border-t border-stone-100 pt-4">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex justify-between gap-3 font-sans text-sm">
              <span className="text-stone-600">
                {item.product_name}
                <span className="text-stone-400"> × {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap text-stone-900">
                {money(item.unit_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 font-sans text-sm font-semibold text-stone-900">
          <span>Total (CAD)</span>
          <span>{money(order.total)}</span>
        </div>
      </div>

      {awaiting && (
        <p className="mt-4 font-sans text-xs text-stone-400">
          These details are also in your email. Unpaid orders are released after the deadline.
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0] px-6 py-16 text-center">
      <div className="w-full max-w-md">
        {children}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-stone-900 transition-colors hover:text-stone-500"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-stone-500">{label}</dt>
      <dd className="select-all font-semibold text-stone-900">{value}</dd>
    </div>
  );
}
