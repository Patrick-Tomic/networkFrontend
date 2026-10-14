// Shapes returned by the backend's admin-facing endpoints.

export type AdminUser = { id: number; name: string; email: string; role: "user" | "admin" };

export type Paged<T> = { data: T[]; meta: { page: number; limit: number; total: number; pages: number } };

export type ApiPlan = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_categories: number;
  max_images: number;
  features: string[];
  rank: number;
  is_listing_plan: boolean;
};

export type ApiCategory = {
  id: number;
  type: "listing" | "event" | "blog";
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  position: number;
  count?: number;
};

export type ListingStatus = "pending" | "active" | "suspended" | "expired";

export type ApiListing = {
  id: number;
  status: ListingStatus;
  featured: boolean;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  tags: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  social_links: Record<string, string> | null;
  hours: Record<string, string> | null;
  logo_url: string | null;
  image_url: string | null;
  images: string[];
  billing_cycle: "monthly" | "yearly";
  expires_at: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  plan: { id: number; slug: string; name: string };
  categories: { id: number; name: string; slug: string }[];
};

export type EventStatus = "pending" | "active" | "cancelled";

export type ApiEvent = {
  id: number;
  status: EventStatus;
  featured: boolean;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  organizer: string | null;
  tags: string[];
  address: string | null;
  city: string | null;
  website: string | null;
  image_url: string | null;
  category: { id: number; name: string; slug: string } | null;
};

export type ApiPost = {
  id: number;
  status: "draft" | "published";
  title: string;
  slug: string;
  excerpt: string | null;
  body?: unknown;
  cta: { label: string; href: string } | null;
  image_url: string | null;
  views: number;
  published_at: string | null;
  updated_at: string;
  category: { id: number; name: string; slug: string } | null;
};

export type ApiMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  is_read: number;
  created_at: string;
};

export type AdminStats = {
  users: number;
  listings: { active: number; pending: number };
  events: { upcoming: number; pending: number };
  reviews_pending: number;
  unread_contact_messages: number;
  listings_by_plan: { slug: string; name: string; count: number }[];
};
