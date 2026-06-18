"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import {
  CURRENCY_SYMBOL,
  DELIVERY_FEE_CENTS,
  FREE_DELIVERY_THRESHOLD_CENTS,
} from "@/constants";
import { createCheckoutSession } from "@/app/checkout/actions";
import type { FulfilmentMethod } from "@/types";

interface FormState {
  customerName: string;
  email: string;
  phone: string;
  fulfilmentMethod: FulfilmentMethod;
  deliveryAddress: string;
  note: string;
}

const empty: FormState = {
  customerName: "",
  email: "",
  phone: "",
  fulfilmentMethod: "pickup",
  deliveryAddress: "",
  note: "",
};

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCartStore();
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = subtotalCents();
  const isDelivery = form.fulfilmentMethod === "delivery";
  const deliveryFee = isDelivery
    ? subtotal >= FREE_DELIVERY_THRESHOLD_CENTS
      ? 0
      : DELIVERY_FEE_CENTS
    : 0;
  const total = subtotal + deliveryFee;

  const field =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const result = await createCheckoutSession({
      customerName: form.customerName,
      email: form.email,
      phone: form.phone,
      fulfilmentMethod: form.fulfilmentMethod,
      deliveryAddress: form.deliveryAddress || undefined,
      note: form.note || undefined,
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.url) {
      // Stripe redirect — backend wired
      window.location.href = result.url;
    } else {
      // Stub: clear cart and go to success page until Stripe is connected
      clearCart();
      router.push("/checkout/success");
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="font-serif text-2xl text-stone-600">Your cart is empty</p>
        <p className="mt-2 font-sans text-sm text-stone-400">
          Add some items before checking out.
        </p>
        <a
          href="/"
          className="mt-6 font-sans text-sm font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-600 transition-colors"
        >
          Back to menu
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
    >
      {/* ── Left: form sections ── */}
      <div className="space-y-5">

        {/* Contact */}
        <FormSection title="Contact Details">
          <Field label="Full Name">
            <input
              type="text"
              required
              value={form.customerName}
              onChange={field("customerName")}
              placeholder="Jane Smith"
              className={input}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input
                type="email"
                required
                value={form.email}
                onChange={field("email")}
                placeholder="jane@example.com"
                className={input}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                required
                value={form.phone}
                onChange={field("phone")}
                placeholder="+1 555 000 0000"
                className={input}
              />
            </Field>
          </div>
        </FormSection>

        {/* Fulfilment */}
        <FormSection title="Fulfilment">
          <div className="grid grid-cols-2 gap-3">
            {(["pickup", "delivery"] as FulfilmentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, fulfilmentMethod: method }))
                }
                className={cn(
                  "rounded-xl border-2 py-4 font-sans text-sm font-medium capitalize transition-colors",
                  form.fulfilmentMethod === method
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                )}
              >
                {method === "pickup" ? "Pickup" : "Delivery"}
              </button>
            ))}
          </div>

          {isDelivery && (
            <Field label="Delivery Address">
              <input
                type="text"
                required
                value={form.deliveryAddress}
                onChange={field("deliveryAddress")}
                placeholder="123 Main St, City, State, ZIP"
                className={input}
              />
            </Field>
          )}
        </FormSection>

        {/* Order note */}
        <FormSection title="Order Note">
          <Field label="Any special requests? (optional)">
            <textarea
              value={form.note}
              onChange={field("note")}
              placeholder="e.g. 'Happy Birthday Sarah' on the cake…"
              rows={3}
              className={cn(input, "resize-none")}
            />
          </Field>
        </FormSection>

      </div>

      {/* ── Right: order summary ── */}
      <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-8">
        <h2 className="mb-5 font-serif text-xl text-stone-900">Order Summary</h2>

        <ul className="mb-5 space-y-3">
          {items.map((item) => (
            <li key={item.product.id} className="flex justify-between gap-3">
              <span className="font-sans text-sm text-stone-600">
                {item.product.name}
                <span className="text-stone-400"> × {item.quantity}</span>
              </span>
              <span className="font-sans text-sm font-medium text-stone-900 whitespace-nowrap">
                {CURRENCY_SYMBOL}
                {((item.product.price * item.quantity) / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-stone-100 pt-4">
          <SummaryRow label="Subtotal" value={`${CURRENCY_SYMBOL}${(subtotal / 100).toFixed(2)}`} />
          <SummaryRow
            label="Delivery"
            value={
              !isDelivery
                ? "—"
                : deliveryFee === 0
                ? "Free"
                : `${CURRENCY_SYMBOL}${(deliveryFee / 100).toFixed(2)}`
            }
          />
          <div className="flex justify-between border-t border-stone-100 pt-3">
            <span className="font-sans font-semibold text-stone-900">Total</span>
            <span className="font-sans font-semibold text-stone-900">
              {CURRENCY_SYMBOL}{(total / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {isDelivery && deliveryFee > 0 && (
          <p className="mt-3 font-sans text-xs text-stone-400">
            Free delivery on orders over {CURRENCY_SYMBOL}
            {(FREE_DELIVERY_THRESHOLD_CENTS / 100).toFixed(0)}.
          </p>
        )}

        {error && (
          <p className="mt-4 font-sans text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
        >
          {loading ? "Processing…" : "Place Order →"}
        </button>

        <p className="mt-3 text-center font-sans text-xs text-stone-400">
          Secure payment powered by Stripe
        </p>
      </aside>
    </form>
  );
}

// ── Helpers ─────────────────────────────────────────────

const input =
  "w-full rounded-lg border border-stone-200 bg-white px-4 py-3 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition";

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl text-stone-900">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-sans text-sm text-stone-500">{label}</span>
      <span className="font-sans text-sm text-stone-900">{value}</span>
    </div>
  );
}
