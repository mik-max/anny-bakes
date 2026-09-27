"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cart";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import { productImage } from "@/lib/images";

export default function CartDrawer() {
  const pathname = usePathname();
  const {
    items,
    isOpen: open,
    openCart,
    closeCart,
    removeItem,
    updateQuantity,
    subtotalCents,
  } = useCartStore();

  if (pathname.startsWith("/admin") || pathname.startsWith("/sign-in")) return null;

  const totalItems = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = subtotalCents();

  return (
    <>
      {/* ── Floating cart trigger ── */}
      <button
        onClick={openCart}
        aria-label="Open cart"
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-stone-900 px-4 py-3 text-white shadow-lg transition-colors hover:bg-stone-700",
          totalItems === 0 && "px-3.5"
        )}
      >
        <ShoppingBag size={20} strokeWidth={1.75} />
        {totalItems > 0 && (
          <span className="font-sans text-sm font-medium">
            {totalItems} · {CURRENCY_SYMBOL}{(subtotal / 100).toFixed(2)}
          </span>
        )}
      </button>

      {/* ── Backdrop ── */}
      <div
        onClick={closeCart}
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
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="font-serif text-xl text-stone-900 sm:text-2xl">Your Cart</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag size={48} strokeWidth={1.75} className="text-stone-200" />
            <p className="font-serif italic text-xl text-stone-600">Your cart is empty</p>
            <p className="font-sans text-sm text-stone-400">
              Add something delicious to get started.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto px-4 sm:px-6">
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
          <div className="space-y-4 border-t border-stone-100 px-4 py-4 sm:px-6 sm:py-5">
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
              onClick={closeCart}
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
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5EFE6]">
        <Image
          src={productImage(item.product)}
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
            <X size={14} strokeWidth={2} />
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
              disabled={item.quantity >= item.maxQuantity}
              aria-label="Increase quantity"
              className="font-sans text-sm text-stone-400 transition-colors hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
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
