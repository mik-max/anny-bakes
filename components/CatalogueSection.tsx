import { getAllProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function CatalogueSection() {
  return (
    <section id="full-menu" className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Everything We Make
          </p>
          <h2 className="font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900 mb-4">
            Our Full Menu
          </h2>
          <p className="font-sans text-base text-stone-500">
            Baked fresh daily — order by midday for same-day pickup or delivery.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getAllProducts().map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
