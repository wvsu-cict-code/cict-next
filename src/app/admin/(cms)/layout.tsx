import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/cms/auth";
import { signOut } from "../actions";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 bg-[#1e1e1e] p-4 text-white md:w-64 md:p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/cict-emblem.png" width={32} height={33} alt="" />
          <span className="font-major text-xl">
            <b className="font-medium">CICT</b> CMS
          </span>
        </Link>

        <AdminNav />

        <div className="mt-auto hidden space-y-3 border-t border-white/10 pt-4 text-xs text-neutral-400 md:block">
          <p className="truncate" title={user.email}>
            {user.email}
          </p>
          <div className="flex gap-3">
            <Link href="/" target="_blank" className="hover:text-white">
              View site ↗
            </Link>
            <form action={signOut}>
              <button type="submit" className="hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10">
        <div className="mx-auto max-w-5xl">{children}</div>

        <form action={signOut} className="mt-10 md:hidden">
          <button type="submit" className="text-sm text-neutral-500 underline">
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}
