"use client";

import { Heart } from "lucide-react";
import type { StudentWork } from "@/lib/cms/content";
import { SignInPrompt } from "@/components/account/SignInPrompt";
import { useLike } from "@/lib/museum/likes";
import { cn } from "@/lib/utils";

export function LikeButton({
  work,
  compact = false,
}: {
  work: Pick<StudentWork, "id" | "like_count">;
  compact?: boolean;
}) {
  const { liked, count, toggle, promptSignIn, dismissPrompt } = useLike(work);
  const label = `${liked ? "Unlike" : "Like"}, ${count}`;

  return (
    <>
      <button
        type="button"
        aria-pressed={liked}
        aria-label={label}
        onClick={toggle}
        className={cn(
          "inline-flex items-center rounded-full border border-current/40 font-semibold hover:bg-current/10",
          compact ? "h-8 gap-1 px-2 text-xs" : "min-h-11 gap-2 px-3 text-sm",
        )}
      >
        <Heart className={cn("size-4", liked && "fill-current")} aria-hidden />
        <span aria-hidden>{count}</span>
      </button>
      <SignInPrompt
        open={promptSignIn}
        onOpenChange={(open) => {
          if (!open) dismissPrompt();
        }}
      />
    </>
  );
}
