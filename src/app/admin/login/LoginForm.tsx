"use client";

import { startTransition, useActionState } from "react";
import { signIn } from "../actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(signIn, undefined);
  const error = state?.error ?? initialError;

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-dark focus:ring-2 focus:ring-orange-dark/20 focus:outline-none";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        // Avoid React's automatic form reset so the email survives a failed attempt
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-orange-dark hover:bg-orange-light w-full rounded-md py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
