"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DropFormInput, DropStatus, Product, WeeklyDrop } from "@/types";
import { BAKERY_TIMEZONE, CURRENCY_SYMBOL, PRODUCT_CATEGORIES } from "@/constants";
import { DropStatusBadge } from "@/components/admin/DropStatusBadge";
import {
  closeDropNowAction,
  createDropAction,
  deleteDropAction,
  updateDropAction,
} from "@/app/(dashboard)/admin/drops/actions";

interface DropFormProps {
  products: Product[];
  /** null when creating a new drop */
  drop: WeeklyDrop | null;
  status?: DropStatus;
  initial: DropFormInput;
}

type Pending = "save" | "close" | "delete" | null;

const labelClass =
  "block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500";
const inputClass =
  "w-full rounded-lg border border-stone-200 px-3 py-2.5 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20";

export default function DropForm({ products, drop, status, initial }: DropFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState({
    name: initial.name,
    opens_at: initial.opens_at,
    closes_at: initial.closes_at,
    pickup_date: initial.pickup_date,
    pickup_window: initial.pickup_window,
  });
  // Count per product id, kept as the raw input string so the field can be empty.
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries(initial.items.map((i) => [i.product_id, String(i.quantity)]))
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reservedOf = new Map(drop?.items.map((i) => [i.product_id, i.reserved]) ?? []);
  const groups = PRODUCT_CATEGORIES.map((category) => ({
    category,
    products: products.filter((p) => p.category === category),
  })).filter((g) => g.products.length > 0);

  const selectedCounts = Object.values(counts).map(Number).filter((q) => q > 0);
  const totalUnits = selectedCounts.reduce((sum, q) => sum + q, 0);

  function setField(name: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [name]: e.target.value }));
  }

  async function perform(kind: Pending, action: () => Promise<{ error?: string }>) {
    setPending(kind);
    setError(null);
    const result = await action();
    setPending(null);
    if (result.error) {
      setError(result.error);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const data: DropFormInput = {
      ...fields,
      items: Object.entries(counts).map(([product_id, value]) => ({
        product_id,
        quantity: value === "" ? 0 : Number(value),
      })),
    };
    const ok = await perform("save", () =>
      drop ? updateDropAction(drop.id, data) : createDropAction(data)
    );
    if (ok) {
      router.push("/admin/drops");
      router.refresh();
    }
  }

  async function handleClose() {
    if (!drop) return;
    const ok = await perform("close", () => closeDropNowAction(drop.id));
    if (ok) router.refresh();
  }

  async function handleDelete() {
    if (!drop) return;
    const ok = await perform("delete", () => deleteDropAction(drop.id));
    if (ok) {
      router.push("/admin/drops");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5 pb-24">
      {/* Heading */}
      <div>
        <Link
          href="/admin/drops"
          className="font-sans text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          ← Weekly Drops
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-sans text-2xl font-semibold text-stone-900">
            {drop ? drop.name : "New Drop"}
          </h1>
          {status && <DropStatusBadge status={status} />}
        </div>
      </div>

      {/* Details */}
      <section className="space-y-4 rounded-xl border border-stone-100 bg-white p-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            required
            value={fields.name}
            onChange={setField("name")}
            placeholder="e.g. Thanksgiving Week Drop"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="opens_at" className={labelClass}>
              Orders open <span className="text-red-400">*</span>
            </label>
            <input
              id="opens_at"
              type="datetime-local"
              required
              value={fields.opens_at}
              onChange={setField("opens_at")}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="closes_at" className={labelClass}>
              Orders close <span className="text-red-400">*</span>
            </label>
            <input
              id="closes_at"
              type="datetime-local"
              required
              value={fields.closes_at}
              onChange={setField("closes_at")}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pickup_date" className={labelClass}>
              Pickup date <span className="text-red-400">*</span>
            </label>
            <input
              id="pickup_date"
              type="date"
              required
              value={fields.pickup_date}
              onChange={setField("pickup_date")}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pickup_window" className={labelClass}>
              Pickup time
            </label>
            <input
              id="pickup_window"
              value={fields.pickup_window}
              onChange={setField("pickup_window")}
              placeholder="3–5pm"
              className={inputClass}
            />
          </div>
        </div>
        <p className="font-sans text-xs text-stone-400">
          Times are in bakery time ({BAKERY_TIMEZONE.replace("_", " ")}).
        </p>
      </section>

      {/* Products */}
      <section className="rounded-xl border border-stone-100 bg-white p-5">
        <h2 className="font-sans text-base font-semibold text-stone-900">Products</h2>
        <p className="mt-0.5 font-sans text-sm text-stone-500">
          Set how many of each product are available in this drop. Leave blank to leave it out.
        </p>

        <div className="mt-4 space-y-5">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                {group.category}
              </p>
              <ul className="divide-y divide-stone-50">
                {group.products.map((product) => {
                  const reserved = reservedOf.get(product.id) ?? 0;
                  return (
                    <li key={product.id} className="flex items-center gap-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm text-stone-900">{product.name}</p>
                        <p className="font-sans text-xs text-stone-400">
                          {CURRENCY_SYMBOL}
                          {(product.price / 100).toFixed(2)}
                          {reserved > 0 && (
                            <span className="text-amber-700"> · {reserved} already ordered</span>
                          )}
                        </p>
                      </div>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={reserved}
                        step={1}
                        aria-label={`Count for ${product.name}`}
                        value={counts[product.id] ?? ""}
                        onChange={(e) =>
                          setCounts((c) => ({ ...c, [product.id]: e.target.value }))
                        }
                        placeholder="0"
                        className="w-20 rounded-lg border border-stone-200 px-3 py-2 text-right font-sans text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone — existing drops only */}
      {drop && (
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-100 bg-white p-5">
          {status === "open" && (
            <button
              type="button"
              onClick={handleClose}
              disabled={pending !== null}
              className="rounded-lg border border-stone-200 px-4 py-2.5 font-sans text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60"
            >
              {pending === "close" ? "Closing…" : "Close orders now"}
            </button>
          )}
          {confirmDelete ? (
            <span className="flex items-center gap-3">
              <span className="font-sans text-sm text-stone-500">Delete this drop?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending !== null}
                className="font-sans text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-60"
              >
                {pending === "delete" ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="font-sans text-sm font-semibold text-stone-400 hover:text-stone-700"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="font-sans text-sm font-semibold text-stone-400 transition-colors hover:text-red-600"
            >
              Delete drop
            </button>
          )}
        </section>
      )}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-100 bg-white/95 px-4 py-3 backdrop-blur md:left-56">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-sm text-stone-500">
            {selectedCounts.length} product{selectedCounts.length !== 1 ? "s" : ""} ·{" "}
            {totalUnits} unit{totalUnits !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3">
            {error && <p className="font-sans text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={pending !== null}
              className="rounded-lg bg-stone-900 px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
            >
              {pending === "save" ? "Saving…" : drop ? "Save Changes" : "Create Drop"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
