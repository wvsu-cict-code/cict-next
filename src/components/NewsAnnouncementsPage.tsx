"use client";

import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import NewsAnnouncementsView from "@/components/NewsAnnouncementsView";
import { fetchPublishedPosts } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { toNewsArticle } from "@/lib/news";

/** Loads the news and announcements lists, then renders the page's view. */
export default function NewsAnnouncementsPage() {
  const posts = useContent("news-announcements", async (client) => {
    const [announcements, news] = await Promise.all([
      fetchPublishedPosts(client, { category: "announcement", limit: 10 }),
      fetchPublishedPosts(client, { category: "news" }),
    ]);
    return {
      announcements: announcements.map(toNewsArticle),
      newsArticles: news.map(toNewsArticle),
    };
  });

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
