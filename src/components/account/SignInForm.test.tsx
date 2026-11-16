import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignInForm } from "./SignInForm";
import { safeNextPath } from "@/lib/auth/next";

const signIn = vi.fn();
const replace = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/client", () => ({
  signIn: (...a: unknown[]) => signIn(...a),
}));

function submit() {
  fireEvent.change(screen.getByLabelText("WVSU email"), {
    target: { value: "ana@wvsu.edu.ph" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

afterEach(cleanup);

describe("SignInForm", () => {
  beforeEach(() => {
    signIn.mockReset().mockResolvedValue({});
    replace.mockReset();
    search = "";
  });

  it("sign-in redirects to a safe next path", async () => {
    search = "next=/museum/submit/";
    render(<SignInForm />);
    submit();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/museum/submit/"),
    );
  });

  it("sign-in ignores //evil.com and defaults to /account/", async () => {
    search = "next=//evil.com";
    render(<SignInForm />);
    submit();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/account/"));
  });

  it("shows an error and does not redirect", async () => {
    signIn.mockResolvedValue({ error: "That email and password don't match." });
    render(<SignInForm />);
    submit();
    expect((await screen.findByRole("alert")).textContent).toContain(
      "don't match",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("safeNextPath", () => {
  it.each([
    [null, "/account/"],
    ["", "/account/"],
    ["/a/b/", "/a/b/"],
    ["//evil.com", "/account/"],
    ["/\\evil.com", "/account/"],
    ["https://evil.com", "/account/"],
    ["javascript:alert(1)", "/account/"],
    ["museum", "/account/"],
  ])("%s -> %s", (input, out) => {
    expect(safeNextPath(input)).toBe(out);
  });
});
