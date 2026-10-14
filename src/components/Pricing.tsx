"use client";

import { useState } from "react";
import { facebookReach, price, type Plan } from "@/lib/plans";
import { mailto } from "@/lib/site";

export function Pricing({ plans, facebook }: { plans: Plan[]; facebook?: Plan }) {
  const [yearly, setYearly] = useState(false);
  const per = yearly ? "/yr" : "/mo";

  return (
    <div>
      <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full bg-paper p-1 text-sm ring-1 ring-line">
        {[
          { label: "Monthly", value: false },
          { label: "Yearly · 2 months free", value: true },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={yearly === opt.value}
            onClick={() => setYearly(opt.value)}
            className={`rounded-full px-4 py-2 font-medium transition ${
              yearly === opt.value ? "bg-brand text-white" : "text-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-3xl p-7 ${
              plan.featured ? "bg-brand text-white shadow-2xl shadow-brand/20" : "bg-paper ring-1 ring-line"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-7 rounded-full bg-sun px-3 py-1 text-xs font-semibold text-ink">
                Recommended
              </span>
            )}
            <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
            <p className={plan.featured ? "text-white/75" : "text-muted"}>{plan.pitch}</p>
            <p className="mt-6 font-display text-5xl font-bold tracking-tight">
              {price(yearly ? plan.yearly : plan.monthly)}
              <span className="ml-1 font-sans text-base font-normal opacity-70">{per}</span>
            </p>
            <ul className="mt-6 mb-auto space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden className={plan.featured ? "text-sun" : "text-brand"}>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={mailto(`${plan.name} listing (${yearly ? "yearly" : "monthly"})`)}
              className={`mt-8 block rounded-full px-5 py-3 text-center font-semibold transition ${
                plan.featured ? "bg-sun text-ink hover:bg-white" : "bg-ink text-white hover:bg-brand"
              }`}
            >
              Start with {plan.name}
            </a>
          </div>
        ))}
      </div>

      {facebook && (
      <div className="mt-4 grid gap-6 rounded-3xl bg-navy p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-9">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-sun uppercase">Facebook group ads</p>
          <h3 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
            Put your business in front of {facebookReach} locals
          </h3>
          <ul className="mt-4 grid gap-1.5 text-sm text-white/80 sm:grid-cols-2">
            {facebook.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="text-sun">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:text-right">
          <p className="font-display text-5xl font-bold">
            {price(yearly ? facebook.yearly : facebook.monthly)}
            <span className="ml-1 font-sans text-base font-normal opacity-70">{per}</span>
          </p>
          <a
            href={mailto(`Facebook group ads (${yearly ? "yearly" : "monthly"})`)}
            className="mt-4 inline-block rounded-full bg-sun px-5 py-3 font-semibold text-ink transition hover:bg-white"
          >
            Claim a spot
          </a>
        </div>
      </div>
      )}
    </div>
  );
}
