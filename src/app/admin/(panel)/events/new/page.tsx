import { saveEvent } from "@/app/admin/actions";
import { EventForm } from "@/components/admin/EventForm";
import { PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiCategory } from "@/lib/admin/types";

export default async function NewEventPage() {
  const categories = await adminFetch<{ data: ApiCategory[] }>("/categories?type=event");
  return (
    <>
      <PageTitle title="Add an event" back={{ label: "Events", href: "/admin/events" }} />
      <EventForm categories={categories.data} action={saveEvent.bind(null, null)} />
    </>
  );
}
