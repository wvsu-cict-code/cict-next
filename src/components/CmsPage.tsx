"use client";

import type { ReactNode } from "react";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { PageHeader, container } from "@/components/PageHeader";
import { fetchPage } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";

/**
 * A page whose text is edited in the CMS (Pages). Until it's published,
 * visitors see `fallback` under the route's own heading.
 */
export function CmsPage({
  slug,
  eyebrow,
  fallbackTitle,
  fallback,
  image,
}: {
  slug: string;
  eyebrow: string;
  fallbackTitle: string;
  fallback: ReactNode;
  image?: string;
}) {
  const result = useContent(`page:${slug}`, (client) =>
    fetchPage(client, slug),
  );

  if (result.status === "error") {
    return <ContentError onRetry={result.retry} />;
  }

  if (result.status === "loading") {
    return (
      <div className="bg-white">
        <ContentPlaceholder className="h-72 w-full rounded-none" />
        <div className={`${container} grid gap-4 py-16`}>
          <ContentPlaceholder className="h-8 w-64" />
          <ContentPlaceholder className="h-4 w-full max-w-3xl" />
          <ContentPlaceholder className="h-4 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  const page = result.data;

  return (
    <div className="bg-white">
      {page?.status === "draft" && (
        <div className="flex items-center justify-center gap-4 bg-[#373737] px-6 py-2 text-sm text-white">
          <span>Preview — this page is a draft</span>
        </div>
      )}
      <PageHeader
        eyebrow={eyebrow}
        title={page?.title ?? fallbackTitle}
        intro={page?.summary || undefined}
        image={image}
      />
      <div className={`${container} py-12 md:py-16`}>
        <div className="max-w-3xl">
          {page ? <MarkdownRenderer content={page.body} /> : fallback}
        </div>
      </div>
    </div>
  );
}
