import Link from "next/link";
import { ArrowCircle } from "@/components/PhotoSlot";
import { SdgBadges } from "@/components/SdgBadges";
import { newsHref } from "@/lib/news";

interface NewsArticleCardProps {
  slug: string;
  imgSrc?: string;
  date: string;
  header: string;
  description?: string;
  sdgs?: number[];
}

/** A news article in the News page grid; styled like the home page cards. */
const NewsArticleCard: React.FC<NewsArticleCardProps> = ({
  slug,
  imgSrc,
  date,
  header,
  description,
  sdgs,
}) => {
  return (
    <Link
      href={newsHref(slug)}
      className="ease-draw group flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(16,32,51,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(16,32,51,0.12)]"
    >
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- matches the home page cards */}
        <img
          src={imgSrc || "/home-page_assets/featured-card-image.png"}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
        <SdgBadges sdgs={sdgs} className="absolute bottom-3 left-3" />
      </div>
      <span className="flex flex-1 flex-col p-5">
        <span className="flex items-center gap-3">
          <span className="text-theme-red text-[11px] font-semibold tracking-[0.14em] uppercase">
            News
          </span>
          <span className="text-ink-soft text-xs">{date}</span>
        </span>
        <span className="font-major text-ink group-hover:text-theme-red mt-2 block text-xl leading-snug font-medium">
          {header}
        </span>
        {description ? (
          <span className="text-ink-soft mt-2 line-clamp-3 block text-sm leading-relaxed">
            {description}
          </span>
        ) : null}
        <span className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-theme-red text-sm font-semibold">
            Read more
          </span>
          <ArrowCircle className="text-ink-soft group-hover:border-theme-red group-hover:text-theme-red" />
        </span>
      </span>
    </Link>
  );
};

export default NewsArticleCard;
