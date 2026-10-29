// [IMPORT] Standard
import Image from "next/image";
import Link from "next/link";
import { draftMode } from "next/headers";

// [IMPORT] Components
import MarkdownRenderer from "@/components/MarkdownRenderer";

// [IMPORT] Data
import { getPostBySlug, getPublishedPosts } from "@/lib/cms/queries";
import { formatDate } from "@/lib/format";
import { newsHref } from "@/lib/news";

// Short fallback so posts scheduled for a future date appear on time.
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

const NewsAnnouncements = async ({ params }: PageProps) => {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const article = await getPostBySlug(slug);

  if (!article) {
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

  return (
    <>
      {isPreview && (
        <div className="font-minor flex items-center justify-center gap-4 bg-[#373737] px-6 py-2 text-sm text-white">
          <span>
            Preview mode
            {article.status === "draft" ? " — this post is a draft" : ""}
          </span>
          <a
            href={`/api/preview/exit?url=${encodeURIComponent(newsHref(slug))}`}
            className="hover:text-orange-light underline"
          >
            Exit preview
          </a>
        </div>
      )}
      <div className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="mb-4 text-3xl font-bold">{article.title}</h1>
        <p className="mb-6 text-sm text-gray-500">
          {formatDate(article.published_at ?? article.created_at)}
        </p>
        {article.cover_image_url && (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            className="mb-6 w-full max-w-xl rounded-lg"
            width={800}
            height={450}
          />
        )}
        <MarkdownRenderer content={article.body} />
      </div>
    </>
  );
};

export default NewsAnnouncements;
