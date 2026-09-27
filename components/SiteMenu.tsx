"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import ScrollLink from "@/components/ScrollLink";
import { SOCIAL_LABELS, SocialIcon, type SocialNetwork } from "@/components/SocialIcon";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/constants";
import { cn } from "@/lib/utils";

const linkClass =
  "block text-left font-serif text-4xl italic text-[#F5EFE6] transition-colors hover:text-white sm:text-5xl";

const socials = (Object.entries(SOCIAL_LINKS) as [SocialNetwork, string][]).filter(
  ([, href]) => href
);

/** Hamburger button + full-screen site menu. */
export default function SiteMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Freeze the page behind the menu (programmatic scrolling still works).
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const trigger = triggerRef.current;
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      // preventScroll: don't jump back to the top after a menu link scrolled the page.
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className={cn("flex items-center gap-2.5 transition-colors", className)}
      >
        <Menu size={24} strokeWidth={1.5} />
        <span className="hidden font-sans text-sm uppercase tracking-widest sm:inline">Menu</span>
      </button>

      {/* Portalled to <body>: a transformed ancestor (e.g. the animated hero nav)
          would otherwise trap this fixed overlay inside itself. */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-stone-950 px-5 py-5 duration-300 animate-in fade-in md:px-12 md:py-9"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl text-white md:text-[1.75rem]">Anny Bakes</span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Links — any click inside closes the menu */}
            <nav onClick={close} className="my-auto space-y-5 py-12 sm:space-y-6">
              <Link href="/about" className={linkClass}>
                About
              </Link>
              <ScrollLink targetId="weekly-drop" className={linkClass}>
                Order
              </ScrollLink>
              <Link href="/menu" className={linkClass}>
                Full Menu
              </Link>
              {CONTACT_EMAIL && (
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                  Contact Us
                </a>
              )}
            </nav>

            {/* Footer */}
            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-6">
              <p className="max-w-xs font-sans text-sm leading-relaxed text-stone-400">
                Small batch. Real ingredients. Baked fresh to order.
              </p>
              {socials.length > 0 && (
                <div className="flex items-center gap-4">
                  {socials.map(([network, href]) => (
                    <a
                      key={network}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[network]}
                      className="text-stone-400 transition-colors hover:text-white"
                    >
                      <SocialIcon network={network} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
