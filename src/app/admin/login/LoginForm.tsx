"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { SubmitButton, submitWithoutReset } from "@/components/admin/ActionForm";
import { Field, inputClass } from "@/components/admin/ui";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(login, {});
  const message = state.error ?? notice;
  return (
    <form onSubmit={submitWithoutReset(action)} className="space-y-4">
      {message && (
        <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {message}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <SubmitButton pending={pending}>Sign in</SubmitButton>
    </form>
  );
}
