import { describe, expect, it } from "vitest";
import { BROCHURE, brochureFor } from "@/lib/programs/brochure";

describe("brochure programs", () => {
  it("covers the five degrees in the PAMCO brochure", () => {
    expect(BROCHURE.map((program) => program.code)).toEqual([
      "BSCS",
      "BSIT",
      "BSIS",
      "BSEMC",
      "BLIS",
    ]);
    expect(brochureFor("bscs")?.code).toBe("BSCS");
    expect(brochureFor("MIT")).toBeUndefined();
  });

  it("lists highlighted subjects for every year", () => {
    for (const program of BROCHURE) {
      const years = program.groups.filter((group) =>
        group.label.endsWith("Year"),
      );
      expect(years.map((group) => group.label)).toEqual([
        "First Year",
        "Second Year",
        "Third Year",
        "Fourth Year",
      ]);
      for (const group of program.groups) {
        expect(group.subjects.length).toBeGreaterThan(0);
        for (const subject of group.subjects) {
          expect(subject.code).toMatch(/[A-Z]/);
          expect(subject.title.length).toBeGreaterThan(3);
        }
      }
    }
  });

  it("keeps the licensure note and a specialization track", () => {
    expect(brochureFor("BLIS")?.highlight).toContain("LCBLE");
    expect(brochureFor("BLIS")?.lead).toContain("BLIS");
    const it = brochureFor("BSIT");
    expect(it?.groups.some((group) => group.label === "Cybersecurity")).toBe(
      true,
    );
    expect(
      it?.groups
        .find((group) => group.label === "Cybersecurity")
        ?.subjects.some((subject) => subject.code === "CIT 254"),
    ).toBe(true);
  });
});
