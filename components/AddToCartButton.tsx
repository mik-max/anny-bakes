"use client";

import { useCartStore } from "@/store/cart";
import { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  dropId: string;
  remaining: number;
}

export default function AddToCartButton({ product, dropId, remaining }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) =>
    s.dropId === dropId ? (s.items.find((i) => i.product.id === product.id)?.quantity ?? 0) : 0
  );

  const label = !product.in_stock
    ? "Unavailable"
    : remaining === 0
      ? "Sold Out"
      : inCart >= remaining
        ? "All in Cart"
        : "Add to Cart →";

  return (
    <button
      onClick={() => addItem(product, dropId, remaining)}
      disabled={!product.in_stock || inCart >= remaining}
      className="font-sans text-sm text-amber-700 transition-colors hover:text-amber-900 disabled:cursor-not-allowed disabled:text-stone-400"
    >
      {label}
    </button>
  );
}
