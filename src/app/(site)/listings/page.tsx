import type { Metadata } from "next";
import { CategoryCard, PageHeader } from "@/components/blocks";
import { ListCta } from "@/components/ListCta";
import { DirectoryBrowser } from "@/components/DirectoryBrowser";
import { getBusinesses, getCategories, withPhotosFirst } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const businesses = await getBusinesses();
  return {
    title: "Local businesses",
    description: `Browse ${businesses.length} local businesses in Wesley Chapel, New Tampa, Lutz and nearby.`,
  };
}

export default async function ListingsPage() {
  const [businesses, categories] = await Promise.all([getBusinesses(), getCategories()]);
  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Local businesses, all in one place."
        intro={`${businesses.length} businesses across ${categories.length} categories, from Wesley Chapel to New Tampa and Lutz. Call them direct. No middleman.`}
      />
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <DirectoryBrowser businesses={withPhotosFirst(businesses)} categories={categories} />
      </section>
      <section className="mx-auto max-w-6xl px-5 pt-16">
        <h2 className="font-display text-2xl font-bold">Browse by category</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.slug} c={c} />
          ))}
        </div>
      </section>
      <ListCta />
    </>
  );
}
