import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BusinessCard, EventCard, GuideCard } from "@/components/blocks";
import { SearchBar } from "@/components/SearchBar";
import { getCategories } from "@/lib/api";
import { getPlaces, search } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search local businesses, events and guides by what you need and where.",
  robots: { index: false },
};

type Params = Promise<{ [key: string]: string | string[] | undefined }>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-10 md:pt-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">Search</p>
          <Suspense fallback={<SearchHeader q="" where="" places={[]} />}>
            <Header searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16 text-muted">Searching…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Header({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  return <SearchHeader q={one(sp.q)} where={one(sp.where)} places={await getPlaces()} />;
}

function SearchHeader({ q, where, places }: { q: string; where: string; places: string[] }) {
  const raw = q && where ? `${q} in ${where}` : q || (where ? `Everything in ${where}` : "What are you looking for?");
  const title = raw[0].toUpperCase() + raw.slice(1);
  return (
    <>
      <h1 className="mt-3 mb-8 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
      <SearchBar q={q} where={where} places={places} size="md" />
    </>
  );
}

async function Results({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const q = one(sp.q);
  const where = one(sp.where);

  if (!q && !where) return <Browse />;

  const r = await search(q, where);
  const total = r.businesses.length + r.events.length + r.guides.length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm text-muted" aria-live="polite">
        {total ? `${total} result${total === 1 ? "" : "s"}` : "No results"}
        {q && <> for “{q}”</>}
        {where && <> in {where}</>}
      </p>

      {r.businesses.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-2xl font-bold">
            Businesses <span className="text-muted">· {r.businesses.length}</span>
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {r.businesses.map((b) => (
              <BusinessCard key={b.slug} b={b} />
            ))}
          </div>
        </section>
      )}

      {!r.businesses.length && (
        <div className="mt-6 rounded-3xl bg-paper p-8 ring-1 ring-line md:p-10">
          <p className="font-display text-2xl font-semibold">
            No businesses {q ? <>matching “{q}”</> : null} {where ? <>in {where}</> : null} yet.
          </p>
          <p className="mt-2 text-muted">
            Try a broader word, like “cleaning” instead of “window cleaning”, or{" "}
            <Link href="/listings" className="font-semibold text-brand hover:underline">
              browse every business
            </Link>
            .
          </p>
        </div>
      )}

      {r.elsewhere.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">“{q}” in other towns</h2>
          <p className="mt-1 text-muted">Listed elsewhere on the network. Check whether they serve {where}.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {r.elsewhere.map((b) => (
              <BusinessCard key={b.slug} b={b} />
            ))}
          </div>
        </section>
      )}

      {r.events.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            Events <span className="text-muted">· {r.events.length}</span>
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {r.events.map((e) => (
              <EventCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}

      {r.guides.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            Guides <span className="text-muted">· {r.guides.length}</span>
          </h2>
          <div className="mt-5 grid gap-8 md:grid-cols-3">
            {r.guides.map((g) => (
              <GuideCard key={g.slug} g={g} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-14 text-sm text-muted">
        Can&apos;t find a business you know?{" "}
        <Link href="/contact#form" className="font-semibold text-brand hover:underline">
          Tell us about it
        </Link>
        .
      </p>
    </div>
  );
}

/** Shown before anything is searched: quick links into categories and towns. */
async function Browse() {
  const [categories, places] = await Promise.all([getCategories(), getPlaces()]);
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2">
      <section>
        <h2 className="font-display text-xl font-bold">Popular categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link key={c.slug} href={`/listings/${c.slug}`} className="rounded-full bg-paper px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand">
              {c.name} <span className="text-muted">· {c.count}</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold">Browse by town</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {places.map((p) => (
            <Link key={p} href={`/search?where=${encodeURIComponent(p)}`} className="rounded-full bg-paper px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand">
              {p}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
