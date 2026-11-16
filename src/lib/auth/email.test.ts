import { describe, expect, it } from "vitest";
import { confirmUrl, isWvsuEmail, normalizeEmail } from "./email";

describe("isWvsuEmail", () => {
  it("accepts a WVSU address regardless of case and spacing", () => {
    expect(isWvsuEmail(" Ana@WVSU.edu.ph")).toBe(true);
  });

  it.each([
    "a@wvsu.edu.ph.evil.com",
    "a@student.wvsu.edu.ph",
    "wvsu.edu.ph",
    "@wvsu.edu.ph",
    "",
  ])("rejects %j", (email) => {
    expect(isWvsuEmail(email)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Ana@WVSU.edu.ph ")).toBe("ana@wvsu.edu.ph");
  });
});

describe("confirmUrl", () => {
  it("points at the confirm page with a trailing slash", () => {
    expect(confirmUrl("https://cict.example")).toBe(
      "https://cict.example/account/confirm/",
    );
  });
});
