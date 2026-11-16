import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const uiDir = path.resolve(import.meta.dirname);
const globalsCss = path.resolve(import.meta.dirname, "../../app/globals.css");

describe("shadcn/ui tokens", () => {
  it("shadcn components never use the accent token", () => {
    const files = readdirSync(uiDir).filter(
      (name) => name.endsWith(".tsx") || name.endsWith(".ts"),
    );
    const components = files.filter((name) => !name.endsWith(".test.ts"));
    expect(components.length).toBeGreaterThan(0);

    for (const name of components) {
      const source = readFileSync(path.join(uiDir, name), "utf8");
      expect(source, `${name} uses the accent token`).not.toMatch(
        /\b(bg|text|border|ring|from|to)-accent(-foreground)?\b/,
      );
    }
  });

  it("globals.css keeps the site accent", () => {
    const css = readFileSync(globalsCss, "utf8");
    const theme = css.match(/@theme\s*\{[\s\S]*?\n\}/);
    expect(theme?.[0]).toContain("--color-accent: #ba3d1b;");
    expect(css).not.toMatch(/\.dark\s*\{/);
  });
});
