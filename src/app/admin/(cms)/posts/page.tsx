import { Metadata } from "next";
import Link from "next/link";
import { inputClass } from "@/components/admin/fields";
import { Icon } from "@/components/admin/icons";
import PageHeader, {
  buttonClass,
  Card,
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import { SdgBadges } from "@/components/SdgBadges";
import { requireAdmin } from "@/lib/cms/auth";
import {
  matchesSearch,
  pageCount,
  pageRange,
  parsePostListParams,
  POST_FILTERS,
  postListHref,
  postState,
  searchWords,
  type PostFilter,
  type PostState,
} from "@/lib/cms/postList";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "News & Announcements",
};

interface PageProps {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = parsePostListParams(await searchParams);
  const { q, filter } = params;
  const { supabase } = await requireAdmin();
  // The list columns of every post: small enough to search and page here,
  // where "bold" Facebook letters can be matched as plain ones
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, status, is_featured, published_at, sdgs",
    )
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const now = new Date();
  const words = searchWords(q);
  const matching = posts
    .filter((post) => matchesSearch(post, words))
    .map((post) => ({ ...post, state: postState(post, now) }));
  const countFor = (value: PostFilter) =>
    value === "all"
      ? matching.length
      : matching.filter((row) => row.state === value).length;
  const filtered =
    filter === "all"
      ? matching
      : matching.filter((row) => row.state === filter);

  // A page past the end (e.g. after a search narrows the list) shows the last
  const pages = pageCount(filtered.length);
  const page = Math.min(params.page, pages);
  const { from, to } = pageRange(page);
  const shown = filtered.slice(from, to + 1);
  const hrefFor = (target: number) => postListHref({ q, filter, page: target });
  const filterLabel = POST_FILTERS.find((f) => f.value === filter)?.label;

  return (
    <>
      <PageHeader
        title="News & Announcements"
        description="Articles and announcements for the News page and the home page."
        actions={<PrimaryLink href="/admin/posts/new">New post</PrimaryLink>}
      />

      <form
        role="search"
        action="/admin/posts"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Search posts</span>
          <Icon
            name="search"
            className="text-ink-soft pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <input
            // Remount on a new search so the box shows what was searched
            key={q}
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by title, slug or summary"
            className={`${inputClass} pl-9`}
          />
        </label>
        {filter !== "all" && (
          <input type="hidden" name="status" value={filter} />
        )}
        <button type="submit" className={buttonClass.secondary}>
          Search
        </button>
        {q && (
          <Link
            href={postListHref({ q: "", filter, page: 1 })}
            className="text-ink-soft hover:text-theme-red px-2 text-sm underline"
          >
            Clear
          </Link>
        )}
      </form>

      <nav
        aria-label="Filter posts"
        className="border-rule mb-6 flex gap-1 overflow-x-auto border-b"
      >
        {POST_FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <Link
              key={f.value}
              href={postListHref({ q, filter: f.value, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? "border-theme-red text-ink"
                  : "text-ink-soft hover:text-ink border-transparent"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active ? "bg-theme-red/10 text-theme-red" : "bg-rule/60"
                }`}
              >
                {countFor(f.value)}
              </span>
            </Link>
          );
        })}
      </nav>

      {shown.length === 0 ? (
        q ? (
          <EmptyState
            title={`No ${filter === "all" ? "" : `${filterLabel?.toLowerCase()} `}posts match “${q}”.`}
            action={
              <Link
                href={postListHref({ q: "", filter, page: 1 })}
                className={buttonClass.secondary}
              >
                Clear search
              </Link>
            }
          />
        ) : (
          <EmptyState
            title={
              filter === "all"
                ? "No posts yet."
                : `No ${filterLabel?.toLowerCase()} posts.`
            }
            action={<PrimaryLink href="/admin/posts/new">New post</PrimaryLink>}
          />
        )
      ) : (
        <>
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-rule text-ink-soft border-b text-xs tracking-[0.06em] uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="hidden px-6 py-3 font-semibold sm:table-cell">
                    Type
                  </th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="hidden px-6 py-3 font-semibold md:table-cell">
                    Publish date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-rule/70 divide-y">
                {shown.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-paper/60 relative transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-ink group-hover:text-theme-red font-semibold after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                      <span className="text-ink-soft mt-0.5 hidden text-xs sm:block">
                        /{post.slug}
                      </span>
                      <SdgBadges sdgs={post.sdgs} max={8} className="mt-2" />
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <span className="text-ink-soft inline-flex items-center gap-2 capitalize">
                        {post.category}
                        {post.is_featured && (
                          <span className="bg-theme-red/10 text-theme-red rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide normal-case">
                            Featured
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={post.state} />
                    </td>
                    <td className="text-ink-soft hidden px-6 py-4 whitespace-nowrap md:table-cell">
                      {formatDate(post.published_at) || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination
            page={page}
            pages={pages}
            total={filtered.length}
            from={from + 1}
            to={from + shown.length}
            noun={filtered.length === 1 ? "post" : "posts"}
            hrefFor={hrefFor}
          />
        </>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: PostState }) {
  const styles = {
    draft: "bg-neutral-100 text-neutral-700",
    published: "bg-green-50 text-green-800",
    scheduled: "bg-blue-50 text-blue-800",
  };
  const dots = {
    draft: "bg-neutral-400",
    published: "bg-green-600",
    scheduled: "bg-blue-600",
  };
  const labels = { draft: "Draft", published: "Live", scheduled: "Scheduled" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dots[status]}`}
        aria-hidden
      />
      {labels[status]}
    </span>
  );
}
