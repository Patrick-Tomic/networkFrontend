import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard, PageHeader, Photo } from "@/components/blocks";
import { getEvent, getEvents } from "@/lib/api";
import { mapsUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  return e ? { title: e.title, description: e.summary } : {};
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();
  const others = (await getEvents()).filter((o) => o.slug !== e.slug);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Events", href: "/events" }]}
        eyebrow={`${e.weekday}, ${e.month} ${e.day} · ${e.time}`}
        title={e.title}
        intro={e.summary}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-navy"
          >
            Organizer&apos;s page ↗
          </a>
          <a
            href={mapsUrl(e.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-3.5 font-semibold ring-1 ring-ink/15 transition hover:bg-cream"
          >
            Get directions ↗
          </a>
        </div>
      </PageHeader>

      {e.image && (
        <div className="mx-auto max-w-6xl px-5 pt-12">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl bg-sky">
            <Photo src={e.image} alt={e.title} sizes="(min-width: 1152px) 1104px, 100vw" />
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3">
        {[
          ["When", `${e.weekday}, ${e.month} ${e.day}, ${e.year}`, e.time],
          ["Where", e.venue, e.address],
          ["Hosted by", e.organizer, "Check their page for tickets, parking & registration."],
        ].map(([label, main, sub]) => (
          <div key={label} className="rounded-3xl bg-paper p-6 ring-1 ring-line">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{label}</p>
            <p className="mt-2 font-display text-xl font-semibold">{main}</p>
            <p className="mt-1 text-sm text-muted">{sub}</p>
          </div>
        ))}
        <ul className="flex flex-wrap gap-2 md:col-span-3">
          {e.tags.map((t) => (
            <li key={t} className="rounded-full bg-sky px-3 py-1 text-sm font-medium text-brand">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {others.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="font-display text-2xl font-bold">Also coming up</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {others.map((o) => (
              <EventCard key={o.slug} e={o} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
