"use client";

import Link from "next/link";
import { ArrowCircle, ArrowIcon } from "@/components/PhotoSlot";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { HomeNewsCard } from "@/components/NewsHome";
import { SdgBadges } from "@/components/SdgBadges";
import { HOME_NEWS_LIMIT, loadHomeNews } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";
import { formatDate } from "@/lib/format";
import { newsHref } from "@/lib/news";
import { Eyebrow, container } from "@/components/PageHeader";

const SIDE_COUNT = 3;

function categoryLabel(category: string) {
  if (category === "announcement") return "Announcement";
  if (category === "news") return "News";
  return category;
}

export function NewsHomeSection() {
  const content = useContent("home-news", loadHomeNews);
  const { featuredPost = null, latestPosts = [] } =
    content.status === "ready" ? content.data : {};

  const featured = featuredPost ?? latestPosts[0] ?? null;
  const newsItems = latestPosts
    .filter((post) => post.id !== featured?.id)
    .slice(0, Math.min(SIDE_COUNT, HOME_NEWS_LIMIT))
    .map((post) => ({
      date: formatDate(post.published_at),
      tag: categoryLabel(post.category),
      title: post.title,
      href: newsHref(post.slug),
      image: post.cover_image_url,
      sdgs: post.sdgs ?? [],
    }));

  return (
    <section className="bg-white">
      <div className={`${container} py-16 md:py-24`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Latest</Eyebrow>
            <h2 className="text-ink mt-3 text-4xl font-medium md:text-5xl">
              College updates
            </h2>
            <p className="text-ink-soft mt-3 max-w-[52ch] text-base leading-relaxed">
              Stay informed with the latest events, announcements, and
              achievements.
            </p>
          </div>
          <Link
            href="/news-announcements"
            className="text-theme-red inline-flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap"
          >
            View all news
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        {content.status === "error" ? (
          <ContentError onRetry={content.retry} />
        ) : content.status === "loading" ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-12">
            <ContentPlaceholder className="h-80 w-full rounded-2xl lg:col-span-7" />
            <div className="grid gap-4 lg:col-span-5">
              {Array.from({ length: SIDE_COUNT }, (_, index) => (
                <ContentPlaceholder
                  key={index}
                  className="h-24 w-full rounded-2xl"
                />
              ))}
            </div>
          </div>
        ) : !featured ? (
          <p className="text-ink-soft mt-10 text-base">No announcements yet.</p>
        ) : (
          <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-12">
            <article className="min-w-0 lg:col-span-7">
              <Link
                href={newsHref(featured.slug)}
                className="group relative block aspect-[4/3] h-full min-h-72 overflow-hidden rounded-2xl sm:aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]"
              >
                <img
                  src={
                    featured.cover_image_url ||
                    "/home-page_assets/featured-card-image.png"
                  }
                  alt=""
                  className="motion-safe:ease-draw absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102033] via-[#102033]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 pr-16 text-white md:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    {featured.category ? (
                      <span className="bg-theme-red inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-white uppercase">
                        {categoryLabel(featured.category)}
                      </span>
                    ) : null}
                    <SdgBadges sdgs={featured.sdgs} max={6} size="md" />
                  </div>
                  <p className="mt-3 text-sm text-white/80">
                    {formatDate(featured.published_at)}
                  </p>
                  <h3 className="mt-1 text-2xl leading-snug font-medium md:text-3xl">
                    {featured.title}
                  </h3>
                </div>
                <ArrowCircle className="absolute right-5 bottom-5 border-white/40 text-white" />
              </Link>
            </article>
            {newsItems.length > 0 && (
              <div className="grid auto-rows-fr gap-4 lg:col-span-5">
                {newsItems.map((item) => (
                  <HomeNewsCard key={item.href} {...item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
