"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard, FormError } from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/client";
import { safeNextPath } from "@/lib/auth/next";
import { getBrowserClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const result = await signIn(getBrowserClient(), {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (result.error) {
      setBusy(false);
      setError(result.error);
      return;
    }
    router.replace(safeNextPath(params.get("next")));
  }

  return (
    <AuthCard title="Sign in">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">WVSU email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={busy}>
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/account/forgot-password/" className="underline">
          Forgot your password?
        </Link>
      </p>
      <p className="mt-2 text-sm">
        New here?{" "}
        <Link href="/account/sign-up/" className="underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
