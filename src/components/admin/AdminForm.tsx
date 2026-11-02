"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import { buttonClass } from "@/components/admin/PageHeader";
import type { FormState } from "@/lib/cms/forms";

interface AdminFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  children: React.ReactNode;
}

/**
 * Form shell for CMS editors: shows server errors, a pending state, and a
 * save bar that stays in view and says when there are unsaved changes.
 * Submits via onSubmit instead of <form action> so React doesn't reset the
 * fields when the server returns a validation error.
 */
export default function AdminForm({
  action,
  submitLabel = "Save",
  children,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [dirty, setDirty] = useState(false);

  // Ask before leaving the page with edits that haven't been saved
  useEffect(() => {
    if (!dirty || pending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  return (
    <form
      className="space-y-6"
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {state?.error && (
        <p
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      {children}

      <div className="border-rule/70 sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border bg-white/95 px-4 py-3 shadow-[0_12px_40px_rgba(16,32,51,0.12)] backdrop-blur">
        <p
          className="text-ink-soft flex items-center gap-2 text-sm"
          aria-live="polite"
        >
          {pending ? (
            "Saving…"
          ) : dirty ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
              Unsaved changes
            </>
          ) : null}
        </p>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass.primary}
        >
          {pending ? (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <Icon name="check" className="h-4 w-4" />
          )}
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
