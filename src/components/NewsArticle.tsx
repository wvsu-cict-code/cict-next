"use client";

import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { PageHeader, container } from "@/components/PageHeader";
import { SdgList } from "@/components/SdgBadges";
import { fetchPostBySlug, previewLabel } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { formatDate } from "@/lib/format";
import { NEWS_PREFIX, segmentFromPathname } from "@/lib/routes";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

/**
 * A news post or announcement. The slug comes from the address bar: on the
 * school site every post URL is served by the same exported template page.
 */
export default function NewsArticle() {
  const slug = segmentFromPathname(usePathname(), NEWS_PREFIX);
  const article = useContent(
    slug === null ? "missing" : `post:${slug}`,
    (client) =>
      slug === null ? Promise.resolve(null) : fetchPostBySlug(client, slug),
  );
  const post = article.status === "ready" ? article.data : null;
  useDocumentTitle(post?.title);

  if (article.status === "error") {
    return <ContentError onRetry={article.retry} />;
  }

  if (article.status === "loading") {
    return (
      <div className="bg-white">
        <ContentPlaceholder className="h-72 w-full rounded-none" />
        <div className={`${container} grid gap-4 py-16`}>
          <ContentPlaceholder className="h-80 w-full max-w-3xl rounded-2xl" />
          <ContentPlaceholder className="h-4 w-full max-w-2xl" />
          <ContentPlaceholder className="h-4 w-full max-w-xl" />
        </div>
      </div>
    );
  }

  const back = { href: "/news-announcements", label: "All news" };

  if (!post) {
    return (
      <PageHeader
        eyebrow="News"
        title="Article not found"
        intro="The article you are looking for does not exist or has been removed."
        back={back}
      />
    );
  }

  const preview = previewLabel(post);

  return (
    <div className="bg-white">
      {preview && (
        <div className="flex items-center justify-center gap-4 bg-[#373737] px-6 py-2 text-sm text-white">
          <span>{preview}</span>
        </div>
      )}
      <PageHeader
        eyebrow={post.category === "announcement" ? "Announcement" : "News"}
        title={post.title}
        intro={formatDate(post.published_at ?? post.created_at)}
        back={back}
      />
      <div className={`${container} py-12 md:py-16`}>
        <div className="max-w-3xl">
          {post.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- matches the home page cards
            <img
              src={post.cover_image_url}
              alt=""
              className="mb-10 w-full rounded-2xl object-cover"
            />
          )}
          <MarkdownRenderer content={post.body} />
          <SdgList sdgs={post.sdgs} />
        </div>
      </div>
    </div>
  );
}
