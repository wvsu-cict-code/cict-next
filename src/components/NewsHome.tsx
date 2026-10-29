import Link from "next/link";
import { ArrowCircle } from "@/components/PhotoSlot";

interface CardProps {
  date: string;
  tag: string;
  title: string;
  href: string;
  image?: string | null;
}

export function HomeNewsCard({ date, tag, title, href, image }: CardProps) {
  return (
    <article className="min-w-0">
      <Link
        href={href}
        className="ease-draw group border-rule flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-[0_10px_30px_rgba(16,32,51,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
      >
        <img
          src={image || "/home-page_assets/featured-card-image.png"}
          alt=""
          className="h-20 w-24 shrink-0 rounded-xl object-cover"
        />
        <span className="min-w-0 flex-1">
          {tag ? (
            <span className="text-theme-red text-[11px] font-semibold tracking-[0.14em] uppercase">
              {tag}
            </span>
          ) : null}
          <span className="text-ink-soft mt-1 block text-xs">{date}</span>
          <span className="text-ink group-hover:text-theme-red mt-1 block text-base leading-snug font-medium">
            {title}
          </span>
        </span>
        <ArrowCircle className="text-ink-soft group-hover:text-theme-red group-hover:border-theme-red" />
      </Link>
    </article>
  );
}
