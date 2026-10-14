import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/blocks";
import { ListCta } from "@/components/ListCta";
import { getEvents } from "@/lib/api";
import { mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: "Festivals, markets, and community events around Wesley Chapel.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <>
      <PageHeader
        eyebrow="What's on"
        title="Things to do around Wesley Chapel."
        intro="Festivals, trunk-or-treats, and downtown nights out. Always check the organizer's page for the latest details before you go."
      />
      <section className="mx-auto max-w-6xl px-5 py-12">
        {events.length === 0 && (
          <p className="rounded-3xl bg-paper p-10 text-center text-muted ring-1 ring-line">
            No upcoming events right now. Check back soon.
          </p>
        )}
        <ol className="space-y-4">
          {events.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/events/${e.slug}`}
                className="group grid gap-6 rounded-3xl bg-paper p-6 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-xl md:grid-cols-[auto_1fr_auto] md:items-center md:p-8"
              >
                <div className="flex size-24 flex-col items-center justify-center rounded-2xl bg-sky text-brand">
                  <span className="text-xs font-bold uppercase">{e.weekday} · {e.month}</span>
                  <span className="font-display text-5xl leading-none font-bold">{e.day}</span>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold group-hover:text-brand md:text-3xl">{e.title}</h2>
                  <p className="mt-1 text-muted">
                    {e.time} · {e.venue}, {e.city}
                  </p>
                  <p className="mt-3 max-w-2xl">{e.summary}</p>
                </div>
                <span className="font-semibold text-brand">Details →</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-navy p-8 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Hosting something near Wesley Chapel?</h2>
            <p className="mt-1 text-white/70">
              Send the date, address, organizer link, cost, and whether registration is needed.
            </p>
          </div>
          <a
            href={mailto("Event submission")}
            className="shrink-0 rounded-full bg-sun px-6 py-3.5 text-center font-semibold text-ink transition hover:bg-white"
          >
            Submit an event
          </a>
        </div>
      </section>
      <ListCta />
    </>
  );
}
