import Image from "next/image";
import Link from "next/link";
import type { Business, Category, Event, Guide } from "@/lib/types";
import { formatDate } from "@/lib/site";

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  crumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-12 md:pt-16">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-muted">
            {crumbs.map((c) => (
              <span key={c.href} className="flex gap-2">
                <Link href={c.href} className="hover:text-brand">
                  {c.label}
                </Link>
                <span aria-hidden>/</span>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${light ? "text-sun" : "text-brand"}`}>
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link href={link.href} className="shrink-0 font-semibold text-brand hover:underline">
          {link.label} →
        </Link>
      )}
    </div>
  );
}

/** Uploaded (/uploads/…) and external images are already sized, so they skip Next's optimizer. */
export const preSized = (src: string) => /^(https?:|\/uploads\/)/.test(src);

export function Photo({ src, alt, sizes, className = "" }: { src: string; alt: string; sizes: string; className?: string }) {
  return <Image src={src} alt={alt} fill sizes={sizes} unoptimized={preSized(src)} className={`object-cover ${className}`} />;
}

export function initials(name: string) {
  return name
    .replace(/[^A-Za-z0-9 &]/g, "")
    .split(" ")
    .filter((w) => w && w !== "&" && !/^(the|and|of|llc|inc)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function BusinessThumb({ b, className = "" }: { b: Business; className?: string }) {
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-sky ${className}`}>
      {b.image ? (
        <Image
          src={b.image}
          alt={b.name}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          unoptimized={preSized(b.image)}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="relative grid h-full place-items-center bg-navy">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25 [background-image:radial-gradient(var(--sky)_1px,transparent_1px)] [background-size:16px_16px]"
          />
          <span aria-hidden className="absolute -right-10 -bottom-10 size-32 rounded-full bg-brand" />
          <span className="relative font-display text-4xl font-bold tracking-tight text-sun">
            {initials(b.name)}
          </span>
        </div>
      )}
    </div>
  );
}

export function BusinessCard({ b }: { b: Business }) {
  return (
    <article className="group relative flex flex-col rounded-3xl bg-paper p-3 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5">
      <BusinessThumb b={b} />
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <p className="text-xs font-semibold text-brand">{b.tags[0] ?? b.categoryName}</p>
        <h3 className="mt-1 font-display text-lg leading-snug font-semibold">
          <Link href={`/business/${b.slug}`} className="after:absolute after:inset-0">
            {b.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-muted">
          <span>{b.city ?? "Tampa Bay area"}</span>
          <a href={`tel:${b.phone.replace(/\D/g, "")}`} className="relative z-10 font-medium text-ink hover:text-brand">
            {b.phone}
          </a>
        </div>
      </div>
    </article>
  );
}

export function CategoryCard({ c, big = false }: { c: Category; big?: boolean }) {
  return (
    <Link
      href={`/listings/${c.slug}`}
      className={`group flex flex-col justify-between rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-xl ${
        big ? "bg-brand text-white" : "bg-paper ring-1 ring-line"
      }`}
    >
      <span className={`font-display font-bold ${big ? "text-7xl text-sun" : "text-3xl text-brand"}`}>
        {c.count}
      </span>
      <span className="mt-6">
        <span className={`block font-display font-semibold ${big ? "text-3xl" : "text-lg"}`}>
          {c.name}
        </span>
        <span className={`text-sm ${big ? "text-white/75" : "text-muted"}`}>
          {c.tags.slice(0, big ? 6 : 3).join(" · ")}
        </span>
      </span>
    </Link>
  );
}

export function EventCard({ e }: { e: Event }) {
  return (
    <article className="group relative flex flex-col rounded-3xl bg-paper p-6 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-xl">
      {e.image && (
        <div className="relative -mx-3 -mt-3 mb-5 aspect-[16/9] overflow-hidden rounded-2xl bg-sky">
          <Photo src={e.image} alt="" sizes="(min-width: 768px) 360px, 100vw" className="transition duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl font-bold text-coral">{e.day}</span>
        <span className="text-sm font-semibold text-muted uppercase">
          {e.weekday} · {e.month}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">
        <Link href={`/events/${e.slug}`} className="after:absolute after:inset-0">
          {e.title}
        </Link>
      </h3>
      <p className="text-sm text-muted">
        {e.venue} · {e.time}
      </p>
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {e.tags.slice(0, 4).map((t) => (
          <li key={t} className="rounded-full bg-sky px-2.5 py-1 text-xs font-medium text-brand">
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}

const guideColors: Record<Guide["section"], string> = {
  "Things to Do": "bg-sun",
  "Local Guides": "bg-brand",
  "Business Spotlights": "bg-coral",
};

export function GuideCard({ g }: { g: Guide }) {
  return (
    <Link href={`/guides/${g.slug}`} className="group block">
      {g.image ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sky transition group-hover:-rotate-1">
          <Photo src={g.image} alt="" sizes="(min-width: 768px) 360px, 100vw" />
          <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold backdrop-blur">
            {g.section}
          </span>
        </div>
      ) : (
        <div
          className={`flex aspect-[4/3] items-end rounded-3xl p-6 transition group-hover:-rotate-1 ${guideColors[g.section] ?? "bg-sky"}`}
        >
          <span className="font-display text-2xl leading-tight font-bold text-ink/90 mix-blend-multiply">
            {g.section}
          </span>
        </div>
      )}
      <p className="mt-5 text-xs font-semibold tracking-[0.15em] text-muted uppercase">
        {formatDate(g.date)}
      </p>
      <h3 className="mt-2 font-display text-xl leading-snug font-semibold group-hover:underline">
        {g.title}
      </h3>
      <p className="mt-2 text-sm text-muted">{g.excerpt}</p>
    </Link>
  );
}
