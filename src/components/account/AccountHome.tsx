"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AuthCard } from "./AuthCard";
import { MySubmissions } from "./MySubmissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { getBrowserClient } from "@/lib/supabase/browser";

export function AccountHome() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useSession();
  const submitted = params.get("submitted") === "1";

  useEffect(() => {
    if (session.status === "signed-out") {
      router.replace(
        `/account/sign-in/?next=${encodeURIComponent("/account/")}`,
      );
    }
  }, [session.status, router]);

  if (session.status !== "signed-in" || !session.user) {
    return (
      <AuthCard title="Your account">
        <p className="text-sm" role="status">
          Loading…
        </p>
      </AuthCard>
    );
  }

  const name = session.displayName ?? session.user?.email ?? "there";

  return (
    <AuthCard title={`Hello, ${name}`}>
      {submitted ? (
        <Alert className="mb-4">
          <AlertDescription>
            Submitted for review. We&apos;ll let you know when it&apos;s
            approved.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/account/submit/">Submit work</Link>
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut(getBrowserClient());
            router.replace("/");
          }}
        >
          Sign out
        </Button>
      </div>
      <MySubmissions userId={session.user.id} />
    </AuthCard>
  );
}
