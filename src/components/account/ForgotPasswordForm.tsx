"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard, FormError } from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth/client";
import { getBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const result = await requestPasswordReset(
      getBrowserClient(),
      String(form.get("email") ?? ""),
    );
    setBusy(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="Check your email">
        <p className="text-sm">
          If that email has an account, we&apos;ve sent a reset link.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      intro="Enter your WVSU email and we'll send you a link."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">WVSU email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={busy}>
          Send reset link
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/account/sign-in/" className="underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
