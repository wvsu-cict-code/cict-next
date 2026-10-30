import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header, { programLinks } from "@/app/layout/header";

let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/lib/cms/useContent", () => ({
  useContent: () => ({ status: "loading" }),
}));

const highlighted = (name: string) =>
  screen
    .getAllByRole("link", { name })
    .map((link) => link.className.split(/\s+/).includes("text-theme-red"));

describe("Header", () => {
  afterEach(cleanup);

  it("highlights the current section on the school site, where URLs end in a slash", () => {
    pathname = "/programs/";
    render(<Header />);
    expect(highlighted("Programs")).not.toContain(false);
    expect(highlighted("Contact")).not.toContain(true);
  });

  it("highlights the current section without a trailing slash (CMS deployment)", () => {
    pathname = "/contact";
    render(<Header />);
    expect(highlighted("Contact")).not.toContain(false);
  });

  it("sends Apply Now to the admissions page", () => {
    pathname = "/";
    render(<Header />);
    expect(
      screen.getByRole("link", { name: "Apply Now" }).getAttribute("href"),
    ).toBe("/admissions");
  });

  it("builds the programs menu from CMS programs with short names", () => {
    expect(
      programLinks([
        {
          id: "bscs",
          code: "BSCS",
          name: "Bachelor of Science in Computer Science",
        },
        {
          id: "blis",
          code: "BLIS",
          name: "Bachelor of Library and Information Science",
        },
        { id: "mit", code: "MIT", name: "Master in Information Technology" },
      ]),
    ).toEqual([
      { href: "/programs/bscs", code: "BSCS", name: "Computer Science" },
      {
        href: "/programs/blis",
        code: "BLIS",
        name: "Library and Information Science",
      },
      {
        href: "/programs/mit",
        code: "MIT",
        name: "Master in Information Technology",
      },
    ]);
  });
});
