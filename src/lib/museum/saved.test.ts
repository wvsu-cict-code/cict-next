import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSavedIds, toggleSaved, useSaved } from "./saved";

const KEY = "cict.museum.saved.v1";

describe("saved ids", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("survive a reload and fall back to empty when storage throws", () => {
    expect(toggleSaved("w1")).toEqual(["w1"]);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(["w1"]));
    expect(getSavedIds()).toEqual(["w1"]);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(getSavedIds()).toEqual([]);
    vi.mocked(Storage.prototype.getItem).mockRestore();

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => toggleSaved("w2")).not.toThrow();
    vi.mocked(Storage.prototype.setItem).mockRestore();
    expect(getSavedIds()).toEqual(["w1"]);

    localStorage.setItem(KEY, "{");
    expect(getSavedIds()).toEqual([]);
  });

  it("toggles off an id that is already saved", () => {
    toggleSaved("w1");
    expect(toggleSaved("w1")).toEqual([]);
    expect(getSavedIds()).toEqual([]);
  });
});

describe("useSaved", () => {
  beforeEach(() => localStorage.clear());

  it("reads stored ids and shares a toggle across callers", () => {
    toggleSaved("a");
    const first = renderHook(() => useSaved());
    const second = renderHook(() => useSaved());
    expect(first.result.current.ids).toEqual(["a"]);
    expect(first.result.current.isSaved("a")).toBe(true);
    expect(second.result.current.isSaved("b")).toBe(false);
    act(() => first.result.current.toggle("a"));
    expect(second.result.current.isSaved("a")).toBe(false);
    act(() => second.result.current.toggle("b"));
    expect(first.result.current.ids).toEqual(["b"]);
  });
});
