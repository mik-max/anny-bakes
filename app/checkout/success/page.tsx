import type { Metadata } from "next";
import Link from "next/link";
import { getOrderForSession } from "@/backend/checkout";
import ClearCart from "@/components/ClearCart";
import { CURRENCY_SYMBOL } from "@/constants";
import { formatPickupDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Order Confirmed — Anny Bakes Cakes and Treats",
};

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const result = session_id ? await getOrderForSession(session_id) : null;
  const order = result?.order;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0] px-6 py-16 text-center">
      {result?.paid && <ClearCart />}

      <div className="w-full max-w-md">
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          {result?.paid ? "Payment Received" : "Order Received"}
        </p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-tight text-stone-900">
          Thank you for your order!
        </h1>
        <p className="mt-4 font-sans text-base text-stone-500">
          {order
            ? `We'll bake it fresh for pickup. A confirmation is on its way to ${order.email}.`
            : "We couldn't load your order details, but if you completed payment your order is confirmed."}
        </p>

        {order && (
          <div className="mt-8 rounded-2xl bg-white px-6 py-6 text-left shadow-sm sm:px-8">
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
                    {CURRENCY_SYMBOL}
                    {((item.unit_price * item.quantity) / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 font-sans text-sm font-semibold text-stone-900">
              <span>Total</span>
              <span>
                {CURRENCY_SYMBOL}
                {(order.total / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}

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
