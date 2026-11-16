"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard, FormError } from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/client";
import { getBrowserClient } from "@/lib/supabase/browser";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const displayName = String(form.get("name") ?? "").trim();
    if (!displayName) {
      setError("Enter your name.");
      return;
    }
    setBusy(true);
    setError(null);
    // signUp itself rejects non-WVSU emails and short passwords.
    const result = await signUp(getBrowserClient(), {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      displayName,
    });
    setBusy(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="Check your email">
        <p className="text-sm">
          Check your email for a link to confirm your account.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create an account"
      intro="For WVSU students and faculty. Use your @wvsu.edu.ph email."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">WVSU email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@wvsu.edu.ph"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
          />
          <p className="text-xs">At least 8 characters.</p>
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={busy}>
          Create account
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/account/sign-in/" className="underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
