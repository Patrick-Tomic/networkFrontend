"use client";

import { useState } from "react";
import type { FormState } from "@/app/admin/actions";
import type { ApiCategory, ApiListing, ApiPlan } from "@/lib/admin/types";
import { ActionForm } from "./ActionForm";
import { GalleryField, ImageField } from "./ImageField";
import { Field, inputClass, Section } from "./ui";

// Listing fields each plan feature unlocks (mirrors the backend's GATED_FIELDS).
const NEEDS: Record<string, string> = {
  website: "website",
  description: "description",
  social: "social_links",
  hours: "hours",
  image_url: "logo",
  logo_url: "logo",
  images: "images",
};

export function ListingForm({
  listing,
  plans,
  categories,
  action,
  footer,
}: {
  listing?: ApiListing;
  plans: ApiPlan[];
  categories: ApiCategory[];
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  footer?: React.ReactNode;
}) {
  const [planSlug, setPlanSlug] = useState(listing?.plan.slug ?? "basic");
  const plan = plans.find((p) => p.slug === planSlug) ?? plans[0];
  const [picked, setPicked] = useState<number[]>(listing?.categories.map((c) => c.id) ?? []);
  const allows = (field: keyof typeof NEEDS) => plan.features.includes(NEEDS[field]);
  const locked = (field: keyof typeof NEEDS) => (allows(field) ? undefined : `Not included in ${plan.name}`);
  const v = (x: string | null | undefined) => x ?? "";

  return (
    <ActionForm action={action} footer={footer} submitLabel={listing ? "Save changes" : "Create business"}>
      <div className="space-y-6">
        <Section title="Listing" intro="What shows on the site, and where.">
          <Field label="Business name" className="sm:col-span-2">
            <input name="title" required defaultValue={v(listing?.title)} className={inputClass} />
          </Field>
          <Field label="Status" hint="Only Live businesses appear on the site.">
            <select name="status" defaultValue={listing?.status ?? "active"} className={inputClass}>
              <option value="active">Live</option>
              <option value="pending">Pending approval</option>
              <option value="suspended">Hidden (suspended)</option>
              <option value="expired">Expired</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 self-end rounded-xl px-1 py-2.5">
            <input type="checkbox" name="featured" defaultChecked={listing?.featured} className="size-5 accent-brand" />
            <span className="text-sm font-semibold">
              Featured <span className="font-normal text-muted">(shown first and on the home page)</span>
            </span>
          </label>
          <Field label="Plan">
            <select name="plan" value={planSlug} onChange={(e) => setPlanSlug(e.target.value)} className={inputClass}>
              {plans
                .filter((p) => p.is_listing_plan)
                .map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} (${p.price_monthly}/mo)
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Billing">
            <select name="billing_cycle" defaultValue={listing?.billing_cycle ?? "yearly"} className={inputClass}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold">
              Categories{" "}
              <span className="font-normal text-muted">
                ({picked.length} of {plan.max_categories} allowed on {plan.name})
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = picked.includes(c.id);
                const full = !on && picked.length >= plan.max_categories;
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-sm ring-1 transition ${
                      on ? "bg-brand text-white ring-brand" : "bg-paper ring-line"
                    } ${full ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <input
                      type="checkbox"
                      name="category_ids"
                      value={c.id}
                      checked={on}
                      disabled={full}
                      onChange={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                      className="sr-only"
                    />
                    {c.name}
                  </label>
                );
              })}
            </div>
          </div>
          <Field label="Services" hint="Comma-separated, e.g. Plumbing, Water Heaters" className="sm:col-span-2">
            <input name="tags" defaultValue={listing?.tags.join(", ")} className={inputClass} />
          </Field>
        </Section>

        <Section title="Contact">
          <Field label="Phone">
            <input name="phone" defaultValue={v(listing?.phone)} className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={v(listing?.email)} className={inputClass} />
          </Field>
          <Field label="Website" hint={locked("website")} className="sm:col-span-2">
            <input
              name="website"
              type="url"
              placeholder="https://"
              disabled={!allows("website")}
              defaultValue={v(listing?.website)}
              className={inputClass}
            />
          </Field>
          <Field label="Street address" className="sm:col-span-2">
            <input name="address" defaultValue={v(listing?.address)} className={inputClass} />
          </Field>
          <Field label="City">
            <input name="city" defaultValue={v(listing?.city)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <input name="state" defaultValue={listing?.state ?? "FL"} className={inputClass} />
            </Field>
            <Field label="ZIP">
              <input name="zip" defaultValue={v(listing?.zip)} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="About">
          <Field label="Short summary" hint="One line, up to 300 characters." className="sm:col-span-2">
            <input name="summary" maxLength={300} defaultValue={v(listing?.summary)} className={inputClass} />
          </Field>
          <Field label="Full description" hint={locked("description")} className="sm:col-span-2">
            <textarea
              name="description"
              rows={5}
              disabled={!allows("description")}
              defaultValue={v(listing?.description)}
              className={inputClass}
            />
          </Field>
          <Field label="Opening hours" hint={locked("hours") ?? "One per line, e.g. Mon–Fri: 8 AM – 5 PM"} className="sm:col-span-2">
            <textarea
              name="hours"
              rows={3}
              disabled={!allows("hours")}
              defaultValue={Object.entries(listing?.hours ?? {})
                .map(([d, t]) => `${d}: ${t}`)
                .join("\n")}
              className={inputClass}
            />
          </Field>
          {(["facebook", "instagram", "x", "linkedin"] as const).map((k) => (
            <Field key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} hint={locked("social")}>
              <input
                name={`social_${k}`}
                type="url"
                placeholder="https://"
                disabled={!allows("social")}
                defaultValue={v(listing?.social_links?.[k])}
                className={inputClass}
              />
            </Field>
          ))}
        </Section>

        <Section title="Photos" intro="JPEG, PNG, WebP or GIF up to 10 MB. Large photos are resized automatically.">
          <ImageField
            name="image_url"
            label="Main photo"
            hint={locked("image_url") ?? "Shown on the business card and at the top of its page."}
            disabled={!allows("image_url")}
            defaultValue={listing?.image_url}
          />
          <ImageField
            name="logo_url"
            label="Logo"
            shape="square"
            hint={locked("logo_url") ?? "Shown next to the business name."}
            disabled={!allows("logo_url")}
            defaultValue={listing?.logo_url}
          />
          <div className="sm:col-span-2">
            <GalleryField
              name="images"
              label="Gallery"
              max={plan.max_images}
              hint={locked("images") ?? `Up to ${plan.max_images} photos on ${plan.name}. Use ← to reorder.`}
              disabled={!allows("images") || plan.max_images === 0}
              defaultValue={listing?.images}
            />
          </div>
        </Section>
      </div>
    </ActionForm>
  );
}
