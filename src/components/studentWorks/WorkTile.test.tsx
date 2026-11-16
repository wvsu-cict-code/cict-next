import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "./fixtures";
import { WorkTile } from "./WorkTile";

afterEach(cleanup);

const video = makeWork({
  category: "short_film",
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
    expect(screen.getByText("Short film")).toBeTruthy();
    expect(
      container.querySelector("[data-play]")?.getAttribute("aria-hidden"),
    ).toBe("true");
    rerender(
      <WorkTile work={{ ...video, category: "animation" }} onOpen={() => {}} />,
    );
    expect(screen.getByText("Animation")).toBeTruthy();
    expect(container.querySelector("[data-play]")).not.toBeNull();
  });

  it("falls back from maxresdefault to hqdefault", () => {
    const { container } = render(<WorkTile work={video} onOpen={() => {}} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toContain("maxresdefault.jpg");
    fireEvent.error(img);
    expect(img.getAttribute("src")).toContain("hqdefault.jpg");
  });

  it("falls back when YouTube serves its 120x90 placeholder", () => {
    const { container } = render(<WorkTile work={video} onOpen={() => {}} />);
    const img = container.querySelector("img")!;
    Object.defineProperty(img, "naturalWidth", { configurable: true, value: 120 });
    Object.defineProperty(img, "naturalHeight", { configurable: true, value: 90 });
    fireEvent.load(img);
    expect(img.getAttribute("src")).toContain("hqdefault.jpg");
  });

  it("keeps maxresdefault when it loads at full size", () => {
    const { container } = render(<WorkTile work={video} onOpen={() => {}} />);
    const img = container.querySelector("img")!;
    Object.defineProperty(img, "naturalWidth", { configurable: true, value: 1280 });
    Object.defineProperty(img, "naturalHeight", { configurable: true, value: 720 });
    fireEvent.load(img);
    expect(img.getAttribute("src")).toContain("maxresdefault.jpg");
  });

  it("gives a vertical video a 9 / 16 media box", () => {
    const { container } = render(
      <WorkTile work={{ ...video, orientation: "vertical" }} onOpen={() => {}} />,
    );
    const box = container.querySelector("[data-media]") as HTMLElement;
    expect(box.style.aspectRatio).toBe("9 / 16");
  });

  it("labels a short film and shows the play marker", () => {
    const { container } = render(
      <WorkTile
        work={makeWork({
          category: "short_film",
          title: "Reel",
          student: "Ana Cruz",
          image_url: "https://cdn.test/poster.jpg",
          video_url: "https://cdn.test/reel.webm",
          image_width: 1920,
          image_height: 1080,
          orientation: "vertical",
        })}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText("Short film")).toBeTruthy();
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://cdn.test/poster.jpg");
    expect(
      container.querySelector("[data-play]")?.getAttribute("aria-hidden"),
    ).toBe("true");
    const box = container.querySelector("[data-media]") as HTMLElement;
    const [width, height = "1"] = box.style.aspectRatio.split("/");
    expect(Number(width) / Number(height)).toBeCloseTo(1920 / 1080);
  });

  it("shows a sound cover with an audio marker", () => {
    const { container } = render(
      <WorkTile
        work={makeWork({
          category: "sound_design",
          image_url: "https://cdn.test/cover.jpg",
        })}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText("Sound design")).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.test/cover.jpg",
    );
    expect(container.querySelector("[data-audio]")).toBeTruthy();
    expect(container.querySelector("[data-play]")).toBeNull();
  });

  it("lazy-loads images with explicit dimensions", () => {
    const { container } = render(<WorkTile work={makeWork()} onOpen={() => {}} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("width")).toBeTruthy();
    expect(img.getAttribute("height")).toBeTruthy();
  });
});
