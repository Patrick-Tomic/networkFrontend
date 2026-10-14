"use client";

import type { FormState } from "@/app/admin/actions";
import { toEasternInput } from "@/lib/admin/time";
import type { ApiCategory, ApiEvent } from "@/lib/admin/types";
import { ActionForm } from "./ActionForm";
import { ImageField } from "./ImageField";
import { Field, inputClass, Section } from "./ui";

export function EventForm({
  event,
  categories,
  action,
  footer,
}: {
  event?: ApiEvent;
  categories: ApiCategory[];
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  footer?: React.ReactNode;
}) {
  const v = (x: string | null | undefined) => x ?? "";
  return (
    <ActionForm action={action} footer={footer} submitLabel={event ? "Save changes" : "Create event"}>
      <div className="space-y-6">
        <Section title="Event">
          <Field label="Title" className="sm:col-span-2">
            <input name="title" required defaultValue={v(event?.title)} className={inputClass} />
          </Field>
          <Field label="Starts" hint="Wesley Chapel time">
            <input
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={toEasternInput(event?.starts_at)}
              className={inputClass}
            />
          </Field>
          <Field label="Ends" hint="Optional">
            <input name="ends_at" type="datetime-local" defaultValue={toEasternInput(event?.ends_at)} className={inputClass} />
          </Field>
          <Field label="Status" hint="Only Live events appear on the site.">
            <select name="status" defaultValue={event?.status ?? "active"} className={inputClass}>
              <option value="active">Live</option>
              <option value="pending">Pending approval</option>
              <option value="cancelled">Cancelled (hidden)</option>
            </select>
          </Field>
          <Field label="Category">
            <select name="category_id" defaultValue={event?.category?.id ?? ""} className={inputClass}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-3 rounded-xl px-1 py-1 sm:col-span-2">
            <input type="checkbox" name="featured" defaultChecked={event?.featured} className="size-5 accent-brand" />
            <span className="text-sm font-semibold">
              Featured <span className="font-normal text-muted">(listed first)</span>
            </span>
          </label>
          <Field label="Summary" hint="One or two sentences for event cards." className="sm:col-span-2">
            <textarea name="summary" rows={2} maxLength={300} defaultValue={v(event?.summary)} className={inputClass} />
          </Field>
          <Field label="Highlights" hint="Comma-separated, e.g. Live music, Food trucks" className="sm:col-span-2">
            <input name="tags" defaultValue={event?.tags.join(", ")} className={inputClass} />
          </Field>
          <Field label="Full description" hint="Optional" className="sm:col-span-2">
            <textarea name="description" rows={4} defaultValue={v(event?.description)} className={inputClass} />
          </Field>
        </Section>

        <Section title="Photo" intro="Shown on the event card and page. JPEG, PNG or WebP up to 10 MB.">
          <ImageField name="image_url" label="Event photo" defaultValue={event?.image_url} />
        </Section>

        <Section title="Where & who">
          <Field label="Venue">
            <input name="venue" defaultValue={v(event?.venue)} className={inputClass} />
          </Field>
          <Field label="Organizer">
            <input name="organizer" defaultValue={v(event?.organizer)} className={inputClass} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input name="address" defaultValue={v(event?.address)} className={inputClass} />
          </Field>
          <Field label="City">
            <input name="city" defaultValue={v(event?.city)} className={inputClass} />
          </Field>
          <Field label="Organizer's website">
            <input name="website" type="url" placeholder="https://" defaultValue={v(event?.website)} className={inputClass} />
          </Field>
        </Section>
      </div>
    </ActionForm>
  );
}
