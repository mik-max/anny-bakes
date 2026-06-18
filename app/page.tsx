import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import CatalogueSection from "@/components/CatalogueSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div id="catalogue">
        <FeaturedSection />
      </div>
      <CatalogueSection />
    </main>
  );
}
