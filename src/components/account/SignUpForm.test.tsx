import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignUpForm } from "./SignUpForm";

const signUp = vi.fn();
vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({
    auth: { signUp: (...a: unknown[]) => signUp(...a) },
  }),
}));

function fill(name: string, email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("WVSU email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
}

afterEach(cleanup);

describe("SignUpForm", () => {
  beforeEach(() => signUp.mockReset());

  it("sign-up shows the WVSU error as soon as a non-WVSU email is submitted", async () => {
    render(<SignUpForm />);
    fill("Ana", "ana@gmail.com", "password123");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Use your WVSU email address (@wvsu.edu.ph) to sign up.",
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("requires a name", async () => {
    render(<SignUpForm />);
    fill("  ", "ana@wvsu.edu.ph", "password123");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Enter your name.",
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("sign-up success tells the user to check their email", async () => {
    signUp.mockResolvedValue({ error: null });
    render(<SignUpForm />);
    fill("Ana", "ana@wvsu.edu.ph", "password123");
    await waitFor(() =>
      expect(
        screen.getByText(
          "Check your email for a link to confirm your account.",
        ),
      ).toBeTruthy(),
    );
  });

  it("shows a server error", async () => {
    signUp.mockResolvedValue({
      error: "Use a password of at least 8 characters.",
    });
    render(<SignUpForm />);
    fill("Ana", "ana@wvsu.edu.ph", "short");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "at least 8",
    );
  });
});
