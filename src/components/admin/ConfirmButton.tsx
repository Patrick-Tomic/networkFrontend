"use client";

import { useTransition } from "react";

/** Runs a server action after an optional confirmation, e.g. delete or approve. */
export function ConfirmButton({
  action,
  confirm,
  children,
  tone = "default",
}: {
  action: () => Promise<void>;
  confirm?: string;
  children: React.ReactNode;
  tone?: "default" | "danger" | "primary";
}) {
  const [pending, start] = useTransition();
  const styles = {
    default: "ring-1 ring-line hover:ring-brand",
    danger: "text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50",
    primary: "bg-brand text-white hover:bg-navy",
  }[tone];
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(() => action());
      }}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${styles}`}
    >
      {pending ? "…" : children}
    </button>
  );
}
