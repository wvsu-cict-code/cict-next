"use client";

import { useContext, type MouseEvent } from "react";
import { ContentError } from "@/components/ContentState";
import { container, Eyebrow } from "@/components/PageHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useContent } from "@/lib/cms/useContent";
import { fetchFeaturedWorks } from "@/lib/museum/queries";
import { ExhibitCard } from "./ExhibitCard";
import { MuseumContext } from "./MuseumSection";

function viewAll(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("browse")?.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
  });
}

/** Featured exhibits. Hidden when none are flagged. */
export function Highlights({ onVisit }: { onVisit(workId: string): void }) {
  const museum = useContext(MuseumContext);
  const result = useContent("featured-works", (client) =>
    fetchFeaturedWorks(client),
  );

  function visit(workId: string) {
    if (museum) museum.visitExhibit(workId);
    else onVisit(workId);
  }

  if (result.status === "loading") return null;
  if (result.status === "error") {
    return (
      <div className={`${container} py-16 md:py-20`}>
        <ContentError onRetry={result.retry} />
      </div>
    );
  }
  if (result.data.length === 0) return null;

  return (
    <div className={`${container} py-16 md:py-20`}>
      <Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Featured exhibits</Eyebrow>
            <h2 className="text-ink mt-3 text-3xl leading-tight font-medium md:text-4xl">
              Student Highlights
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#browse"
              onClick={viewAll}
              className="text-accent inline-flex min-h-11 items-center text-sm font-semibold"
            >
              View All Exhibits →
            </a>
            <CarouselPrevious className="static top-auto right-auto bottom-auto left-auto translate-y-0" />
            <CarouselNext className="static top-auto right-auto bottom-auto left-auto translate-y-0" />
          </div>
        </div>
        <CarouselContent className="mt-8">
          {result.data.map((work) => (
            <CarouselItem
              key={work.id}
              className="basis-[83.333%] md:basis-[220px]"
            >
              <ExhibitCard work={work} onOpen={() => visit(work.id)} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
