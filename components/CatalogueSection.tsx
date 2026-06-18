"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getAllProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import TextReveal from "@/components/TextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function CatalogueSection() {
  const products = getAllProducts();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Eyebrow + description fade up
      gsap.from(".cs-eyebrow, .cs-description", {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cs-eyebrow",
          start: "top 88%",
          once: true,
        },
      });

      // Each card animates independently when it crosses the 65% viewport mark.
      // Column position (i % 3) adds a left-to-right cascade within each row.
      gsap.utils.toArray<HTMLElement>(".cs-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 1,
          delay: (i % 3) * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 65%",
            once: true,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="full-menu" className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="cs-eyebrow mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Everything We Make
          </p>
          <h2 className="mb-4 font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900">
            <TextReveal>Our Full Menu</TextReveal>
          </h2>
          <p className="cs-description font-sans text-base text-stone-500">
            Baked fresh daily — order by midday for same-day pickup or delivery.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="cs-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
