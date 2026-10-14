import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard, PageHeader, Photo } from "@/components/blocks";
import { getGuide, getGuides } from "@/lib/api";
import { formatDate, mapsUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const g = await getGuide((await params).slug);
  return g ? { title: g.title, description: g.excerpt } : {};
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const g = await getGuide(slug);
  if (!g) notFound();
  const more = (await getGuides()).filter((o) => o.slug !== g.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Guides", href: "/guides" }]}
        eyebrow={`${g.section} · ${formatDate(g.date)}`}
        title={g.title}
      />
      {g.image && (
        <div className="mx-auto max-w-4xl px-5 pt-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-sky">
            <Photo src={g.image} alt="" sizes="(min-width: 896px) 848px, 100vw" />
          </div>
        </div>
      )}
      <article className="mx-auto max-w-3xl px-5 py-14 text-lg leading-relaxed">
        {g.body.map((block, i) => {
          switch (block.type) {
            case "h":
              return (
                <h2 key={i} className="mt-10 mb-3 font-display text-2xl font-bold">
                  {block.text}
                </h2>
              );
            case "p":
              return (
                <p key={i} className="mb-5 text-ink/85">
                  {block.text}
                </p>
              );
            case "list":
              return (
                <ul key={i} className="mb-6 space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            case "image":
              return (
                <figure key={i} className="my-8">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-sky">
                    <Photo src={block.src} alt={block.alt ?? ""} sizes="(min-width: 768px) 720px, 100vw" />
                  </div>
                  {block.caption && <figcaption className="mt-2 text-sm text-muted">{block.caption}</figcaption>}
                </figure>
              );
            case "places":
              return (
                <ol key={i} className="mt-8 space-y-4">
                  {block.items.map((p, n) => (
                    <li key={p.name} className="flex gap-5 rounded-3xl bg-paper p-6 ring-1 ring-line">
                      <span className="font-display text-4xl leading-none font-bold text-sun">{n + 1}</span>
                      <div>
                        <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                        <p className="mt-1 text-base text-ink/80">{p.text}</p>
                        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                          <a href={mapsUrl(p.address)} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                            {p.address} ↗
                          </a>
                          <span>{p.highlights}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              );
          }
        })}
        {g.cta && (
          <Link
            href={g.cta.href}
            className="mt-8 inline-block rounded-full bg-brand px-6 py-3.5 text-base font-semibold text-white transition hover:bg-navy"
          >
            {g.cta.label} →
          </Link>
        )}
      </article>

      <section className="border-t border-line bg-paper py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-2xl font-bold">Keep reading</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {more.map((o) => (
              <GuideCard key={o.slug} g={o} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
