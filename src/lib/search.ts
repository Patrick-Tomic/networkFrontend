// Search across the directory, events and guides by keyword ("what") and place ("where").
// The directory is small, so this filters the cached API data instead of querying per search.
import { getBusinesses, getEvents, getGuides } from "./api";
import type { Business, Event, Guide } from "./types";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Rough word stem so "plumber", "plumbers" and "plumbing" all match each other.
const stem = (w: string) => (w.length > 4 ? w.replace(/(ings|ing|ers|er|es|s)$/, "") : w);

const words = (s: string) => normalize(s).split(" ").filter(Boolean).map(stem);

/** How well `text` matches every query word: 0 = some word is missing, higher is better. */
function score(queryWords: string[], fields: [text: string | undefined, weight: number][]) {
  if (!queryWords.length) return 1;
  let total = 0;
  for (const q of queryWords) {
    let best = 0;
    for (const [text, weight] of fields) {
      if (text && words(text).some((w) => w.startsWith(q) || (w.length >= 4 && q.startsWith(w)))) best = Math.max(best, weight);
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}

// "Wesley Chapel, FL" and "wesley chapel florida 33543" both reduce to the useful part.
function placeQuery(where: string) {
  return normalize(where)
    .replace(/\b(fl|florida|usa|united states)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inPlace(place: string, ...fields: (string | undefined)[]) {
  if (!place) return true;
  return fields.some((f) => f && normalize(f).includes(place));
}

export type SearchResults = {
  q: string;
  where: string;
  businesses: Business[];
  events: Event[];
  guides: Guide[];
  /** When nothing matched in that place: matches for the keyword anywhere. */
  elsewhere: Business[];
};

export async function search(q: string, where: string): Promise<SearchResults> {
  const [all, events, guides] = await Promise.all([getBusinesses(), getEvents(), getGuides()]);
  const qw = words(q);
  const place = placeQuery(where);

  const ranked = all
    .map((b) => ({
      b,
      s: score(qw, [
        [b.name, 3],
        [b.tags.join(" "), 2],
        [b.categoryName, 1.5],
      ]),
    }))
    .filter((r) => r.s > 0)
    .sort((a, z) => z.s - a.s || +z.b.featured - +a.b.featured || +!!z.b.image - +!!a.b.image);

  const businesses = ranked.filter((r) => inPlace(place, r.b.city, r.b.address)).map((r) => r.b);

  return {
    q,
    where,
    businesses,
    elsewhere: place && !businesses.length && qw.length ? ranked.map((r) => r.b).slice(0, 6) : [],
    events: qw.length
      ? events.filter(
          (e) =>
            score(qw, [
              [e.title, 3],
              [e.tags.join(" "), 2],
              [e.summary, 1],
              [e.venue, 1],
            ]) > 0 && inPlace(place, e.city, e.address, e.venue),
        )
      : events.filter((e) => place && inPlace(place, e.city, e.address, e.venue)),
    guides: qw.length
      ? guides.filter((g) =>
          score(qw, [
            [g.title, 3],
            [g.excerpt, 1],
          ]),
        )
      : [],
  };
}

/** Towns that have businesses, most businesses first, for the "where" suggestions. */
export async function getPlaces() {
  const counts = new Map<string, number>();
  for (const b of await getBusinesses()) if (b.city) counts.set(b.city, (counts.get(b.city) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([city]) => city);
}
