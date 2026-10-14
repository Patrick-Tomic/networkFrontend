// Data from the directory API (wesleychapelbackend). Every reader is cached with
// `use cache`, so pages prerender at build time and refresh in the background.
import { cacheLife, cacheTag } from "next/cache";
import { PITCH, type Plan } from "./plans";
import type { Business, Category, Event, Guide, GuideBlock } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

type Page<T> = { data: T[]; meta: { page: number; pages: number; total: number } };

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for ${path}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** Fetches every page of a paginated endpoint. */
async function getAll<T>(path: string): Promise<T[]> {
  const sep = path.includes("?") ? "&" : "?";
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const res = (await get<Page<T>>(`${path}${sep}limit=100&page=${page}`))!;
    out.push(...res.data);
    if (page >= res.meta.pages) return out;
  }
}

// ---- API shapes (only the fields the site uses) ----

type ApiListing = {
  slug: string;
  title: string;
  featured: boolean;
  tags: string[];
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  website?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  images?: string[];
  categories: { slug: string; name: string }[];
};

type ApiCategory = { slug: string; name: string; description: string | null; count: number };

type ApiEvent = {
  slug: string;
  title: string;
  summary: string | null;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  organizer: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  image_url: string | null;
  tags: string[];
};

type ApiPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body?: GuideBlock[] | string | null;
  cta: { label: string; href: string } | null;
  published_at: string;
  image_url: string | null;
  category: { name: string } | null;
};

// ---- Mappers to the site's types ----

const toBusiness = (l: ApiListing): Business => ({
  slug: l.slug,
  name: l.title,
  category: l.categories[0]?.slug ?? "",
  categoryName: l.categories[0]?.name ?? "",
  tags: l.tags,
  phone: l.phone ?? "",
  address: l.address ?? undefined,
  city: l.city ?? undefined,
  website: l.website ?? undefined,
  image: l.image_url ?? undefined,
  logo: l.logo_url ?? undefined,
  images: l.images ?? [],
  featured: l.featured,
});

// Events happen in Wesley Chapel, so show times in Eastern time.
const TZ = "America/New_York";
const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(d);
const clock = (d: Date) =>
  fmt(d, { hour: "numeric", minute: "2-digit" }).replace(":00", "").replace(/\s/g, " ");

function toEvent(e: ApiEvent): Event {
  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : null;
  return {
    slug: e.slug,
    title: e.title,
    date: new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(start), // YYYY-MM-DD
    weekday: fmt(start, { weekday: "short" }),
    month: fmt(start, { month: "short" }),
    day: fmt(start, { day: "numeric" }),
    year: fmt(start, { year: "numeric" }),
    time: end ? `${clock(start)} – ${clock(end)}` : clock(start),
    venue: e.venue ?? "",
    address: e.address ?? "",
    city: e.city ?? "",
    organizer: e.organizer ?? "",
    url: e.website ?? "",
    summary: e.summary ?? "",
    tags: e.tags,
    image: e.image_url ?? undefined,
  };
}

const toGuide = (p: ApiPost): Guide => ({
  slug: p.slug,
  title: p.title,
  section: (p.category?.name ?? "Local Guides") as Guide["section"],
  date: p.published_at.slice(0, 10),
  excerpt: p.excerpt ?? "",
  body: typeof p.body === "string" ? [{ type: "p", text: p.body }] : (p.body ?? []),
  cta: p.cta ?? undefined,
  image: p.image_url ?? undefined,
});

// ---- Readers ----

/** All active listings, featured and higher plans first. */
export async function getBusinesses(): Promise<Business[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");
  return (await getAll<ApiListing>("/listings")).map(toBusiness);
}

export async function getBusiness(slug: string): Promise<Business | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings", `listing:${slug}`);
  const res = await get<{ data: ApiListing }>(`/listings/${encodeURIComponent(slug)}`);
  return res ? toBusiness(res.data) : undefined;
}

/** Listing categories with their count and most common service tags. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings", "categories");
  const [cats, businesses] = await Promise.all([
    get<{ data: ApiCategory[] }>("/categories?type=listing"),
    getBusinesses(),
  ]);
  return cats!.data.map((c) => ({
    slug: c.slug,
    name: c.name,
    intro: c.description ?? "",
    count: c.count,
    tags: topTags(businesses.filter((b) => b.category === c.slug)),
  }));
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function businessesIn(slug: string) {
  return withPhotosFirst((await getBusinesses()).filter((b) => b.category === slug));
}

/** Upcoming events, soonest first. */
export async function getEvents(): Promise<Event[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");
  return (await getAll<ApiEvent>("/events")).map(toEvent);
}

export async function getEvent(slug: string): Promise<Event | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events", `event:${slug}`);
  const res = await get<{ data: ApiEvent }>(`/events/${encodeURIComponent(slug)}`);
  return res ? toEvent(res.data) : undefined;
}

/** Published guides, newest first. */
export async function getGuides(): Promise<Guide[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  return (await getAll<ApiPost>("/posts")).map(toGuide);
}

export async function getGuide(slug: string): Promise<Guide | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", `post:${slug}`);
  const res = await get<{ data: ApiPost }>(`/posts/${encodeURIComponent(slug)}`);
  return res ? toGuide(res.data) : undefined;
}

type ApiPlan = {
  slug: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
};

/** Plan prices and bullet points, as edited in the admin area. */
export async function getPlans(): Promise<{ listing: Plan[]; facebook: Plan | undefined }> {
  "use cache";
  cacheLife("hours");
  cacheTag("plans");
  const res = await get<{ data: ApiPlan[] }>("/plans");
  const plans = res!.data.map(
    (p): Plan => ({
      slug: p.slug,
      name: p.name,
      monthly: p.price_monthly,
      yearly: p.price_yearly,
      pitch: PITCH[p.slug] ?? "",
      features: bullets(p.description),
      featured: p.slug === "preferred",
    }),
  );
  return {
    // Cheapest first; the Facebook package is shown separately as an add-on.
    listing: plans.filter((p) => p.slug !== "facebook-advertising").sort((a, b) => a.monthly - b.monthly),
    facebook: plans.find((p) => p.slug === "facebook-advertising"),
  };
}

// ---- Helpers ----

/** A plan description is one bullet per line (older ones are a comma-separated sentence). */
function bullets(text: string | null) {
  if (!text) return [];
  const parts = text.includes("\n") ? text.split("\n") : text.replace(/\.$/, "").split(/,\s+/);
  return parts.map((s) => s.trim()).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1));
}

/** Listings with photos lead; order is otherwise preserved. */
export function withPhotosFirst(list: Business[]) {
  return [...list].sort((a, b) => Number(!!b.image) - Number(!!a.image));
}

/** Most common service tags in a list of businesses, for short descriptions. */
function topTags(list: Business[], n = 12) {
  const counts = new Map<string, number>();
  for (const b of list) for (const t of b.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t);
}
