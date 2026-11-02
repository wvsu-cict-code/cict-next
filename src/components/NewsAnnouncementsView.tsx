"use client";

// [IMPORT] Hooks
import { useMemo, useState } from "react";

// [IMPORT] Components
import { AnnouncementsCarousel } from "./AnnouncementsCarousel";
import SearchBar from "./SearchBar";
import SortFilter from "./SortFilter";
import NewsArticleCard from "./NewsArticleCard";
import { PageHeader, SectionHeading, container } from "./PageHeader";

// [IMPORT] Types
import type { NewsArticle } from "@/lib/news";

interface NewsAnnouncementsViewProps {
  announcements: NewsArticle[];
  newsArticles: NewsArticle[];
}

const pageButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40";

export function NewsPageHeader() {
  return (
    <PageHeader
      eyebrow="News"
      title="News and announcements"
      intro="Stay informed with the latest events, announcements, and achievements."
    />
  );
}

export default function NewsAnnouncementsView({
  announcements,
  newsArticles,
}: NewsAnnouncementsViewProps) {
  // States
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const articlesPerPage = 6; // # of articles per page (two rows of three)

  // [MEMO FUNCTION] Sort Articles
  const sortedArticles = useMemo(() => {
    const copy = [...newsArticles];

    switch (sortOption) {
      case "name-asc":
        return copy.sort((a, b) => a.newsHeader.localeCompare(b.newsHeader));
      case "name-desc":
        return copy.sort((a, b) => b.newsHeader.localeCompare(a.newsHeader));
      case "date-new":
        return copy.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );
      case "date-old":
        return copy.sort(
          (a, b) =>
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime(),
        );
      default:
        return copy;
    }
  }, [newsArticles, sortOption]);

  // Pagination calculations
  const indexOfLast = currentPage * articlesPerPage;
  const indexOfFirst = indexOfLast - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);

  // [FUNCTION] Navigate to page number
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white">
      <NewsPageHeader />

      {/* [SECTION] Announcements */}
      {announcements.length > 0 && (
        <section className={`${container} py-16 md:py-20`}>
          <SectionHeading
            eyebrow="Announcements"
            title="From the college office"
          />

          {/* [SECTION] Announcements Carousel */}
          <div className="bg-navy relative mt-10 overflow-hidden rounded-2xl">
            <div
              aria-hidden
              className="absolute inset-0 bg-[url('/carousel-bg.webp')] bg-cover bg-center opacity-25"
            />
            <div className="relative z-10 px-4 py-10">
              <AnnouncementsCarousel articles={announcements} />
            </div>
          </div>
        </section>
      )}

      {/* [SECTION] News Articles */}
      <section className="bg-[#f7f8fa]">
        <div className={`${container} py-16 md:py-20`}>
          <SectionHeading eyebrow="News" title="News articles" />

          {/* [FEATURE] Search Bar & Sort Filter */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SearchBar />
            <SortFilter value={sortOption} onChange={setSortOption} />
          </div>

          {/* [SECTION] News Article Cards */}
          {currentArticles.length === 0 ? (
            <p className="text-ink-soft mt-10 text-base">
              No news articles yet.
            </p>
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {currentArticles.map((article) => (
                <li key={article.id} className="flex min-w-0">
                  <NewsArticleCard
                    slug={article.slug}
                    imgSrc={article.imgSrc}
                    date={article.date}
                    header={article.newsHeader}
                    description={article.description}
                    sdgs={article.sdgs}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* [FEATURE] Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="News pages"
              className="mt-10 flex flex-wrap justify-center gap-2"
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${pageButton} border-rule text-ink hover:border-ink bg-white`}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`${pageButton} ${
                      page === currentPage
                        ? "border-theme-red bg-theme-red text-white"
                        : "border-rule text-ink hover:border-ink bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${pageButton} border-rule text-ink hover:border-ink bg-white`}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
