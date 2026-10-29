"use client";

import Link from "next/link";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { HomeNewsCard } from "@/components/NewsHome";
import { fetchFeaturedPost, fetchPublishedPosts } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { formatDate, timeAgo } from "@/lib/format";
import { newsHref } from "@/lib/news";

const HOME_NEWS_CARD_LIMIT = 4;
const card_small =
  "w-full shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-xl p-3 shadow-lg rounded-xl";

export function NewsHomeSection() {
  const content = useContent("home-news", async (client) => {
    const [featuredPost, latestPosts] = await Promise.all([
      fetchFeaturedPost(client),
      fetchPublishedPosts(client, { limit: HOME_NEWS_CARD_LIMIT + 1 }),
    ]);
    return { featuredPost, latestPosts };
  });
  const { featuredPost = null, latestPosts = [] } =
    content.status === "ready" ? content.data : {};

  // Fall back to the newest post when nothing is flagged as featured
  const featured = featuredPost ?? latestPosts[0] ?? null;
  const newsItems = latestPosts
    .filter((post) => post.id !== featured?.id)
    .slice(0, HOME_NEWS_CARD_LIMIT)
    .map((post) => ({
      date: formatDate(post.published_at),
      tag: post.category.toUpperCase(),
      title: post.title,
      href: newsHref(post.slug),
    }));

  return (
    <section className="mx-4 mt-10 mb-16 flex max-w-full flex-col items-center justify-center md:mx-40 md:mt-38">
      {/*Top Section*/}
      <div className="grid w-full grid-cols-2 gap-6">
        <div className="w-full">
          <div className="flex items-center">
            <h1 className="flex text-[11px] font-medium text-[#585858] md:text-2xl">
              NEWS AND ANNOUNCEMENTS
            </h1>
            <Link
              href="/news-announcements"
              className="group ml-auto flex h-3 w-14 items-center justify-center rounded-full border border-[#4D4D4D] text-[6px] text-[#4D4D4D] transition duration-200 hover:bg-[#4D4D4D] hover:text-white md:h-8 md:w-32 md:text-xs"
            >
              READ MORE →
            </Link>
          </div>

          <h1 className="text-lg font-medium text-[#373737] md:mt-6 md:text-5xl">
            CHECK OUT THE LATEST <br />
            <span className="text-orange-light">COLLEGE UPDATES</span>
          </h1>

          <p className="text-[8px] font-normal text-[#828282] md:mt-1 md:text-base">
            Stay informed with the latest updates, official announcements, and
            important notices
          </p>
        </div>

        {content.status === "loading" && (
          <>
            <ContentPlaceholder className="hidden h-52 w-full md:block" />
            <ContentPlaceholder className="h-28 w-full md:hidden" />
          </>
        )}

        {/*Featured Card (desktop)*/}
        {featured && (
          <div className="bg-yellow hidden h-52 w-full rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.15)] md:flex">
            <img
              src={
                featured.cover_image_url ||
                "/home-page_assets/featured-card-image.png"
              }
              className="mr-4 h-full w-3xs object-cover"
              alt="image"
            />
            <div className="mt-4">
              <div className="flex h-6 items-center">
                <p className="text-xs font-normal text-[#4D4D4D]">
                  {timeAgo(featured.published_at)} |
                </p>
                <span className="bg-orange-light border-orange-light ml-1.5 rounded-sm px-2 text-[8px] font-bold text-white">
                  {featured.category.toUpperCase()}
                </span>
              </div>
              <div className="mt-6 ml-2 flex h-36 flex-col">
                <h1 className="mr-3 text-xl font-bold">{featured.title}</h1>
                <Link
                  href={newsHref(featured.slug)}
                  className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto mr-3 mb-3 ml-auto flex h-8 w-28 items-center justify-center rounded-full border text-xs font-normal transition duration-200 hover:text-white"
                >
                  Read Now →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/*Featured Card (mobile)*/}
        {featured && (
          <div className={`${card_small} block md:hidden`}>
            <div className="flex items-center">
              <p className="font-minor text-[8px] font-normal text-[#4D4D4D]">
                {formatDate(featured.published_at)}
              </p>
              <span className="font-minor border-orange-light bg-orange-light ml-auto flex h-3.5 w-17 items-center justify-center rounded-sm border text-center text-[6px] font-bold text-white">
                {featured.category.toUpperCase()}
              </span>
            </div>
            <div className="mt-1 flex h-20 flex-col">
              <h1 className="text-sm font-bold">{featured.title}</h1>
              <Link
                href={newsHref(featured.slug)}
                className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto ml-auto flex h-4.5 w-17.5 items-center justify-center rounded-full border text-[8px] font-normal transition duration-200 hover:text-white"
              >
                Read More →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/*Bottom Section
        NOTE: We should only limit 4 news articles
        */}
      {content.status === "error" ? (
        <ContentError onRetry={content.retry} />
      ) : (
        <div className="mt-6 grid w-full grid-cols-2 gap-6 md:mt-8 md:grid-cols-4">
          {content.status === "loading"
            ? Array.from({ length: HOME_NEWS_CARD_LIMIT }, (_, index) => (
                <ContentPlaceholder key={index} className="h-24 w-full" />
              ))
            : newsItems.map((item, index) => (
                <HomeNewsCard key={index} className={card_small} {...item} />
              ))}
        </div>
      )}
    </section>
  );
}
