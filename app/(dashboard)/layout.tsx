import Link from "next/link";
import { ClerkProvider, SignOutButton } from "@clerk/nextjs";
import { CalendarDays, ClipboardList, House, LogOut, Package } from "lucide-react";

const iconProps = { size: 16, strokeWidth: 1.75 };

// ClerkProvider lives here and in (auth) rather than the root layout,
// so the public storefront doesn't load Clerk's client script.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in">
    <div className="flex min-h-screen bg-stone-50">

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col border-r border-stone-100 bg-white md:flex">
        {/* Brand */}
        <div className="border-b border-stone-100 px-6 py-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Admin
          </p>
          <p className="mt-0.5 font-sans text-xl font-semibold text-stone-900">Anny Bakes</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <NavLink href="/admin" label="Orders" icon={<ClipboardList {...iconProps} />} />
          <NavLink href="/admin/drops" label="Weekly Drops" icon={<CalendarDays {...iconProps} />} />
          <NavLink href="/admin/products" label="Products" icon={<Package {...iconProps} />} />
        </nav>

        {/* Footer */}
        <div className="border-t border-stone-100 px-3 py-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 font-sans text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
          >
            <House {...iconProps} />
            View Store
          </Link>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-sans text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <LogOut {...iconProps} />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3 md:hidden">
        <p className="font-sans text-lg font-semibold text-stone-900">Anny Bakes Admin</p>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-sans text-sm text-stone-600 hover:text-stone-900">Orders</Link>
          <Link href="/admin/drops" className="font-sans text-sm text-stone-600 hover:text-stone-900">Drops</Link>
          <Link href="/admin/products" className="font-sans text-sm text-stone-600 hover:text-stone-900">Products</Link>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-56">
        <div className="mt-12 md:mt-0 px-4 py-5 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
    </ClerkProvider>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 font-sans text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
    >
      {icon}
      {label}
    </Link>
  );
}
