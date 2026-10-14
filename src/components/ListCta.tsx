import Link from "next/link";
import { getPlans } from "@/lib/api";
import { facebookReach, price } from "@/lib/plans";
import { Eyebrow } from "./blocks";

/** The "get your business listed" banner, with the current starting price. */
export async function ListCta() {
  const { listing } = await getPlans();
  const from = listing[0] ? `${price(listing[0].monthly)} a month` : "a few dollars a month";
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-brand p-10 text-white md:p-16">
        <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-sun/90" />
        <div aria-hidden className="absolute -right-10 -bottom-32 size-64 rounded-full bg-navy" />
        <div className="relative max-w-xl">
          <Eyebrow light>For business owners</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Your neighbors are already looking.
          </h2>
          <p className="mt-4 text-white/80 md:text-lg">
            Listings start at {from}. Add Facebook group ads to reach {facebookReach} locals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/advertise" className="rounded-full bg-sun px-6 py-3.5 font-semibold text-ink transition hover:bg-white">
              See plans & pricing
            </Link>
            <Link href="/contact#story" className="rounded-full px-6 py-3.5 font-semibold ring-1 ring-white/40 transition hover:bg-white/10">
              Share your story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
