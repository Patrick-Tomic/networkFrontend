import Link from "next/link";
import {
  BusinessCard,
  CategoryCard,
  EventCard,
  GuideCard,
  SectionHead,
} from "@/components/blocks";
import { ListCta } from "@/components/ListCta";
import { SearchBar } from "@/components/SearchBar";
import { getBusinesses, getCategories, getEvents, getGuides } from "@/lib/api";
import { getPlaces } from "@/lib/search";

export default async function Home() {
  const [businesses, categories, events, guides, places] = await Promise.all([
    getBusinesses(),
    getCategories(),
    getEvents(),
    getGuides(),
    getPlaces(),
  ]);
  // The most common services across the directory, as one-tap searches.
  const tagCounts = new Map<string, number>();
  for (const b of businesses) for (const t of b.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const popular = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);
  // Featured listings are flagged by an admin in the API.
  const featured = businesses.filter((b) => b.featured).slice(0, 6);
  const [next] = events;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper">
        <div aria-hidden className="absolute -top-40 -right-40 size-[34rem] rounded-full bg-sky" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pt-14 pb-20 md:grid-cols-[1.3fr_1fr] md:items-center md:pt-24 md:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-sm font-medium text-brand">
              <span className="size-2 rounded-full bg-coral" />
              Wesley Chapel, Florida
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[0.95] font-bold tracking-tight md:text-7xl">
              Find the local pro.
              <br />
              <span className="text-brand">Skip the guesswork.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted">
              Plumbers, stylists, pool techs and more from Wesley Chapel and the towns around it.
              Plus what&apos;s on this weekend. Free to browse, no account needed.
            </p>
            <div className="mt-8">
              <SearchBar places={places} />
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>Popular:</span>
              {popular.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="rounded-full bg-cream px-3 py-1 font-medium text-ink ring-1 ring-line transition hover:ring-brand"
                >
                  {t}
                </Link>
              ))}
            </p>
            <p className="mt-6 text-sm font-semibold">
              <Link href="/listings" className="text-brand hover:underline">
                Browse all {businesses.length} businesses
              </Link>
              <span className="mx-2 text-line">|</span>
              <Link href="/events" className="text-brand hover:underline">
                See what&apos;s on →
              </Link>
            </p>
          </div>

          {next && (
            <Link href={`/events/${next.slug}`} className="group relative block">
              <div className="absolute -inset-3 -rotate-3 rounded-[2rem] bg-sun transition group-hover:-rotate-2" />
              <article className="relative rounded-[1.75rem] bg-navy p-7 text-white shadow-xl">
                <p className="text-xs font-semibold tracking-[0.2em] text-sun uppercase">Coming up</p>
                <div className="mt-5 flex items-start gap-5">
                  <div className="rounded-2xl bg-white px-4 py-3 text-center text-ink">
                    <p className="text-xs font-semibold uppercase">{next.month}</p>
                    <p className="font-display text-4xl leading-none font-bold">{next.day}</p>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl leading-tight font-semibold">{next.title}</h2>
                    <p className="mt-1 text-sm text-white/70">
                      {next.venue} · {next.time}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {next.tags.slice(0, 4).map((t) => (
                    <li key={t} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Link>
          )}
        </div>
      </section>

      {/* Promise strip */}
      <section className="border-y border-line bg-cream">
        <ul className="mx-auto grid max-w-6xl gap-5 px-5 py-7 text-sm md:grid-cols-3">
          {[
            ["Free to browse", "No sign-up wall. Just look."],
            ["Close to home", "Wesley Chapel, New Tampa, Lutz & nearby."],
            ["Your data stays yours", "We never sell it."],
          ].map(([title, body]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
              <span>
                <strong className="font-semibold">{title}.</strong> <span className="text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <SectionHead
          eyebrow="Find a pro"
          title="What do you need done?"
          link={{ label: "All businesses", href: "/listings" }}
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <div
              key={c.slug}
              className={`grid ${
                i === 0 ? "sm:col-span-2 lg:row-span-2" : i === categories.length - 1 ? "sm:col-span-2" : ""
              }`}
            >
              <CategoryCard c={c} big={i === 0} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured businesses */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead
            eyebrow="On the network"
            title="A few of your neighbors."
            link={{ label: "See all", href: "/listings" }}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BusinessCard key={b.slug} b={b} />
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      {events.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-24">
          <SectionHead
            eyebrow="What's on"
            title="Three Saturdays, three reasons to get out."
            link={{ label: "All events", href: "/events" }}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}

      {/* Guides */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead
            eyebrow="Guides"
            title="Living here, made easier."
            link={{ label: "All guides", href: "/guides" }}
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {guides.slice(0, 3).map((g) => (
              <GuideCard key={g.slug} g={g} />
            ))}
          </div>
        </div>
      </section>

      <ListCta />
    </>
  );
}
