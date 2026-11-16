"use client";

import { useState } from "react";
import type { StudentWork } from "@/lib/cms/content";
import {
  CATEGORY_ICON,
  CATEGORY_SINGULAR,
  CATEGORY_TINT,
} from "@/lib/museum/categories";
import { youtubeThumbnail } from "@/lib/studentWorks/youtube";
import { LikeButton } from "./LikeButton";

function coverOf(work: StudentWork): string | null {
  if (work.image_url) return work.image_url;
  if (work.youtube_id) return youtubeThumbnail(work.youtube_id, "hqdefault");
  return null;
}

/** One exhibit in the highlights row or the browse grid. */
export function ExhibitCard({
  work,
  onOpen,
}: {
  work: StudentWork;
  onOpen(): void;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : coverOf(work);
  const tint = CATEGORY_TINT[work.category];
  const Icon = CATEGORY_ICON[work.category];

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={onOpen}
        className="group focus-visible:outline-accent block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span
          data-cover
          className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl"
          style={{
            backgroundImage: `linear-gradient(160deg, ${tint.from}, ${tint.to})`,
          }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={() => setFailed(true)}
            />
          ) : (
            <Icon aria-hidden className="size-10 text-white" />
          )}
        </span>
        <span className="text-ink mt-2 block truncate text-sm leading-5 font-semibold">
          {work.title}
        </span>
      </button>
      <p className="text-ink-soft mt-0.5 truncate text-xs leading-5">
        {CATEGORY_SINGULAR[work.category]}
      </p>
      <div className="mt-2">
        <LikeButton work={work} compact />
      </div>
    </div>
  );
}
