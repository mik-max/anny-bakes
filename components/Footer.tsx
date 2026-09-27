"use client";

import Link from "next/link";
import ScrollLink from "@/components/ScrollLink";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 text-white">
      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div>
            <p className="font-serif text-2xl text-white">Anny Bakes</p>
            <p className="mt-0.5 font-sans text-sm text-stone-400">Cakes &amp; Treats</p>
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-stone-500">
              Small batch. Real ingredients. Baked fresh to order.
            </p>
          </div>

          {/* Quick links */}
          <nav className="flex flex-col gap-2.5">
            <p className="mb-0.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Quick Links
            </p>
            <ScrollLink
              targetId="weekly-drop"
              className="text-left font-sans text-sm text-stone-400 transition-colors hover:text-white"
            >
              Weekly Drop
            </ScrollLink>
            <Link
              href="/about"
              className="text-left font-sans text-sm text-stone-400 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="/menu"
              className="text-left font-sans text-sm text-stone-400 transition-colors hover:text-white"
            >
              Full Menu
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-stone-800/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-1 px-6 py-4 sm:px-10 lg:px-16">
          <p className="font-sans text-xs text-stone-600">
            © {year} Anny Bakes Cakes and Treats.
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs text-stone-500 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/sign-in"
              className="font-sans text-xs text-stone-700 transition-colors hover:text-stone-500"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
