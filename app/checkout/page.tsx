import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
import ScrollLink from "@/components/ScrollLink";
import { getStorefrontDrop } from "@/backend/drops";

export const metadata: Metadata = {
  title: "Checkout — Anny Bakes Cakes and Treats",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const drop = await getStorefrontDrop();
  const pickup =
    drop?.status === "open"
      ? { dropId: drop.id, pickupDate: drop.pickup_date, pickupWindow: drop.pickup_window }
      : null;

  return (
    <main className="min-h-screen bg-[#FAF6F0] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">

        {/* Page header */}
        <div className="mb-8 sm:mb-10">
          <ScrollLink
            targetId="weekly-drop"
            className="mb-6 font-sans text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            ← Back to the weekly drop
          </ScrollLink>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Almost there
          </p>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-stone-900">
            Checkout
          </h1>
        </div>

        <CheckoutForm pickup={pickup} />
      </div>
    </main>
  );
}
