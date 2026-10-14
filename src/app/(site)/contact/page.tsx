import type { Metadata } from "next";
import { PageHeader } from "@/components/blocks";
import { Faq } from "@/components/Faq";
import { ContactForm } from "./ContactForm";
import { mailto, site, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Wesley Chapel Network.",
};

const reasons = [
  {
    id: "listing",
    title: "List or update a business",
    body: "Tell us the business name, what you do, and which plan you're interested in. Already listed? Tell us what to change.",
    subject: "Business listing",
  },
  {
    id: "event",
    title: "Submit an event",
    body: "Send the date, address, organizer link, cost, and whether registration is needed.",
    subject: "Event submission",
  },
  {
    id: "story",
    title: "Share your story",
    body: "Run a local business? Tell us how it started and what you wish locals knew. Include a photo you own and who we can contact.",
    subject: "Business Spotlight",
  },
  {
    id: "other",
    title: "Something else",
    body: "A local resource we should know about, a correction, or a data request. We read everything.",
    subject: "Hello WCN",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Say hello."
        intro="We're a small local team. Send a message below, or email us directly."
      >
        <a
          href={mailto("Hello WCN")}
          className="mt-8 inline-block font-display text-2xl font-bold text-brand underline decoration-sun decoration-4 underline-offset-8 hover:decoration-brand md:text-4xl"
        >
          {site.email}
        </a>
      </PageHeader>

      <section id="form" className="mx-auto max-w-3xl scroll-mt-24 px-5 pt-14">
        <h2 className="mb-6 font-display text-3xl font-bold tracking-tight">Send us a message</h2>
        <ContactForm subjects={reasons.map((r) => r.subject)} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 md:grid-cols-2">
        {reasons.map((r) => (
          <a
            key={r.id}
            id={r.id}
            href={mailto(r.subject)}
            className="group scroll-mt-28 rounded-3xl bg-paper p-7 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-xl target:ring-2 target:ring-sun"
          >
            <h2 className="font-display text-2xl font-semibold group-hover:text-brand">{r.title}</h2>
            <p className="mt-2 text-muted">{r.body}</p>
            <p className="mt-5 text-sm font-semibold text-brand">Email us: “{r.subject}” →</p>
          </a>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Follow along</h2>
          <p className="mt-2 text-muted">Events and new businesses, as they happen.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl bg-paper px-5 py-4 font-semibold ring-1 ring-line transition hover:bg-brand hover:text-white"
                >
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">Wesley Chapel Network Inc · {site.location}</p>
        </div>
        <div>
          <h2 className="mb-6 font-display text-3xl font-bold tracking-tight">Quick answers</h2>
          <Faq />
        </div>
      </section>
    </>
  );
}
