import type { Metadata } from "next";
import { GuideCard, PageHeader } from "@/components/blocks";
import { ListCta } from "@/components/ListCta";
import { getGuides } from "@/lib/api";

export const metadata: Metadata = {
  title: "Guides",
  description: "Parks, weekend plans, and local know-how for Wesley Chapel.",
};

export default async function GuidesPage() {
  const guides = await getGuides();
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="Living here, made easier."
        intro="Parks worth the drive, weekend plans, and how to find your people when you're new in town."
      />
      <section className="mx-auto grid max-w-6xl gap-x-8 gap-y-14 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <GuideCard key={g.slug} g={g} />
        ))}
      </section>
      <ListCta />
    </>
  );
}
