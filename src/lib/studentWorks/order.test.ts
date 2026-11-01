import { describe, expect, it } from "vitest";
import { moveItem } from "@/lib/studentWorks/order";

describe("moveItem", () => {
  const list = ["a", "b", "c"];

  it("moves forward and backward", () => {
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(list, 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("returns a new array when nothing moves", () => {
    const result = moveItem(list, 1, 1);
    expect(result).toEqual(list);
    expect(result).not.toBe(list);
  });

  it("clamps an out-of-range target", () => {
    expect(moveItem(list, 0, 99)).toEqual(["b", "c", "a"]);
    expect(moveItem(list, 2, -5)).toEqual(["c", "a", "b"]);
  });

  it("does not mutate the input", () => {
    moveItem(list, 0, 2);
    expect(list).toEqual(["a", "b", "c"]);
  });
});
