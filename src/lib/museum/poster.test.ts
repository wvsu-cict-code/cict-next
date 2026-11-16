import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { capturePoster, readVideoOrientation } from "./poster";

describe("poster load timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("releases the object URL when the video never loads", async () => {
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const create = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test-video");

    const video = document.createElement("video");
    Object.defineProperty(video, "load", {
      value: vi.fn(),
      configurable: true,
    });
    const createElement = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "video") return video;
        return document.createElementNS("http://www.w3.org/1999/xhtml", tag);
      });

    const file = new File([new Uint8Array([1])], "slow.webm", {
      type: "video/webm",
    });
    const pending = capturePoster(file);
    const expectation = expect(pending).rejects.toThrow(
      /took too long to load/,
    );
    await vi.advanceTimersByTimeAsync(10_000);
    await expectation;

    expect(create).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith("blob:test-video");
    createElement.mockRestore();
  });

  it("rejects when video dimensions stay zero after load", async () => {
    vi.useRealTimers();
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:zero");

    const video = document.createElement("video");
    Object.defineProperty(video, "videoWidth", { get: () => 0 });
    Object.defineProperty(video, "videoHeight", { get: () => 0 });
    Object.defineProperty(video, "load", {
      value: vi.fn(),
      configurable: true,
    });
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "video") return video;
      return document.createElementNS("http://www.w3.org/1999/xhtml", tag);
    });

    const file = new File([new Uint8Array([1])], "zero.webm", {
      type: "video/webm",
    });
    const pending = readVideoOrientation(file);
    queueMicrotask(() => {
      video.onloadeddata?.(new Event("loadeddata") as Event);
    });
    await expect(pending).rejects.toThrow(/dimensions/);
    expect(revoke).toHaveBeenCalledWith("blob:zero");
  });
});
