import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudentWork } from "@/lib/cms/content";
import ReviewPanel from "./ReviewPanel";

afterEach(cleanup);

function work(over: Partial<StudentWork> = {}): StudentWork {
  return {
    id: "work-1",
    title: "Night Market",
    student: "Ana Cruz",
    category: "short_film",
    status: "pending",
    featured: false,
    like_count: 0,
    submitted_by: "student-1",
    rejection_reason: null,
    video_url: null,
    audio_url: null,
    submitted_at: "2026-11-01T00:00:00Z",
    reviewed_at: null,
    description: "A short film.",
    visible: true,
    sort_order: 0,
    image_url: "https://cdn.test/poster.webp",
    image_width: 1280,
    image_height: 720,
    orientation: "landscape",
    youtube_id: null,
    original_url: null,
    portfolio_url: "https://ana.test",
    store_url: null,
    zoom_url: null,
    zoom_width: null,
    zoom_height: null,
    created_at: "2026-11-01",
    updated_at: "2026-11-01",
    ...over,
  };
}

describe("ReviewPanel", () => {
  it("requires a reason before rejecting", async () => {
    const onApprove = vi.fn().mockResolvedValue({});
    const onReject = vi.fn().mockResolvedValue({});
    render(<ReviewPanel work={work()} onApprove={onApprove} onReject={onReject} />);

    expect(screen.queryByRole("textbox", { name: "Reason" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const reason = screen.getByRole("textbox", { name: "Reason" });
    fireEvent.click(screen.getByRole("button", { name: "Reject submission" }));
    expect(screen.getByRole("alert").textContent).toBe("Give the student a reason.");
    expect(onReject).not.toHaveBeenCalled();

    fireEvent.change(reason, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Reject submission" }));
    expect(onReject).not.toHaveBeenCalled();

    fireEvent.change(reason, { target: { value: "  The audio is missing.  " } });
    fireEvent.click(screen.getByRole("button", { name: "Reject submission" }));
    await waitFor(() =>
      expect(onReject).toHaveBeenCalledWith("work-1", "The audio is missing."),
    );

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(onApprove).toHaveBeenCalledWith("work-1"));
  });

  it("plays webm video and audio previews", () => {
    const { unmount } = render(
      <ReviewPanel
        work={work({
          video_url: "https://cdn.test/clip.webm",
          store_url: "https://films.test/night",
        })}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    const video = document.querySelector("video");
    expect(video?.getAttribute("src")).toBe("https://cdn.test/clip.webm");
    expect(video?.hasAttribute("controls")).toBe(true);
    expect(document.querySelector("audio")).toBeNull();
    expect(document.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.test/poster.webp",
    );
    expect(screen.getByRole("link", { name: "https://films.test/night" }).getAttribute("href")).toBe(
      "https://films.test/night",
    );
    expect(screen.getByRole("link", { name: "https://ana.test" }).getAttribute("href")).toBe(
      "https://ana.test",
    );

    unmount();
    render(
      <ReviewPanel
        work={work({
          category: "sound_design",
          video_url: null,
          orientation: null,
          audio_url: "https://cdn.test/track.webm",
          image_url: "https://cdn.test/cover.webp",
          portfolio_url: null,
        })}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    const audio = document.querySelector("audio");
    expect(audio?.getAttribute("src")).toBe("https://cdn.test/track.webm");
    expect(audio?.hasAttribute("controls")).toBe(true);
    expect(document.querySelector("video")).toBeNull();
    expect(document.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.test/cover.webp",
    );
  });
});
