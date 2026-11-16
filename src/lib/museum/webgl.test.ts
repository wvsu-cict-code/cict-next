import { afterEach, describe, expect, it, vi } from "vitest";
import { hasWebGL } from "./webgl";

describe("hasWebGL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hasWebGL tries webgl2 and then webgl", () => {
    const getContext = vi.fn((kind: string) =>
      kind === "webgl2" ? { kind } : null,
    );
    const original = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas")
        return { getContext } as unknown as HTMLCanvasElement;
      return original(tag);
    });

    expect(hasWebGL()).toBe(true);
    expect(getContext.mock.calls.map((call) => call[0])).toEqual(["webgl2"]);

    getContext.mockClear();
    getContext.mockImplementation((kind: string) =>
      kind === "webgl" ? { kind } : null,
    );
    expect(hasWebGL()).toBe(true);
    expect(getContext.mock.calls.map((call) => call[0])).toEqual([
      "webgl2",
      "webgl",
    ]);

    getContext.mockReset();
    getContext.mockReturnValue(null);
    expect(hasWebGL()).toBe(false);
    expect(getContext.mock.calls.map((call) => call[0])).toEqual([
      "webgl2",
      "webgl",
    ]);

    vi.mocked(document.createElement).mockImplementation(() => {
      throw new Error("no canvas");
    });
    expect(hasWebGL()).toBe(false);
  });
});
