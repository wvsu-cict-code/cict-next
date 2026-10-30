import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentPlaceholder } from "@/components/ContentState";
import { SearchResults } from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description: "Search articles, programs, and faculty at WVSU CICT.",
  // Result pages are thin, duplicate content for search engines
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={<ContentPlaceholder className="h-72 w-full rounded-none" />}
    >
      <SearchResults />
    </Suspense>
  );
}
