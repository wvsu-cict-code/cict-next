import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "@/components/studentWorks/fixtures";
import { clearContentCache } from "@/lib/cms/useContent";
import { CATEGORY_TINT } from "@/lib/museum/categories";
import { clearLikeCache } from "@/lib/museum/likes";
import { Highlights } from "./Highlights";

const fetchFeaturedWorks = vi.hoisted(() => vi.fn());

vi.mock("@/lib/museum/queries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/museum/queries")>(
    "@/lib/museum/queries",
  );
  return { ...actual, fetchFeaturedWorks };
});

vi.mock("@/lib/auth/session", () => ({
  useSession: () => ({ status: "signed-out", user: null, displayName: null }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({}),
}));

function tintColor(hex: string): string {
  const value = hex.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgb(${red}, ${green}, ${blue})`;
}

const featured = [
  makeWork({
    id: "sunrise",
    title: "Sunrise",
    category: "digital_art",
    like_count: 4,
    image_url: "https://cdn.test/sunrise.jpg",
  }),
  makeWork({
    id: "night",
    title: "Night Drive",
    category: "sound_design",
    like_count: 2,
    image_url: null,
    youtube_id: null,
  }),
];

class TestObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  fetchFeaturedWorks.mockReset();
  fetchFeaturedWorks.mockResolvedValue(featured);
  clearContentCache();
  clearLikeCache();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  vi.stubGlobal("ResizeObserver", TestObserver);
  vi.stubGlobal("IntersectionObserver", TestObserver);
});

afterEach(() => {
  cleanup();
  clearContentCache();
  clearLikeCache();
});

describe("Highlights", () => {
  it("highlights render featured works with like counts and no comment counts", async () => {
    const browse = document.createElement("div");
    browse.id = "browse";
    document.body.append(browse);
    const onVisit = vi.fn();
    render(<Highlights onVisit={onVisit} />);

    expect(
      await screen.findByRole("heading", { name: "Student Highlights" }),
    ).toBeTruthy();
    expect(screen.getByText("Featured exhibits")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Like, 4" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Like, 2" })).toBeTruthy();
    expect(screen.queryByText(/comment/i)).toBeNull();
    expect(screen.getByText("Digital art")).toBeTruthy();
    expect(screen.getByText("Sound design")).toBeTruthy();

    const sunrise = screen.getByRole("button", { name: "Sunrise" });
    const sunriseCover = sunrise.querySelector("[data-cover]");
    expect(sunriseCover?.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.test/sunrise.jpg",
    );
    const sunriseTint = CATEGORY_TINT.digital_art;
    const coverStyle = sunriseCover?.getAttribute("style") ?? "";
    expect(coverStyle).toContain(tintColor(sunriseTint.from));
    expect(coverStyle).toContain(tintColor(sunriseTint.to));

    const night = screen.getByRole("button", { name: "Night Drive" });
    const nightCover = night.querySelector("[data-cover]");
    expect(nightCover?.querySelector("img")).toBeNull();
    expect(nightCover?.querySelector("svg")).toBeTruthy();

    const slide = sunrise.closest("[data-slot=carousel-item]");
    expect(slide?.className).toContain("basis-[83.333%]");
    expect(slide?.className).toContain("md:basis-[220px]");

    fireEvent.click(sunrise);
    expect(onVisit).toHaveBeenCalledWith("sunrise");
    expect(onVisit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("link", { name: /View All Exhibits/ }));
    expect(browse.scrollIntoView).toHaveBeenCalled();
    browse.remove();
  });

  it("highlights are hidden when nothing is featured", async () => {
    fetchFeaturedWorks.mockResolvedValue([]);
    render(<Highlights onVisit={() => {}} />);

    await waitFor(() => expect(fetchFeaturedWorks).toHaveBeenCalled());
    await act(async () => {
      await fetchFeaturedWorks.mock.results[0]?.value;
    });
    expect(
      screen.queryByRole("heading", { name: "Student Highlights" }),
    ).toBeNull();
  });
});
