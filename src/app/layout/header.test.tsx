import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "@/app/layout/header";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const highlighted = (name: string) =>
  screen
    .getAllByRole("link", { name })
    .map((link) =>
      link.className.split(/\s+/).includes("text-[var(--color-orange-light)]"),
    );

describe("Header", () => {
  afterEach(cleanup);

  it("highlights the current section on the school site, where URLs end in a slash", () => {
    pathname = "/programs/";
    render(<Header />);
    expect(highlighted("PROGRAMS")).not.toContain(false);
    expect(highlighted("CONTACT")).not.toContain(true);
  });

  it("highlights the current section without a trailing slash (CMS deployment)", () => {
    pathname = "/contact";
    render(<Header />);
    expect(highlighted("CONTACT")).not.toContain(false);
  });
});
