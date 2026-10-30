import Link from "next/link";
import { Icon, type IconName } from "@/components/admin/icons";
import PageHeader, { Card, buttonClass } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { fetchSiteSettings } from "@/lib/cms/content";
import { formatDate } from "@/lib/format";

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

  const [published, drafts, programs, departments, faculty, recent, settings] =
    await Promise.all([
      countPosts("published"),
      countPosts("draft"),
      count("programs"),
      count("departments"),
      count("faculty_members"),
      supabase
        .from("posts")
        .select("id, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5)
        .then(({ data }) => data ?? []),
      fetchSiteSettings(supabase).catch(() => null),
    ]);

  const tiles: {
    href: string;
    label: string;
    value: number;
    detail: string;
    icon: IconName;
  }[] = [
    {
      href: "/admin/posts",
      label: "Published posts",
      value: published,
      detail: `${drafts} draft${drafts === 1 ? "" : "s"}`,
      icon: "news",
    },
    {
      href: "/admin/programs",
      label: "Programs",
      value: programs,
      detail: "Offered programs",
      icon: "programs",
    },
    {
      href: "/admin/faculty",
      label: "Faculty members",
      value: faculty,
      detail: `${departments} departments`,
      icon: "faculty",
    },
  ];

  const actions: { href: string; label: string; icon: IconName }[] = [
    { href: "/admin/posts/new", label: "Write a post", icon: "news" },
    {
      href: "/admin/faculty/members/new",
      label: "Add a faculty member",
      icon: "faculty",
    },
    { href: "/admin/programs/new", label: "Add a program", icon: "programs" },
  ];

  const maintenance = settings?.maintenance_mode ?? false;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage the content shown on the CICT website."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group">
            <Card className="group-hover:border-theme-red/40 h-full transition-colors">
              <div className="flex items-start justify-between gap-4">
                <p className="text-ink-soft text-sm font-medium">
                  {tile.label}
                </p>
                <span className="bg-theme-red/10 text-theme-red flex h-9 w-9 items-center justify-center rounded-full">
                  <Icon name={tile.icon} className="h-[18px] w-[18px]" />
                </span>
              </div>
              <p className="font-major text-ink mt-2 text-5xl leading-none">
                {tile.value}
              </p>
              <p className="text-ink-soft mt-2 text-xs">{tile.detail}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-0">
          <div className="border-rule/70 flex items-center justify-between gap-4 border-b px-6 py-4">
            <h2 className="text-ink text-lg font-medium">Recently edited</h2>
            <Link
              href="/admin/posts"
              className="text-theme-red text-sm font-semibold hover:underline"
            >
              All posts
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-ink-soft px-6 py-8 text-sm">No posts yet.</p>
          ) : (
            <ul className="divide-rule/70 divide-y">
              {recent.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="group hover:bg-paper/60 flex items-center justify-between gap-4 px-6 py-3 transition-colors"
                  >
                    <span className="text-ink group-hover:text-theme-red min-w-0 truncate text-sm font-semibold">
                      {post.title}
                    </span>
                    <span className="text-ink-soft shrink-0 text-xs">
                      {post.status === "draft" ? "Draft · " : ""}
                      {formatDate(post.updated_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-ink text-lg font-medium">Landing page</h2>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full ${maintenance ? "bg-amber-500" : "bg-green-600"}`}
              />
              <span className="text-ink font-semibold">
                {maintenance ? "Maintenance mode" : "Live"}
              </span>
            </p>
            <p className="text-ink-soft mt-1 text-sm">
              {maintenance
                ? "Visitors see the maintenance notice instead of the home page."
                : "Visitors see the normal home page."}
            </p>
            <Link
              href="/admin/settings"
              className={`${buttonClass.secondary} mt-4`}
            >
              <Icon name="settings" className="h-4 w-4" />
              Settings
            </Link>
          </Card>

          <Card>
            <h2 className="text-ink text-lg font-medium">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="border-rule text-ink hover:border-theme-red/50 hover:text-theme-red flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition-colors"
                >
                  <Icon name={action.icon} className="h-[18px] w-[18px]" />
                  {action.label}
                  <Icon name="plus" className="ml-auto h-4 w-4 opacity-60" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
