export const site = {
  name: "Wesley Chapel Network",
  short: "WCN",
  email: "info@wesleychapelnetwork.com",
  location: "Wesley Chapel, FL 33543",
  url: "https://www.wesleychapelnetwork.com",
};

export const nav = [
  { label: "Businesses", href: "/listings" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/guides" },
  { label: "Advertise", href: "/advertise" },
  { label: "Contact", href: "/contact" },
];

export const socials = [
  { name: "Facebook", href: "https://facebook.com/wesleychapelnetwork" },
  { name: "Instagram", href: "https://instagram.com/wesleychapelnetwork" },
  { name: "X", href: "https://x.com/WesleyChapelNet" },
  { name: "LinkedIn", href: "https://linkedin.com/in/wcnbusinessdirectory" },
];

export function mailto(subject: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
