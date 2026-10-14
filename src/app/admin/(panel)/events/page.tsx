import Link from "next/link";
import { setEventStatus } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ButtonLink, Card, Empty, Notice, PageTitle, StatusBadge } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import { formatEastern } from "@/lib/admin/time";
import type { ApiEvent, Paged } from "@/lib/admin/types";

export default async function EventsPage({ searchParams }: PageProps<"/admin/events">) {
  const sp = await searchParams;
  const show = sp.show === "all" ? "all" : "upcoming";
  const { data, meta } = await adminFetch<Paged<ApiEvent>>(
    `/admin/events?limit=100${show === "upcoming" ? "&when=upcoming" : ""}`,
  );
  // Upcoming soonest first; "all" stays newest first.
  const events = show === "upcoming" ? [...data].reverse() : data;

  return (
    <>
      <PageTitle
        title="Events"
        intro="Past events drop off the site automatically."
        action={<ButtonLink href="/admin/events/new">Add an event</ButtonLink>}
      />
      {sp.deleted && <Notice>Event deleted.</Notice>}
      <div className="mb-4 flex gap-2 text-sm">
        {(["upcoming", "all"] as const).map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/events?show=all" : "/admin/events"}
            className={`rounded-full px-4 py-1.5 font-semibold ${show === s ? "bg-brand text-white" : "ring-1 ring-line"}`}
          >
            {s === "upcoming" ? "Upcoming" : "All, including past"}
          </Link>
        ))}
      </div>
      <Card>
        {events.length ? (
          <ul className="divide-y divide-line">
            {events.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/events/${e.id}`} className="font-semibold hover:text-brand">
                    {e.featured && <span className="mr-1 text-sun">★</span>}
                    {e.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {formatEastern(e.starts_at)} · {e.venue ?? "No venue"}
                  </p>
                </div>
                <StatusBadge status={e.status} />
                {e.status === "pending" && (
                  <ConfirmButton tone="primary" action={setEventStatus.bind(null, e.id, "active")}>
                    Approve
                  </ConfirmButton>
                )}
                <Link href={`/admin/events/${e.id}`} className="text-sm font-semibold text-brand hover:underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No events yet.</Empty>
        )}
      </Card>
      {meta.total > 100 && <p className="mt-3 text-sm text-muted">Showing the first 100 of {meta.total}.</p>}
    </>
  );
}
