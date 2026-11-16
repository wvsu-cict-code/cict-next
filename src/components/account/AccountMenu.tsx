"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { getBrowserClient } from "@/lib/supabase/browser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="text-ink hover:bg-paper inline-flex h-11 w-11 items-center justify-center rounded-full"
        >
          <User className="h-5 w-5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/">My submissions</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/submit/">Submit work</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void signOut(getBrowserClient());
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
