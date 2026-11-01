import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "./fixtures";
import { ZoomableImage } from "./ZoomableImage";

// jsdom has no layout: give every element (image and viewport) a 400×300 box.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ALT = "Sunrise by Ana Cruz";

function setup(work = makeWork()) {
  const onZoomedChange = vi.fn();
  const onParentPointerDown = vi.fn();
  const onParentPointerUp = vi.fn();
  const utils = render(
    <div onPointerDown={onParentPointerDown} onPointerUp={onParentPointerUp}>
      <ZoomableImage work={work} onZoomedChange={onZoomedChange} />
    </div>,
  );
  return { ...utils, onZoomedChange, onParentPointerDown, onParentPointerUp };
}

const button = (name: string) =>
  screen.getByRole("button", { name }) as HTMLButtonElement;
const transform = () => screen.getByTestId("zoom-image").style.transform;
const scale = () => Number(/scale\(([\d.]+)\)/.exec(transform())?.[1]);

function pointer(id: number, x: number, y: number, primary = id === 1) {
  return {
    pointerId: id,
    clientX: x,
    clientY: y,
    isPrimary: primary,
    pointerType: "touch",
  };
}

function tap(el: Element, x = 100, y = 100) {
  fireEvent.pointerDown(el, pointer(1, x, y));
  fireEvent.pointerUp(el, pointer(1, x, y));
}

describe("ZoomableImage", () => {
  it("names the image for the piece and its student", () => {
    setup();
    expect(screen.getByAltText(ALT).getAttribute("src")).toBe(
      "https://cdn.test/sunrise.jpg",
    );
  });

  it("disables Zoom out and Reset at scale 1 and Zoom in at the maximum", () => {
    setup();
    expect(button("Zoom in").disabled).toBe(false);
    expect(button("Zoom out").disabled).toBe(true);
    expect(button("Reset zoom").disabled).toBe(true);
    fireEvent.click(button("Zoom in"));
    fireEvent.click(button("Zoom in"));
    expect(scale()).toBe(4);
    expect(button("Zoom in").disabled).toBe(true);
    expect(button("Zoom out").disabled).toBe(false);
    expect(button("Reset zoom").disabled).toBe(false);
  });

  it("zooms in, out and resets with the buttons", () => {
    const { onZoomedChange } = setup();
    expect(scale()).toBe(1);
    fireEvent.click(button("Zoom in"));
    expect(scale()).toBe(2);
    expect(onZoomedChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(button("Zoom in"));
    fireEvent.click(button("Zoom out"));
    expect(scale()).toBe(2);
    fireEvent.click(button("Reset zoom"));
    expect(scale()).toBe(1);
    expect(transform()).toContain("translate(0px, 0px)");
    expect(onZoomedChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps keyboard focus on an enabled zoom button", () => {
    setup();
    button("Zoom in").focus();
    fireEvent.click(button("Zoom in"));
    fireEvent.click(button("Zoom in"));
    expect(document.activeElement).toBe(button("Zoom out"));
    button("Reset zoom").focus();
    fireEvent.click(button("Reset zoom"));
    expect(document.activeElement).toBe(button("Zoom in"));
  });

  it("toggles between 1 and 2 on double-click", () => {
    setup();
    const img = screen.getByAltText(ALT);
    fireEvent.doubleClick(img);
    expect(scale()).toBe(2);
    fireEvent.doubleClick(img);
    expect(scale()).toBe(1);
  });

  it("toggles on a double-tap without the follow-up dblclick undoing it", () => {
    setup();
    const img = screen.getByAltText(ALT);
    tap(img);
    tap(img);
    expect(scale()).toBe(2);
    fireEvent.doubleClick(img);
    expect(scale()).toBe(2);
    tap(img);
    tap(img);
    expect(scale()).toBe(1);
  });

  it("does not treat two taps far apart as a double-tap", () => {
    setup();
    const img = screen.getByAltText(ALT);
    tap(img, 10, 10);
    tap(img, 200, 200);
    expect(scale()).toBe(1);
  });

  it("loads the zoom version only once zoomed and swaps it in when loaded", () => {
    const zoomUrl = "https://cdn.test/sunrise-zoom.webp";
    const { container } = setup(
      makeWork({ zoom_url: zoomUrl, zoom_width: 3200, zoom_height: 2400 }),
    );
    const selector = `img[src="${zoomUrl}"]`;
    expect(container.querySelector(selector)).toBeNull();
    fireEvent.click(button("Zoom in"));
    const zoomImg = container.querySelector(selector)!;
    expect(zoomImg).toBeTruthy();
    expect(screen.getByAltText(ALT).getAttribute("src")).toBe(
      "https://cdn.test/sunrise.jpg",
    );
    fireEvent.load(zoomImg);
    expect(screen.getByAltText(ALT).getAttribute("src")).toBe(zoomUrl);
  });

  it("keeps the display image when there is no zoom version", () => {
    const { container } = setup();
    fireEvent.click(button("Zoom in"));
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByAltText(ALT).getAttribute("src")).toBe(
      "https://cdn.test/sunrise.jpg",
    );
  });

  it("pans with a single-pointer drag while zoomed, without bubbling", () => {
    const { onParentPointerDown, onParentPointerUp } = setup();
    fireEvent.click(button("Zoom in"));
    onParentPointerDown.mockClear();
    const img = screen.getByAltText(ALT);
    fireEvent.pointerDown(img, pointer(1, 200, 200));
    fireEvent.pointerMove(img, pointer(1, 150, 180));
    fireEvent.pointerUp(img, pointer(1, 150, 180));
    expect(transform()).toBe("translate(-50px, -20px) scale(2)");
    expect(onParentPointerDown).not.toHaveBeenCalled();
    expect(onParentPointerUp).not.toHaveBeenCalled();
  });

  it("can't drag the image out of view", () => {
    setup();
    fireEvent.click(button("Zoom in"));
    const img = screen.getByAltText(ALT);
    fireEvent.pointerDown(img, pointer(1, 200, 200));
    fireEvent.pointerMove(img, pointer(1, 900, 900));
    fireEvent.pointerUp(img, pointer(1, 900, 900));
    // Fitted 400×300 at ×2 in a 400×300 viewport: at most 200 and 150 each way.
    expect(transform()).toBe("translate(200px, 150px) scale(2)");
  });

  it("lets single-pointer gestures through at scale 1", () => {
    const { onParentPointerDown, onParentPointerUp } = setup();
    const img = screen.getByAltText(ALT);
    fireEvent.pointerDown(img, pointer(1, 200, 200));
    fireEvent.pointerUp(img, pointer(1, 120, 200));
    expect(onParentPointerDown).toHaveBeenCalledTimes(1);
    expect(onParentPointerUp).toHaveBeenCalledTimes(1);
    expect(scale()).toBe(1);
  });

  it("pinches to zoom and never bubbles the pinch's ending", () => {
    const { onZoomedChange, onParentPointerUp } = setup();
    const img = screen.getByAltText(ALT);
    fireEvent.pointerDown(img, pointer(1, 150, 150));
    fireEvent.pointerDown(img, pointer(2, 250, 150));
    fireEvent.pointerMove(img, pointer(2, 350, 150));
    expect(scale()).toBe(2);
    expect(onZoomedChange).toHaveBeenLastCalledWith(true);
    // Pinch back out to 1, then lift both fingers.
    fireEvent.pointerMove(img, pointer(2, 200, 150));
    expect(scale()).toBe(1);
    fireEvent.pointerUp(img, pointer(2, 200, 150));
    fireEvent.pointerUp(img, pointer(1, 150, 150));
    expect(onParentPointerUp).not.toHaveBeenCalled();
  });

  it("zooms with the scroll wheel and keeps the page from scrolling", () => {
    setup();
    const viewport = screen.getByTestId("zoom-viewport");
    const notCancelled = fireEvent.wheel(viewport, {
      deltaY: -300,
      clientX: 0,
      clientY: 0,
    });
    expect(notCancelled).toBe(false);
    expect(scale()).toBeGreaterThan(1);
    fireEvent.wheel(viewport, { deltaY: 3000, clientX: 0, clientY: 0 });
    expect(scale()).toBe(1);
  });

  it("pans with a two-finger trackpad scroll while zoomed", () => {
    setup();
    fireEvent.click(button("Zoom in"));
    const viewport = screen.getByTestId("zoom-viewport");
    const notCancelled = fireEvent.wheel(viewport, { deltaX: 30, deltaY: 10 });
    expect(notCancelled).toBe(false);
    expect(transform()).toBe("translate(-30px, -10px) scale(2)");
    // Later events in the same stream pan even without sideways movement.
    fireEvent.wheel(viewport, { deltaX: 0, deltaY: 20 });
    expect(transform()).toBe("translate(-30px, -30px) scale(2)");
  });

  it("keeps zooming with a mouse wheel or trackpad pinch while zoomed", () => {
    setup();
    fireEvent.click(button("Zoom in"));
    const viewport = screen.getByTestId("zoom-viewport");
    fireEvent.wheel(viewport, { deltaY: -100, clientX: 0, clientY: 0 });
    expect(scale()).toBeGreaterThan(2);
    const afterWheel = scale();
    fireEvent.wheel(viewport, {
      deltaX: 3,
      deltaY: -5,
      ctrlKey: true,
      clientX: 0,
      clientY: 0,
    });
    expect(scale()).toBeGreaterThan(afterWheel);
  });

  it("only promotes the image layer for gestures that move it", () => {
    setup();
    const img = screen.getByAltText(ALT);
    const willChange = () => screen.getByTestId("zoom-image").style.willChange;
    fireEvent.pointerDown(img, pointer(1, 200, 200));
    expect(willChange()).toBe("auto");
    fireEvent.pointerDown(img, pointer(2, 260, 200));
    expect(willChange()).toBe("transform");
    fireEvent.pointerUp(img, pointer(2, 260, 200));
    fireEvent.pointerUp(img, pointer(1, 200, 200));
    expect(willChange()).toBe("auto");
    fireEvent.click(button("Zoom in"));
    fireEvent.pointerDown(img, pointer(3, 200, 200));
    expect(willChange()).toBe("transform");
    fireEvent.pointerUp(img, pointer(3, 200, 200));
    expect(willChange()).toBe("auto");
  });

  it("keeps the image in view when the viewport resizes", () => {
    let resized: (() => void) | undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    try {
      setup();
      fireEvent.click(button("Zoom in"));
      const img = screen.getByAltText(ALT);
      fireEvent.pointerDown(img, pointer(1, 200, 200));
      fireEvent.pointerMove(img, pointer(1, 900, 200));
      fireEvent.pointerUp(img, pointer(1, 900, 200));
      expect(transform()).toBe("translate(200px, 0px) scale(2)");
      // Image and viewport shrink to 200 wide: at ×2 the limit is 100.
      vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
        200,
      );
      act(() => resized!());
      expect(transform()).toBe("translate(100px, 0px) scale(2)");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("resets the zoom when the work changes", () => {
    const onZoomedChange = vi.fn();
    const { rerender } = render(
      <ZoomableImage
        work={makeWork({ id: "a" })}
        onZoomedChange={onZoomedChange}
      />,
    );
    fireEvent.click(button("Zoom in"));
    expect(scale()).toBe(2);
    rerender(
      <ZoomableImage
        work={makeWork({ id: "b", title: "Dusk", student: "Ben" })}
        onZoomedChange={onZoomedChange}
      />,
    );
    expect(scale()).toBe(1);
    expect(onZoomedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByAltText("Dusk by Ben")).toBeTruthy();
    expect(button("Reset zoom").disabled).toBe(true);
  });
});
