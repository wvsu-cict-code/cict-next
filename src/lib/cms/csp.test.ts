import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/lib/cms/csp";

const directive = (policy: string, name: string) =>
  policy.split("; ").find((d) => d.startsWith(`${name} `));
const scriptSrc = (policy: string) => directive(policy, "script-src");

describe("contentSecurityPolicy", () => {
  it("allows eval in development, which React needs for debugging", () => {
    const policy = contentSecurityPolicy("abc", { isDev: true });
    expect(scriptSrc(policy)).toBe(
      "script-src 'self' 'nonce-abc' 'strict-dynamic' 'unsafe-eval'",
    );
  });

  it("never allows eval in production", () => {
    const policy = contentSecurityPolicy("abc", { isDev: false });
    expect(scriptSrc(policy)).toBe(
      "script-src 'self' 'nonce-abc' 'strict-dynamic'",
    );
  });

  it("allows inline styles in development, for Next's dev tools", () => {
    const policy = contentSecurityPolicy("abc", { isDev: true });
    // Browsers ignore 'unsafe-inline' when a nonce is present, so no nonce here
    expect(directive(policy, "style-src")).toBe(
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    );
  });

  it("only allows nonced styles in production", () => {
    const policy = contentSecurityPolicy("abc", { isDev: false });
    expect(directive(policy, "style-src")).toBe(
      "style-src 'self' 'nonce-abc' https://fonts.googleapis.com",
    );
  });

  it("allows images from Supabase Storage", () => {
    const policy = contentSecurityPolicy("abc", {
      isDev: false,
      supabaseOrigin: "https://x.supabase.co",
    });
    expect(policy).toContain(
      "img-src 'self' blob: data: https://x.supabase.co;",
    );
  });
});
