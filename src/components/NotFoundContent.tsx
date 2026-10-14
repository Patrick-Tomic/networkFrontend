import Link from "next/link";

export function NotFoundContent() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-32 text-center">
      <p className="font-display text-8xl font-bold text-sun">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold">This page took a wrong turn on SR 54.</h1>
      <p className="mt-3 text-muted">Let&apos;s get you back somewhere useful.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-brand px-6 py-3.5 font-semibold text-white hover:bg-navy">
          Home
        </Link>
        <Link href="/listings" className="rounded-full px-6 py-3.5 font-semibold ring-1 ring-ink/15 hover:bg-paper">
          Browse businesses
        </Link>
      </div>
    </section>
  );
}
