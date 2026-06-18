"use client";
import { IMAGES } from "@/constants/images";
import Image from "next/image";
import ScrollLink from "@/components/ScrollLink";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-stone-900">
      {/* Background image — drop your photo at /public/images/hero-bg.jpg */}
      <Image
        src={IMAGES.hero}
        alt="Freshly baked goods"
        fill
        priority
        className="object-cover object-center"
        onError={() => { }}
      />

      {/* Base tint — darkens the whole image for moodiness */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Bottom gradient — extra depth where the text lives */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      {/* Page content */}
      <div className="relative z-10 flex h-full flex-col px-8 py-7 md:px-12 md:py-9">

        {/* ── Nav ── */}
        <nav className="flex items-center justify-between">
          {/* Left: hamburger + Menu */}
          <button
            aria-label="Open menu"
            className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors"
          >
            <HamburgerIcon />
            <span className="text-sm font-sans tracking-widest uppercase">
              Menu
            </span>
          </button>

          {/* Centre: brand name */}
          <span className="font-serif text-[1.75rem] font-normal tracking-wide text-white select-none">
            Anny Bakes
          </span>

          {/* Right: Order Now */}
          <ScrollLink
            targetId="catalogue"
            className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors"
          >
            Order Now <span aria-hidden>→</span>
          </ScrollLink>
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Bottom content ── */}
        <div className="flex flex-col gap-8 pb-6 md:flex-row md:items-end md:justify-between md:pb-10">

          {/* Left: eyebrow + headline */}
          <div>
            <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.22em] text-white/70">
              Small Batch. Real Ingredients.
            </p>
            <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[1.05] text-[#F5EFE6]">
              Baked Fresh.
              <br />
              Every{" "}
              <em className="font-serif italic font-normal">Single Day.</em>
            </h1>
          </div>

          {/* Right: description + CTA */}
          <div className="flex flex-col items-start gap-5 md:items-end md:max-w-[320px]">
            <p className="font-sans text-sm leading-relaxed text-white/75 md:text-right">
              From classic sponges to indulgent cakes — everything leaves our
              kitchen fresh, never frozen.
            </p>
            <ScrollLink
              targetId="full-menu"
              className="inline-flex items-center gap-2 bg-[#F5EFE6] px-6 py-3 text-sm font-sans font-medium text-stone-900 transition-colors hover:bg-white"
            >
              View Our Menu <span aria-hidden>→</span>
            </ScrollLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      aria-hidden="true"
    >
      <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
