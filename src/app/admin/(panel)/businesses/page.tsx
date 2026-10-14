import Link from "next/link";
import { setListingStatus } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ButtonLink, Card, Empty, Notice, PageTitle, StatusBadge, inputClass } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiListing, Paged } from "@/lib/admin/types";

const STATUSES = ["", "active", "pending", "suspended", "expired"];

export default async function BusinessesPage({ searchParams }: PageProps<"/admin/businesses">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Number(sp.page) || 1;
  const qs = new URLSearchParams({ limit: "50", page: String(page), ...(q && { q }), ...(status && { status }) });
  const { data, meta } = await adminFetch<Paged<ApiListing>>(`/admin/listings?${qs}`);
  const link = (p: number) => `/admin/businesses?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), page: String(p) })}`;

  return (
    <>
      <PageTitle
        title="Businesses"
        intro={`${meta.total} ${status ? `${status} ` : ""}businesses${q ? ` matching “${q}”` : ""}.`}
        action={<ButtonLink href="/admin/businesses/new">Add a business</ButtonLink>}
      />
      {sp.deleted && <Notice>Business deleted.</Notice>}

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search by name" className={`${inputClass} max-w-xs`} />
        <select name="status" defaultValue={status} className={`${inputClass} w-auto`}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? s[0].toUpperCase() + s.slice(1) : "Any status"}
            </option>
          ))}
        </select>
        <button className="rounded-full px-5 text-sm font-semibold ring-1 ring-line hover:ring-brand">Filter</button>
      </form>

      <Card className="overflow-hidden">
        {data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wider text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Business</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.map((l) => (
                  <tr key={l.id} className="hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/businesses/${l.id}`} className="font-semibold hover:text-brand">
                        {l.featured && <span title="Featured" className="mr-1 text-sun">★</span>}
                        {l.title}
                      </Link>
                      <p className="text-xs text-muted">
                        {l.categories.map((c) => c.name).join(", ") || "No category"} · {l.city ?? "No city"}
                      </p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{l.plan.name}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {l.status === "pending" && (
                        <ConfirmButton tone="primary" action={setListingStatus.bind(null, l.id, "active")}>
                          Approve
                        </ConfirmButton>
                      )}{" "}
                      <Link href={`/admin/businesses/${l.id}`} className="font-semibold text-brand hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No businesses found.</Empty>
        )}
      </Card>

      {meta.pages > 1 && (
        <nav className="mt-4 flex items-center gap-3 text-sm">
          {page > 1 && <Link href={link(page - 1)} className="font-semibold text-brand">← Previous</Link>}
          <span className="text-muted">
            Page {page} of {meta.pages}
          </span>
          {page < meta.pages && <Link href={link(page + 1)} className="font-semibold text-brand">Next →</Link>}
        </nav>
      )}
    </>
  );
}
