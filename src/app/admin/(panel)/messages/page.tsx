import Link from "next/link";
import { markMessageRead } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Card, Empty, PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiMessage, Paged } from "@/lib/admin/types";

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { data, meta } = await adminFetch<Paged<ApiMessage>>(`/admin/messages?limit=30&page=${page}`);
  return (
    <>
      <PageTitle title="Messages" intro="Sent from the Contact page." />
      <Card>
        {data.length ? (
          <ul className="divide-y divide-line">
            {data.map((m) => (
              <li key={m.id} className={`px-6 py-5 ${m.is_read ? "" : "bg-sky/50"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {!m.is_read && <span className="mr-2 inline-block size-2 rounded-full bg-coral align-middle" />}
                      {m.subject || "(no subject)"}
                    </p>
                    <p className="text-sm text-muted">
                      {m.name} · <a href={`mailto:${m.email}`} className="text-brand hover:underline">{m.email}</a>
                      {m.phone && <> · <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a></>} · {m.created_at} UTC
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "your message"}`)}`}
                      className="rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-line hover:ring-brand"
                    >
                      Reply
                    </a>
                    {!m.is_read && (
                      <ConfirmButton action={markMessageRead.bind(null, m.id)}>Mark read</ConfirmButton>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line">{m.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No messages yet.</Empty>
        )}
      </Card>
      {meta.pages > 1 && (
        <nav className="mt-4 flex items-center gap-3 text-sm">
          {page > 1 && <Link href={`/admin/messages?page=${page - 1}`} className="font-semibold text-brand">← Newer</Link>}
          <span className="text-muted">Page {page} of {meta.pages}</span>
          {page < meta.pages && <Link href={`/admin/messages?page=${page + 1}`} className="font-semibold text-brand">Older →</Link>}
        </nav>
      )}
    </>
  );
}
