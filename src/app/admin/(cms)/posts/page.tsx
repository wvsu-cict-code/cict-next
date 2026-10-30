import { Metadata } from "next";
import Link from "next/link";
import PageHeader, {
  Card,
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import { SdgBadges } from "@/components/SdgBadges";
import { requireAdmin } from "@/lib/cms/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "News & Announcements",
};

type PostState = "published" | "scheduled" | "draft";

const FILTERS: { value: PostState | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Drafts" },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, category, status, is_featured, published_at, updated_at, sdgs",
    )
    .order("published_at", { ascending: false, nullsFirst: true });

  if (error) throw new Error(error.message);

  const now = new Date();
  const rows = posts.map((post) => ({
    ...post,
    state: (post.status === "draft"
      ? "draft"
      : post.published_at && new Date(post.published_at) > now
        ? "scheduled"
        : "published") as PostState,
  }));
  const filter = FILTERS.some((f) => f.value === status)
    ? (status as PostState | "all")
    : "all";
  const shown =
    filter === "all" ? rows : rows.filter((row) => row.state === filter);
  const countFor = (value: PostState | "all") =>
    value === "all"
      ? rows.length
      : rows.filter((row) => row.state === value).length;

  return (
    <>
      <PageHeader
        title="News & Announcements"
        description="Articles and announcements for the News page and the home page."
        actions={<PrimaryLink href="/admin/posts/new">New post</PrimaryLink>}
      />

      <nav
        aria-label="Filter posts"
        className="border-rule mb-6 flex gap-1 overflow-x-auto border-b"
      >
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <Link
              key={f.value}
              href={
                f.value === "all"
                  ? "/admin/posts"
                  : `/admin/posts?status=${f.value}`
              }
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
        <EmptyState
          title={
            filter === "all"
              ? "No posts yet."
              : `No ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} posts.`
          }
          action={<PrimaryLink href="/admin/posts/new">New post</PrimaryLink>}
        />
      ) : (
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
