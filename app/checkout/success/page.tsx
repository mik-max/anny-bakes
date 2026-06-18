import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed — Anny Bakes Cakes and Treats",
};

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0] px-6 text-center">
      <div className="max-w-md">
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Order Received
        </p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-tight text-stone-900">
          Thank you for your order!
        </h1>
        <p className="mt-4 font-sans text-base text-stone-500">
          We&apos;ve received your order and will begin preparing it shortly.
          You&apos;ll receive a confirmation email once payment is confirmed.
        </p>

        {/* Order number placeholder — will be populated from Stripe session once backend is wired */}
        <div className="mt-8 rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
            Order Number
          </p>
          <p className="mt-1 font-serif text-2xl text-stone-900">—</p>
          <p className="mt-1 font-sans text-xs text-stone-400">
            Your order number will appear here once Stripe payment is connected.
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-stone-900 transition-colors hover:text-stone-500"
        >
          ← Back to menu
        </Link>
      </div>
    </main>
  );
}
