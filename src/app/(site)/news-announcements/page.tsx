import NewsAnnouncementsView from "@/components/NewsAnnouncementsView";
import { getPublishedPosts } from "@/lib/cms/queries";
import { toNewsArticle } from "@/lib/news";

// Short fallback so posts scheduled for a future date appear on time.
export const revalidate = 60;

export default async function NewsAnnouncementsPage() {
  const [announcements, news] = await Promise.all([
    getPublishedPosts({ category: "announcement", limit: 10 }),
    getPublishedPosts({ category: "news" }),
  ]);

  return (
    <NewsAnnouncementsView
      announcements={announcements.map(toNewsArticle)}
      newsArticles={news.map(toNewsArticle)}
    />
  );
}
