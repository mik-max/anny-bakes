import Image from "next/image";
import { mockProducts } from "@/data/products";
import { toggleProductStock } from "@/app/(dashboard)/admin/actions";
import { CURRENCY_SYMBOL } from "@/constants";

function formatCents(cents: number) {
  return `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;
}

export default function AdminProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold text-stone-900">Products</h1>
        <p className="mt-0.5 font-sans text-sm text-stone-500">
          {mockProducts.length} products
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-100 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
                Product
              </th>
              <th className="hidden px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400 sm:table-cell">
                Price
              </th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
                Stock
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {mockProducts.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-stone-50/50">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-stone-900">
                        {product.name}
                      </p>
                      <p className="line-clamp-1 font-sans text-xs text-stone-400">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3.5 font-sans text-sm text-stone-900 sm:table-cell">
                  {formatCents(product.price)}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold ${
                      product.in_stock
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <form action={toggleProductStock.bind(null, product.id, !product.in_stock)}>
                    <button
                      type="submit"
                      className="font-sans text-xs font-semibold text-stone-500 transition-colors hover:text-stone-900"
                    >
                      {product.in_stock ? "Mark Out of Stock" : "Mark In Stock"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
