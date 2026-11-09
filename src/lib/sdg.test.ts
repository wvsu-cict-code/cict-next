import { describe, expect, it } from "vitest";
import { SDGS, parseSdgs, sdgsFor } from "@/lib/sdg";

describe("SDGS", () => {
  it("lists the 17 goals in order", () => {
    expect(SDGS.map((goal) => goal.number)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    );
  });
});

describe("sdgsFor", () => {
  it("returns the goals in goal order, ignoring unknown numbers", () => {
    expect(sdgsFor([9, 4, 99]).map((goal) => goal.name)).toEqual([
      "Quality Education",
      "Industry, Innovation and Infrastructure",
    ]);
  });

  it("handles posts saved before goals existed", () => {
    expect(sdgsFor(undefined)).toEqual([]);
    expect(sdgsFor(null)).toEqual([]);
  });
});

describe("parseSdgs", () => {
  it("keeps valid goals once each, sorted", () => {
    expect(parseSdgs(["17", "4", "4", "9"])).toEqual([4, 9, 17]);
  });

  it("drops anything that isn't a goal number", () => {
    expect(parseSdgs(["0", "18", "abc", "", "3.5", "-1"])).toEqual([]);
  });
});
