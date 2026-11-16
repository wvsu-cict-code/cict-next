import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/seo";

describe("resolveSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL when set, without a trailing slash", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://cict.wvsu.edu.ph/",
        VERCEL_PROJECT_PRODUCTION_URL: "cict-next.vercel.app",
      }),
    ).toBe("https://cict.wvsu.edu.ph");
  });

  it("points a Vercel deployment without a site address at its own domain", () => {
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "cict-next.vercel.app" }),
    ).toBe("https://cict-next.vercel.app");
  });

  it("always uses the school domain for the school site build", () => {
    expect(
      resolveSiteUrl({
        BUILD_TARGET: "site",
        VERCEL_PROJECT_PRODUCTION_URL: "cict-next.vercel.app",
      }),
    ).toBe("https://cict.wvsu.edu.ph");
  });

  it("falls back to the school domain", () => {
    expect(resolveSiteUrl({})).toBe("https://cict.wvsu.edu.ph");
  });
});
