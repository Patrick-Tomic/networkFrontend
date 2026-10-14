import Link from "next/link";
import { ButtonLink, Card, Empty, Notice, PageTitle, StatusBadge } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiPost, Paged } from "@/lib/admin/types";

export default async function GuidesPage({ searchParams }: PageProps<"/admin/guides">) {
  const sp = await searchParams;
  const { data } = await adminFetch<Paged<ApiPost>>("/posts?status=all&limit=100");
  return (
    <>
      <PageTitle
        title="Guides"
        intro="Articles on the Guides page. Drafts stay hidden until you publish them."
        action={<ButtonLink href="/admin/guides/new">Write a guide</ButtonLink>}
      />
      {sp.deleted && <Notice>Guide deleted.</Notice>}
      <Card>
        {data.length ? (
          <ul className="divide-y divide-line">
            {data.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/guides/${p.id}`} className="font-semibold hover:text-brand">
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {p.category?.name ?? "No section"} · {p.views} views
                  </p>
                </div>
                <StatusBadge status={p.status} />
                <Link href={`/admin/guides/${p.id}`} className="text-sm font-semibold text-brand hover:underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No guides yet.</Empty>
        )}
      </Card>
    </>
  );
}
