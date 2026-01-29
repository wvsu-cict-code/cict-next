"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const active =
  "relative text-[var(--color-orange-light)] after:absolute after:left-[-7px] after:right-[-7px] after:-bottom-1 after:h-[3px] after:bg-[var(--color-orange-light)] after:rounded-full";
const inactive = "";

export default function Header({ inter }) {
  const pathname = usePathname();

  return (
    <header className={`${inter.className} flex flex-row text-lg px-6 py-6 font-medium`}>
      <Link href="/" className="flex items-center gap-x-2 ml-45">
        <Image src="/cict-emblem-dark.png" width={37} height={38} />
        <Image src="/cict-wordmark.png" width={112} height={25} />
      </Link>
    
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-x-12 text-lg mt-1"> 
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
      </div>
    </header>
  );
}
