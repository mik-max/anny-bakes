import Link from "next/link";
import { ClerkProvider, SignOutButton } from "@clerk/nextjs";

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
          <NavLink href="/admin" label="Orders" icon={<OrdersIcon />} />
          <NavLink href="/admin/drops" label="Weekly Drops" icon={<DropsIcon />} />
          <NavLink href="/admin/products" label="Products" icon={<ProductsIcon />} />
        </nav>

        {/* Footer */}
        <div className="border-t border-stone-100 px-3 py-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 font-sans text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
          >
            <StoreIcon />
            View Store
          </Link>
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-sans text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <SignOutIcon />
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

function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function DropsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
