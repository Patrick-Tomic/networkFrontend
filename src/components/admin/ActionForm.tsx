"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import type { FormState } from "@/app/admin/actions";

/**
 * Submits a form to an action without React's automatic form reset, so typed values
 * survive a failed save (passing `action` to <form> would clear every field).
 */
export function submitWithoutReset(dispatch: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
}

/** A form wired to a server action, with an error banner and a "Saved" confirmation. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "",
  footer,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!state.saved) return;
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 3000);
    return () => clearTimeout(t);
  }, [state.saved]);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className={className}>
      {state.error && (
        <p role="alert" className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {state.error}
        </p>
      )}
      {children}
      <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-cream/95 py-4 backdrop-blur">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        <span aria-live="polite" className="text-sm font-medium text-emerald-700">
          {showSaved && "Saved ✓"}
        </span>
        <div className="ml-auto">{footer}</div>
      </div>
    </form>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition hover:bg-navy disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
