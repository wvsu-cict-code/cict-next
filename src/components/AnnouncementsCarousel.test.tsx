import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NewsArticle } from "@/lib/news";
import { AnnouncementsCarousel, AUTOPLAY_MS } from "./AnnouncementsCarousel";

const article = (
  n: number,
  publishedAt = "2026-11-01T00:00:00Z",
): NewsArticle => ({
  id: `id${n}`,
  slug: `post-${n}`,
  date: "",
  publishedAt,
  newsHeader: `Announcement ${n}`,
  category: "announcement",
  sdgs: [],
});

const three = [article(1), article(2), article(3)];

/** The visible (not aria-hidden) slide. */
function activeSlide() {
  return screen.getByRole("group");
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn(() => ({
    matches: reduce,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("AnnouncementsCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-09T12:00:00Z"));
    setReducedMotion(false);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows one slide to assistive tech and links only that one", () => {
    render(<AnnouncementsCarousel articles={three} />);
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(
      "/news-announcements/news/post-1",
    );
  });

  it("steps with the arrows and loops at both ends", () => {
    render(<AnnouncementsCarousel articles={three} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Previous announcement" }),
    );
    expect(activeSlide().getAttribute("aria-label")).toBe("3 of 3");
    fireEvent.click(screen.getByRole("button", { name: "Next announcement" }));
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
  });

  it("jumps with the dots and the keyboard", () => {
    render(<AnnouncementsCarousel articles={three} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Show announcement 3 of 3" }),
    );
    expect(activeSlide().getAttribute("aria-label")).toBe("3 of 3");
    fireEvent.keyDown(activeSlide(), { key: "ArrowRight" });
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
  });

  it("brings a faded card forward when it's clicked", () => {
    const { container } = render(<AnnouncementsCarousel articles={three} />);
    const faded = container.querySelectorAll(
      '[aria-roledescription="slide"]',
    )[1];
    fireEvent.click(faded);
    expect(activeSlide().textContent).toContain("Announcement 2");
  });

  it("swipes sideways but not on a vertical scroll", () => {
    const { container } = render(<AnnouncementsCarousel articles={three} />);
    const area = container.querySelector(".overflow-hidden")!;
    const swipe = (x0: number, y0: number, x1: number, y1: number) => {
      fireEvent.touchStart(area, { touches: [{ clientX: x0, clientY: y0 }] });
      fireEvent.touchEnd(area, {
        changedTouches: [{ clientX: x1, clientY: y1 }],
      });
    };
    swipe(300, 100, 300, 400);
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
    swipe(300, 100, 150, 120);
    expect(activeSlide().getAttribute("aria-label")).toBe("2 of 3");
  });

  it("moves on by itself, restarting the wait after a manual step", () => {
    render(<AnnouncementsCarousel articles={three} />);
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS - 1000));
    fireEvent.click(
      screen.getByRole("button", { name: "Show announcement 3 of 3" }),
    );
    act(() => vi.advanceTimersByTime(1500));
    expect(activeSlide().getAttribute("aria-label")).toBe("3 of 3");
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS));
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
  });

  it("pauses while a mouse is over it", () => {
    render(<AnnouncementsCarousel articles={three} />);
    const region = screen.getByRole("region", { name: "Announcements" });
    fireEvent.pointerEnter(region, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS * 2));
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
    fireEvent.pointerLeave(region);
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS));
    expect(activeSlide().getAttribute("aria-label")).toBe("2 of 3");
  });

  it("doesn't move by itself for visitors who prefer less motion", () => {
    setReducedMotion(true);
    render(<AnnouncementsCarousel articles={three} />);
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS * 3));
    expect(activeSlide().getAttribute("aria-label")).toBe("1 of 3");
  });

  it("shows no controls for a single announcement", () => {
    render(<AnnouncementsCarousel articles={[article(1)]} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows recent dates as days ago and older ones as a date", () => {
    render(
      <AnnouncementsCarousel
        articles={[
          article(1, "2026-11-06T12:00:00Z"),
          article(2, "2026-02-04T00:00:00Z"),
        ]}
      />,
    );
    expect(screen.getByText("3 days ago")).toBeTruthy();
    expect(screen.getByText("February 4, 2026")).toBeTruthy();
  });
});
