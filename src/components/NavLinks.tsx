"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/site";

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-full px-3.5 py-2 transition ${
              isActive(n.href) ? "bg-sky text-brand" : "hover:text-brand"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="grid size-10 place-items-center rounded-full ring-1 ring-line md:hidden"
      >
        <span className="sr-only">Menu</span>
        <span aria-hidden className="text-lg leading-none">{open ? "✕" : "☰"}</span>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-line bg-paper px-5 pb-5 md:hidden"
        >
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`block border-b border-line py-3.5 font-display text-xl font-semibold ${
                isActive(n.href) ? "text-brand" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/advertise"
            onClick={() => setOpen(false)}
            className="mt-5 block rounded-full bg-brand py-3 text-center font-semibold text-white"
          >
            Get your business listed
          </Link>
        </nav>
      )}
    </>
  );
}
