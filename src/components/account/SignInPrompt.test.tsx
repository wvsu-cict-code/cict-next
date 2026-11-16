import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignInPrompt } from "./SignInPrompt";

vi.mock("next/navigation", () => ({
  usePathname: () => "/programs/bsemc/museum/",
  useSearchParams: () => new URLSearchParams("exhibit=w1"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const next = encodeURIComponent("/programs/bsemc/museum/?exhibit=w1");

describe("SignInPrompt", () => {
  it("offers sign in and create account for the current url", () => {
    render(<SignInPrompt open onOpenChange={() => {}} />);
    expect(
      screen.getByText("Sign in with your WVSU account to like exhibits."),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Sign In" }).getAttribute("href")).toBe(
      `/account/sign-in/?next=${next}`,
    );
    expect(
      screen.getByRole("link", { name: "Create account" }).getAttribute("href"),
    ).toBe(`/account/sign-up/?next=${next}`);
  });
});
