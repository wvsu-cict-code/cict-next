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
    fireEvent.click(screen.getByTestId("spotlight-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("swipes to the next work and down to close", () => {
    const { onIndexChange, onClose } = setup();
    drag(screen.getByTestId("spotlight-media"), -80, 0);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    drag(screen.getByTestId("spotlight-media"), 0, 120);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("moves focus into the dialog on open", () => {
    setup();
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });
});
