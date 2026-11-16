import { describe, expect, it } from "vitest";
import {
  eventDateBadge,
  eventEnd,
  formatEventWhen,
  splitEvents,
} from "@/lib/events";

// Philippine time is UTC+8
const manila = (local: string) => new Date(`${local}+08:00`).toISOString();

describe("formatEventWhen", () => {
  it("shows a timed event on one day with its start and end times", () => {
    expect(
      formatEventWhen({
        starts_at: manila("2026-11-05T09:00:00"),
        ends_at: manila("2026-11-05T12:00:00"),
        all_day: false,
      }),
    ).toBe("November 5, 2026 · 9:00 AM – 12:00 PM");
  });

  it("shows only the start time when there is no end", () => {
    expect(
      formatEventWhen({
        starts_at: manila("2026-11-05T13:30:00"),
        ends_at: null,
        all_day: false,
      }),
    ).toBe("November 5, 2026 · 1:30 PM");
  });

  it("shows both dates and times for a timed event across days", () => {
    expect(
      formatEventWhen({
        starts_at: manila("2026-11-05T09:00:00"),
        ends_at: manila("2026-11-06T17:00:00"),
        all_day: false,
      }),
    ).toBe("November 5, 2026, 9:00 AM – November 6, 2026, 5:00 PM");
  });

  it("hides times for all-day events", () => {
    expect(
      formatEventWhen({
        starts_at: manila("2026-11-05T00:00:00"),
        ends_at: null,
        all_day: true,
      }),
    ).toBe("November 5, 2026");
    expect(
      formatEventWhen({
        starts_at: manila("2026-11-05T00:00:00"),
        ends_at: manila("2026-11-07T00:00:00"),
        all_day: true,
      }),
    ).toBe("November 5, 2026 – November 7, 2026");
  });

  it("uses the Philippine date, not UTC's", () => {
    // 11 PM UTC on Nov 4 is 7 AM on Nov 5 in Manila
    expect(
      formatEventWhen({
        starts_at: "2026-11-04T23:00:00.000Z",
        ends_at: null,
        all_day: false,
      }),
    ).toBe("November 5, 2026 · 7:00 AM");
  });
});

describe("eventDateBadge", () => {
  it("gives the short month and day in Philippine time", () => {
    expect(eventDateBadge("2026-11-04T23:00:00.000Z")).toEqual({
      month: "Nov",
      day: "5",
    });
  });
});

describe("eventEnd", () => {
  it("lasts until the end of an all-day event's last day", () => {
    expect(
      eventEnd({
        starts_at: manila("2026-11-05T00:00:00"),
        ends_at: null,
        all_day: true,
      }).toISOString(),
    ).toBe(manila("2026-11-06T00:00:00"));
  });
});

describe("splitEvents", () => {
  const now = new Date(manila("2026-11-05T10:00:00"));
  const event = (
    slug: string,
    starts: string,
    ends: string | null = null,
    all_day = false,
  ) => ({
    slug,
    starts_at: manila(starts),
    ends_at: ends ? manila(ends) : null,
    all_day,
  });

  it("puts upcoming events soonest first and past events newest first", () => {
    const { upcoming, past } = splitEvents(
      [
        event("later", "2026-12-01T09:00:00"),
        event("old", "2026-09-01T09:00:00"),
        event("soon", "2026-11-10T09:00:00"),
        event("recent", "2026-10-20T09:00:00"),
      ],
      now,
    );
    expect(upcoming.map((e) => e.slug)).toEqual(["soon", "later"]);
    expect(past.map((e) => e.slug)).toEqual(["recent", "old"]);
  });

  it("keeps an event that is still going on in upcoming", () => {
    const { upcoming } = splitEvents(
      [
        event("running", "2026-11-05T08:00:00", "2026-11-05T12:00:00"),
        event("today", "2026-11-05T00:00:00", null, true),
      ],
      now,
    );
    expect(upcoming.map((e) => e.slug)).toEqual(["today", "running"]);
  });

  it("moves an event to past once it has ended", () => {
    const { past } = splitEvents(
      [event("morning", "2026-11-05T07:00:00", "2026-11-05T09:00:00")],
      now,
    );
    expect(past.map((e) => e.slug)).toEqual(["morning"]);
  });
});
