"use client";

import { startTransition, useActionState, useState } from "react";
import { inputClass } from "@/components/admin/fields";
import { Icon } from "@/components/admin/icons";
import { buttonClass } from "@/components/admin/PageHeader";
import { signIn } from "../actions";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(signIn, undefined);
  const error = state?.error ?? initialError;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      // POST, so a sign-in before the page has loaded its scripts never puts
      // the password in the URL
      method="post"
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
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-ink block text-sm font-semibold">
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
        <label
          htmlFor="password"
          className="text-ink block text-sm font-semibold"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="text-ink-soft hover:text-ink absolute inset-y-0 right-0 flex w-11 items-center justify-center"
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              className="h-[18px] w-[18px]"
            />
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className={`${buttonClass.primary} min-h-11 w-full`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
