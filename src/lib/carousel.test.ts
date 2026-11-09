import { describe, expect, it } from "vitest";
import { centerSlide, swipeStep, wrapIndex } from "./carousel";

describe("wrapIndex", () => {
  it("loops past both ends", () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(1, 3)).toBe(1);
  });

  it("is 0 when there's nothing to show", () => {
    expect(wrapIndex(5, 0)).toBe(0);
  });
});

describe("swipeStep", () => {
  it("goes next on a swipe left and back on a swipe right", () => {
    expect(swipeStep(-80, 10)).toBe(1);
    expect(swipeStep(80, -10)).toBe(-1);
  });

  it("ignores taps and short drags", () => {
    expect(swipeStep(-20, 0)).toBe(0);
  });

  it("ignores mostly vertical movement, which is scrolling", () => {
    expect(swipeStep(-60, 140)).toBe(0);
  });
});

describe("centerSlide", () => {
  it("moves the track so the slide's middle sits in the viewport's middle", () => {
    expect(centerSlide(0)).toBe(
      "translateX(calc(50% - 0.5 * var(--slide) - 0 * var(--gap)))",
    );
    expect(centerSlide(2)).toBe(
      "translateX(calc(50% - 2.5 * var(--slide) - 2 * var(--gap)))",
    );
  });
});
