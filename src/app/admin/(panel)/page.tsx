import Link from "next/link";
import { setEventStatus, setListingStatus } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Empty, PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import { formatEastern } from "@/lib/admin/time";
import type { AdminStats, ApiEvent, ApiListing, ApiMessage, Paged } from "@/lib/admin/types";

export default async function Dashboard() {
  const [{ data: stats }, pendingListings, pendingEvents, messages] = await Promise.all([
    adminFetch<{ data: AdminStats }>("/admin/stats"),
    adminFetch<Paged<ApiListing>>("/admin/listings?status=pending&limit=10"),
    adminFetch<Paged<ApiEvent>>("/admin/events?status=pending&limit=10"),
    adminFetch<Paged<ApiMessage>>("/admin/messages?unread=true&limit=5"),
  ]);

  const tiles = [
    { label: "Live businesses", value: stats.listings.active, href: "/admin/businesses?status=active" },
    { label: "Upcoming events", value: stats.events.upcoming, href: "/admin/events" },
    { label: "Waiting for approval", value: stats.listings.pending + stats.events.pending, href: "#pending" },
    { label: "New messages", value: stats.unread_contact_messages, href: "/admin/messages" },
  ];

  return (
    <>
      <PageTitle title="Dashboard" intro="What's live on the site, and what needs your attention." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-3xl bg-paper p-5 ring-1 ring-line transition hover:ring-brand">
            <p className="font-display text-4xl font-bold text-brand">{t.value}</p>
            <p className="mt-1 text-sm text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 id="pending" className="border-b border-line px-6 py-4 font-display text-lg font-semibold">
            Businesses waiting for approval
          </h2>
          {pendingListings.data.length ? (
            <ul className="divide-y divide-line">
              {pendingListings.data.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <Link href={`/admin/businesses/${l.id}`} className="min-w-0 truncate font-medium hover:text-brand">
                    {l.title}
                    <span className="ml-2 text-xs text-muted">{l.plan.name}</span>
                  </Link>
                  <ConfirmButton tone="primary" action={setListingStatus.bind(null, l.id, "active")}>
                    Approve
                  </ConfirmButton>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing waiting.</Empty>
          )}
        </Card>

        <Card>
          <h2 className="border-b border-line px-6 py-4 font-display text-lg font-semibold">Events waiting for approval</h2>
          {pendingEvents.data.length ? (
            <ul className="divide-y divide-line">
              {pendingEvents.data.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <Link href={`/admin/events/${e.id}`} className="min-w-0 hover:text-brand">
                    <span className="block truncate font-medium">{e.title}</span>
                    <span className="text-xs text-muted">{formatEastern(e.starts_at)}</span>
                  </Link>
                  <ConfirmButton tone="primary" action={setEventStatus.bind(null, e.id, "active")}>
                    Approve
                  </ConfirmButton>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing waiting.</Empty>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-semibold">New messages</h2>
            <Link href="/admin/messages" className="text-sm font-semibold text-brand hover:underline">
              Inbox →
            </Link>
          </div>
          {messages.data.length ? (
            <ul className="divide-y divide-line">
              {messages.data.map((m) => (
                <li key={m.id} className="px-6 py-3">
                  <p className="font-medium">
                    {m.subject || "(no subject)"} <span className="font-normal text-muted">· {m.name}</span>
                  </p>
                  <p className="line-clamp-1 text-sm text-muted">{m.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No unread messages.</Empty>
          )}
        </Card>
      </div>

      <h2 className="mt-10 mb-3 font-display text-lg font-semibold">Live businesses by plan</h2>
      <div className="flex flex-wrap gap-3">
        {stats.listings_by_plan.map((p) => (
          <span key={p.slug} className="rounded-full bg-paper px-4 py-2 text-sm ring-1 ring-line">
            <strong>{p.count}</strong> {p.name}
          </span>
        ))}
      </div>
    </>
  );
}
