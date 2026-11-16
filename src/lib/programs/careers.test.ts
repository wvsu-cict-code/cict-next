import { describe, expect, it } from "vitest";
import { parseCareers } from "./careers";

describe("parseCareers", () => {
  it("takes one career per line", () => {
    expect(parseCareers("Game developer\nAnimator")).toEqual([
      "Game developer",
      "Animator",
    ]);
  });

  it("trims, skips blank lines and handles Windows line endings", () => {
    expect(parseCareers("  Game developer \r\n\r\n\tAnimator\n  \n")).toEqual([
      "Game developer",
      "Animator",
    ]);
  });

  it("drops bullets people paste from documents", () => {
    expect(parseCareers("- Game developer\n• Animator\n* Level designer")).toEqual([
      "Game developer",
      "Animator",
      "Level designer",
    ]);
  });

  it("drops repeats, ignoring case", () => {
    expect(parseCareers("Animator\nanimator\nGame developer")).toEqual([
      "Animator",
      "Game developer",
    ]);
  });

  it("returns an empty list for empty text", () => {
    expect(parseCareers("")).toEqual([]);
    expect(parseCareers(" \n ")).toEqual([]);
  });
});
