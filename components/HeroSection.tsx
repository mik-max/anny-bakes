"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IMAGES } from "@/constants/images";
import { getImageProps } from "next/image";
import ScrollLink from "@/components/ScrollLink";
import SiteMenu from "@/components/SiteMenu";
import FlourDust from "@/components/FlourDust";
import NudgeArrow from "@/components/NudgeArrow";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const nav = section.querySelector<HTMLElement>(".hero-nav");
    const eyebrow = section.querySelector<HTMLElement>(".hero-eyebrow");
    const headline = section.querySelector<HTMLElement>(".hero-headline");
    const description = section.querySelector<HTMLElement>(".hero-description");
    const cta = section.querySelector<HTMLElement>(".hero-cta");

    if (!nav || !eyebrow || !headline || !description || !cta) return;

    const ctx = gsap.context(() => {
      // Split the headline into visual lines so each slides up behind its own mask
      const split = new SplitText(headline, { type: "lines", mask: "lines" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(nav, { opacity: 0, y: -18, duration: 0.7 })
        .from(eyebrow, { opacity: 0, duration: 0.5 }, "-=0.3")
        .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.14 }, "-=0.15")
        .from(description, { opacity: 0, y: 18, duration: 0.65 }, "+=0.05")
        .from(cta, { opacity: 0, y: 12, duration: 0.55 }, "-=0.35");
    }, section);

    // Ambient life, skipped entirely for visitors who prefer reduced motion.
    // At rest (top of the page, first paint) the hero looks exactly as designed.
    const mm = gsap.matchMedia(section);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The photo breathes: a slow zoom in and back out, paused while scrolled away.
      const breathe = gsap.to(".hero-photo", {
        scale: 1.06,
        duration: 22,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => breathe.paused(!self.isActive),
      });

      // Scrolling away: the photo drifts slower than the page.
      gsap.to(".hero-parallax", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
    });

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  // Art direction: the landscape photo on landscape screens, a portrait crop on phones.
  const common = { alt: "Freshly baked breads and pastries", sizes: "100vw", quality: 90 };
  const {
    props: { srcSet: landscapeSrcSet },
  } = getImageProps({ ...common, src: IMAGES.heroDesktop });
  const {
    props: { srcSet: portraitSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: IMAGES.heroMobile });

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-stone-900"
    >
      {/* Photo + drifting flour move together for the scroll parallax */}
      <div className="hero-parallax absolute inset-0 will-change-transform">
        <picture>
          <source media="(orientation: landscape)" srcSet={landscapeSrcSet} />
          <img
            {...imgProps}
            srcSet={portraitSrcSet}
            alt={common.alt}
            loading="eager"
            fetchPriority="high"
            className="hero-photo absolute inset-0 h-full w-full object-cover object-center will-change-transform"
          />
        </picture>
        <FlourDust />
      </div>
      {/* Soft scrims only where text sits, so the photo shows at full brightness */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/60 to-transparent" />
      {/* Phones get a stronger scrim: the headline covers more of the photo there */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 via-black/55 to-transparent md:from-black/85 md:via-black/35" />

      <div className="relative z-10 flex h-full flex-col px-5 py-5 md:px-12 md:py-9">

        {/* Nav */}
        <nav className="hero-nav flex items-center justify-between">
          {/* Left: hamburger */}
          <SiteMenu className="text-white/90 hover:text-white" />

          {/* Centre: brand */}
          <span className="select-none font-serif text-2xl font-normal tracking-wide text-white md:text-[1.75rem]">
            Anny Bakes
          </span>

          {/* Right: Order Now — hidden on mobile, replaced by the hero CTA below */}
          <ScrollLink
            targetId="weekly-drop"
            className="group hidden items-center gap-1.5 text-sm text-white/90 transition-colors hover:text-white sm:flex"
          >
            Order Now <NudgeArrow />
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
              {" "}<em>Anny</em>thing, baked fresh.
            </p>
            <div className="hero-cta">
              <ScrollLink
                targetId="weekly-drop"
                className="group inline-flex items-center gap-2 bg-[#F5EFE6] px-6 py-3 font-sans text-sm font-medium text-stone-900 transition-colors hover:bg-white"
              >
                View Weekly Menu <NudgeArrow />
              </ScrollLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
