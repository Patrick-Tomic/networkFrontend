import type { Metadata } from "next";
import { Eyebrow, PageHeader } from "@/components/blocks";
import { Faq } from "@/components/Faq";
import { Pricing } from "@/components/Pricing";
import { getBusinesses, getPlans } from "@/lib/api";
import { bannerAds, eventPlans, facebookReach, price } from "@/lib/plans";
import { mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise",
  description: "List your business on Wesley Chapel Network from $9.99/month, or reach 30,000+ locals with Facebook group ads.",
};

export default async function AdvertisePage() {
  const [businesses, plans] = await Promise.all([getBusinesses(), getPlans()]);
  const cheapest = plans.listing[0];
  return (
    <>
      <PageHeader
        eyebrow="Advertise"
        title="Get found by the people who live here."
        intro="A listing puts your phone number in front of neighbors searching for exactly what you do. Facebook group ads put you in their feed."
      >
        <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-4">
          {[
            [`${businesses.length}`, "local businesses listed"],
            [facebookReach, "locals in our Facebook groups"],
            [cheapest ? price(cheapest.monthly) : "", "to get started"],
          ].map(([n, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-3xl font-bold text-brand md:text-5xl">{n}</dd>
              <dd className="mt-1 text-sm text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Eyebrow>Listing plans</Eyebrow>
        <h2 className="mt-3 mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl">Choose your listing.</h2>
        <Pricing plans={plans.listing} facebook={plans.facebook} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <Eyebrow>Event promotion</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Fill the room.</h2>
          <p className="mt-2 text-muted">Put your event on the calendar locals check every week.</p>
          <div className="mt-6 space-y-3">
            {eventPlans.map((p) => (
              <div key={p.name} className="flex items-start justify-between gap-6 rounded-2xl bg-paper p-5 ring-1 ring-line">
                <div>
                  <p className="font-display text-lg font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm text-muted">{p.features.join(" · ")}</p>
                </div>
                <p className="shrink-0 font-display text-2xl font-bold">
                  {price(p.monthly)}
                  <span className="font-sans text-sm font-normal text-muted">/mo</span>
                </p>
              </div>
            ))}
          </div>
          <a href={mailto("Event promotion")} className="mt-5 inline-block font-semibold text-brand hover:underline">
            Promote an event →
          </a>
        </div>

        <div>
          <Eyebrow>Banner ads</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Own the page.</h2>
          <p className="mt-2 text-muted">Display placements across the site, desktop and mobile.</p>
          <div className="mt-6 overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
            <table className="w-full text-left">
              <thead className="bg-sky text-xs tracking-[0.15em] text-brand uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Placement</th>
                  <th className="px-5 py-3 font-semibold">Size</th>
                  <th className="px-5 py-3 text-right font-semibold">Monthly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bannerAds.map((b) => (
                  <tr key={b.name}>
                    <td className="px-5 py-4 font-medium">{b.name}</td>
                    <td className="px-5 py-4 text-muted tabular-nums">{b.size}</td>
                    <td className="px-5 py-4 text-right font-display text-lg font-bold">{price(b.monthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href={mailto("Banner advertising")} className="mt-5 inline-block font-semibold text-brand hover:underline">
            Book a banner →
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="mb-6 font-display text-3xl font-bold tracking-tight">Questions</h2>
        <Faq />
      </section>
    </>
  );
}
