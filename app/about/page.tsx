import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ScrollLink from "@/components/ScrollLink";
import Footer from "@/components/Footer";
import { IMAGES } from "@/constants/images";

export const metadata: Metadata = {
  title: "About — Anny Bakes Cakes and Treats",
  description:
    "Three generations and 70+ years of baking passion — small-batch bakes made with love, joy and real ingredients.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader />

      <main className="bg-[#FAF6F0]">
        {/* Banner */}
        <div className="relative h-[40vh] min-h-64 w-full overflow-hidden bg-stone-900">
          <Image
            src={IMAGES.hero}
            alt="Freshly baked goods"
            fill
            priority
            className="object-cover object-center opacity-80"
            sizes="100vw"
          />
        </div>

        <section className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Our Story
          </p>
          <h1 className="mb-8 font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-tight text-stone-900">
            About Anny Bakes
          </h1>
          {/* Copy from the client's rollout plan */}
          <p className="font-sans text-lg leading-relaxed text-stone-600">
            Anny Bakes is a vision of delightful, healthy eating inspired by three generations of
            serving our communities in bakes, treats and finger foods for life, all made with love,
            joy and 70+ years of passion and skill passed along.
          </p>
          <p className="mt-6 font-sans text-lg leading-relaxed text-stone-600">
            Our desire is to create tasty gourmet treats that support your health, wholeness and
            happiness.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <ScrollLink
              targetId="weekly-drop"
              className="inline-flex items-center gap-2 bg-stone-900 px-7 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700"
            >
              See This Week&apos;s Drop <span aria-hidden>→</span>
            </ScrollLink>
            <Link
              href="/menu"
              className="font-sans text-sm font-semibold text-stone-900 transition-colors hover:text-stone-500"
            >
              View Full Menu →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
