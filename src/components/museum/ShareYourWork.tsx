"use client";

import Link from "next/link";
import { primaryButton } from "@/components/PageHeader";
import { ArrowIcon } from "@/components/PhotoSlot";
import { useSession } from "@/lib/auth/session";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/museum/categories";

const SUBMIT = "/account/submit/";

export function ShareYourWork() {
  const session = useSession();
  const href =
    session.status === "signed-in"
      ? SUBMIT
      : `/account/sign-in/?next=${encodeURIComponent(SUBMIT)}`;

  return (
    <div className="border-rule bg-surface-2 flex h-full flex-col rounded-2xl border p-6 md:p-8">
      <h2 className="text-ink text-3xl leading-tight font-medium">
        Share Your Work
      </h2>
      <p className="text-ink-soft mt-3 max-w-[46ch] leading-relaxed">
        BSEMC students can upload and showcase their projects in the Virtual
        Museum.
      </p>
      <ul aria-label="Accepted work" className="mt-6 grid gap-2">
        {CATEGORIES.map((category) => (
          <li
            key={category}
            className="text-ink flex items-center gap-3 text-sm"
          >
            <span
              aria-hidden
              className="bg-theme-red size-1.5 shrink-0 rounded-full"
            />
            {CATEGORY_LABELS[category]}
          </li>
        ))}
      </ul>
      <Link href={href} className={`${primaryButton} mt-8 self-start`}>
        Upload Exhibit
        <ArrowIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
