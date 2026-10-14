export type Business = {
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  tags: string[];
  phone: string;
  address?: string;
  city?: string;
  website?: string;
  image?: string;
  logo?: string;
  images: string[];
  featured: boolean;
};

export type Category = {
  slug: string;
  name: string;
  intro: string;
  count: number;
  /** Most common service tags in the category. */
  tags: string[];
};

export type Event = {
  slug: string;
  title: string;
  date: string;
  weekday: string;
  month: string;
  day: string;
  year: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  organizer: string;
  url: string;
  summary: string;
  tags: string[];
  image?: string;
};

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | {
      type: "places";
      items: { name: string; address: string; text: string; highlights: string }[];
    };

export type Guide = {
  slug: string;
  title: string;
  section: "Things to Do" | "Local Guides" | "Business Spotlights";
  date: string;
  excerpt: string;
  body: GuideBlock[];
  cta?: { label: string; href: string };
  image?: string;
};
