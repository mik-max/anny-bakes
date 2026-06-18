import { getAllProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ScrollLink from "@/components/ScrollLink";

export default function FeaturedSection() {
  const featured = getAllProducts().slice(0, 3);

  return (
    <section className="bg-[#FAF6F0] px-6 py-20 md:py-28">
      {/* Header */}
      <div className="mx-auto max-w-5xl text-center mb-16">
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Featured Favorites
        </p>
        <h2 className="font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900 mb-4">
          Our Best Sellers
        </h2>
        <p className="font-sans text-base text-stone-500">
          The pastries our guests return for every morning.
        </p>
      </div>

      {/* Card grid — middle card sits higher than the two side cards */}
      <div className="mx-auto max-w-5xl flex flex-col gap-6 md:flex-row md:items-start">
        {featured.map((product, index) => (
          <div key={product.id} className="flex-1">
            <ProductCard product={product} elevated={index === 1} />
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-16 text-center">
        <ScrollLink
          targetId="full-menu"
          className="inline-flex items-center gap-2 font-sans font-semibold text-stone-900 transition-colors hover:text-stone-500"
        >
          View Full Menu <span aria-hidden>→</span>
        </ScrollLink>
      </div>
    </section>
  );
}
