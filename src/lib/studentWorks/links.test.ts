import { describe, expect, it } from "vitest";
import { isWebUrl, storeLabel } from "@/lib/studentWorks/links";

describe("storeLabel", () => {
  it.each([
    ["https://team-habol.itch.io/sinamay-run", "Play on itch.io"],
    ["https://play.google.com/store/apps/details?id=x", "Get it on Google Play"],
    ["https://apps.apple.com/ph/app/x/id1", "Download on the App Store"],
    ["https://example.com/game", "Play the game"],
    ["not a url", "Play the game"],
  ])("labels %s", (url, label) => {
    expect(storeLabel(url)).toBe(label);
  });
});

describe("isWebUrl", () => {
  it("accepts only http and https", () => {
    expect(isWebUrl("https://behance.net/x")).toBe(true);
    expect(isWebUrl("http://behance.net/x")).toBe(true);
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
    expect(isWebUrl("ftp://x")).toBe(false);
    expect(isWebUrl("nope")).toBe(false);
  });
});
