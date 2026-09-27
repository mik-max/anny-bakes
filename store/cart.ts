import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
  /** Units left in the drop when added — the server re-checks at checkout. */
  maxQuantity: number;
}

interface CartStore {
  /** Every item in the cart belongs to this drop. */
  dropId: string | null;
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, dropId: string, maxQuantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalCents: () => number;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      dropId: null,
      items: [],
      isOpen: false,

      addItem: (product, dropId, maxQuantity) => {
        set((state) => {
          // Items from an earlier drop can't be ordered any more — start fresh.
          const items = state.dropId === dropId ? state.items : [];
          const existing = items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              dropId,
              items: items.map((i) =>
                i.product.id === product.id
                  ? { ...i, maxQuantity, quantity: Math.min(i.quantity + 1, maxQuantity) }
                  : i
              ),
            };
          }
          return { dropId, items: [...items, { product, quantity: 1, maxQuantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], dropId: null }),

      subtotalCents: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "ovenly-cart",
      // v1: carts are tied to a drop. Older carts can't be checked out, so drop them.
      version: 1,
      migrate: () => ({ items: [], dropId: null }),
      partialize: ({ items, dropId }) => ({ items, dropId }),
    }
  )
);
