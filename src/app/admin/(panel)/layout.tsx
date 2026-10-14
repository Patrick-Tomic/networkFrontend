import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";
import { adminFetch, getAdmin } from "@/lib/admin/session";
import type { AdminStats } from "@/lib/admin/types";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const [admin, stats] = await Promise.all([getAdmin(), adminFetch<{ data: AdminStats }>("/admin/stats")]);
  return (
    <div className="min-h-screen bg-cream md:grid md:grid-cols-[15rem_1fr]">
      <aside className="flex flex-col gap-6 bg-navy p-4 text-white md:sticky md:top-0 md:h-screen md:p-5">
        <div className="flex items-center justify-between gap-3">
          <Logo light className="h-10 w-auto" />
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase">
            Admin
          </span>
        </div>
        <AdminNav unread={stats.data.unread_contact_messages} />
        <div className="mt-auto hidden space-y-3 text-sm md:block">
          <Link href="/" target="_blank" className="block text-white/75 hover:text-white">
            View site ↗
          </Link>
          <div className="border-t border-white/10 pt-3">
            <p className="truncate font-medium">{admin.name}</p>
            <p className="truncate text-xs text-white/60">{admin.email}</p>
            <form action={logout}>
              <button className="mt-2 text-xs font-semibold text-sun hover:underline">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
        <form action={logout} className="mt-10 md:hidden">
          <button className="text-sm font-semibold text-brand">Sign out</button>
        </form>
      </main>
    </div>
  );
}
