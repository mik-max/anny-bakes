"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";

interface ProductCardProps {
  product: Product;
  /** Elevates the card above its siblings — used for the staggered hero grid */
  elevated?: boolean;
}

export default function ProductCard({ product, elevated }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg",
        elevated ? "md:mt-0" : "md:mt-10",
        !product.in_stock && "opacity-60"
      )}
    >
      {/* Product image */}
      <div className="relative h-56 w-full">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          // Placeholder until the client supplies product photos
          <div className="flex h-full w-full items-center justify-center bg-[#F5EFE6] font-serif italic text-stone-400">
            {product.category}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="mb-1.5 font-serif italic text-xl text-stone-800">
          {product.name}
        </h3>
        <p className="mb-5 line-clamp-2 font-sans text-sm leading-relaxed text-stone-500">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-sans text-base font-semibold text-stone-900">
            {CURRENCY_SYMBOL}
            {(product.price / 100).toFixed(2)}
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
            className="font-sans text-sm text-amber-700 transition-colors hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.in_stock ? "Add to Cart →" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
