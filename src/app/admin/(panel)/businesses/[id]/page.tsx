import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteListing, saveListing } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ListingForm } from "@/components/admin/ListingForm";
import { Notice, PageTitle, StatusBadge } from "@/components/admin/ui";
import { adminFetch, ApiError } from "@/lib/admin/session";
import type { ApiCategory, ApiListing, ApiPlan } from "@/lib/admin/types";

export default async function EditBusinessPage({ params, searchParams }: PageProps<"/admin/businesses/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const [listing, plans, categories] = await Promise.all([
    adminFetch<{ data: ApiListing }>(`/listings/${id}`).catch((e) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }),
    adminFetch<{ data: ApiPlan[] }>("/plans"),
    adminFetch<{ data: ApiCategory[] }>("/categories?type=listing"),
  ]);
  const l = listing.data;

  return (
    <>
      <PageTitle
        title={l.title}
        back={{ label: "Businesses", href: "/admin/businesses" }}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={l.status} />
            {l.status === "active" && (
              <Link href={`/business/${l.slug}`} target="_blank" className="text-sm font-semibold text-brand hover:underline">
                View on site ↗
              </Link>
            )}
          </div>
        }
      />
      {sp.created && <Notice>Business created.</Notice>}
      <ListingForm
        listing={l}
        plans={plans.data}
        categories={categories.data}
        action={saveListing.bind(null, l.id)}
        footer={
          <ConfirmButton
            tone="danger"
            confirm={`Delete “${l.title}”? This also removes its reviews and messages, and can't be undone.`}
            action={deleteListing.bind(null, l.id)}
          >
            Delete business
          </ConfirmButton>
        }
      />
    </>
  );
}
