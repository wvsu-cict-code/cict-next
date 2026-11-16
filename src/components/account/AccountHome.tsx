"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthCard } from "./AuthCard";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { getBrowserClient } from "@/lib/supabase/browser";

export function AccountHome() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "signed-out") {
      router.replace(
        `/account/sign-in/?next=${encodeURIComponent("/account/")}`,
      );
    }
  }, [session.status, router]);

  if (session.status !== "signed-in") {
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
      <Button
        variant="outline"
        onClick={async () => {
          await signOut(getBrowserClient());
          router.replace("/");
        }}
      >
        Sign out
      </Button>
    </AuthCard>
  );
}
