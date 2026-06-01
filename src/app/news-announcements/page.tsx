"use client";

// [IMPORT] Hooks
import { useMemo, useState } from "react";

// [IMPORT] Components
import { AnnouncementsCarousel } from "../../components/AnnouncementsCarousel";
import SearchBar from "../../components/SearchBar";
import SortFilter from "../../components/SortFilter";
import NewsArticleCard from "../../components/NewsArticleCard";

export default function NewsAnnouncements() {
    // States
    const [sortOption, setSortOption] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const articlesPerPage = 4; // # of articles per page

    // Mock data
    const newsArticles = useMemo(() => [
        {
            id: 1,
            date: "February 1, 2026",
            description: "WVSU-CICT showcased innovative tech solutions at the ICC 2025 in Taiwan, highlighting student projects and faculty research.",
            newsHeader: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
        },
        {
            id: 2,
            imgSrc: "",
            date: "February 2, 2026",
            description: "CICT faculty member Dr. Reyes published a groundbreaking research paper on AI applications in education, receiving international acclaim.",
            newsHeader: "CICT Faculty Publishes AI Research Paper",
        },
        {
            id: 3,
            imgSrc: "",
            date: "February 3, 2026",
            description: "WVSU-CICT will host the annual Student Projects Showcase on March 15, featuring innovative projects from students across all levels.",
            newsHeader: "New Student Projects Showcase 2026",
        },
        {
            id: 4,
            imgSrc: "",
            date: "February 4, 2026",
            description: "WVSU-CICT is launching a new scholarship program for underprivileged students pursuing degrees in computer science and information technology.",
            newsHeader: "Upcoming Technology Workshops at WVSU",
        },
    ], []);

    // [MEMO FUNCTION] Sort Articles
    const sortedArticles = useMemo(() => {
        const copy = [...newsArticles];

        switch (sortOption) {
            case "name-asc":
                return copy.sort((a, b) => a.newsHeader.localeCompare(b.newsHeader));
            case "name-desc":
                return copy.sort((a, b) => b.newsHeader.localeCompare(a.newsHeader));
            case "date-new":
                return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            case "date-old":
                return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        <main className="px-6 sm:px-12 md:px-14 py-8 sm:py-12 md:py-16 space-y-10 sm:space-y-14 md:space-y-18">
            {/* [SECTION] Announcements */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="text-2xl sm:text-3xl font-medium text-[#4D4D4D] whitespace-nowrap">
                        ANNOUNCEMENTS
                    </h2>
                    <div className="flex-1 h-[2px] border-2 border-orange-dark" />
                </div>

                {/* [SECTION] Announcements Carousel */}
                <div className="relative w-full rounded-lg overflow-hidden bg-[url('/carousel-bg.webp')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-orange-light opacity-60" />
                    <div className="relative z-10 py-10 px-4">
                        <AnnouncementsCarousel articles={newsArticles} />
                    </div>
                </div>
            </section>

            {/* [SECTION] News Articles */}
            <section className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="text-2xl sm:text-3xl font-medium text-[#4D4D4D] whitespace-nowrap">
                        NEWS ARTICLES
                    </h2>
                    <div className="flex-1 h-[2px] border-2 border-orange-dark"/>
                </div>

                {/* [FEATURE] Search Bar & Sort Filter */}
                <div className="flex flex-wrap justify-between items-center py-2 space-x-4 sm:space-x-6 md:space-x-8 mb-4">
                    <SearchBar/>
                    <div className="flex flex-2 sm:flex-1">
                        <SortFilter value={sortOption} onChange={setSortOption} />
                    </div>
                </div>

                {/* [SECTION] News Article Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {currentArticles.map(article => (
                        <NewsArticleCard
                            key={article.id}
                            imgSrc={article.imgSrc}
                            date={article.date}
                            header={article.newsHeader}
                            description={article.description}
                        />
                    ))}
                </div>

                {/* [FEATURE] Pagination */}
                <div className="flex justify-center space-x-2 mt-6">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded border ${
                                page === currentPage ? "bg-orange-dark text-white" : "bg-white hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </section>
        </main>
    );
}
