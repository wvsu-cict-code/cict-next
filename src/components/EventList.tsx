"use client";

import Link from "next/link";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { ArrowIcon } from "@/components/PhotoSlot";
import { Eyebrow, PageHeader, container } from "@/components/PageHeader";
import { loadEvents } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";
import {
  type CalendarEvent,
  eventDateBadge,
  eventHref,
  formatEventWhen,
  splitEvents,
} from "@/lib/events";

/** How many upcoming events the home page lists. */
const HOME_EVENTS_LIMIT = 3;

/** How many past events the Events page lists. */
const PAST_EVENTS_LIMIT = 12;

/** One event: a date tile, then its title, time, and place. */
function EventRow({ event }: { event: CalendarEvent }) {
  const badge = eventDateBadge(event.starts_at);
  return (
    <li>
      <Link
        href={eventHref(event.slug)}
        className="group border-rule hover:bg-paper/60 flex gap-5 border-b py-5 transition-colors md:gap-8"
      >
        <span
          aria-hidden
          className="border-theme-red/30 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border bg-white"
        >
          <span className="text-theme-red text-xs font-semibold tracking-[0.12em] uppercase">
            {badge.month}
          </span>
          <span className="text-ink text-2xl leading-none font-medium">
            {badge.day}
          </span>
        </span>
        <span className="min-w-0">
          <span className="text-ink group-hover:text-theme-red block text-lg leading-snug font-medium transition-colors md:text-xl">
            {event.title}
          </span>
          <span className="text-ink-soft mt-1 block text-sm md:text-base">
            {formatEventWhen(event)}
            {event.location ? ` · ${event.location}` : ""}
          </span>
          {event.summary ? (
            <span className="text-ink-soft mt-2 line-clamp-2 block max-w-[68ch] text-base leading-relaxed">
              {event.summary}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

function ListPlaceholder({ rows }: { rows: number }) {
  return (
    <div className="mt-8 grid gap-4">
      {Array.from({ length: rows }, (_, index) => (
        <ContentPlaceholder key={index} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

/** The Events page: upcoming events, then recent past ones. */
export function EventsPage() {
  const result = useContent("events", loadEvents);
  const { upcoming, past } =
    result.status === "ready"
      ? splitEvents(result.data)
      : { upcoming: [], past: [] };

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Events"
        title="Events and academic calendar"
        intro="Seminars, competitions, and important dates at the College of ICT."
      />
      <div className={`${container} py-12 md:py-16`}>
        {result.status === "error" ? (
          <ContentError onRetry={result.retry} />
        ) : (
          <>
            <section aria-labelledby="upcoming-events">
              <h2
                id="upcoming-events"
                className="text-ink text-3xl font-medium"
              >
                Upcoming
              </h2>
              {result.status === "loading" ? (
                <ListPlaceholder rows={3} />
              ) : upcoming.length === 0 ? (
                <p className="text-ink-soft mt-6 text-base md:text-lg">
                  No upcoming events have been posted yet. Check the{" "}
                  <Link
                    href="/news-announcements"
                    className="text-theme-red underline underline-offset-2"
                  >
                    news and announcements
                  </Link>{" "}
                  for the latest updates.
                </p>
              ) : (
                <ul className="border-rule mt-6 border-t">
                  {upcoming.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </ul>
              )}
            </section>

            {past.length > 0 && (
              <section aria-labelledby="past-events" className="mt-16">
                <h2 id="past-events" className="text-ink text-3xl font-medium">
                  Past events
                </h2>
                <ul className="border-rule mt-6 border-t">
                  {past.slice(0, PAST_EVENTS_LIMIT).map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Upcoming events on the home page. Hidden when there are none. */
export function HomeEvents() {
  const result = useContent("events", loadEvents);
  if (result.status !== "ready") return null;

  const upcoming = splitEvents(result.data).upcoming.slice(
    0,
    HOME_EVENTS_LIMIT,
  );
  if (upcoming.length === 0) return null;

  return (
    <section className="bg-[#f7f8fa]">
      <div className={`${container} py-16 md:py-20`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Calendar</Eyebrow>
            <h2 className="text-ink mt-3 text-4xl font-medium md:text-5xl">
              Upcoming events
            </h2>
          </div>
          <Link
            href="/events"
            className="text-theme-red inline-flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap"
          >
            All events
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
        <ul className="border-rule mt-8 border-t">
          {upcoming.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </section>
  );
}
