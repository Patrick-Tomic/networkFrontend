"use client";

import type { FormState } from "@/app/admin/actions";
import type { ApiCategory, ApiPost } from "@/lib/admin/types";
import type { GuideBlock } from "@/lib/types";
import { ActionForm } from "./ActionForm";
import { BlockEditor } from "./BlockEditor";
import { ImageField } from "./ImageField";
import { Field, inputClass, Section } from "./ui";

/** Older posts may store the body as plain text; edit it as paragraphs. */
function toBlocks(body: unknown): GuideBlock[] {
  if (Array.isArray(body)) return body as GuideBlock[];
  if (typeof body === "string" && body.trim()) {
    return body.split(/\n\s*\n/).map((text) => ({ type: "p" as const, text: text.trim() }));
  }
  return [{ type: "p", text: "" }];
}

export function PostForm({
  post,
  categories,
  action,
  footer,
}: {
  post?: ApiPost;
  categories: ApiCategory[];
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  footer?: React.ReactNode;
}) {
  const v = (x: string | null | undefined) => x ?? "";
  return (
    <ActionForm action={action} footer={footer} submitLabel={post ? "Save changes" : "Create guide"}>
      <div className="space-y-6">
        <Section title="Guide">
          <Field label="Title" className="sm:col-span-2">
            <input name="title" required defaultValue={v(post?.title)} className={inputClass} />
          </Field>
          <Field label="Status" hint="Drafts aren't shown on the site.">
            <select name="status" defaultValue={post?.status ?? "draft"} className={inputClass}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
          <Field label="Section">
            <select name="category_id" defaultValue={post?.category?.id ?? ""} className={inputClass}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Teaser" hint="One sentence shown on guide cards." className="sm:col-span-2">
            <textarea name="excerpt" rows={2} maxLength={500} defaultValue={v(post?.excerpt)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <ImageField
              name="image_url"
              label="Cover photo"
              hint="Shown on the post card and at the top of the post."
              defaultValue={post?.image_url}
            />
          </div>
          <Field label="Button at the end: label" hint="Optional, e.g. See upcoming events">
            <input name="cta_label" defaultValue={v(post?.cta?.label)} className={inputClass} />
          </Field>
          <Field label="Button link" hint="e.g. /events or a full https:// link">
            <input name="cta_href" defaultValue={v(post?.cta?.href)} className={inputClass} />
          </Field>
        </Section>

        <fieldset className="rounded-3xl bg-paper p-6 ring-1 ring-line md:p-7">
          <legend className="sr-only">Article</legend>
          <h2 className="mb-4 font-display text-lg font-semibold">Article</h2>
          <BlockEditor name="body" initial={toBlocks(post?.body)} />
        </fieldset>
      </div>
    </ActionForm>
  );
}
