"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/admin/icons";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/posts", label: "News & Announcements", icon: "news" },
  { href: "/admin/events", label: "Events", icon: "calendar" },
  { href: "/admin/student-works", label: "Student works", icon: "works" },
  { href: "/admin/pages", label: "Pages", icon: "page" },
  { href: "/admin/programs", label: "Programs", icon: "programs" },
  { href: "/admin/faculty", label: "Faculty", icon: "faculty" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminNav({
  badges,
}: {
  badges?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="CMS"
      className="-mx-1 flex flex-row gap-1 overflow-x-auto px-1 md:mx-0 md:flex-col md:overflow-visible md:px-0"
    >
      {links.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const badge = badges?.[link.href] ?? 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`ease-draw flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              isActive
                ? "bg-theme-red text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name={link.icon} className="h-[18px] w-[18px] shrink-0" />
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {link.label}
              {badge > 0 ? (
                <span
                  className={`ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                    isActive
                      ? "bg-white text-theme-red"
                      : "bg-theme-red text-white"
                  }`}
                >
                  {badge}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
