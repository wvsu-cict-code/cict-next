import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { Icon } from "@/components/admin/icons";
import { requireAdmin } from "@/lib/cms/auth";
import { fetchSiteSettings } from "@/lib/cms/content";
import { siteUrl } from "@/lib/site";
import { signOut } from "../actions";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, supabase } = await requireAdmin();
  const settings = await fetchSiteSettings(supabase).catch(() => null);
  const email = user.email ?? "";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-navy flex shrink-0 flex-col gap-4 p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:gap-8 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 px-1">
            <Image
              src="/cict-emblem.png"
              width={32}
              height={33}
              alt=""
              className="brightness-0 invert"
            />
            <span className="font-major text-xl leading-none">
              <b className="font-medium">CICT</b>{" "}
              <span className="text-white/60">CMS</span>
            </span>
          </Link>
          <form action={signOut} className="md:hidden">
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>

        <AdminNav />

        <div className="mt-auto hidden space-y-3 border-t border-white/10 pt-4 md:block">
          <div className="flex items-center gap-3 px-1">
            <span
              aria-hidden
              className="bg-theme-red flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase"
            >
              {email.slice(0, 1) || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-white/50">Signed in as</p>
              <p className="truncate text-sm text-white/90" title={email}>
                {email}
              </p>
            </div>
          </div>
          <div className="grid gap-1">
            <a
              href={siteUrl("/")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon name="external" className="h-[18px] w-[18px]" />
              View site
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name="logout" className="h-[18px] w-[18px]" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {settings?.maintenance_mode && (
          <div
            role="status"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 md:px-10"
          >
            <Icon name="wrench" className="h-4 w-4 shrink-0" />
            <span>
              <b className="font-semibold">Maintenance mode is on.</b> Visitors
              to the landing page see the maintenance notice.
            </span>
            <Link
              href="/admin/settings"
              className="font-semibold underline underline-offset-2"
            >
              Change in Settings
            </Link>
          </div>
        )}
        <div className="mx-auto max-w-6xl p-4 pb-16 md:p-10">{children}</div>
      </main>
    </div>
  );
}
