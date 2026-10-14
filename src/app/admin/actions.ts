"use server";

// Server actions behind the admin forms. Each one calls the backend as the signed-in
// admin, then marks the public site's cached data stale so pages rebuild with the change.
import { refresh, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminFetch, adminUpload, ApiError, apiLogin, COOKIE } from "@/lib/admin/session";
import { fromEasternInput } from "@/lib/admin/time";
import type { ApiCategory, ApiEvent, ApiListing, ApiPost } from "@/lib/admin/types";

export type FormState = { error?: string; fields?: string[]; saved?: number };

// Marks cached API data stale. Visitors get the previous version while the page rebuilds
// in the background. (updateTag would delete it outright, and pages with a [slug] in their
// path then fail to rebuild without a loading fallback.)
const expire = (tag: string) => revalidateTag(tag, "max");

// ---- Form helpers ----

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const optional = (fd: FormData, key: string) => str(fd, key) || null;
const lines = (fd: FormData, key: string) =>
  str(fd, key)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const commaList = (fd: FormData, key: string) =>
  str(fd, key)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const ids = (fd: FormData, key: string) => fd.getAll(key).map(Number).filter(Number.isInteger);
const money = (fd: FormData, key: string) => Math.round(Number(str(fd, key)) * 100) / 100;

/** Turns an API validation error into a message for the form; anything else is rethrown. */
function failed(e: unknown): FormState {
  if (!(e instanceof ApiError)) throw e;
  const details = e.details as { fields?: string[] } | { path: string; message: string }[] | undefined;
  if (Array.isArray(details)) {
    return { error: details.map((d) => `${d.path || "Form"}: ${d.message}`).join(" · ") };
  }
  return { error: e.message, fields: details?.fields };
}

// ---- Session ----

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await apiLogin(str(fd, "email"), str(fd, "password"));
  if ("error" in result) return { error: result.error };
  (await cookies()).set(COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  const next = str(fd, "next");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}

// ---- Images ----

/** Uploads one image from an admin form; returns its URL to store on the listing, event or post. */
export async function uploadImage(fd: FormData): Promise<{ url: string } | { error: string }> {
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose an image first." };
  return adminUpload(file);
}

// ---- Businesses ----

function listingBody(fd: FormData) {
  const social = Object.fromEntries(
    ["facebook", "instagram", "x", "linkedin"].map((k) => [k, str(fd, `social_${k}`)]).filter(([, v]) => v),
  );
  // "Mon–Fri: 8 AM – 5 PM" per line → { "Mon–Fri": "8 AM – 5 PM" }
  const hours = Object.fromEntries(
    lines(fd, "hours")
      .filter((l) => l.includes(":"))
      .map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()])
      .filter(([day, time]) => day && time),
  );
  return {
    plan: str(fd, "plan"),
    billing_cycle: str(fd, "billing_cycle") || "yearly",
    title: str(fd, "title"),
    summary: optional(fd, "summary"),
    description: optional(fd, "description"),
    tags: commaList(fd, "tags"),
    phone: optional(fd, "phone"),
    email: optional(fd, "email"),
    website: optional(fd, "website"),
    address: optional(fd, "address"),
    city: optional(fd, "city"),
    state: optional(fd, "state"),
    zip: optional(fd, "zip"),
    image_url: optional(fd, "image_url"),
    logo_url: optional(fd, "logo_url"),
    images: lines(fd, "images"),
    social_links: Object.keys(social).length ? social : null,
    hours: Object.keys(hours).length ? hours : null,
    category_ids: ids(fd, "category_ids"),
  };
}

function refreshListings() {
  expire("listings");
  expire("categories");
  refresh();
}

export async function saveListing(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const moderation = { status: str(fd, "status"), featured: fd.get("featured") === "on" };
  let listing: ApiListing;
  try {
    listing = id
      ? (await adminFetch<{ data: ApiListing }>(`/listings/${id}`, { method: "PATCH", body: listingBody(fd) })).data
      : (await adminFetch<{ data: ApiListing }>("/listings", { method: "POST", body: listingBody(fd) })).data;
    await adminFetch(`/admin/listings/${listing.id}`, { method: "PATCH", body: moderation });
  } catch (e) {
    return failed(e);
  }
  refreshListings();
  if (!id) redirect(`/admin/businesses/${listing.id}?created=1`);
  return { saved: Date.now() };
}

export async function setListingStatus(id: number, status: string) {
  await adminFetch(`/admin/listings/${id}`, { method: "PATCH", body: { status } });
  refreshListings();
}

export async function deleteListing(id: number) {
  await adminFetch(`/listings/${id}`, { method: "DELETE" });
  refreshListings();
  redirect("/admin/businesses?deleted=1");
}

// ---- Events ----

function eventBody(fd: FormData) {
  return {
    title: str(fd, "title"),
    summary: optional(fd, "summary"),
    description: optional(fd, "description"),
    starts_at: fromEasternInput(str(fd, "starts_at")) ?? "",
    ends_at: str(fd, "ends_at") ? fromEasternInput(str(fd, "ends_at")) : null,
    venue: optional(fd, "venue"),
    organizer: optional(fd, "organizer"),
    address: optional(fd, "address"),
    city: optional(fd, "city"),
    website: optional(fd, "website"),
    image_url: optional(fd, "image_url"),
    tags: commaList(fd, "tags"),
    category_id: str(fd, "category_id") ? Number(str(fd, "category_id")) : null,
  };
}

export async function saveEvent(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const moderation = { status: str(fd, "status"), featured: fd.get("featured") === "on" };
  let event: ApiEvent;
  try {
    event = id
      ? (await adminFetch<{ data: ApiEvent }>(`/events/${id}`, { method: "PATCH", body: eventBody(fd) })).data
      : (await adminFetch<{ data: ApiEvent }>("/events", { method: "POST", body: eventBody(fd) })).data;
    await adminFetch(`/admin/events/${event.id}`, { method: "PATCH", body: moderation });
  } catch (e) {
    return failed(e);
  }
  expire("events");
  if (!id) redirect(`/admin/events/${event.id}?created=1`);
  refresh();
  return { saved: Date.now() };
}

export async function setEventStatus(id: number, status: string) {
  await adminFetch(`/admin/events/${id}`, { method: "PATCH", body: { status } });
  expire("events");
  refresh();
}

export async function deleteEvent(id: number) {
  await adminFetch(`/events/${id}`, { method: "DELETE" });
  expire("events");
  redirect("/admin/events?deleted=1");
}

// ---- Guides (blog posts) ----

export async function savePost(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  let body: unknown = [];
  try {
    body = JSON.parse(str(fd, "body") || "[]");
  } catch {
    return { error: "The article body couldn't be read. Reload the page and try again." };
  }
  const ctaLabel = str(fd, "cta_label");
  const ctaHref = str(fd, "cta_href");
  const payload = {
    title: str(fd, "title"),
    status: str(fd, "status") === "published" ? "published" : "draft",
    category_id: str(fd, "category_id") ? Number(str(fd, "category_id")) : null,
    excerpt: optional(fd, "excerpt"),
    body,
    cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : null,
    image_url: optional(fd, "image_url"),
  };
  let post: ApiPost;
  try {
    post = id
      ? (await adminFetch<{ data: ApiPost }>(`/posts/${id}`, { method: "PATCH", body: payload })).data
      : (await adminFetch<{ data: ApiPost }>("/posts", { method: "POST", body: payload })).data;
  } catch (e) {
    return failed(e);
  }
  expire("posts");
  if (!id) redirect(`/admin/guides/${post.id}?created=1`);
  refresh();
  return { saved: Date.now() };
}

export async function deletePost(id: number) {
  await adminFetch(`/posts/${id}`, { method: "DELETE" });
  expire("posts");
  redirect("/admin/guides?deleted=1");
}

// ---- Categories ----

export async function saveCategory(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const payload = {
    type: str(fd, "type") as ApiCategory["type"],
    name: str(fd, "name"),
    description: optional(fd, "description"),
    position: Number(str(fd, "position")) || 0,
  };
  try {
    if (id) await adminFetch(`/categories/${id}`, { method: "PATCH", body: payload });
    else await adminFetch("/categories", { method: "POST", body: payload });
  } catch (e) {
    return failed(e);
  }
  expire("categories");
  expire("listings");
  expire("events");
  expire("posts");
  refresh();
  return { saved: Date.now() };
}

export async function deleteCategory(id: number) {
  await adminFetch(`/categories/${id}`, { method: "DELETE" });
  expire("categories");
  expire("listings");
  expire("events");
  expire("posts");
  refresh();
}

// ---- Plans & prices ----

export async function savePlan(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await adminFetch(`/plans/${id}`, {
      method: "PATCH",
      body: {
        name: str(fd, "name"),
        description: optional(fd, "description"),
        price_monthly: money(fd, "price_monthly"),
        price_yearly: money(fd, "price_yearly"),
      },
    });
  } catch (e) {
    return failed(e);
  }
  expire("plans");
  refresh();
  return { saved: Date.now() };
}

// ---- Messages ----

export async function markMessageRead(id: number) {
  await adminFetch(`/messages/${id}/read`, { method: "PATCH" });
  refresh();
}
