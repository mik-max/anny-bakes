"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import { formatPickupDate } from "@/lib/time";
import { PENDING_CHECKOUT_KEY } from "@/lib/checkout";
import { cancelCheckout, createCheckoutSession } from "@/app/checkout/actions";

export interface CheckoutPickup {
  dropId: string;
  pickupDate: string;
  pickupWindow: string;
}

interface FormState {
  customerName: string;
  email: string;
  phone: string;
  note: string;
}

const empty: FormState = {
  customerName: "",
  email: "",
  phone: "",
  note: "",
};

export default function CheckoutForm({ pickup }: { pickup: CheckoutPickup | null }) {
  const { items, dropId, subtotalCents, clearCart } = useCartStore();
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = subtotalCents();
  const cartMatchesDrop = pickup !== null && dropId === pickup.dropId;

  // Back from Stripe without paying? Cancel that session so its stock is freed now.
  useEffect(() => {
    let sessionId: string | null = null;
    try {
      sessionId = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    } catch {
      return;
    }
    if (sessionId) void cancelCheckout(sessionId);
  }, []);

  // The drop this cart was filled from has closed — its items can't be ordered.
  useEffect(() => {
    if (items.length > 0 && !cartMatchesDrop) clearCart();
  }, [items.length, cartMatchesDrop, clearCart]);

  const field =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !pickup) return;

    setLoading(true);
    setError(null);

    const result = await createCheckoutSession({
      customerName: form.customerName,
      email: form.email,
      phone: form.phone,
      note: form.note || undefined,
      dropId: pickup.dropId,
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    });

    if (result.error !== undefined) {
      setError(result.error);
      setLoading(false);
      return;
    }

    try {
      sessionStorage.setItem(PENDING_CHECKOUT_KEY, result.sessionId);
    } catch {
      // Storage unavailable — the session still expires on its own.
    }
    window.location.href = result.url;
  }

  if (items.length === 0 || !pickup) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="font-serif text-2xl text-stone-600">
          {pickup ? "Your cart is empty" : "No drop is open right now"}
        </p>
        <p className="mt-2 font-sans text-sm text-stone-400">
          {pickup
            ? "Add some items from this week's drop before checking out."
            : "Check back when the next weekly drop opens."}
        </p>
        <Link
          href="/"
          className="mt-6 font-sans text-sm font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-600 transition-colors"
        >
          Back to the weekly drop
        </Link>
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

        {/* Fulfilment — pickup only for now; delivery is shown as coming soon */}
        <FormSection title="Pickup or Delivery">
          <div role="radiogroup" aria-label="Fulfilment method" className="grid grid-cols-2 gap-3">
            <div
              role="radio"
              aria-checked="true"
              className="rounded-xl border-2 border-stone-900 bg-stone-900 px-4 py-3 text-white"
            >
              <p className="font-sans text-sm font-semibold">Pickup</p>
              <p className="mt-0.5 font-sans text-xs text-white/70">
                {formatPickupDate(pickup.pickupDate)}, {pickup.pickupWindow}
              </p>
            </div>
            <div
              role="radio"
              aria-checked="false"
              aria-disabled="true"
              className="cursor-not-allowed rounded-xl border-2 border-dashed border-stone-200 px-4 py-3 text-stone-400"
            >
              <p className="font-sans text-sm font-semibold">Delivery</p>
              <p className="mt-0.5 font-sans text-xs">Coming soon</p>
            </div>
          </div>
          <p className="font-sans text-sm text-stone-500">
            Orders are baked fresh for pickup. We&apos;ll email your confirmation with the
            pickup details.
          </p>
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
      <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-8">
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
          <SummaryRow label="Pickup" value={formatPickupDate(pickup.pickupDate)} />
          <div className="flex justify-between border-t border-stone-100 pt-3">
            <span className="font-sans font-semibold text-stone-900">Total</span>
            <span className="font-sans font-semibold text-stone-900">
              {CURRENCY_SYMBOL}{(subtotal / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-4 font-sans text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
        >
          {loading ? "Redirecting to payment…" : "Continue to Payment →"}
        </button>

        <p className="mt-3 text-center font-sans text-xs text-stone-400">
          Secure payment powered by Stripe
        </p>
        <p className="mt-1 text-center font-sans text-xs text-stone-400">
          By ordering you agree to our{" "}
          <Link href="/refunds" className="underline underline-offset-2 hover:text-stone-600">
            refund policy
          </Link>{" "}
          and{" "}
          <Link href="/disclaimer" className="underline underline-offset-2 hover:text-stone-600">
            allergen disclaimer
          </Link>
          .
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
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
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
