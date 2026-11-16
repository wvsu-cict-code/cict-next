"use client";

import type { MouseEvent } from "react";
import {
  Eyebrow,
  container,
  outlineButtonOnDark,
  primaryButton,
} from "@/components/PageHeader";
import {
  CATEGORIES,
  CATEGORY_ICON,
  CATEGORY_LABELS,
  type Category,
} from "@/lib/museum/categories";

const INTRO =
  "A digital gallery of creative works by the BSEMC community — games, animations, films, interactive media, and more.";

function scrollToSection(id: string) {
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
  });
}

function enterMuseum(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  scrollToSection("museum-3d");
  window.dispatchEvent(new Event("museum:enter"));
}

function browseExhibits(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  scrollToSection("browse");
}

function openCategory(
  event: MouseEvent<HTMLAnchorElement>,
  category: Category,
) {
  event.preventDefault();
  const hash = `#browse?category=${category}`;
  if (window.location.hash !== hash) window.location.hash = hash;
  scrollToSection("browse");
}

/** Perspective line drawing of a building, behind the hero copy. */
function BuildingDrawing() {
  const windows = [];
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      windows.push(
        <rect
          key={`${row}-${column}`}
          x={268 + column * 52}
          y={168 + row * 42}
          width="28"
          height="20"
        />,
      );
    }
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 800 480"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <g fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1.25">
        <path d="M48 400 L210 96 L210 318 L48 430 Z" />
        <path d="M210 96 L690 148 L690 392 L210 318 Z" />
        <path d="M188 84 L668 134" />
        <path d="M48 400 L360 250 L690 392" />
        <path d="M250 150 V370 M302 156 V378 M354 162 V386 M406 168 V394 M458 174 V402 M510 180 V410 M562 186 V418 M614 192 V426" />
        {windows}
      </g>
    </svg>
  );
}

export function MuseumHero() {
  return (
    <section
      data-theme="dark"
      className="bg-navy relative isolate overflow-hidden text-white"
    >
      <BuildingDrawing />
      <div
        aria-hidden
        className="bg-orange-light pointer-events-none absolute right-0 bottom-0 h-16 w-16 md:h-24 md:w-24"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />

      <div
        className={`${container} relative grid items-end gap-10 pt-16 pb-20 md:pt-24 md:pb-28 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16`}
      >
        <div className="max-w-[40rem]">
          <Eyebrow onDark>BSEMC</Eyebrow>
          <h1 className="mt-4 text-4xl leading-[1.05] font-medium text-balance md:text-6xl">
            Virtual Museum
          </h1>
          <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-white/80 md:text-lg">
            {INTRO}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#museum-3d"
              className={primaryButton}
              onClick={enterMuseum}
            >
              Enter Museum
            </a>
            <a
              href="#browse"
              className={outlineButtonOnDark}
              onClick={browseExhibits}
            >
              Browse Exhibits
            </a>
          </div>
        </div>

        <nav aria-label="Exhibit categories">
          <ul className="lg:border-orange-light/80 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:pl-6">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICON[category];
              return (
                <li key={category}>
                  <a
                    href={`#browse?category=${category}`}
                    onClick={(event) => openCategory(event, category)}
                    className="flex min-h-11 items-center gap-3 text-sm font-medium text-white/80 transition-colors hover:text-white"
                  >
                    <Icon aria-hidden className="size-5 shrink-0" />
                    {CATEGORY_LABELS[category]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
