import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import CatalogueSection from "@/components/CatalogueSection";
import Footer from "@/components/Footer";
import { getAllProducts } from "@/backend/products";

// Menu comes from the database — render per request, not at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getAllProducts();

  return (
    <>
      <main>
        <HeroSection />
        <div id="catalogue">
          <FeaturedSection products={products.slice(0, 3)} />
        </div>
        <CatalogueSection products={products} />
      </main>
      <Footer />
    </>
  );
}
