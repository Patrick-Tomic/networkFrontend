"use client";

import { startTransition, useActionState } from "react";
import { sendMessage } from "./actions";

const input =
  "w-full rounded-2xl bg-paper px-4 py-3 ring-1 ring-line outline-none transition placeholder:text-muted/60 focus:ring-2 focus:ring-brand";

export function ContactForm({ subjects }: { subjects: string[] }) {
  const [state, action, pending] = useActionState(sendMessage, {});
  if (state.sent) {
    return (
      <div role="status" className="rounded-3xl bg-paper p-8 text-center ring-1 ring-line">
        <p className="font-display text-2xl font-bold">Thanks, we got it.</p>
        <p className="mt-2 text-muted">We&apos;ll reply to your email soon.</p>
      </div>
    );
  }
  return (
    <form
      // Submitted manually so a failed send doesn't clear what the visitor typed.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-4 rounded-3xl bg-paper p-6 ring-1 ring-line sm:grid-cols-2 md:p-8">
      {state.error && (
        <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 sm:col-span-2">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Your name</span>
        <input name="name" required autoComplete="name" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email</span>
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">
          Phone <span className="font-normal text-muted">(optional)</span>
        </span>
        <input name="phone" type="tel" autoComplete="tel" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">About</span>
        <select name="subject" className={input}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold">Message</span>
        <textarea name="body" required rows={5} className={input} />
      </label>
      <label aria-hidden className="absolute -left-[9999px]">
        Company <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="sm:col-span-2">
        <Submit pending={pending} />
      </div>
    </form>
  );
}

function Submit({ pending }: { pending: boolean }) {
  return (
    <button
      disabled={pending}
      className="rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-navy disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}
