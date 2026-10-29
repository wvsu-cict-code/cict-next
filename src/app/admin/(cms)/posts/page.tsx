import { Metadata } from "next";
import Link from "next/link";
import PageHeader, { Card, PrimaryLink } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "News & Announcements",
};

export default async function AdminPostsPage() {
  const { supabase } = await requireAdmin();
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, category, status, is_featured, published_at, updated_at",
    )
    .order("published_at", { ascending: false, nullsFirst: true });

  if (error) throw new Error(error.message);

  const now = new Date();

  return (
    <>
      <PageHeader
        title="News & Announcements"
        actions={<PrimaryLink href="/admin/posts/new">New post</PrimaryLink>}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs text-neutral-500 uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-neutral-500"
                >
                  No posts yet.
                </td>
              </tr>
            )}
            {posts.map((post) => {
              const isScheduled =
                post.status === "published" &&
                post.published_at &&
                new Date(post.published_at) > now;
              return (
                <tr key={post.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="hover:text-orange-dark font-medium"
                    >
                      {post.title}
                    </Link>
                    {post.is_featured && (
                      <span className="bg-orange-light ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 capitalize">{post.category}</td>
                  <td className="px-6 py-3">
                    <StatusBadge
                      status={isScheduled ? "scheduled" : post.status}
                    />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-neutral-500">
                    {formatDate(post.published_at) || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function StatusBadge({
  status,
}: {
  status: "draft" | "published" | "scheduled";
}) {
  const styles = {
    draft: "bg-neutral-200 text-neutral-700",
    published: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
