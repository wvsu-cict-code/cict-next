import Link from "next/link";
import type { ReactNode } from "react";

/** Width and side padding shared by every section of the public site. */
export const container = "mx-auto w-full max-w-[1400px] px-4 md:px-8";

export const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-theme-red px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 ease-draw hover:bg-accent-deep active:scale-[0.98]";

export const outlineButtonOnDark =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/50 px-5 text-sm font-semibold whitespace-nowrap text-white backdrop-blur-sm transition-colors duration-200 ease-draw hover:border-white hover:bg-white/10 active:scale-[0.98]";

/** Small uppercase label above a heading, led by a short rule. */
export function Eyebrow({
  children,
  onDark = false,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase ${onDark ? "text-orange-light" : "text-theme-red"}`}
    >
      <span
        className={`h-px w-8 ${onDark ? "bg-orange-light" : "bg-theme-red"}`}
        aria-hidden
      />
      {children}
    </p>
  );
}

/**
 * The top of every inner page: a navy band, over a darkened photo when one
 * is given, matching the home page hero.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  back,
  aside,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  back?: { href: string; label: string };
  /** Shown at the right edge on large screens, such as a program logo. */
  aside?: ReactNode;
  /** Shown under the intro, such as a search form. */
  children?: ReactNode;
}) {
  return (
    <header className="bg-navy relative isolate overflow-hidden text-white">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- the static site can't optimize images */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(16,32,51,0.6)_0%,rgba(16,32,51,0.85)_100%)] lg:bg-[linear-gradient(90deg,rgba(16,32,51,0.94)_0%,rgba(16,32,51,0.8)_40%,rgba(16,32,51,0.35)_75%,rgba(16,32,51,0.2)_100%)]"
          />
        </>
      ) : null}

      <div className={`${container} relative py-14 md:py-20`}>
        {back ? (
          <Link
            href={back.href}
            className="group mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <svg
              viewBox="0 0 20 20"
              className="ease-draw h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden
            >
              <path
                d="M16 10H4M9 5l-5 5 5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {back.label}
          </Link>
        ) : null}
        <div className="flex items-center justify-between gap-10">
          <div className="max-w-[44rem] min-w-0">
            <Eyebrow onDark>{eyebrow}</Eyebrow>
            <h1 className="mt-4 text-4xl leading-[1.05] font-medium text-balance md:text-6xl">
              {title}
            </h1>
            {intro ? (
              <div className="mt-5 max-w-[56ch] text-base leading-relaxed text-white/80 md:text-lg">
                {intro}
              </div>
            ) : null}
            {children}
          </div>
          {aside ? (
            <div className="hidden shrink-0 lg:block" aria-hidden>
              {aside}
            </div>
          ) : null}
        </div>
      </div>

      <div
        aria-hidden
        className="bg-theme-red absolute right-0 bottom-0 h-16 w-16 md:h-24 md:w-24"
        style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 70%)" }}
      />
    </header>
  );
}

/** Heading for a section inside a page. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          className={`text-ink text-3xl leading-[1.1] font-medium md:text-4xl ${eyebrow ? "mt-3" : ""}`}
        >
          {title}
        </h2>
        {intro ? (
          <p className="text-ink-soft mt-3 max-w-[52ch] text-base leading-relaxed">
            {intro}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
