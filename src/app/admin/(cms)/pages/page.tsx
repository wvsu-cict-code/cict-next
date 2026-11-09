import { Metadata } from "next";
import Link from "next/link";
import PageHeader, { Card, EmptyState } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pages",
};

export default async function AdminPagesPage() {
  const { supabase } = await requireAdmin();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("slug, title, status, updated_at")
    .order("title");

  if (error) {
    // The pages table isn't in the database until its migration is applied
    if (error.code === "PGRST205" || error.code === "42P01") {
      return (
        <>
          <PageHeader title="Pages" />
          <EmptyState title="Pages aren't set up in the database yet. Apply the latest database migrations, then reload." />
        </>
      );
    }
    throw new Error(error.message);
  }

  return (
    <>
      <PageHeader
        title="Pages"
        description="Standalone pages on the public site, such as Admissions. Each page has its own address on the site; new ones are added by the developers."
      />

      {pages.length === 0 ? (
        <EmptyState title="No pages yet." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-rule text-ink-soft border-b text-xs tracking-[0.06em] uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Page</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="hidden px-6 py-3 font-semibold md:table-cell">
                  Last edited
                </th>
              </tr>
            </thead>
            <tbody className="divide-rule/70 divide-y">
              {pages.map((page) => (
                <tr
                  key={page.slug}
                  className="group hover:bg-paper/60 relative transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="text-ink group-hover:text-theme-red font-semibold after:absolute after:inset-0"
                    >
                      {page.title}
                    </Link>
                    <span className="text-ink-soft mt-0.5 hidden text-xs sm:block">
                      /{page.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        page.status === "published"
                          ? "bg-green-50 text-green-800"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          page.status === "published"
                            ? "bg-green-600"
                            : "bg-neutral-400"
                        }`}
                        aria-hidden
                      />
                      {page.status === "published" ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="text-ink-soft hidden px-6 py-4 whitespace-nowrap md:table-cell">
                    {formatDate(page.updated_at)}
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
