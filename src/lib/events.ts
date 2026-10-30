import { formatDate } from "@/lib/format";
import { EVENTS_PREFIX } from "@/lib/routes";
import type { Tables } from "@/lib/supabase/database.types";

export type CalendarEvent = Tables<"events">;

// Event dates and times are always shown in Philippine time
const TIME_ZONE = "Asia/Manila";
const DAY_MS = 24 * 60 * 60 * 1000;

export function eventHref(slug: string) {
  return `${EVENTS_PREFIX}/${slug}`;
}

type EventTimes = Pick<CalendarEvent, "starts_at" | "ends_at" | "all_day">;

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
}

/**
 * When an event happens, e.g. "November 5, 2026 · 9:00 AM – 12:00 PM" or
 * "November 5, 2026 – November 7, 2026" for a multi-day, all-day event.
 */
export function formatEventWhen({ starts_at, ends_at, all_day }: EventTimes) {
  const startDay = formatDate(starts_at);
  const endDay = ends_at ? formatDate(ends_at) : startDay;

  if (all_day) {
    return startDay === endDay ? startDay : `${startDay} – ${endDay}`;
  }
  if (!ends_at) return `${startDay} · ${formatTime(starts_at)}`;
  if (startDay === endDay) {
    return `${startDay} · ${formatTime(starts_at)} – ${formatTime(ends_at)}`;
  }
  return `${startDay}, ${formatTime(starts_at)} – ${endDay}, ${formatTime(ends_at)}`;
}

/** Month and day for an event's date badge, e.g. { month: "Nov", day: "5" }. */
export function eventDateBadge(starts_at: string) {
  const date = new Date(starts_at);
  return {
    month: date.toLocaleDateString("en-US", {
      month: "short",
      timeZone: TIME_ZONE,
    }),
    day: date.toLocaleDateString("en-US", {
      day: "numeric",
      timeZone: TIME_ZONE,
    }),
  };
}

/**
 * When an event is over. All-day events are stored at midnight Philippine
 * time, so they last until the end of their (last) day.
 */
export function eventEnd({ starts_at, ends_at, all_day }: EventTimes) {
  const end = new Date(ends_at ?? starts_at).getTime();
  return new Date(all_day ? end + DAY_MS : end);
}

/** Upcoming events soonest first, then past events most recent first. */
export function splitEvents<T extends EventTimes>(
  events: T[],
  now = new Date(),
) {
  const upcoming = events
    .filter((event) => eventEnd(event) > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = events
    .filter((event) => eventEnd(event) <= now)
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  return { upcoming, past };
}
