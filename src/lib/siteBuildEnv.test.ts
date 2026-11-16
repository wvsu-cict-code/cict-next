import { describe, expect, it } from "vitest";
import { siteBuildEnvProblem } from "@/lib/siteBuildEnv.mjs";

const hosted = {
  NEXT_PUBLIC_SUPABASE_URL: "https://ztdtjgqfmloydxgrbyxo.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
};

describe("siteBuildEnvProblem", () => {
  it("accepts a hosted Supabase project", () => {
    expect(siteBuildEnvProblem(hosted)).toBeNull();
  });

  it("rejects missing settings", () => {
    expect(siteBuildEnvProblem({})).toMatch(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(
      siteBuildEnvProblem({
        ...hosted,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      }),
    ).toMatch(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });

  it("rejects a local Supabase, which visitors can't reach", () => {
    for (const url of ["http://127.0.0.1:54321", "http://localhost:54321"]) {
      expect(
        siteBuildEnvProblem({ ...hosted, NEXT_PUBLIC_SUPABASE_URL: url }),
      ).toMatch(/local Supabase/);
    }
  });

  it("rejects a URL that isn't one", () => {
    expect(
      siteBuildEnvProblem({ ...hosted, NEXT_PUBLIC_SUPABASE_URL: "not a url" }),
    ).toMatch(/isn't a valid URL/);
  });
});
