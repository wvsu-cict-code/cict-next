import { afterEach, describe, expect, it, vi } from "vitest";
import { exhibitUrl, shareExhibit } from "./share";

describe("shareExhibit", () => {
  afterEach(() => vi.restoreAllMocks());

  it("copies the link when share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = navigator.share;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
      await expect(
        shareExhibit({ id: "abc", title: "Sunrise" }, "https://cict.test"),
      ).resolves.toBe("copied");
      expect(writeText).toHaveBeenCalledWith(
        "https://cict.test/programs/bsemc/museum/?exhibit=abc",
      );
      expect(exhibitUrl("abc", "https://cict.test")).toBe(
        "https://cict.test/programs/bsemc/museum/?exhibit=abc",
      );
    } finally {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: share,
      });
    }
  });

  it("uses the system share sheet when it is available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    await expect(
      shareExhibit({ id: "abc", title: "Sunrise" }, "https://cict.test"),
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Sunrise",
      url: "https://cict.test/programs/bsemc/museum/?exhibit=abc",
    });
    expect(writeText).not.toHaveBeenCalled();
  });
});
