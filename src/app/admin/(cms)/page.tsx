import Link from "next/link";
import PageHeader, { Card } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const count = async (
    table: "programs" | "departments" | "faculty_members",
  ) => {
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  };
  const countPosts = async (status: "draft" | "published") => {
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    return count ?? 0;
  };

  const [published, drafts, programs, departments, faculty] = await Promise.all(
    [
      countPosts("published"),
      countPosts("draft"),
      count("programs"),
      count("departments"),
      count("faculty_members"),
    ],
  );

  const tiles = [
    {
      href: "/admin/posts",
      label: "News & Announcements",
      value: published,
      detail: `${drafts} draft${drafts === 1 ? "" : "s"}`,
    },
    {
      href: "/admin/programs",
      label: "Programs",
      value: programs,
      detail: "Offered programs",
    },
    {
      href: "/admin/faculty",
      label: "Faculty members",
      value: faculty,
      detail: `${departments} departments`,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage the content shown on the CICT website."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <p className="text-sm text-neutral-500">{tile.label}</p>
              <p className="font-major mt-2 text-4xl">{tile.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{tile.detail}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 space-y-2 text-sm text-neutral-600">
        <h2 className="text-lg font-medium text-neutral-900">Quick actions</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link
              href="/admin/posts/new"
              className="text-orange-dark underline"
            >
              Write a news article or announcement
            </Link>
          </li>
          <li>
            <Link
              href="/admin/faculty/members/new"
              className="text-orange-dark underline"
            >
              Add a faculty member
            </Link>
          </li>
          <li>
            <Link
              href="/admin/programs/new"
              className="text-orange-dark underline"
            >
              Add a program
            </Link>
          </li>
        </ul>
      </Card>
    </>
  );
}
