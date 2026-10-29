"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/cms/forms";

interface AdminFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  children: React.ReactNode;
}

/**
 * Form shell for CMS editors: shows server errors and a pending state.
 * Submits via onSubmit instead of <form action> so React doesn't reset the
 * fields when the server returns a validation error.
 */
export default function AdminForm({
  action,
  submitLabel = "Save",
  children,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {children}

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-orange-dark hover:bg-orange-light rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
