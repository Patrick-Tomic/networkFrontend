"use client";

import { useMemo, useState } from "react";
import type { Business, Category } from "@/lib/types";
import { BusinessCard } from "./blocks";

export function DirectoryBrowser({
  businesses,
  categories,
}: {
  businesses: Business[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter(
      (b) =>
        (!cat || b.category === cat) &&
        (!q || [b.name, b.city, ...b.tags].join(" ").toLowerCase().includes(q)),
    );
  }, [businesses, query, cat]);

  return (
    <div>
      <div className="sticky top-[69px] z-20 -mx-5 border-b border-line bg-cream/95 px-5 py-4 backdrop-blur">
        <label className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
          <span aria-hidden className="text-muted">⌕</span>
          <span className="sr-only">Search businesses</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “pool”, “HVAC”, “Lutz”…"
            className="w-full bg-transparent outline-none placeholder:text-muted/70"
          />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm">
          <Chip active={!cat} onClick={() => setCat(null)}>
            All · {businesses.length}
          </Chip>
          {categories.map((c) => (
            <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "business" : "businesses"}
      </p>
      {results.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((b) => (
            <BusinessCard key={b.slug} b={b} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-3xl bg-paper p-10 text-center ring-1 ring-line">
          <p className="font-display text-2xl font-semibold">Nothing yet for “{query}”.</p>
          <p className="mt-2 text-muted">Know a great local business we&apos;re missing? Tell us about it.</p>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-1.5 font-medium transition ${
        active ? "bg-brand text-white" : "bg-paper ring-1 ring-line hover:ring-brand"
      }`}
    >
      {children}
    </button>
  );
}
