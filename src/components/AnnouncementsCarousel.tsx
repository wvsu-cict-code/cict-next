"use client";

// [IMPORT] Standard
import Image from "next/image";
import Link from "next/link";

// [IMPORT] Hooks
import { useState, useEffect, useRef } from "react";

interface NewsArticle {
  id: number;
  imgSrc?: string;
  date: string;
  newsHeader: string;
}

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

  // [FUNCTION] Generate URL slug from news header
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

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
            className="absolute top-1/2 left-1 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-md transition-all duration-200 hover:bg-white/80 sm:left-4 md:bg-white"
            aria-label="Previous"
          >
            ←
          </button>

          {/* [BUTTON] Right Arrow */}
          <button
            onClick={goNext}
            className="absolute top-1/2 right-1 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-md transition-all duration-200 hover:bg-white/80 sm:right-4 md:bg-white"
            aria-label="Next"
          >
            →
          </button>
        </div>
        <div
          className="flex space-x-10 py-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(50% - ${offset}px))` }}
        >
          {articles.map((article, index) => {
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(article.date).getTime()) /
                (1000 * 60 * 60 * 24),
            );

            const isActive = index === activeIndex;

            return (
              <div
                key={article.id}
                className={`relative w-60 flex-none transition-all duration-700 sm:w-66 md:w-72 ${
                  isActive
                    ? "z-10 scale-105 sm:scale-110"
                    : "scale-100 opacity-20"
                }`}
              >
                <div className="space-y-3 overflow-hidden rounded-xl bg-white p-4 pb-5 sm:space-y-4 sm:p-5 md:space-y-5 md:p-6">
                  <p className="font-minor mb-4 text-end text-xs text-[#4D4D4D]">
                    {daysAgo} days ago
                  </p>

                  {article.imgSrc ? (
                    <Image
                      src={article.imgSrc}
                      alt={article.newsHeader}
                      className="aspect-[16/9] rounded-xl object-cover"
                      width={240}
                      height={135}
                    />
                  ) : (
                    <div className="aspect-[16/9] rounded-xl bg-gray-300" />
                  )}

                  <h3
                    className="text-xl leading-6 font-bold text-black sm:text-2xl"
                    style={{ minHeight: "4.5rem" }}
                  >
                    {article.newsHeader}
                  </h3>

                  <Link
                    href={
                      isActive
                        ? `/news-announcements/news/${generateSlug(article.newsHeader)}`
                        : "#"
                    }
                    className={`font-minor mt-4 self-start rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors duration-300 ease-in-out md:text-sm ${
                      isActive
                        ? "bg-orange-dark border-orange-dark hover:text-orange-dark hover:border-orange-dark cursor-pointer border text-white hover:bg-white"
                        : "pointer-events-none border border-gray-200 bg-gray-200 text-gray-400"
                    }`}
                  >
                    Read More &nbsp;→
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
            className={`h-3 w-3 rounded-full transition-colors ${
              index === activeIndex ? "bg-orange-dark" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </>
  );
};
