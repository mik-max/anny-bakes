"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { IMAGES } from "@/constants/images";
import Image from "next/image";
import ScrollLink from "@/components/ScrollLink";

gsap.registerPlugin(SplitText);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const nav         = section.querySelector<HTMLElement>(".hero-nav");
    const eyebrow     = section.querySelector<HTMLElement>(".hero-eyebrow");
    const headline    = section.querySelector<HTMLElement>(".hero-headline");
    const description = section.querySelector<HTMLElement>(".hero-description");
    const cta         = section.querySelector<HTMLElement>(".hero-cta");

    if (!nav || !eyebrow || !headline || !description || !cta) return;

    const ctx = gsap.context(() => {
      // Split the headline into visual lines so each slides up behind its own mask
      const split = new SplitText(headline, { type: "lines", mask: "lines" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(nav,         { opacity: 0, y: -18, duration: 0.7 })
        .from(eyebrow,     { opacity: 0, duration: 0.5 },           "-=0.3")
        .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.14 }, "-=0.15")
        .from(description, { opacity: 0, y: 18, duration: 0.65 },  "+=0.05")
        .from(cta,         { opacity: 0, y: 12, duration: 0.55 },  "-=0.35");
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-stone-900"
    >
      <Image
        src={IMAGES.hero}
        alt="Freshly baked goods"
        fill
        priority
        className="object-cover object-center"
        onError={() => {}}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/20 to-transparent" />

      <div className="relative z-10 flex h-full flex-col px-5 py-5 md:px-12 md:py-9">

        {/* Nav */}
        <nav className="hero-nav flex items-center justify-between">
          {/* Left: hamburger */}
          <button
            aria-label="Open menu"
            className="flex items-center gap-2.5 text-white/90 transition-colors hover:text-white"
          >
            <HamburgerIcon />
            <span className="hidden font-sans text-sm uppercase tracking-widest sm:inline">Menu</span>
          </button>

          {/* Centre: brand */}
          <span className="select-none font-serif text-2xl font-normal tracking-wide text-white md:text-[1.75rem]">
            Anny Bakes
          </span>

          {/* Right: Order Now — hidden on mobile, replaced by the hero CTA below */}
          <ScrollLink
            targetId="weekly-drop"
            className="hidden items-center gap-1.5 text-sm text-white/90 transition-colors hover:text-white sm:flex"
          >
            Order Now <span aria-hidden>→</span>
          </ScrollLink>

          {/* Invisible spacer keeps brand centred on mobile */}
          <div className="w-6 sm:hidden" aria-hidden />
        </nav>

        <div className="flex-1" />

        {/* Bottom content */}
        <div className="flex flex-col gap-8 pb-6 md:flex-row md:items-end md:justify-between md:pb-10">

          {/* Left: eyebrow + headline */}
          <div>
            <p className="hero-eyebrow mb-3 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Small Batch. Real Ingredients.
            </p>
            <h1 className="hero-headline font-serif text-[clamp(2.25rem,7vw,5.5rem)] font-semibold leading-[1.05] text-[#F5EFE6]">
              Baked Fresh
              <br />
              <em className="font-serif font-normal italic">to Order.</em>
            </h1>
          </div>

          {/* Right: description + CTA */}
          <div className="flex flex-col items-start gap-5 md:max-w-[320px] md:items-end">
            <p className="hero-description font-sans text-sm leading-relaxed text-white/75 md:text-right">
              Cookies, muffins, cakes, breads and pastries — never frozen.
              Annything, baked fresh.
            </p>
            <div className="hero-cta">
              <ScrollLink
                targetId="weekly-drop"
                className="inline-flex items-center gap-2 bg-[#F5EFE6] px-6 py-3 font-sans text-sm font-medium text-stone-900 transition-colors hover:bg-white"
              >
                View Weekly Menu <span aria-hidden>→</span>
              </ScrollLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
