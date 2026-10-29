"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import MarkdownRenderer from "@/components/MarkdownRenderer";
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
      <div className="mx-auto max-w-4xl space-y-4 px-8 py-8">
        <ContentPlaceholder className="h-9 w-3/4" />
        <ContentPlaceholder className="h-4 w-40" />
        <ContentPlaceholder className="h-64 w-full max-w-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Image
          src="/not-found-icon.svg"
          alt="Not Found"
          width={120}
          height={120}
          className="mb-6"
        />
        <h2 className="mb-2 text-2xl font-semibold text-gray-700 sm:text-3xl">
          Article Not Found
        </h2>
        <p className="mb-6 text-gray-500">
          The article you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/news-announcements"
          className="font-minor bg-orange-dark hover:bg-orange-light rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors"
        >
          Back to News
        </Link>
      </div>
    );
  }

  const preview = previewLabel(post);

  return (
    <>
      {preview && (
        <div className="font-minor flex items-center justify-center gap-4 bg-[#373737] px-6 py-2 text-sm text-white">
          <span>{preview}</span>
        </div>
      )}
      <div className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
        <p className="mb-6 text-sm text-gray-500">
          {formatDate(post.published_at ?? post.created_at)}
        </p>
        {post.cover_image_url && (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            className="mb-6 w-full max-w-xl rounded-lg"
            width={800}
            height={450}
          />
        )}
        <MarkdownRenderer content={post.body} />
      </div>
    </>
  );
}
