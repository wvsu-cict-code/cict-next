import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudentWork } from "@/lib/cms/content";
import StatusTabs from "./StatusTabs";
import WorkList from "./WorkList";

afterEach(cleanup);

function work(id: string, over: Partial<StudentWork> = {}): StudentWork {
  return {
    id,
    title: `Work ${id}`,
    student: `Student ${id}`,
    category: "digital_art",
    status: "approved",
    featured: false,
    like_count: 0,
    submitted_by: null,
    rejection_reason: null,
    video_url: null,
    audio_url: null,
    submitted_at: null,
    reviewed_at: null,
    description: "",
    visible: true,
    sort_order: 0,
    image_url: `https://img.test/${id}.webp`,
    image_width: 400,
    image_height: 300,
    orientation: null,
    youtube_id: null,
    original_url: null,
    portfolio_url: null,
    store_url: null,
    zoom_url: null,
    zoom_width: null,
    zoom_height: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...over,
  };
}

const works = [
  work("a"),
  work("b", { category: "short_film", visible: false, image_url: null, youtube_id: "abcdefghijk", orientation: "landscape" }),
  work("c", { category: "game" }),
];

function titles() {
  return screen
    .getAllByRole("listitem")
    .map((li) => li.querySelector("[data-title]")?.textContent);
}

describe("WorkList", () => {
  it("renders works in order with details, hidden badge and edit link", () => {
    render(<WorkList works={works} onReorder={vi.fn()} onToggleVisible={vi.fn()} />);
    expect(titles()).toEqual(["Work a", "Work b", "Work c"]);
    expect(screen.getByText("Student a")).toBeTruthy();
    expect(screen.getByText("Digital art")).toBeTruthy();
    expect(screen.getByText("Short film")).toBeTruthy();
    expect(screen.getByText("Game")).toBeTruthy();
    expect(screen.getAllByText("Hidden")).toHaveLength(1);
    expect(document.querySelectorAll("img")).toHaveLength(3);
    const link = screen.getByRole("link", { name: /Work a/ });
    expect(link.getAttribute("href")).toBe("/admin/student-works/a");
  });

  it("swaps a missing YouTube thumbnail's placeholder for hqdefault", () => {
    render(<WorkList works={works} onReorder={vi.fn()} onToggleVisible={vi.fn()} />);
    const img = document.querySelectorAll("img")[1];
    expect(img.getAttribute("src")).toContain("maxresdefault.jpg");
    Object.defineProperty(img, "naturalWidth", { configurable: true, value: 120 });
    Object.defineProperty(img, "naturalHeight", { configurable: true, value: 90 });
    fireEvent.load(img);
    expect(img.getAttribute("src")).toContain("hqdefault.jpg");
  });

  it("moves a work down, calling onReorder and updating immediately", async () => {
    const onReorder = vi.fn().mockResolvedValue({});
    render(<WorkList works={works} onReorder={onReorder} onToggleVisible={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Move Work a down" }));
    expect(titles()).toEqual(["Work b", "Work a", "Work c"]);
    await waitFor(() => expect(onReorder).toHaveBeenCalledWith(["b", "a", "c"]));
  });

  it("disables Move up on the first and Move down on the last", () => {
    render(<WorkList works={works} onReorder={vi.fn()} onToggleVisible={vi.fn()} />);
    expect(
      (screen.getByRole("button", { name: "Move Work a up" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Move Work c down" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Move Work b up" }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it("reverts and shows the error when reordering fails", async () => {
    const onReorder = vi.fn().mockResolvedValue({ error: "Could not save" });
    render(<WorkList works={works} onReorder={onReorder} onToggleVisible={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Move Work a down" }));
    await screen.findByText("Could not save");
    expect(titles()).toEqual(["Work a", "Work b", "Work c"]);
  });

  it("toggles visibility", async () => {
    const onToggleVisible = vi.fn().mockResolvedValue({});
    render(<WorkList works={works} onReorder={vi.fn()} onToggleVisible={onToggleVisible} />);
    fireEvent.click(screen.getByRole("button", { name: "Hide Work a" }));
    await waitFor(() => expect(onToggleVisible).toHaveBeenCalledWith("a", false));
  });

  it("shows the pending count and only allows reordering on Approved", async () => {
    const queue = [
      work("a", { submitted_by: "student-1", featured: false }),
      work("b", { submitted_by: null, featured: true, status: "pending" }),
    ];
    const onToggleFeatured = vi.fn().mockResolvedValue({});

    const { unmount } = render(
      <>
        <StatusTabs status="pending" pendingCount={4} />
        <WorkList
          works={queue}
          canReorder={false}
          onReorder={vi.fn()}
          onToggleVisible={vi.fn()}
          onToggleFeatured={onToggleFeatured}
        />
      </>,
    );

    const pending = screen.getByRole("link", { name: /Pending/ });
    expect(pending.textContent).toContain("4");
    expect(pending.getAttribute("href")).toBe("/admin/student-works?status=pending");
    expect(screen.getByRole("link", { name: "Approved" }).getAttribute("href")).toBe(
      "/admin/student-works?status=approved",
    );
    expect(screen.queryByRole("button", { name: "Move Work a up" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Move Work a down" })).toBeNull();
    expect(screen.getByText("Student")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();

    fireEvent.click(screen.getByRole("switch", { name: "Featured Work a" }));
    await waitFor(() => expect(onToggleFeatured).toHaveBeenCalledWith("a", true));

    unmount();
    render(
      <>
        <StatusTabs status="approved" pendingCount={4} />
        <WorkList
          works={queue}
          canReorder
          onReorder={vi.fn()}
          onToggleVisible={vi.fn()}
          onToggleFeatured={vi.fn()}
        />
      </>,
    );
    expect(
      (screen.getByRole("button", { name: "Move Work a up" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Move Work a down" }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});
