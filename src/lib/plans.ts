export type Plan = {
  slug: string;
  name: string;
  monthly: number;
  yearly: number;
  pitch: string;
  features: string[];
  featured?: boolean;
};

// Short taglines under each plan name; prices and bullets come from the API.
export const PITCH: Record<string, string> = {
  basic: "Get on the map.",
  standard: "Look the part.",
  preferred: "Give people every reason to call.",
};

export const facebookReach = "30,000+";

export const eventPlans = [
  { name: "Silver", monthly: 15, features: ["Event page", "Phone", "Short description", "Date & time"] },
  { name: "Gold", monthly: 25, features: ["Everything in Silver", "Email", "Gallery (4 images)"] },
  {
    name: "Diamond",
    monthly: 50,
    features: [
      "Everything in Gold",
      "Website link & contact name",
      "Video & cover image",
      "Map & full description",
      "Gallery (6 images)",
    ],
  },
];

export const bannerAds = [
  { name: "Leaderboard", size: "728×90", monthly: 199 },
  { name: "Large mobile", size: "320×100", monthly: 90 },
  { name: "Square", size: "250×250", monthly: 40 },
  { name: "Wide skyscraper", size: "160×600", monthly: 40 },
  { name: "Sponsored link", size: "320×100", monthly: 30 },
];

export function price(n: number) {
  return Number.isInteger(n) ? `$${n.toLocaleString("en-US")}` : `$${n.toFixed(2)}`;
}
