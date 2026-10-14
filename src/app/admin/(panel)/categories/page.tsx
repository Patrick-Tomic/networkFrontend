import Link from "next/link";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Field, inputClass, PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiCategory } from "@/lib/admin/types";

const TYPES = [
  { type: "listing", label: "Business categories", noun: "businesses" },
  { type: "event", label: "Event categories", noun: "events" },
  { type: "blog", label: "Guide sections", noun: "guides" },
] as const;

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const sp = await searchParams;
  const current = TYPES.find((t) => t.type === sp.type) ?? TYPES[0];
  const { data } = await adminFetch<{ data: ApiCategory[] }>(`/categories?type=${current.type}`);

  return (
    <>
      <PageTitle title="Categories" intro="Lower numbers show first. Renaming a category keeps its web address." />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {TYPES.map((t) => (
          <Link
            key={t.type}
            href={`/admin/categories?type=${t.type}`}
            className={`rounded-full px-4 py-1.5 font-semibold ${t.type === current.type ? "bg-brand text-white" : "ring-1 ring-line"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {data.map((c) => (
          <Card key={c.id} className="px-6 pt-5">
            <ActionForm
              action={saveCategory.bind(null, c.id)}
              submitLabel="Save"
              footer={
                <ConfirmButton
                  tone="danger"
                  confirm={`Delete “${c.name}”? ${c.count ?? 0} ${current.noun} will lose this category.`}
                  action={deleteCategory.bind(null, c.id)}
                >
                  Delete
                </ConfirmButton>
              }
            >
              <input type="hidden" name="type" value={c.type} />
              <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
                <Field label="Name" hint={`/${c.slug} · ${c.count ?? 0} ${current.noun}`}>
                  <input name="name" required defaultValue={c.name} className={inputClass} />
                </Field>
                <Field label="Order">
                  <input name="position" type="number" defaultValue={c.position} className={inputClass} />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <input name="description" defaultValue={c.description ?? ""} className={inputClass} />
                </Field>
              </div>
            </ActionForm>
          </Card>
        ))}

        <Card className="border-2 border-dashed border-line px-6 pt-5 ring-0">
          <h2 className="mb-4 font-display text-lg font-semibold">Add a category</h2>
          <ActionForm action={saveCategory.bind(null, null)} submitLabel="Add category">
            <input type="hidden" name="type" value={current.type} />
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
              <Field label="Name">
                <input name="name" required className={inputClass} />
              </Field>
              <Field label="Order">
                <input name="position" type="number" defaultValue={data.length} className={inputClass} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <input name="description" className={inputClass} />
              </Field>
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
