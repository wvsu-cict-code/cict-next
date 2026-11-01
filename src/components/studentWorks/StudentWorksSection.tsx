"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/PageHeader";
import { useStudentWorks } from "@/lib/studentWorks/useStudentWorks";
import { WorkSpotlight } from "./WorkSpotlight";
import { WorkWall } from "./WorkWall";

/** Featured student works for the BSEMC page. Hidden until there is something to show. */
export function StudentWorksSection() {
  const { status, works, total, hasMore, loadMore } = useStudentWorks();
  // Index of the work shown in the spotlight, or null while it is closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  // The spotlight moved past the last loaded work, but loading more added
  // nothing (an admin hid or reordered works meanwhile). Close it rather than
  // leave an empty overlay, and put focus back on the last tile.
  const stranded = openIndex !== null && openIndex >= works.length;
  useEffect(() => {
    if (!stranded) return;
    setOpenIndex(null);
    const last = works.length - 1;
    requestAnimationFrame(() => tileRefs.current[last]?.focus());
  }, [stranded, works.length]);

  if (!active) return null;

  function closeSpotlight() {
    const index = openIndex;
    setOpenIndex(null);
    if (index !== null) {
      // The tile is not covered any more once the overlay unmounts.
      requestAnimationFrame(() => tileRefs.current[index]?.focus());
    }
  }

  return (
    <section className="border-rule mt-12 border-t pt-12">
      <Eyebrow>Student showcase</Eyebrow>
      <h2 className="text-ink mt-3 mb-8 text-3xl leading-[1.1] font-medium md:text-4xl">
        Featured student works
      </h2>
      <WorkWall works={works} onOpen={setOpenIndex} tileRefs={tileRefs} />
      {openIndex !== null && !stranded ? (
        <WorkSpotlight
          works={works}
          total={total}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={closeSpotlight}
          loadMore={loadMore}
        />
      ) : null}
      <div ref={sentinel} aria-hidden className="h-px" />
    </section>
  );
}
