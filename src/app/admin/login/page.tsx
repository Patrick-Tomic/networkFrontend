import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const notice = params.expired
    ? "Your session ended. Please sign in again."
    : params.denied
      ? "That account doesn't have admin access."
      : undefined;
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5">
      <div className="w-full max-w-sm rounded-3xl bg-paper p-8 shadow-xl shadow-brand/5 ring-1 ring-line">
        <Logo className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center font-display text-2xl font-bold">Site admin</h1>
        <p className="mb-6 text-center text-sm text-muted">Edit businesses, events, guides and prices.</p>
        <LoginForm next={next} notice={notice} />
      </div>
    </main>
  );
}
