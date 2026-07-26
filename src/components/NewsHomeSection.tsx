import Link from "next/link";
import { HomeNewsCard } from "@/components/NewsHome";

interface NewsItem {
  date: string;
  tag: string;
  title: string;
  href: string;
}

export const newsItems: NewsItem[] = [
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
];

const HOME_NEWS_CARD_LIMIT = 4;
const card_small =
  "w-full shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-xl p-3 shadow-lg rounded-xl";

export function NewsHomeSection() {
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

        {/*Featured Card (desktop)*/}
        <div className="bg-yellow hidden h-52 w-full rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.15)] md:flex">
          <img
            src="/home-page_assets/featured-card-image.png"
            className="mr-4 h-full w-3xs object-cover"
            alt="image"
          />
          <div className="mt-4">
            <div className="flex h-6 items-center">
              <p className="text-xs font-normal text-[#4D4D4D]">
                2 days ago |
              </p>
              <span className="bg-orange-light border-orange-light ml-1.5 rounded-sm px-2 text-[8px] font-bold text-white">
                ANNOUNCEMENT
              </span>
            </div>
            <div className="mt-6 ml-2 flex h-36 flex-col">
              <h1 className="mr-3 text-xl font-bold">
                WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan
              </h1>
              <Link
                href="/news-announcements"
                className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto mr-3 mb-3 ml-auto flex h-8 w-28 items-center justify-center rounded-full border text-xs font-normal transition duration-200 hover:text-white"
              >
                Read Now →
              </Link>
            </div>
          </div>
        </div>

        {/*Featured Card (mobile)*/}
        <div className={`${card_small} block md:hidden`}>
          <div className="flex items-center">
            <p className="font-minor text-[8px] font-normal text-[#4D4D4D]">
              December 26, 2025
            </p>
            <span className="font-minor border-orange-light bg-orange-light ml-auto flex h-3.5 w-17 items-center justify-center rounded-sm border text-center text-[6px] font-bold text-white">
              ANNOUNCEMENT
            </span>
          </div>
          <div className="mt-1 flex h-20 flex-col">
            <h1 className="text-sm font-bold">
              WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan
            </h1>
            <Link
              href="/news-announcements"
              className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto ml-auto flex h-4.5 w-17.5 items-center justify-center rounded-full border text-[8px] font-normal transition duration-200 hover:text-white"
            >
              Read More →
            </Link>
          </div>
        </div>
      </div>

      {/*Bottom Section
        NOTE: We should only limit 4 news articles
        */}
      <div className="mt-6 grid w-full grid-cols-2 gap-6 md:mt-8 md:grid-cols-4">
        {newsItems.slice(0, HOME_NEWS_CARD_LIMIT).map((item, index) => (
          <HomeNewsCard key={index} className={card_small} {...item} />
        ))}
      </div>
    </section>
  );
}
