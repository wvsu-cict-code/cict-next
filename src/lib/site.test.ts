import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl, yearsOfService } from "@/lib/site";

describe("siteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("prefixes the public site's address", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://cict.wvsu.edu.ph");
    expect(siteUrl("/programs/bscs")).toBe(
      "https://cict.wvsu.edu.ph/programs/bscs",
    );
  });

  it("does not double a trailing slash in the address", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://cict.wvsu.edu.ph/");
    expect(siteUrl("/programs/bscs")).toBe(
      "https://cict.wvsu.edu.ph/programs/bscs",
    );
  });

  it("keeps links relative when the address is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl("/programs/bscs")).toBe("/programs/bscs");
  });
});

describe("yearsOfService", () => {
  it("counts whole years since the 2002 founding", () => {
    expect(yearsOfService(new Date("2026-10-30"))).toBe(24);
    expect(yearsOfService(new Date("2027-01-01"))).toBe(25);
  });
});
