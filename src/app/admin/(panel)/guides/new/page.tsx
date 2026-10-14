import { savePost } from "@/app/admin/actions";
import { PostForm } from "@/components/admin/PostForm";
import { PageTitle } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/session";
import type { ApiCategory } from "@/lib/admin/types";

export default async function NewGuidePage() {
  const categories = await adminFetch<{ data: ApiCategory[] }>("/categories?type=blog");
  return (
    <>
      <PageTitle title="Write a guide" back={{ label: "Guides", href: "/admin/guides" }} />
      <PostForm categories={categories.data} action={savePost.bind(null, null)} />
    </>
  );
}
