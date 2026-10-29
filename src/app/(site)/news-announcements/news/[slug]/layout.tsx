import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/cms/queries";
import { newsHref } from "@/lib/news";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPostBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | CICT",
      description: "The requested news article could not be found.",
    };
  }

  const summary = article.excerpt || article.body;
  const metaDescription =
    summary.length > 160 ? summary.substring(0, 160) + "..." : summary;

  return {
    title: `${article.title} | CICT`,
    description: metaDescription,
    alternates: {
      canonical: newsHref(slug),
    },
    openGraph: {
      title: article.title,
      description: metaDescription,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
    // Never index draft previews
    robots:
      article.status === "draft" ? { index: false, follow: false } : undefined,
  };
}

export default function ArticleLayout({ children }: LayoutProps) {
  // This wraps the dynamic article page, applying the SEO generated above
  return <>{children}</>;
}
