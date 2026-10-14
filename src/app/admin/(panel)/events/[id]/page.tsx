import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEvent, saveEvent } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EventForm } from "@/components/admin/EventForm";
import { Notice, PageTitle, StatusBadge } from "@/components/admin/ui";
import { adminFetch, ApiError } from "@/lib/admin/session";
import type { ApiCategory, ApiEvent } from "@/lib/admin/types";

export default async function EditEventPage({ params, searchParams }: PageProps<"/admin/events/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const [event, categories] = await Promise.all([
    adminFetch<{ data: ApiEvent & { updated_at: string } }>(`/events/${id}`).catch((e) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }),
    adminFetch<{ data: ApiCategory[] }>("/categories?type=event"),
  ]);
  const e = event.data;

  return (
    <>
      <PageTitle
        title={e.title}
        back={{ label: "Events", href: "/admin/events" }}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={e.status} />
            {e.status === "active" && (
              <Link href={`/events/${e.slug}`} target="_blank" className="text-sm font-semibold text-brand hover:underline">
                View on site ↗
              </Link>
            )}
          </div>
        }
      />
      {sp.created && <Notice>Event created.</Notice>}
      <EventForm
        event={e}
        categories={categories.data}
        action={saveEvent.bind(null, e.id)}
        footer={
          <ConfirmButton tone="danger" confirm={`Delete “${e.title}”? This can't be undone.`} action={deleteEvent.bind(null, e.id)}>
            Delete event
          </ConfirmButton>
        }
      />
    </>
  );
}
