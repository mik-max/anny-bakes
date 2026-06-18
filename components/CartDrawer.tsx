"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, CartItem } from "@/store/cart";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQuantity, subtotalCents } = useCartStore();

  const totalItems = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = subtotalCents();

  return (
    <>
      {/* ── Floating cart trigger ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-stone-900 px-4 py-3 text-white shadow-lg transition-colors hover:bg-stone-700",
          totalItems === 0 && "px-3.5"
        )}
      >
        <BagIcon />
        {totalItems > 0 && (
          <span className="font-sans text-sm font-medium">
            {totalItems} · {CURRENCY_SYMBOL}{(subtotal / 100).toFixed(2)}
          </span>
        )}
      </button>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Drawer panel ── */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
          <h2 className="font-serif text-2xl text-stone-900">Your Cart</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <BagIcon size={48} className="text-stone-200" />
            <p className="font-serif italic text-xl text-stone-600">Your cart is empty</p>
            <p className="font-sans text-sm text-stone-400">
              Add something delicious to get started.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto px-6">
            {items.map((item) => (
              <CartLineItem
                key={item.product.id}
                item={item}
                onUpdateQty={(qty) => updateQuantity(item.product.id, qty)}
                onRemove={() => removeItem(item.product.id)}
              />
            ))}
          </ul>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-stone-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-stone-500">Subtotal</span>
              <span className="font-sans text-base font-semibold text-stone-900">
                {CURRENCY_SYMBOL}{(subtotal / 100).toFixed(2)}
              </span>
            </div>
            <p className="font-sans text-xs text-stone-400">
              Delivery fee calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 bg-stone-900 py-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700"
            >
              Proceed to Checkout <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function CartLineItem({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-4 py-4">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
        <Image
          src={item.product.image_url}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-serif italic text-base leading-tight text-stone-800">
            {item.product.name}
          </p>
          <button
            onClick={onRemove}
            aria-label={`Remove ${item.product.name}`}
            className="flex-shrink-0 text-stone-300 transition-colors hover:text-stone-600"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Qty stepper */}
          <div className="flex items-center gap-2 rounded-full border border-stone-200 px-2.5 py-1">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              aria-label="Decrease quantity"
              className="font-sans text-sm text-stone-400 transition-colors hover:text-stone-900"
            >
              −
            </button>
            <span className="w-4 text-center font-sans text-sm text-stone-800">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              aria-label="Increase quantity"
              className="font-sans text-sm text-stone-400 transition-colors hover:text-stone-900"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span className="font-sans text-sm font-semibold text-stone-900">
            {CURRENCY_SYMBOL}{((item.product.price * item.quantity) / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </li>
  );
}

function BagIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
