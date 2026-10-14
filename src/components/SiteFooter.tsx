import Link from "next/link";
import { getCategories } from "@/lib/api";
import { mailto, nav, site, socials } from "@/lib/site";
import { Logo } from "./Logo";

export async function SiteFooter() {
  const categories = await getCategories();
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light className="h-14 w-auto" />
          <p className="mt-5 max-w-xs text-sm text-white/70">
            Local businesses and things to do in Wesley Chapel and the towns around it.
          </p>
          <a href={mailto("Hello WCN")} className="mt-4 inline-block text-sm font-semibold text-sun hover:underline">
            {site.email}
          </a>
        </div>
        <FooterCol title="Explore" links={nav.map((n) => ({ label: n.label, href: n.href }))} />
        <FooterCol
          title="Categories"
          links={categories.slice(0, 6).map((c) => ({ label: c.name, href: `/listings/${c.slug}` }))}
        />
        <FooterCol
          title="Follow"
          links={socials.map((s) => ({ label: s.name, href: s.href, external: true }))}
        />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/50">
          Wesley Chapel Network Inc · {site.location} · Free to browse. We never sell your data.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-sun">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="hover:text-sun">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
