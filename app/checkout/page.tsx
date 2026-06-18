import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout — Anny Bakes Cakes and Treats",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#FAF6F0] px-6 py-16">
      <div className="mx-auto max-w-5xl">

        {/* Page header */}
        <div className="mb-10">
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Almost there
          </p>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-stone-900">
            Checkout
          </h1>
        </div>

        <CheckoutForm />
      </div>
    </main>
  );
}
