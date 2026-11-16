"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SignInPrompt({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  if (!open) return null;
  return <SignInPromptDialog onOpenChange={onOpenChange} />;
}

function SignInPromptDialog({
  onOpenChange,
}: {
  onOpenChange(open: boolean): void;
}) {
  const pathname = usePathname() || "/";
  const search = useSearchParams().toString();
  const next = search ? `${pathname}?${search}` : pathname;
  const encoded = encodeURIComponent(next);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Sign in with your WVSU account to like exhibits.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild>
            <Link href={`/account/sign-in/?next=${encoded}`}>Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/account/sign-up/?next=${encoded}`}>Create account</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
