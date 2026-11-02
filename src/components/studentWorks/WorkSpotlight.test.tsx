import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { storeLabel } from "@/lib/studentWorks/links";
import { youtubeEmbedUrl } from "@/lib/studentWorks/youtube";
import { makeWork } from "./fixtures";
import { WorkSpotlight } from "./WorkSpotlight";

afterEach(cleanup);

type Props = Partial<Parameters<typeof WorkSpotlight>[0]>;

function setup(props: Props = {}) {
  const onIndexChange = vi.fn();
  const onClose = vi.fn();
  const loadMore = vi.fn().mockResolvedValue(true);
  const works = props.works ?? [
    makeWork({ id: "a", title: "Sunrise", student: "Ana Cruz", description: "Morning light" }),
    makeWork({ id: "b", title: "Second", student: "Ben" }),
    makeWork({ id: "c", title: "Third", student: "Cy" }),
  ];
  render(
    <WorkSpotlight
      works={works}
      total={20}
      index={1}
      onIndexChange={onIndexChange}
      onClose={onClose}
      loadMore={loadMore}
      {...props}
    />,
  );
  return { onIndexChange, onClose, loadMore };
}

function drag(el: Element, dx: number, dy: number) {
  const base = { pointerId: 1, isPrimary: true, pointerType: "touch" };
  fireEvent.pointerDown(el, { ...base, clientX: 200, clientY: 200 });
  fireEvent.pointerMove(el, { ...base, clientX: 200 + dx, clientY: 200 + dy });
  fireEvent.pointerUp(el, { ...base, clientX: 200 + dx, clientY: 200 + dy });
}

describe("WorkSpotlight", () => {
  it("renders an accessible dialog with the work's details", () => {
    setup({ index: 0, total: 20 });
    const dialog = screen.getByRole("dialog", { name: "Sunrise" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("Digital art")).toBeTruthy();
    expect(screen.getByText("Ana Cruz")).toBeTruthy();
    expect(screen.getByText("Morning light")).toBeTruthy();
    expect(screen.getByText("1 of 20")).toBeTruthy();
  });

  it("shows the portfolio link only when set", () => {
    setup({ works: [makeWork({ portfolio_url: "https://folio.test" })], index: 0, total: 1 });
    const link = screen.getByRole("link", { name: "View portfolio" });
    expect(link.getAttribute("href")).toBe("https://folio.test");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    cleanup();
    setup({ works: [makeWork()], index: 0, total: 1 });
    expect(screen.queryByRole("link", { name: "View portfolio" })).toBeNull();
  });

  it("shows a store button for a game", () => {
    const url = "https://x.itch.io/game";
    setup({ works: [makeWork({ kind: "game", store_url: url })], index: 0, total: 1 });
    const link = screen.getByRole("link", { name: storeLabel(url) });
    expect(link.getAttribute("href")).toBe(url);
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it.each([
    ["vertical", "9 / 16"],
    ["landscape", "16 / 9"],
  ])("embeds a %s video", (orientation, ratio) => {
    setup({
      works: [
        makeWork({ kind: "video", youtube_id: "abcdefghijk", orientation: orientation as "vertical" }),
      ],
      index: 0,
      total: 1,
    });
    const frame = document.querySelector("iframe")!;
    expect(frame.getAttribute("src")).toBe(youtubeEmbedUrl("abcdefghijk"));
    expect(frame.parentElement!.style.aspectRatio).toBe(ratio);
  });

  it("sizes a vertical frame from its height cap so it stays 9:16", () => {
    setup({
      works: [makeWork({ kind: "video", youtube_id: "abcdefghijk", orientation: "vertical" })],
      index: 0,
      total: 1,
    });
    const box = document.querySelector("iframe")!.parentElement!;
    expect(box.style.aspectRatio).toBe("9 / 16");
    expect(box.getAttribute("style")).toMatch(/width:\s*min\(100%,\s*calc\(var\(--video-cap\) \* 9 \/ 16\)\)/);
    expect(box.className).not.toMatch(/max-h-/);
  });

  it("shows a game screenshot without zoom controls", () => {
    setup({
      works: [makeWork({ kind: "game", title: "Quest", student: "Dee", store_url: "https://x.itch.io/q", zoom_url: "https://cdn.test/q-zoom.webp" })],
      index: 0,
      total: 1,
    });
    expect(screen.getByAltText("Quest by Dee")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
    expect(screen.queryByTestId("zoom-viewport")).toBeNull();
  });

  it("renders no iframe for art", () => {
    setup();
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByAltText("Second by Ben")).toBeTruthy();
  });

  it("navigates with arrow keys and buttons", () => {
    const { onIndexChange } = setup();
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    fireEvent.click(screen.getByRole("button", { name: "Previous work" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });

  it("disables Previous at the start and Next at the end", () => {
    setup({ index: 0, total: 20 });
    expect((screen.getByRole("button", { name: "Previous work" }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    setup({ index: 2, total: 3 });
    expect((screen.getByRole("button", { name: "Next work" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("loads more before advancing past the last loaded work", async () => {
    const { onIndexChange, loadMore } = setup({ index: 2 });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next work" }));
    });
    expect(loadMore).toHaveBeenCalled();
    expect(onIndexChange).toHaveBeenCalledWith(3);
  });

  it("stays put and says so when loading more fails", async () => {
    const loadMore = vi.fn().mockResolvedValue(false);
    const { onIndexChange } = setup({ index: 2, loadMore });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next work" }));
    });
    expect(onIndexChange).not.toHaveBeenCalled();
    expect(screen.getByText("Couldn't load more works.")).toBeTruthy();
  });

  it("closes on Escape, the close button and the backdrop only", () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("heading", { name: "Second" }));
    expect(onClose).toHaveBeenCalledTimes(2);
    const backdrop = screen.getByTestId("spotlight-backdrop");
    fireEvent.pointerDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("swipes to the next work and down to close", () => {
    const { onIndexChange, onClose } = setup();
    drag(screen.getByTestId("spotlight-media"), -80, 0);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    drag(screen.getByTestId("spotlight-media"), 0, 120);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("swipes between works from the details too, but never closes from there", () => {
    const { onIndexChange, onClose } = setup();
    const details = screen.getByTestId("spotlight-details");
    expect(details.style.touchAction).toBe("pan-y");
    drag(screen.getByRole("heading", { name: "Second" }), -80, 0);
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    drag(details, 80, 0);
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    drag(details, 0, 120);
    expect(onClose).not.toHaveBeenCalled();
    expect(onIndexChange).toHaveBeenCalledTimes(2);
  });

  it("ignores details swipes that start on a link or button, or use a mouse", () => {
    const { onIndexChange } = setup({
      works: [makeWork({ id: "a" }), makeWork({ id: "b", portfolio_url: "https://folio.test" })],
    });
    drag(screen.getByRole("link", { name: "View portfolio" }), -80, 0);
    const details = screen.getByTestId("spotlight-details");
    const mouse = { pointerId: 2, isPrimary: true, pointerType: "mouse" };
    fireEvent.pointerDown(details, { ...mouse, clientX: 200, clientY: 200 });
    fireEvent.pointerUp(details, { ...mouse, clientX: 100, clientY: 200 });
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("ignores a two-finger gesture on the details", () => {
    const { onIndexChange } = setup();
    const details = screen.getByTestId("spotlight-details");
    const touch = (id: number, x: number) => ({
      pointerId: id,
      clientX: x,
      clientY: 200,
      isPrimary: id === 1,
      pointerType: "touch",
    });
    fireEvent.pointerDown(details, touch(1, 200));
    fireEvent.pointerDown(details, touch(2, 260));
    fireEvent.pointerUp(details, touch(1, 100));
    fireEvent.pointerUp(details, touch(2, 260));
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("lets the details scroll vertically without chaining to the page", () => {
    setup({ works: [makeWork({ description: "Long text" })], index: 0, total: 1 });
    const scroller = screen.getByText("Long text").parentElement!;
    expect(scroller.className).toMatch(/overflow-y-auto/);
    expect(scroller.className).toMatch(/overscroll-contain/);
  });

  it("still swipes from the artwork itself at scale 1", () => {
    const { onIndexChange } = setup();
    drag(screen.getByAltText("Second by Ben"), -80, 0);
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it("pans instead of changing pieces while zoomed", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
    try {
      const { onIndexChange, onClose } = setup();
      fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
      const image = screen.getByAltText("Second by Ben");
      const before = screen.getByTestId("zoom-image").style.transform;
      drag(image, -80, 0);
      drag(image, 0, 120);
      expect(screen.getByTestId("zoom-image").style.transform).not.toBe(before);
      expect(onIndexChange).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("swipes again after leaving a zoomed artwork for a video", () => {
    const works = [
      makeWork({ id: "a", kind: "video", youtube_id: "abcdefghijk", image_url: null }),
      makeWork({ id: "b", title: "Second", student: "Ben" }),
    ];
    const onIndexChange = vi.fn();
    const props = { works, total: 2, onIndexChange, onClose: vi.fn(), loadMore: vi.fn() };
    const { rerender } = render(<WorkSpotlight {...props} index={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    rerender(<WorkSpotlight {...props} index={0} />);
    drag(screen.getByTestId("spotlight-media"), -80, 0);
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("doesn't fetch the next work's zoom image after zooming the current one", () => {
    const zoomA = "https://cdn.test/a-zoom.webp";
    const zoomB = "https://cdn.test/b-zoom.webp";
    const works = [
      makeWork({ id: "a", title: "First", student: "Ana", zoom_url: zoomA }),
      makeWork({ id: "b", title: "Second", student: "Ben", zoom_url: zoomB }),
    ];
    const props = { works, total: 2, onIndexChange: vi.fn(), onClose: vi.fn(), loadMore: vi.fn() };
    const { container, rerender } = render(<WorkSpotlight {...props} index={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(container.querySelector(`img[src="${zoomA}"]`)).toBeTruthy();

    const requested: string[] = [];
    const observer = new MutationObserver(() => {});
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });
    rerender(<WorkSpotlight {...props} index={1} />);
    for (const record of observer.takeRecords()) {
      if (record.type === "attributes") {
        requested.push((record.target as Element).getAttribute("src") ?? "");
      }
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        for (const img of [node, ...Array.from(node.querySelectorAll("img"))]) {
          if (img instanceof HTMLImageElement) requested.push(img.getAttribute("src") ?? "");
        }
      });
    }
    observer.disconnect();
    expect(requested).not.toContain(zoomB);
    expect(container.querySelector(`img[src="${zoomB}"]`)).toBeNull();
    expect(screen.getByAltText("Second by Ben")).toBeTruthy();
  });

  it("never treats a pinch as a swipe", () => {
    const { onIndexChange } = setup();
    const image = screen.getByAltText("Second by Ben");
    const touch = (id: number, x: number) => ({
      pointerId: id,
      clientX: x,
      clientY: 200,
      isPrimary: id === 1,
      pointerType: "touch",
    });
    fireEvent.pointerDown(image, touch(1, 200));
    fireEvent.pointerDown(image, touch(2, 260));
    fireEvent.pointerMove(image, touch(1, 100));
    fireEvent.pointerUp(image, touch(1, 100));
    fireEvent.pointerUp(image, touch(2, 260));
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("moves focus into the dialog on open", () => {
    setup();
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("does not close when a press started inside the panel ends on the backdrop", () => {
    const { onClose } = setup();
    fireEvent.pointerDown(screen.getByRole("heading", { name: "Second" }));
    fireEvent.click(screen.getByTestId("spotlight-backdrop"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores arrow keys with modifiers", () => {
    const { onIndexChange } = setup();
    fireEvent.keyDown(document, { key: "ArrowRight", altKey: true });
    fireEvent.keyDown(document, { key: "ArrowLeft", metaKey: true });
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("does not advance if closed while more works were loading", async () => {
    let resolve!: (ok: boolean) => void;
    const loadMore = vi.fn(() => new Promise<boolean>((r) => (resolve = r)));
    const { onIndexChange } = setup({ index: 2, loadMore });
    fireEvent.click(screen.getByRole("button", { name: "Next work" }));
    fireEvent.keyDown(document, { key: "Escape" });
    await act(async () => resolve(true));
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("does not jump forward if the visitor moved while more works were loading", async () => {
    let resolve!: (ok: boolean) => void;
    const loadMore = vi.fn(() => new Promise<boolean>((r) => (resolve = r)));
    const works = [makeWork({ id: "a" }), makeWork({ id: "b" }), makeWork({ id: "c" })];
    const onIndexChange = vi.fn();
    const props = { works, total: 20, onIndexChange, onClose: vi.fn(), loadMore };
    const { rerender } = render(<WorkSpotlight {...props} index={2} />);
    fireEvent.click(screen.getByRole("button", { name: "Next work" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous work" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    rerender(<WorkSpotlight {...props} index={1} />);
    await act(async () => resolve(true));
    expect(onIndexChange).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll while open and restores it on close", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <WorkSpotlight
        works={[makeWork()]}
        total={1}
        index={0}
        onIndexChange={vi.fn()}
        onClose={vi.fn()}
        loadMore={vi.fn()}
      />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  it("doesn't lock body scroll when there is no work to show", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <WorkSpotlight
        works={[makeWork()]}
        total={3}
        index={1}
        onIndexChange={vi.fn()}
        onClose={vi.fn()}
        loadMore={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
    unmount();
    document.body.style.overflow = "";
  });

  it("wraps Tab focus from the last control to the first and back", () => {
    setup({ works: [makeWork({ portfolio_url: "https://folio.test" })], index: 0, total: 1 });
    const dialog = screen.getByRole("dialog");
    const items = Array.from(
      dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    );
    const first = items[0];
    const last = items[items.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});
