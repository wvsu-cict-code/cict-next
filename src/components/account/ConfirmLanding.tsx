"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthCard, FormError } from "./AuthCard";
import { verifyEmailLink } from "@/lib/auth/client";
import { getBrowserClient } from "@/lib/supabase/browser";

export function ConfirmLanding() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // A token is single-use: never verify twice (Strict Mode re-runs effects).
    if (started.current) return;
    started.current = true;
    void verifyEmailLink(getBrowserClient(), params).then((result) => {
      if ("error" in result) setError(result.error);
      else router.replace(result.next);
    });
  }, [params, router]);

  return (
    <AuthCard title={error ? "Link problem" : "Confirming…"}>
      {error ? (
        <>
          <FormError message={error} />
          <p className="mt-4 text-sm">
            <Link href="/account/sign-in/" className="underline">
              Go to sign in
            </Link>
          </p>
        </>
      ) : (
        <p className="text-sm" role="status">
          One moment while we check your link.
        </p>
      )}
    </AuthCard>
  );
}
