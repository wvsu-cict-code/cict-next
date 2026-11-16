"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard, FormError } from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/auth/client";
import { getBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const result = await updatePassword(
      getBrowserClient(),
      String(form.get("password") ?? ""),
    );
    if (result.error) {
      setBusy(false);
      setError(result.error);
      return;
    }
    router.replace("/account/");
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
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
          Save password
        </Button>
      </form>
    </AuthCard>
  );
}
