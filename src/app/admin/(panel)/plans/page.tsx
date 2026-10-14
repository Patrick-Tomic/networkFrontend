import { savePlan } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, inputClass, PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiPlan } from "@/lib/admin/types";

export default async function PlansPage() {
  const { data } = await adminFetch<{ data: ApiPlan[] }>("/plans");
  return (
    <>
      <PageTitle
        title="Plans & prices"
        intro="Prices and descriptions shown on the Advertise page. What each plan unlocks is set in the backend."
      />
      <div className="space-y-4">
        {data.map((p) => (
          <Card key={p.id} className="px-6 pt-5">
            <ActionForm action={savePlan.bind(null, p.id)} submitLabel={`Save ${p.name}`}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Plan name">
                  <input name="name" required defaultValue={p.name} className={inputClass} />
                </Field>
                <Field label="Monthly price ($)">
                  <input name="price_monthly" type="number" min="0" step="0.01" required defaultValue={p.price_monthly} className={inputClass} />
                </Field>
                <Field label="Yearly price ($)">
                  <input name="price_yearly" type="number" min="0" step="0.01" required defaultValue={p.price_yearly} className={inputClass} />
                </Field>
                <Field
                  label="What's included"
                  hint={`One bullet point per line. This plan allows ${p.max_categories} categories and ${p.max_images} photos.`}
                  className="sm:col-span-3"
                >
                  <textarea name="description" rows={Math.max(3, (p.description ?? "").split("\n").length)} defaultValue={p.description ?? ""} className={inputClass} />
                </Field>
              </div>
            </ActionForm>
          </Card>
        ))}
      </div>
    </>
  );
}
