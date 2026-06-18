"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getAllProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ScrollLink from "@/components/ScrollLink";
import TextReveal from "@/components/TextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedSection() {
  const featured = getAllProducts().slice(0, 3);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Eyebrow + description + CTA fade up on scroll
      gsap.from(".fs-eyebrow, .fs-description, .fs-cta", {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".fs-eyebrow",
          start: "top 88%",
          once: true,
        },
      });

      // Each card gets its own scroll trigger so they animate as they individually
      // enter the lower half of the viewport. Column-based delay keeps the
      // left-to-right cascade within a row.
      gsap.utils.toArray<HTMLElement>(".fs-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 1,
          delay: i * 0.1,
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
    <section ref={sectionRef} className="bg-[#FAF6F0] px-6 py-20 md:py-28">

      {/* Header */}
      <div className="mx-auto mb-16 max-w-5xl text-center">
        <p className="fs-eyebrow mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Featured Favorites
        </p>
        <h2 className="mb-4 font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900">
          <TextReveal>Our Best Sellers</TextReveal>
        </h2>
        <p className="fs-description font-sans text-base text-stone-500">
          The pastries our guests return for every morning.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start">
        {featured.map((product, index) => (
          <div key={product.id} className="fs-card flex-1">
            <ProductCard product={product} elevated={index === 1} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <ScrollLink
          targetId="full-menu"
          className="fs-cta inline-flex items-center gap-2 font-sans font-semibold text-stone-900 transition-colors hover:text-stone-500"
        >
          View Full Menu <span aria-hidden>→</span>
        </ScrollLink>
      </div>

    </section>
  );
}
