import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "./fixtures";
import { WorkTile } from "./WorkTile";

afterEach(cleanup);

const video = makeWork({
  kind: "video",
  title: "Reel",
  image_url: null,
  youtube_id: "abc123",
  orientation: "landscape",
});

describe("WorkTile", () => {
  it("is a button named for the piece and its student", () => {
    const onOpen = vi.fn();
    render(<WorkTile work={makeWork()} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Sunrise by Ana Cruz" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("labels the type and marks videos with a hidden play marker", () => {
    const { container, rerender } = render(
      <WorkTile work={makeWork()} onOpen={() => {}} />,
    );
    expect(screen.getByText("Digital art")).toBeTruthy();
    expect(container.querySelector("[data-play]")).toBeNull();
    rerender(<WorkTile work={video} onOpen={() => {}} />);
    expect(screen.getByText("Video")).toBeTruthy();
    expect(
      container.querySelector("[data-play]")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("falls back from maxresdefault to hqdefault", () => {
    const { container } = render(<WorkTile work={video} onOpen={() => {}} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toContain("maxresdefault.jpg");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toContain("hqdefault.jpg");
  });

  it("gives a vertical video a 9 / 16 media box", () => {
    const { container } = render(
      <WorkTile work={{ ...video, orientation: "vertical" }} onOpen={() => {}} />,
    );
    const box = container.querySelector("[data-media]") as HTMLElement;
    expect(box.style.aspectRatio).toBe("9 / 16");
  });

  it("lazy-loads images with explicit dimensions", () => {
    const { container } = render(<WorkTile work={makeWork()} onOpen={() => {}} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("width")).toBeTruthy();
    expect(img.getAttribute("height")).toBeTruthy();
  });
});
