"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/PageHeader";
import { useStudentWorks } from "@/lib/studentWorks/useStudentWorks";
import { WorkWall } from "./WorkWall";

/** Featured student works for the BSEMC page. Hidden until there is something to show. */
export function StudentWorksSection() {
  const { status, works, total, hasMore, loadMore } = useStudentWorks();
  // Index of the opened work. Task 10 renders the spotlight from it and
  // returns focus with tileRefs.current[openIndex] on close.
  const [, setOpenIndex] = useState<number | null>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);

  const active = status === "ready" && total > 0;

  useEffect(() => {
    const el = sentinel.current;
    if (!active || !hasMore || !el || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, hasMore, works.length, loadMore]);

  if (!active) return null;

  return (
    <section className="border-rule mt-12 border-t pt-12">
      <Eyebrow>Student showcase</Eyebrow>
      <h2 className="text-ink mt-3 mb-8 text-3xl leading-[1.1] font-medium md:text-4xl">
        Featured student works
      </h2>
      <WorkWall works={works} onOpen={setOpenIndex} tileRefs={tileRefs} />
      <div ref={sentinel} aria-hidden className="h-px" />
    </section>
  );
}
