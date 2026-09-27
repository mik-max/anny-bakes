"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { StorefrontDrop } from "@/types";
import { useCartStore } from "@/store/cart";
import { formatBakeryDateTime, formatPickupDate } from "@/lib/time";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import Countdown from "@/components/Countdown";
import TextReveal from "@/components/TextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function WeeklyDropSection({ drop }: { drop: StorefrontDrop | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isOpen = drop?.status === "open";
  const openDropId = isOpen ? drop.id : null;

  // A cart from a drop that's no longer open can't be checked out — clear it.
  const cartDropId = useCartStore((s) => s.dropId);
  const clearCart = useCartStore((s) => s.clearCart);
  const openCart = useCartStore((s) => s.openCart);
  useEffect(() => {
    if (cartDropId && cartDropId !== openDropId) clearCart();
  }, [cartDropId, openDropId, clearCart]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Eyebrow + description + countdown + CTA fade up on scroll
      gsap.from(".wd-fade", {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".wd-fade",
          start: "top 88%",
          once: true,
        },
      });

      // Each card animates independently when it crosses the 65% viewport mark.
      // Column position (i % 3) adds a left-to-right cascade within each row.
      gsap.utils.toArray<HTMLElement>(".wd-card").forEach((card, i) => {
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
    <section ref={sectionRef} id="weekly-drop" className="bg-[#FAF6F0] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="wd-fade mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            {isOpen ? "Pre-order now" : "This week"}
          </p>
          <h2 className="mb-4 font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900">
            <TextReveal>Your Weekly Drops</TextReveal>
          </h2>
          <p className="wd-fade font-sans text-base text-stone-500">
            {!drop
              ? "Our next drop is coming soon — check back shortly."
              : isOpen
                ? `Pre-order closes ${formatBakeryDateTime(drop.closes_at)} for pickup ${formatPickupDate(drop.pickup_date)}, ${drop.pickup_window}.`
                : `Pre-orders open ${formatBakeryDateTime(drop.opens_at)} for pickup ${formatPickupDate(drop.pickup_date)}, ${drop.pickup_window}.`}
          </p>
        </div>

        {drop && (
          <>
            {/* Countdown */}
            <div className="wd-fade mb-14">
              <Countdown
                target={isOpen ? drop.closes_at : drop.opens_at}
                label={isOpen ? "Orders close in" : "Orders open in"}
              />
            </div>

            {/* Drop items */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {drop.items.map(({ product, remaining }) => (
                <div key={product.id} className="wd-card">
                  <ProductCard
                    product={product}
                    badge={remaining === 0 ? "Sold out" : `${remaining} left`}
                    action={
                      isOpen ? (
                        <AddToCartButton product={product} dropId={drop.id} remaining={remaining} />
                      ) : (
                        <span className="font-sans text-sm text-stone-400">Opens soon</span>
                      )
                    }
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
            {isOpen && (
              <div className="mt-14 text-center">
                <button
                  onClick={openCart}
                  className="wd-fade inline-flex items-center gap-2 bg-stone-900 px-7 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700"
                >
                  Order Weekly Drop <span aria-hidden>→</span>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
