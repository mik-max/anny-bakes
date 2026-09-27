import Link from "next/link";
import SiteMenu from "@/components/SiteMenu";
import ScrollLink from "@/components/ScrollLink";

/** Dark top bar for inner pages — mirrors the hero nav on the home page. */
export default function PageHeader() {
  return (
    <header className="flex items-center justify-between bg-stone-900 px-5 py-5 md:px-12">
      <SiteMenu className="text-white/90 hover:text-white" />

      <Link href="/" className="font-serif text-2xl text-white md:text-[1.75rem]">
        Anny Bakes
      </Link>

      {/* Hidden on mobile; invisible spacer keeps the brand centred */}
      <ScrollLink
        targetId="weekly-drop"
        className="hidden items-center gap-1.5 font-sans text-sm text-white/90 transition-colors hover:text-white sm:flex"
      >
        Order Now <span aria-hidden>→</span>
      </ScrollLink>
      <div className="w-6 sm:hidden" aria-hidden />
    </header>
  );
}
