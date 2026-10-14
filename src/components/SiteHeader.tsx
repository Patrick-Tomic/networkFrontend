import Link from "next/link";
import { Suspense } from "react";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

function StaticNav() {
  return (
    <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
      {nav.map((n) => (
        <Link key={n.href} href={n.href} className="px-3.5 py-2">
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Logo />
        <Suspense fallback={<StaticNav />}>
          <NavLinks />
        </Suspense>
        <Link
          href="/advertise"
          className="hidden rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy md:block"
        >
          Get listed
        </Link>
      </div>
    </header>
  );
}
