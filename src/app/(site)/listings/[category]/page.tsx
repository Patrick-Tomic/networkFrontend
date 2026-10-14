import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessCard, PageHeader } from "@/components/blocks";
import { ListCta } from "@/components/ListCta";
import { businessesIn, getCategories, getCategory } from "@/lib/api";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/listings/[category]">): Promise<Metadata> {
  const c = await getCategory((await params).category);
  return c ? { title: `${c.name} near Wesley Chapel`, description: c.intro } : {};
}

export default async function CategoryPage({ params }: PageProps<"/listings/[category]">) {
  const { category } = await params;
  const c = await getCategory(category);
  if (!c) notFound();
  const [list, categories] = await Promise.all([businessesIn(c.slug), getCategories()]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Businesses", href: "/listings" }]}
        eyebrow={`${list.length} ${list.length === 1 ? "business" : "businesses"}`}
        title={c.name}
        intro={c.intro}
      >
        <ul className="mt-6 flex flex-wrap gap-2">
          {c.tags.map((t) => (
            <li key={t} className="rounded-full bg-sky px-3 py-1 text-sm font-medium text-brand">
              {t}
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <BusinessCard key={b.slug} b={b} />
          ))}
        </div>

        <nav aria-label="Other categories" className="mt-16 flex flex-wrap gap-2 text-sm">
          <span className="mr-2 self-center font-semibold">More categories:</span>
          {categories
            .filter((o) => o.slug !== c.slug)
            .map((o) => (
              <Link
                key={o.slug}
                href={`/listings/${o.slug}`}
                className="rounded-full bg-paper px-3.5 py-1.5 font-medium ring-1 ring-line hover:ring-brand"
              >
                {o.name}
              </Link>
            ))}
        </nav>
      </section>
      <ListCta />
    </>
  );
}
