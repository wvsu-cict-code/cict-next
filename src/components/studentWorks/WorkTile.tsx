"use client";

import { useState, type Ref } from "react";
import type { StudentWork } from "@/lib/cms/content";
import { tileImage, workAspect } from "@/lib/studentWorks/layout";

const TYPE_LABELS: Record<StudentWork["kind"], string> = {
  art: "Digital art",
  video: "Video",
  game: "Game",
};

/** Height of the caption under the image; the wall's layout relies on it. */
export const CAPTION_HEIGHT = 52;

/** Intrinsic size hint so the browser reserves space before the image loads. */
function imageSize(work: StudentWork) {
  if (work.kind === "video") {
    return work.orientation === "vertical"
      ? { width: 720, height: 1280 }
      : { width: 1280, height: 720 };
  }
  if (work.image_width && work.image_height) {
    return { width: work.image_width, height: work.image_height };
  }
  return { width: 800, height: 600 };
}

export function WorkTile({
  work,
  onOpen,
  buttonRef,
}: {
  work: StudentWork;
  onOpen(): void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const image = tileImage(work);
  const [failed, setFailed] = useState(false);
  const src = failed && image.fallbackSrc ? image.fallbackSrc : image.src;
  const { width, height } = imageSize(work);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={onOpen}
      aria-label={`${work.title} by ${work.student}`}
      className="group focus-visible:outline-theme-red block h-full w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span
        data-media
        className="bg-paper relative block w-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(16,32,51,0.08)] transition-shadow duration-200 group-hover:shadow-[0_12px_32px_rgba(16,32,51,0.18)]"
        style={{ aspectRatio: workAspectRatio(work) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="bg-navy/80 absolute top-2 left-2 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.06em] text-white uppercase">
          {TYPE_LABELS[work.kind]}
        </span>
        {work.kind === "video" ? (
          <span
            data-play
            aria-hidden="true"
            className="bg-navy/70 absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white"
          >
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        ) : null}
      </span>
      <span
        className="block pt-2"
        style={{ height: CAPTION_HEIGHT }}
      >
        <span className="text-ink block truncate text-sm leading-5 font-semibold">
          {work.title}
        </span>
        <span className="text-ink-soft block truncate text-xs leading-5">
          {work.student}
        </span>
      </span>
    </button>
  );
}

/** CSS aspect-ratio value; verticals read "9 / 16" exactly. */
function workAspectRatio(work: StudentWork): string {
  if (work.kind === "video") {
    return work.orientation === "vertical" ? "9 / 16" : "16 / 9";
  }
  return `${workAspect(work)}`;
}
