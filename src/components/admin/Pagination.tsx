import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { pageItems } from "@/lib/cms/postList";

interface PaginationProps {
  page: number;
  pages: number;
  /** Items in the whole list and the first/last shown, for "21–40 of 57". */
  total: number;
  from: number;
  to: number;
  noun: string;
  hrefFor: (page: number) => string;
}

const cell =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-semibold tabular-nums transition-colors";

/** Page links under a list. Renders only the count when there's one page. */
export default function Pagination({
  page,
  pages,
  total,
  from,
  to,
  noun,
  hrefFor,
}: PaginationProps) {
  const summary = (
    <p className="text-ink-soft text-sm tabular-nums">
      Showing {from}–{to} of {total} {noun}
    </p>
  );
  if (pages <= 1) return <div className="mt-4">{summary}</div>;

  const step = (target: number, label: string, flip: boolean) =>
    target >= 1 && target <= pages ? (
      <Link
        href={hrefFor(target)}
        aria-label={label}
        className={`${cell} text-ink hover:bg-paper border-rule border bg-white`}
      >
        <Icon
          name="chevron"
          className={`h-4 w-4 ${flip ? "rotate-90" : "-rotate-90"}`}
        />
      </Link>
    ) : (
      <span
        aria-hidden
        className={`${cell} border-rule text-ink-soft/40 border bg-white`}
      >
        <Icon
          name="chevron"
          className={`h-4 w-4 ${flip ? "rotate-90" : "-rotate-90"}`}
        />
      </span>
    );

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      {summary}
      <nav aria-label="Pages" className="flex items-center gap-1">
        {step(page - 1, "Previous page", true)}
        {/* Phones get a short label; the numbered links need more room */}
        <span className="text-ink px-2 text-sm font-semibold tabular-nums sm:hidden">
          Page {page} of {pages}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          {pageItems(page, pages).map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                className="text-ink-soft px-1"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Link
                key={item}
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${cell} ${
                  item === page
                    ? "bg-theme-red text-white"
                    : "text-ink hover:bg-paper"
                }`}
              >
                {item}
              </Link>
            ),
          )}
        </span>
        {step(page + 1, "Next page", false)}
      </nav>
    </div>
  );
}
