import Link from "next/link";

interface CardProps {
  className?: string;
  date: string;
  tag: string;
  title: string;
  href: string;
}

export function HomeNewsCard({ date, tag, title, href, className }: CardProps) {
  return (
    <div className={className}>
      <div className="flex items-center">
        <p className="font-minor text-[8px] font-normal text-[#4D4D4D]">
          {date}
        </p>
        <span className="font-minor border-orange-light bg-orange-light ml-auto h-3.5 w-8 rounded-sm border text-center text-[8px] font-bold text-white">
          {tag}
        </span>
      </div>
      <div className="mt-1 flex h-20 flex-col md:mt-3">
        <h1 className="md:text-4 text-sm font-bold">{title}</h1>
        <Link
          href={href}
          className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto ml-auto flex h-4.5 w-17.5 items-center justify-center rounded-full border text-[8px] font-normal transition duration-200 hover:text-white"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}
