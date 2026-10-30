"use client";

// [IMPORT] Standard
import { ArrowIcon } from "@/components/PhotoSlot";
import { SdgBadges } from "@/components/SdgBadges";
import Link from "next/link";

// [IMPORT] Hooks
import { useState, useEffect, useRef } from "react";

// [IMPORT] Types
import { newsHref, type NewsArticle } from "@/lib/news";

interface AnnouncementsCarouselProps {
  articles: NewsArticle[];
}

export const AnnouncementsCarousel: React.FC<AnnouncementsCarouselProps> = ({
  articles,
}) => {
  // [STATES] Carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(240); // default = w-60
  const [windowWidth, setWindowWidth] = useState(0);

  // [STATES] Touch handling for mobile swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const autoSlideInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // [CONSTANTS] Carousel configuration
  const GAP = 40; // space-x-10
  const offset = activeIndex * (cardWidth + GAP) + cardWidth / 2;

  // [EFFECT] Update card width based on window size
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width >= 768)
        setCardWidth(288); // md:w-72
      else if (width >= 640)
        setCardWidth(264); // sm:w-66
      else setCardWidth(240); // w-60
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // [EFFECT] Auto-slide functionality with pause on hover
  useEffect(() => {
    if (!articles.length) return;

    // Clear any previous interval
    if (autoSlideInterval.current) clearInterval(autoSlideInterval.current);

    if (!isPaused) {
      autoSlideInterval.current = setInterval(() => {
        setActiveIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
      }, 5000);
    }

    return () => {
      if (autoSlideInterval.current) clearInterval(autoSlideInterval.current);
    };
  }, [articles.length, isPaused]);

  // [FUNCTIONS] Carousel navigation
  const goToIndex = (index: number) => setActiveIndex(index);
  const goNext = () => {
    setActiveIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  };
  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPaused(true); // pause auto-slide when user starts touching
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const SWIPE_THRESHOLD = 50;

    if (diff > SWIPE_THRESHOLD) goNext();
    else if (diff < -SWIPE_THRESHOLD) goPrev();

    setTouchStartX(null);

    // resume auto-slide after a short delay
    setTimeout(() => setIsPaused(false), 2000); // 2s pause after swipe
  };

  return (
    <>
      <div
        className="relative w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hidden sm:block">
          {/* [BUTTON] Left Arrow */}
          <button
            onClick={goPrev}
            className="text-ink hover:text-theme-red absolute top-1/2 left-1 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-colors duration-200 sm:left-4"
            aria-label="Previous"
          >
            <ArrowIcon className="h-4 w-4 rotate-180" />
          </button>

          {/* [BUTTON] Right Arrow */}
          <button
            onClick={goNext}
            className="text-ink hover:text-theme-red absolute top-1/2 right-1 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-colors duration-200 sm:right-4"
            aria-label="Next"
          >
            <ArrowIcon className="h-4 w-4" />
          </button>
        </div>
        <div
          className="flex space-x-10 py-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(50% - ${offset}px))` }}
        >
          {articles.map((article, index) => {
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(article.publishedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            );

            const isActive = index === activeIndex;

            return (
              <div
                key={article.id}
                className={`relative w-60 flex-none transition-all duration-700 sm:w-66 md:w-72 ${
                  isActive
                    ? "z-10 scale-105 sm:scale-110"
                    : "scale-100 opacity-30"
                }`}
              >
                <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-4 pb-5 shadow-[0_18px_50px_rgba(16,32,51,0.25)] sm:p-5">
                  <p className="text-ink-soft text-xs">{daysAgo} days ago</p>

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

                  <Link
                    href={isActive ? newsHref(article.slug) : "#"}
                    className={`ease-draw inline-flex min-h-10 items-center gap-2 self-start rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "bg-theme-red hover:bg-accent-deep text-white"
                        : "text-ink-soft pointer-events-none bg-neutral-200"
                    }`}
                  >
                    Read more
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="mt-6 flex justify-center space-x-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            aria-label={`Show announcement ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "bg-orange-light w-6"
                : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </>
  );
};
