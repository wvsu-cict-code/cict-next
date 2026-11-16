import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";

const KEY = "cict.museum.settings.v1";

function matchMedia(coarse: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: coarse && query === "(pointer: coarse)",
    media: query,
  })) as unknown as typeof window.matchMedia;
}

describe("museum settings", () => {
  beforeEach(() => {
    localStorage.clear();
    matchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("loadSettings repairs out-of-range and unparseable values", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      lookSensitivity: 1,
      moveSpeed: 1,
      invertLook: false,
      quality: "high",
    });

    localStorage.setItem(KEY, "{");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);

    localStorage.setItem(KEY, "null");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);

    localStorage.setItem(
      KEY,
      JSON.stringify({
        lookSensitivity: 9,
        moveSpeed: 0.1,
        invertLook: "yes",
        quality: "ultra",
      }),
    );
    expect(loadSettings()).toEqual({
      lookSensitivity: 2,
      moveSpeed: 0.5,
      invertLook: false,
      quality: "high",
    });

    localStorage.setItem(
      KEY,
      JSON.stringify({
        lookSensitivity: 0.5,
        moveSpeed: 2,
        invertLook: true,
        quality: "low",
      }),
    );
    expect(loadSettings()).toEqual({
      lookSensitivity: 0.5,
      moveSpeed: 2,
      invertLook: true,
      quality: "low",
    });

    saveSettings({
      lookSensitivity: 1.5,
      moveSpeed: 0.75,
      invertLook: true,
      quality: "low",
    });
    expect(localStorage.getItem(KEY)).toBe(
      JSON.stringify({
        lookSensitivity: 1.5,
        moveSpeed: 0.75,
        invertLook: true,
        quality: "low",
      }),
    );
    expect(loadSettings()).toEqual({
      lookSensitivity: 1.5,
      moveSpeed: 0.75,
      invertLook: true,
      quality: "low",
    });
  });

  it("loadSettings falls back to defaults when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);

    vi.mocked(Storage.prototype.getItem).mockRestore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
  });

  it("quality defaults to low on a coarse pointer", () => {
    matchMedia(true);
    expect(loadSettings()).toEqual({
      lookSensitivity: 1,
      moveSpeed: 1,
      invertLook: false,
      quality: "low",
    });

    localStorage.setItem(
      KEY,
      JSON.stringify({
        lookSensitivity: 1,
        moveSpeed: 1,
        invertLook: false,
        quality: "high",
      }),
    );
    expect(loadSettings().quality).toBe("high");
  });
});
