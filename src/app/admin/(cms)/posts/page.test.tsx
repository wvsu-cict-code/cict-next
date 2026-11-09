import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPostsPage from "./page";

type Row = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: "news" | "announcement";
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string | null;
  sdgs: number[];
};

let rows: Row[] = [];

// The page reads every post's list columns once, sorted by the database
vi.mock("@/lib/cms/auth", () => ({
  requireAdmin: async () => {
    const query = {
      select: () => query,
      order: () => query,
      then: (resolve: (value: { data: Row[]; error: null }) => void) =>
        resolve({ data: rows, error: null }),
    };
    return { supabase: { from: () => query } };
  },
}));

const post = (n: number, patch: Partial<Row> = {}): Row => ({
  id: `p${n}`,
  title: `Post ${n}`,
  slug: `post-${n}`,
  excerpt: null,
  category: "news",
  status: "published",
  is_featured: false,
  published_at: "2026-01-01T00:00:00Z",
  sdgs: [],
  ...patch,
});

async function show(params: Record<string, string> = {}) {
  render(await AdminPostsPage({ searchParams: Promise.resolve(params) }));
}

const titles = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getByRole("link").textContent);

describe("Admin posts list", () => {
  beforeEach(() => {
    rows = Array.from({ length: 45 }, (_, i) => post(i + 1));
  });
  afterEach(cleanup);

  it("shows 20 posts a page with page links", async () => {
    await show();
    expect(titles()).toHaveLength(20);
    expect(titles()[0]).toBe("Post 1");
    expect(screen.getByText("Showing 1–20 of 45 posts")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Page 3" }).getAttribute("href"),
    ).toBe("/admin/posts?page=3");
  });

  it("shows the last, partly filled page", async () => {
    await show({ page: "3" });
    expect(titles()).toEqual([
      "Post 41",
      "Post 42",
      "Post 43",
      "Post 44",
      "Post 45",
    ]);
    expect(screen.getByText("Showing 41–45 of 45 posts")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Page 3" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.queryByRole("link", { name: "Next page" })).toBeNull();
  });

  it("falls back to the last page when the page is past the end", async () => {
    await show({ page: "99" });
    expect(titles()[0]).toBe("Post 41");
  });

  it("searches, including Facebook bold letters, and counts matches per tab", async () => {
    rows = [
      post(1, { title: "𝗪𝗩𝗦𝗨 𝗖𝗜𝗖𝗧 Wins Hackathon" }),
      post(2, { title: "Hackathon sign-ups", status: "draft" }),
      post(3, { title: "Enrollment schedule" }),
    ];
    await show({ q: "hackathon" });
    expect(titles()).toEqual([
      "𝗪𝗩𝗦𝗨 𝗖𝗜𝗖𝗧 Wins Hackathon",
      "Hackathon sign-ups",
    ]);
    const tabs = screen.getByRole("navigation", { name: "Filter posts" });
    expect(within(tabs).getByRole("link", { name: /Drafts/ }).textContent).toBe(
      "Drafts1",
    );
    // Tabs keep the search
    expect(
      within(tabs)
        .getByRole("link", { name: /Drafts/ })
        .getAttribute("href"),
    ).toBe("/admin/posts?q=hackathon&status=draft");

    cleanup();
    await show({ q: "wvsu cict" });
    expect(titles()).toEqual(["𝗪𝗩𝗦𝗨 𝗖𝗜𝗖𝗧 Wins Hackathon"]);
  });

  it("combines search with a status tab and keeps both in the form", async () => {
    rows = [
      post(1, { title: "Hackathon results" }),
      post(2, { title: "Hackathon sign-ups", status: "draft" }),
    ];
    await show({ q: "hackathon", status: "draft" });
    expect(titles()).toEqual(["Hackathon sign-ups"]);
    const search = screen.getByRole("search");
    expect(within(search).getByRole("searchbox").getAttribute("value")).toBe(
      "hackathon",
    );
    expect(
      search.querySelector<HTMLInputElement>('input[name="status"]')?.value,
    ).toBe("draft");
  });

  it("says when nothing matches and offers to clear the search", async () => {
    await show({ q: "nothing like this" });
    expect(
      screen.getByText("No posts match “nothing like this”."),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Clear search" }).getAttribute("href"),
    ).toBe("/admin/posts");
  });

  it("hides the page links when everything fits on one page", async () => {
    rows = rows.slice(0, 3);
    await show();
    expect(screen.getByText("Showing 1–3 of 3 posts")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Pages" })).toBeNull();
  });
});
