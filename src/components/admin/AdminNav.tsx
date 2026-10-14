"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/guides", label: "Blog" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/plans", label: "Plans & prices" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              active ? "bg-white text-navy" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l.label}
            {l.href === "/admin/messages" && unread > 0 && (
              <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-ink">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
