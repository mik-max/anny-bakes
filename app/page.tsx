import HeroSection from "@/components/HeroSection";
import WeeklyDropSection from "@/components/WeeklyDropSection";
import BestSellersSection from "@/components/BestSellersSection";
import Footer from "@/components/Footer";
import { PendingScroll } from "@/components/ScrollLink";
import { getAllProducts } from "@/backend/products";
import { getStorefrontDrop } from "@/backend/drops";

// Menu and drop come from the database — render per request, not at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [drop, products] = await Promise.all([getStorefrontDrop(), getAllProducts()]);
  const inDropIds = drop?.status === "open" ? drop.items.map((i) => i.product.id) : [];

  return (
    <>
      <main>
        <HeroSection />
        <WeeklyDropSection drop={drop} />
        <BestSellersSection
          products={products.filter((p) => p.featured)}
          inDropIds={inDropIds}
        />
      </main>
      <Footer />
      <PendingScroll />
    </>
  );
}
