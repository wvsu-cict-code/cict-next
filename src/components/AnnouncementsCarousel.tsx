"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/PhotoSlot";
import { SdgBadges } from "@/components/SdgBadges";
import {
  centerSlide,
  swipeStep,
  usePageVisible,
  useReducedMotion,
  wrapIndex,
} from "@/lib/carousel";
import { timeAgo } from "@/lib/format";
import { newsHref, type NewsArticle } from "@/lib/news";

interface AnnouncementsCarouselProps {
  articles: NewsArticle[];
}

function isKeyboardFocus(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

/** How long each announcement stays up before the next one slides in. */
export const AUTOPLAY_MS = 5000;

const arrowButton =
  "text-ink hover:text-accent bg-surface absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md transition-colors duration-200 sm:flex";

/**
 * Announcements, one in focus at a time with the next ones peeking beside
 * it. Steps with the arrows, the dots, the keyboard arrows, a swipe or a
 * click on a faded card, and moves on by itself every few seconds unless
 * the visitor is pointing at it, focused in it, touching it, has the tab
 * hidden, or prefers reduced motion.
 */
export const AnnouncementsCarousel: React.FC<AnnouncementsCarouselProps> = ({
  articles,
}) => {
  const count = articles.length;
  const [requested, setRequested] = useState(0);
  // The list can shrink under us (e.g. fresh content); stay in range
  const active = Math.min(requested, Math.max(0, count - 1));

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const visible = usePageVisible();
  const playing =
    count > 1 && !reducedMotion && visible && !hovered && !focused && !touching;

  const go = (index: number) => setRequested(wrapIndex(index, count));

  // One timer per slide, so any manual step gives the new slide its full time
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(
      () => setRequested((index) => wrapIndex(index + 1, count)),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(timer);
  }, [playing, active, count]);

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setTouching(true);
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    setTouching(false);
    if (!start) return;
    const touch = e.changedTouches[0];
    const step = swipeStep(touch.clientX - start.x, touch.clientY - start.y);
    if (step) go(active + step);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
    else return;
    e.preventDefault();
  }

  if (count === 0) return null;
  const multiple = count > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Announcements"
      onKeyDown={multiple ? onKeyDown : undefined}
      // Only a mouse hovers; a tap would otherwise leave it paused for good
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // Keyboard focus pauses; a mouse click leaving focus on an arrow doesn't
      onFocus={(e) => isKeyboardFocus(e.target) && setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setFocused(false);
      }}
    >
      <div
        className="relative w-full overflow-hidden [--gap:2.5rem] [--slide:15rem] sm:[--slide:16.5rem] md:[--slide:18rem]"
        onTouchStart={multiple ? onTouchStart : undefined}
        onTouchEnd={multiple ? onTouchEnd : undefined}
        onTouchCancel={() => {
          touchStart.current = null;
          setTouching(false);
        }}
      >
        {multiple && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              className={`${arrowButton} left-4`}
              aria-label="Previous announcement"
            >
              <ArrowIcon className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              className={`${arrowButton} right-4`}
              aria-label="Next announcement"
            >
              <ArrowIcon className="h-4 w-4" />
            </button>
          </>
        )}

        <div
          className="flex gap-(--gap) py-4 transition-transform duration-500 ease-in-out motion-reduce:transition-none"
          style={{ transform: centerSlide(active) }}
          // Announce slide changes the visitor makes, not the automatic ones
          aria-live={playing ? "off" : "polite"}
        >
          {articles.map((article, index) => {
            const isActive = index === active;
            return (
              <div
                key={article.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                // Faded cards are a preview: hidden from screen readers
                // (the arrows and dots reach them) and a click brings
                // them forward
                aria-hidden={isActive ? undefined : true}
                onClick={isActive ? undefined : () => go(index)}
                className={`relative w-(--slide) flex-none transition-all duration-700 motion-reduce:transition-none ${
                  isActive
                    ? "z-10 scale-105 sm:scale-110"
                    : "scale-100 cursor-pointer opacity-30 hover:opacity-50"
                }`}
              >
                <div className="bg-surface flex flex-col gap-4 overflow-hidden rounded-2xl p-4 pb-5 shadow-[0_18px_50px_rgba(16,32,51,0.25)] sm:p-5">
                  <time
                    dateTime={article.publishedAt}
                    className="text-ink-soft text-xs"
                  >
                    {timeAgo(article.publishedAt)}
                  </time>

                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- same fallback as the home page cards */}
                    <img
                      src={
                        article.imgSrc ||
                        "/home-page_assets/featured-card-image.png"
                      }
                      alt=""
                      className="aspect-[16/9] w-full rounded-xl object-cover"
                    />
                    <SdgBadges
                      sdgs={article.sdgs}
                      max={3}
                      className="absolute bottom-2 left-2"
                    />
                  </div>

                  <h3
                    className="font-major text-ink text-xl leading-snug font-medium sm:text-2xl"
                    style={{ minHeight: "4.5rem" }}
                  >
                    {article.newsHeader}
                  </h3>

                  {isActive ? (
                    <Link
                      href={newsHref(article.slug)}
                      className="ease-draw bg-theme-red hover:bg-accent-deep inline-flex min-h-10 items-center gap-2 self-start rounded-full px-4 text-sm font-semibold text-white transition-colors duration-200"
                    >
                      Read more
                      <span className="sr-only">: {article.newsHeader}</span>
                      <ArrowIcon className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-ink-soft bg-paper-2 inline-flex min-h-10 items-center gap-2 self-start rounded-full px-4 text-sm font-semibold">
                      Read more
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {multiple && (
        <div className="mt-6 flex justify-center">
          {articles.map((article, index) => (
            <button
              key={article.id}
              type="button"
              onClick={() => go(index)}
              aria-label={`Show announcement ${index + 1} of ${count}`}
              aria-current={index === active ? "true" : undefined}
              // The padding makes a finger-sized target around the small dot
              className="group flex h-8 items-center px-1"
            >
              <span
                className={`block h-2.5 rounded-full transition-all duration-300 ${
                  index === active
                    ? "bg-orange-light w-6"
                    : "w-2.5 bg-white/50 group-hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
