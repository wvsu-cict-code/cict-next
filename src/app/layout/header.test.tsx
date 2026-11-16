import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header, { programLinks } from "@/app/layout/header";

let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
let session: {
  status: "loading" | "signed-out" | "signed-in";
  user: object | null;
  displayName: string | null;
} = { status: "signed-out", user: null, displayName: null };
vi.mock("@/lib/auth/session", () => ({ useSession: () => session }));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/museum/notifications", () => ({
  fetchNotifications: async () => [],
  markAllNotificationsRead: async () => {},
}));
vi.mock("@/lib/cms/useContent", () => ({
  useContent: () => ({ status: "loading" }),
}));

const highlighted = (name: string) =>
  screen
    .getAllByRole("link", { name })
    .map((link) => link.className.split(/\s+/).includes("text-accent"));

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

  it("shows Virtual Museum in the nav and marks it current on the museum page only", () => {
    pathname = "/programs/bsemc/museum/";
    render(<Header />);
    expect(highlighted("Virtual Museum")).not.toContain(false);
    expect(highlighted("Programs")).not.toContain(true);
    cleanup();
    pathname = "/programs/bsemc";
    render(<Header />);
    expect(highlighted("Virtual Museum")).not.toContain(true);
    expect(highlighted("Programs")).not.toContain(false);
  });

  it("signed-out header links Sign In with next set to the current page", () => {
    pathname = "/events/";
    session = { status: "signed-out", user: null, displayName: null };
    render(<Header />);
    // next/link adds the trailing slash itself when trailingSlash is on
    expect(
      screen.getAllByRole("link", { name: /Sign In/ })[0].getAttribute("href"),
    ).toMatch(/^\/account\/sign-in\/?\?next=%2Fevents%2F$/);
  });

  it("renders neither Sign In nor the account menu while loading", () => {
    pathname = "/";
    session = { status: "loading", user: null, displayName: null };
    render(<Header />);
    expect(screen.queryByRole("link", { name: /Sign In/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /account/i })).toBeNull();
  });

  it("signed-in header shows the account menu and the bell", () => {
    pathname = "/";
    session = {
      status: "signed-in",
      user: { email: "a@wvsu.edu.ph" },
      displayName: "Ana",
    };
    render(<Header />);
    expect(screen.getByRole("button", { name: /account menu/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /notifications/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Sign In/ })).toBeNull();
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
