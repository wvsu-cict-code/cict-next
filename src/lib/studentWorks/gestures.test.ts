import { describe, expect, it } from "vitest";
import { classifySwipe } from "@/lib/studentWorks/gestures";

describe("classifySwipe", () => {
  it("swipes horizontally between works", () => {
    expect(classifySwipe(-80, 5, false)).toBe("next");
    expect(classifySwipe(80, 5, false)).toBe("previous");
  });

  it("closes on a downward swipe only", () => {
    expect(classifySwipe(5, 120, false)).toBe("close");
    expect(classifySwipe(5, -120, false)).toBeNull();
  });

  it("ignores short swipes", () => {
    expect(classifySwipe(-30, 0, false)).toBeNull();
  });

  it("never fires while zoomed", () => {
    expect(classifySwipe(-200, 0, true)).toBeNull();
    expect(classifySwipe(0, 200, true)).toBeNull();
  });
});
