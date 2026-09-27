"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { PENDING_CHECKOUT_KEY } from "@/lib/checkout";

/** Empties the cart once an order has been paid. Renders nothing. */
export default function ClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    try {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    } catch {
      // Storage unavailable — nothing to clear.
    }
  }, [clearCart]);

  return null;
}
