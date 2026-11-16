"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";

const navButton =
  "inline-flex h-11 min-w-11 items-center justify-center rounded border border-white/40 px-3 text-white hover:bg-white/10";

function altFor(photo: Photo, index: number, total: number) {
  return photo.alt || `Photo ${index + 1} of ${total}`;
}

/** A grid of a post's or event's photos; clicking one opens a viewer. */
export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [current, setCurrent] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const total = photos.length;
  const isOpen = current !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (total === 0) return null;

  function open(index: number, button: HTMLElement) {
    opener.current = button;
    setCurrent(index);
  }

  function close() {
    // Close the modal first: while it is open everything outside is inert,
    // so focusing the opener would do nothing.
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.close === "function") dialog.close();
    setCurrent(null);
    opener.current?.focus();
  }

  function step(delta: number) {
    setCurrent((i) => (i === null ? i : (i + delta + total) % total));
  }

  const photo = current === null ? null : photos[current];

  return (
    <section aria-label="Photos" className="mt-10">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, i) => (
          <li key={`${p.url}-${i}`}>
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              className="block w-full overflow-hidden rounded-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- the static site can't optimize images */}
              <img
                src={p.url}
                width={p.width}
                height={p.height}
                alt={altFor(p, i, total)}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      {photo && current !== null && (
        <dialog
          ref={dialogRef}
          aria-label="Photo viewer"
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            } else if (e.altKey || e.ctrlKey || e.metaKey) {
              return;
            } else if (e.key === "ArrowRight") {
              step(1);
            } else if (e.key === "ArrowLeft") {
              step(-1);
            }
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="m-auto h-dvh max-h-none w-dvw max-w-none bg-black/90 p-0 backdrop:bg-black/90"
        >
          <div
            onClick={(e) => {
              // The wrapper fills the dialog, so it is the visible backdrop
              if (e.target === e.currentTarget) close();
            }}
            className="flex h-full flex-col items-center justify-center gap-4 p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the static site can't optimize images */}
            <img
              src={photo.url}
              width={photo.width}
              height={photo.height}
              alt={altFor(photo, current, total)}
              className="max-h-[75dvh] w-auto max-w-full object-contain"
            />
            <div className="flex items-center gap-4 text-white">
              <button
                type="button"
                className={navButton}
                onClick={() => step(-1)}
              >
                Previous
              </button>
              <p aria-live="polite" className="min-w-16 text-center text-sm">
                {current + 1} of {total}
              </p>
              <button
                type="button"
                className={navButton}
                onClick={() => step(1)}
              >
                Next
              </button>
              <button
                ref={closeRef}
                type="button"
                className={navButton}
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
