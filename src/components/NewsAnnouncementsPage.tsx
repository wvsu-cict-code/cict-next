"use client";

import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import NewsAnnouncementsView, {
  NewsPageHeader,
} from "@/components/NewsAnnouncementsView";
import { container } from "@/components/PageHeader";
import { loadNewsAnnouncements } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";

/** Loads the news and announcements lists, then renders the page's view. */
export default function NewsAnnouncementsPage() {
  const posts = useContent("news-announcements", loadNewsAnnouncements);

  if (posts.status === "ready") {
    return <NewsAnnouncementsView {...posts.data} />;
  }

  return (
    <div className="bg-white">
      <NewsPageHeader />
      <div className={`${container} py-16 md:py-20`}>
        {posts.status === "error" ? (
          <ContentError onRetry={posts.retry} />
        ) : (
          <>
            <ContentPlaceholder className="h-80 w-full rounded-2xl" />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <ContentPlaceholder
                  key={index}
                  className="h-80 w-full rounded-2xl"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
