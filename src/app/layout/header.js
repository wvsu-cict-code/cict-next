"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const active = "text-[var(--color-orange-dark)] underline";
const inactive = "";

export default function Header({ inter }) {
  const pathname = usePathname();

  return (
    <header className={`${inter.className} flex flex-row gap-x-4 text-lg justify-center px-6 py-4`}>
      <Link href="/programs" className={(pathname === "/programs") ? active : inactive}>
        PROGRAMS
      </Link>
      <Link
        href="/news-announcements"
        className={(pathname === "/news-announcements") ? active : inactive}
      >
        NEWS
      </Link>
      <Link
        href="/faculty-profiles"
        className={(pathname === "/faculty-profiles") ? active : inactive}
      >
        FACULTY
      </Link>
      <Link href="/contact" className={(pathname === "/contact") ? active : inactive}>
        CONTACT
      </Link>
    </header>
  );
}
