import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/backend/products";
import { getStorefrontDrop } from "@/backend/drops";
import { PRODUCT_CATEGORIES } from "@/constants";
import ProductCard from "@/components/ProductCard";
import ScrollLink from "@/components/ScrollLink";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Full Menu — Anny Bakes Cakes and Treats",
  description:
    "Sourdough, croissants, babka, muffins, cakes and more — everything we bake, fresh to order.",
};

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [products, drop] = await Promise.all([getAllProducts(), getStorefrontDrop()]);
  const inDrop = new Set(drop?.status === "open" ? drop.items.map((i) => i.product.id) : []);

  // Biggest categories first; ties keep the usual category order (sort is stable).
  const groups = PRODUCT_CATEGORIES.map((category) => ({
    category,
    products: products.filter((p) => p.category === category),
  }))
    .filter((g) => g.products.length > 0)
    .sort((a, b) => b.products.length - a.products.length);

  return (
    <>
      <header className="flex items-center justify-between bg-stone-900 px-5 py-5 md:px-12">
        <Link href="/" className="font-serif text-2xl text-white md:text-[1.75rem]">
          Anny Bakes
        </Link>
        <ScrollLink
          targetId="weekly-drop"
          className="font-sans text-sm text-white/90 transition-colors hover:text-white"
        >
          Order Weekly Drop <span aria-hidden>→</span>
        </ScrollLink>
      </header>

      <main className="bg-[#FAF6F0] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              Everything We Bake
            </p>
            <h1 className="mb-4 font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900">
              Our Full Menu
            </h1>
            <p className="font-sans text-base text-stone-500">
              Each week&apos;s drop features a selection from this menu — pre-order it on the{" "}
              <ScrollLink
                targetId="weekly-drop"
                className="font-semibold text-stone-900 underline underline-offset-4"
              >
                home page
              </ScrollLink>
              .
            </p>
          </div>

          <div className="space-y-14">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="mb-6 border-b border-stone-200 pb-3 font-serif text-2xl text-stone-900">
                  {group.category}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badge={inDrop.has(product.id) ? "In this week's drop" : undefined}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
