import Image from "next/image";
import type { ReactNode } from "react";
import { Product } from "@/types";
import { CURRENCY_SYMBOL } from "@/constants";

interface ProductCardProps {
  product: Product;
  /** Small label over the image, e.g. "3 left" */
  badge?: ReactNode;
  /** Shown beside the price, e.g. an add-to-cart button */
  action?: ReactNode;
}

export default function ProductCard({ product, badge, action }: ProductCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
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
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 font-sans text-xs font-semibold text-stone-800 shadow-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 font-serif italic text-xl text-stone-800">{product.name}</h3>
        {product.description && (
          <p className="mb-3 line-clamp-2 font-sans text-sm leading-relaxed text-stone-500">
            {product.description}
          </p>
        )}
        {product.ingredients && (
          <p className="mb-3 font-sans text-xs leading-relaxed text-stone-400">
            <span className="font-semibold text-stone-500">Ingredients: </span>
            {product.ingredients}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-sans text-base font-semibold text-stone-900">
            {CURRENCY_SYMBOL}
            {(product.price / 100).toFixed(2)}
          </span>
          {action}
        </div>
      </div>
    </div>
  );
}
