import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessCard, BusinessThumb, Photo } from "@/components/blocks";
import { businessesIn, getBusinesses, getBusiness } from "@/lib/api";
import { mailto, mapsUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getBusinesses()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/business/[slug]">): Promise<Metadata> {
  const b = await getBusiness((await params).slug);
  return b
    ? {
        title: b.name,
        description: `${b.name}: ${b.tags.join(", ")}${b.city ? ` in ${b.city}, FL` : ""}. Call ${b.phone}.`,
      }
    : {};
}

export default async function BusinessPage({ params }: PageProps<"/business/[slug]">) {
  const { slug } = await params;
  const b = await getBusiness(slug);
  if (!b) notFound();
  const cat = { slug: b.category, name: b.categoryName };
  const related = (await businessesIn(b.category)).filter((o) => o.slug !== b.slug).slice(0, 3);
  const tel = `tel:${b.phone.replace(/\D/g, "")}`;

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1fr_1.1fr] md:items-center md:py-16">
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted">
              <Link href="/listings" className="hover:text-brand">
                Businesses
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/listings/${cat.slug}`} className="hover:text-brand">
                {cat.name}
              </Link>
            </nav>
            <div className="mt-5 flex items-center gap-4">
              {b.logo && (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-paper ring-1 ring-line md:size-20">
                  <Photo src={b.logo} alt={`${b.name} logo`} sizes="80px" className="!object-contain p-1.5" />
                </div>
              )}
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{b.name}</h1>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {b.tags.map((t) => (
                <li key={t} className="rounded-full bg-sky px-3 py-1 text-sm font-medium text-brand">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={tel} className="rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-navy">
                Call {b.phone}
              </a>
              {b.website && (
                <a
                  href={b.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-6 py-3.5 font-semibold ring-1 ring-ink/15 transition hover:bg-cream"
                >
                  Visit website ↗
                </a>
              )}
            </div>
          </div>
          <BusinessThumb b={b} className="rounded-3xl shadow-xl" />
        </div>
      </section>

      {b.images.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pt-12">
          <h2 className="font-display text-2xl font-bold">Photos</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            {b.images.map((src, i) => (
              <a
                key={`${src}-${i}`}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sky"
              >
                <Photo
                  src={src}
                  alt={`${b.name} photo ${i + 1}`}
                  sizes="(min-width: 768px) 360px, 50vw"
                  className="transition duration-500 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3">
        <InfoTile label="Phone">
          <a href={tel} className="hover:text-brand">
            {b.phone}
          </a>
        </InfoTile>
        <InfoTile label="Address">
          {b.address ? (
            <a href={mapsUrl(b.address)} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
              {b.address} ↗
            </a>
          ) : (
            "Serves the Wesley Chapel area"
          )}
        </InfoTile>
        <InfoTile label="Is this your business?">
          <a href={mailto(`Update listing: ${b.name}`)} className="text-brand hover:underline">
            Update or upgrade this listing →
          </a>
        </InfoTile>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="font-display text-2xl font-bold">More in {cat.name}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <BusinessCard key={o.slug} b={o} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function InfoTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-paper p-6 ring-1 ring-line">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{label}</p>
      <div className="mt-2 font-medium">{children}</div>
    </div>
  );
}
