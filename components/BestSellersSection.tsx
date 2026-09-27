"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import TextReveal from "@/components/TextReveal";

gsap.registerPlugin(ScrollTrigger);

interface BestSellersSectionProps {
  products: Product[];
  /** Products in the open drop — labelled so customers know they can order them */
  inDropIds: string[];
}

export default function BestSellersSection({ products, inDropIds }: BestSellersSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Eyebrow + description + CTA fade up
      gsap.from(".bs-fade", {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".bs-fade",
          start: "top 88%",
          once: true,
        },
      });

      // Each card animates independently when it crosses the 65% viewport mark.
      // Column position (i % 3) adds a left-to-right cascade within each row.
      gsap.utils.toArray<HTMLElement>(".bs-card").forEach((card, i) => {
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
    <section ref={sectionRef} id="best-sellers" className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="bs-fade mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Featured
          </p>
          <h2 className="mb-4 font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900">
            <TextReveal>Our Best Sellers</TextReveal>
          </h2>
          <p className="bs-fade font-sans text-base text-stone-500">
            The bakes that make our guests return every morning.
          </p>
        </div>

        {/* Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="bs-card">
                <ProductCard
                  product={product}
                  badge={inDropIds.includes(product.id) ? "In this week's drop" : undefined}
                />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/menu"
            className="bs-fade inline-flex items-center gap-2 font-sans font-semibold text-stone-900 transition-colors hover:text-stone-500"
          >
            View Full Menu <span aria-hidden>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
