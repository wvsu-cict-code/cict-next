"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { StudentWork } from "@/lib/cms/content";
import { classifySwipe } from "@/lib/studentWorks/gestures";
import { isWebUrl, storeLabel } from "@/lib/studentWorks/links";
import { youtubeEmbedUrl } from "@/lib/studentWorks/youtube";

const KIND_LABEL: Record<StudentWork["kind"], string> = {
  art: "Digital art",
  video: "Video",
  game: "Game",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

const navButton =
  "inline-flex h-11 min-w-11 items-center justify-center rounded border border-white/40 px-3 text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";

/** Full-screen view of one featured work, with next/previous and swipe. */
export function WorkSpotlight({
  works,
  total,
  index,
  onIndexChange,
  onClose,
  loadMore,
}: {
  works: StudentWork[];
  total: number;
  index: number;
  onIndexChange(index: number): void;
  onClose(): void;
  loadMore(): Promise<boolean>;
}) {
  const work = works[index];
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const busy = useRef(false);
  const closed = useRef(false);
  const indexRef = useRef(index);
  const downOnBackdrop = useRef(false);
  // Task 11's ZoomableImage drives this; swipes are ignored while zoomed.
  const [zoomed] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const canPrevious = index > 0;
  const canNext = index < total - 1;

  function close() {
    closed.current = true;
    onClose();
  }

  async function next() {
    if (!canNext || busy.current) return;
    setLoadFailed(false);
    if (index >= works.length - 1) {
      busy.current = true;
      let ok: boolean;
      try {
        ok = await loadMore();
      } finally {
        busy.current = false;
      }
      // The visitor may have closed or moved while the page loaded.
      if (closed.current || indexRef.current !== index) return;
      if (!ok) {
        setLoadFailed(true);
        return;
      }
    }
    onIndexChange(index + 1);
  }

  function previous() {
    if (canPrevious) {
      setLoadFailed(false);
      onIndexChange(index - 1);
    }
  }

  // Latest handlers for the document listener without re-subscribing.
  const handlers = useRef({ next, previous, close });
  useEffect(() => {
    handlers.current = { next, previous, close };
    indexRef.current = index;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handlers.current.close();
      } else if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      } else if (event.key === "ArrowRight") {
        void handlers.current.next();
      } else if (event.key === "ArrowLeft") {
        handlers.current.previous();
      } else if (event.key === "Tab" && panelRef.current) {
        const items = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!panelRef.current.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!work) return null;

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary) return;
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function onPointerUp(event: PointerEvent) {
    const origin = start.current;
    start.current = null;
    if (!origin || origin.id !== event.pointerId) return;
    const action = classifySwipe(
      event.clientX - origin.x,
      event.clientY - origin.y,
      zoomed,
    );
    if (action === "next") void next();
    else if (action === "previous") previous();
    else if (action === "close") close();
  }

  const titleId = `spotlight-title-${work.id}`;
  const portfolio =
    work.portfolio_url && isWebUrl(work.portfolio_url)
      ? work.portfolio_url
      : null;
  const store =
    work.store_url && isWebUrl(work.store_url) ? work.store_url : null;
  const vertical = work.orientation === "vertical";

  return (
    <div
      data-testid="spotlight-backdrop"
      className="bg-navy/95 fixed inset-0 z-50 flex items-stretch justify-center lg:items-center lg:p-8"
      onPointerDown={(event) => {
        downOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && downOnBackdrop.current)
          close();
        downOnBackdrop.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-dvh w-full max-w-6xl flex-col lg:grid lg:h-auto lg:max-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={close}
          className={`${navButton} absolute top-3 right-3 z-10 bg-black/40`}
        >
          <span aria-hidden>✕</span>
        </button>

        <div
          data-testid="spotlight-media"
          className="flex max-h-[55dvh] min-h-0 shrink-0 items-center justify-center p-4 pt-16 lg:max-h-none lg:p-8"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            start.current = null;
          }}
        >
          {work.kind === "video" && work.youtube_id ? (
            <div
              className="max-h-[calc(55dvh-5rem)] w-full"
              style={{
                aspectRatio: vertical ? "9 / 16" : "16 / 9",
                maxWidth: vertical ? "min(100%, 35dvh)" : "100%",
              }}
            >
              <iframe
                key={work.id}
                src={youtubeEmbedUrl(work.youtube_id)}
                title={`${work.title} by ${work.student}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full rounded"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={work.image_url ?? undefined}
              alt={`${work.title} by ${work.student}`}
              draggable={false}
              className="max-h-[calc(55dvh-5rem)] max-w-full rounded object-contain lg:max-h-[80vh]"
            />
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col text-white">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8 lg:pt-16">
            <p className="text-orange-light text-sm tracking-widest uppercase">
              {KIND_LABEL[work.kind]}
            </p>
            <h2 id={titleId} className="font-major text-3xl leading-tight">
              {work.title}
            </h2>
            <p className="text-lg text-white/80">{work.student}</p>
            {work.description ? (
              <p className="whitespace-pre-line text-white/90">
                {work.description}
              </p>
            ) : null}
            {work.kind === "game" && store ? (
              <a
                href={store}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-theme-red inline-flex min-h-11 items-center justify-center rounded px-5 font-bold text-white hover:opacity-90"
              >
                {storeLabel(store)}
              </a>
            ) : null}
            {portfolio ? (
              <a
                href={portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded border border-white/60 px-5 font-bold text-white hover:bg-white/10"
              >
                View portfolio
              </a>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/15 px-6 py-3 lg:px-8">
            <button
              type="button"
              aria-label="Previous work"
              disabled={!canPrevious}
              onClick={previous}
              className={navButton}
            >
              <span aria-hidden>←</span>
            </button>
            <p className="text-sm text-white/80" aria-live="polite">
              {index + 1} of {total}
            </p>
            <button
              type="button"
              aria-label="Next work"
              disabled={!canNext}
              onClick={() => void next()}
              className={navButton}
            >
              <span aria-hidden>→</span>
            </button>
          </div>
          {loadFailed ? (
            <p
              role="status"
              className="px-6 pb-3 text-sm text-white/70 lg:px-8"
            >
              Couldn&apos;t load more works.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
