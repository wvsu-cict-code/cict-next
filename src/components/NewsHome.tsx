import Link from "next/link";
import { ArrowCircle } from "@/components/PhotoSlot";
import { SdgBadges } from "@/components/SdgBadges";

interface CardProps {
  date: string;
  tag: string;
  title: string;
  href: string;
  image?: string | null;
  sdgs?: number[];
}

export function HomeNewsCard({
  date,
  tag,
  title,
  href,
  image,
  sdgs,
}: CardProps) {
  return (
    <article className="min-w-0">
      <Link
        href={href}
        className="ease-draw group border-rule hover:border-theme-red/40 flex h-full items-center gap-4 rounded-2xl border bg-white p-3 pr-4 shadow-[0_10px_30px_rgba(16,32,51,0.05)] transition-[transform,border-color] duration-200 hover:-translate-y-0.5"
      >
        <img
          src={image || "/home-page_assets/featured-card-image.png"}
          alt=""
          className="min-h-20 w-24 shrink-0 self-stretch rounded-xl object-cover sm:w-32"
        />
        <div className="min-w-0 flex-1">
          {tag ? (
            <span className="text-theme-red text-[11px] font-semibold tracking-[0.14em] uppercase">
              {tag}
            </span>
          ) : null}
          <span className="text-ink-soft mt-1 block text-xs">{date}</span>
          <span className="text-ink group-hover:text-theme-red mt-1 block text-base leading-snug font-medium">
            {title}
          </span>
          <SdgBadges sdgs={sdgs} max={5} className="mt-2" />
        </div>
        <ArrowCircle className="text-ink-soft group-hover:text-theme-red group-hover:border-theme-red" />
      </Link>
    </article>
  );
}
