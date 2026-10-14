import { saveListing } from "@/app/admin/actions";
import { ListingForm } from "@/components/admin/ListingForm";
import { PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiCategory, ApiPlan } from "@/lib/admin/types";

export default async function NewBusinessPage() {
  const [plans, categories] = await Promise.all([
    adminFetch<{ data: ApiPlan[] }>("/plans"),
    adminFetch<{ data: ApiCategory[] }>("/categories?type=listing"),
  ]);
  return (
    <>
      <PageTitle title="Add a business" back={{ label: "Businesses", href: "/admin/businesses" }} />
      <ListingForm plans={plans.data} categories={categories.data} action={saveListing.bind(null, null)} />
    </>
  );
}
