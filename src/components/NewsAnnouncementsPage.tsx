"use client";

import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import NewsAnnouncementsView from "@/components/NewsAnnouncementsView";
import { loadNewsAnnouncements } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";

/** Loads the news and announcements lists, then renders the page's view. */
export default function NewsAnnouncementsPage() {
  const posts = useContent("news-announcements", loadNewsAnnouncements);

  if (posts.status === "ready") {
    return <NewsAnnouncementsView {...posts.data} />;
  }

  return (
    <main className="space-y-10 px-6 py-8 sm:space-y-14 sm:px-12 sm:py-12 md:space-y-18 md:px-14 md:py-16">
      {posts.status === "error" ? (
        <ContentError onRetry={posts.retry} />
      ) : (
        <>
          <ContentPlaceholder className="h-64 w-full rounded-lg" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <ContentPlaceholder key={index} className="h-72 w-full" />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
