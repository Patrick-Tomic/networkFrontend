import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePost, savePost } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PostForm } from "@/components/admin/PostForm";
import { Notice, PageTitle, StatusBadge } from "@/components/admin/ui";
import { adminFetch, ApiError } from "@/lib/admin/session";
import type { ApiCategory, ApiPost } from "@/lib/admin/types";

export default async function EditGuidePage({ params, searchParams }: PageProps<"/admin/guides/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const [post, categories] = await Promise.all([
    adminFetch<{ data: ApiPost }>(`/posts/${id}`).catch((e) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }),
    adminFetch<{ data: ApiCategory[] }>("/categories?type=blog"),
  ]);
  const p = post.data;

  return (
    <>
      <PageTitle
        title={p.title}
        back={{ label: "Guides", href: "/admin/guides" }}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={p.status} />
            {p.status === "published" && (
              <Link href={`/guides/${p.slug}`} target="_blank" className="text-sm font-semibold text-brand hover:underline">
                View on site ↗
              </Link>
            )}
          </div>
        }
      />
      {sp.created && <Notice>Guide created.</Notice>}
      <PostForm
        post={p}
        categories={categories.data}
        action={savePost.bind(null, p.id)}
        footer={
          <ConfirmButton tone="danger" confirm={`Delete “${p.title}”? This can't be undone.`} action={deletePost.bind(null, p.id)}>
            Delete guide
          </ConfirmButton>
        }
      />
    </>
  );
}
