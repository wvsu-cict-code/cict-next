"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowIcon } from "@/components/PhotoSlot";

const active =
  "relative whitespace-nowrap text-sm font-semibold text-theme-red after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:bg-theme-red";
const inactive =
  "whitespace-nowrap text-sm font-medium text-ink transition-colors duration-200 ease-draw hover:text-theme-red";
const activeMobile =
  "mx-auto w-5/6 border-b border-rule bg-paper-2 py-4 text-center text-theme-red";
const inactiveMobile =
  "mx-auto w-5/6 border-b border-rule py-4 text-center text-ink";

const LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/news-announcements", label: "News" },
  { href: "/faculty-profiles", label: "Faculty" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PROGRAM_LINKS = [
  {
    href: "/programs/blis",
    code: "BLIS",
    name: "Library and Information Science",
  },
  { href: "/programs/bscs", code: "BSCS", name: "Computer Science" },
  {
    href: "/programs/bsemc",
    code: "BSEMC",
    name: "Entertainment and Media Computing",
  },
  { href: "/programs/bsis", code: "BSIS", name: "Information Systems" },
  { href: "/programs/bsit", code: "BSIT", name: "Information Technology" },
  {
    href: "/programs/mit",
    code: "MIT",
    name: "Master in Information Technology",
  },
];

export default function Header() {
  // The school site's URLs end in a slash (static export), the CMS's don't
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-rule/80 relative z-50 border-b bg-white">
      <div className="mx-auto grid h-[4.5rem] max-w-[1400px] grid-cols-[1fr_auto] items-center gap-3 px-4 md:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="ease-draw flex min-w-0 items-center gap-2 duration-200 active:scale-[0.98]"
        >
          <Image
            src="/cict-emblem.png"
            width={40}
            height={42}
            alt=""
            className="h-10 w-10 shrink-0"
          />
          <span className="font-major text-ink text-xl font-light tracking-wide">
            <b className="font-medium">WVSU</b> CICT
          </span>
        </Link>

        <nav className="hidden items-center gap-x-6 lg:flex xl:gap-x-8">
          {LINKS.map((link) =>
            link.href === "/programs" ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setProgramsOpen(true)}
                onMouseLeave={() => setProgramsOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Link
                    href={link.href}
                    className={current(link.href) ? active : inactive}
                    aria-current={current(link.href) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    className="text-ink inline-flex h-8 w-8 items-center justify-center"
                    aria-expanded={programsOpen}
                    aria-controls="programs-menu"
                    aria-label="Show programs"
                    onClick={() => setProgramsOpen((open) => !open)}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 transition-transform ${programsOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden
                    >
                      <path d="M5 8l5 5 5-5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {programsOpen && (
                  <div
                    id="programs-menu"
                    className="absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-3"
                  >
                    <div className="border-rule rounded-2xl border bg-white p-2 shadow-[0_18px_50px_rgba(16,32,51,0.12)]">
                      {PROGRAM_LINKS.map((program) => (
                        <Link
                          key={program.href}
                          href={program.href}
                          className="hover:bg-paper block rounded-xl px-3 py-2"
                          onClick={() => setProgramsOpen(false)}
                        >
                          <span className="font-major text-ink block text-sm">
                            {program.code}
                          </span>
                          <span className="text-ink-soft block text-xs">
                            {program.name}
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/programs"
                        className="text-theme-red block rounded-xl px-3 py-2 text-sm font-semibold"
                        onClick={() => setProgramsOpen(false)}
                      >
                        View all programs
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={current(link.href) ? active : inactive}
                aria-current={current(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center justify-end gap-1 lg:gap-2">
          <Link
            href="/news-announcements"
            aria-label="Search news and announcements"
            className="text-ink hover:bg-paper inline-flex h-11 w-11 items-center justify-center rounded-full"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l5 5" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="ease-draw bg-theme-red hover:bg-accent-deep hidden min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 active:scale-[0.98] sm:inline-flex"
          >
            Apply Now
            <ArrowIcon className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={isOpen}
            aria-controls="site-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <Image src="/hamburger.png" width={20} height={20} alt="" />
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          id="site-menu"
          className="border-rule absolute top-full left-0 z-50 flex w-full flex-col border-t bg-white shadow-[0_16px_40px_rgba(28,30,34,0.08)] lg:hidden"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={current(link.href) ? activeMobile : inactiveMobile}
              aria-current={current(link.href) ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-auto grid w-5/6 grid-cols-2 gap-2 py-4">
            {PROGRAM_LINKS.map((program) => (
              <Link
                key={program.href}
                href={program.href}
                className="text-ink-soft text-sm"
                onClick={() => setIsOpen(false)}
              >
                {program.code}
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            className="bg-theme-red mx-auto mb-4 inline-flex min-h-11 w-5/6 items-center justify-center rounded-full text-sm font-semibold text-white sm:hidden"
            onClick={() => setIsOpen(false)}
          >
            Apply Now
          </Link>
        </nav>
      )}
    </header>
  );
}
