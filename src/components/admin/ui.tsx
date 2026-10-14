// Small building blocks shared by the admin pages.
import Link from "next/link";

export const inputClass =
  "w-full rounded-xl bg-paper px-3.5 py-2.5 text-[15px] ring-1 ring-line outline-none transition placeholder:text-muted/60 focus:ring-2 focus:ring-brand disabled:opacity-60";

export function PageTitle({
  title,
  intro,
  action,
  back,
}: {
  title: string;
  intro?: string;
  action?: React.ReactNode;
  back?: { label: string; href: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm font-medium text-muted hover:text-brand">
          ← {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          {intro && <p className="mt-1 max-w-2xl text-muted">{intro}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl bg-paper p-6 ring-1 ring-line md:p-7">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {intro && <p className="mt-0.5 text-sm text-muted">{intro}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

const badgeColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  suspended: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  expired: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${badgeColors[status] ?? badgeColors.draft}`}
    >
      {status}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-paper ring-1 ring-line ${className}`}>{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-12 text-center text-muted">{children}</p>;
}

export function Notice({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" }) {
  return (
    <p
      role="status"
      className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
        tone === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
      }`}
    >
      {children}
    </p>
  );
}

export function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy"
    >
      {children}
    </Link>
  );
}
