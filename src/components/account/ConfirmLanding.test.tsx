import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmLanding } from "./ConfirmLanding";

const verifyEmailLink = vi.fn();
const replace = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/client", () => ({
  verifyEmailLink: (...a: unknown[]) => verifyEmailLink(...a),
}));

afterEach(cleanup);

describe("ConfirmLanding", () => {
  beforeEach(() => {
    verifyEmailLink.mockReset();
    replace.mockReset();
  });

  it("confirm landing verifies the token and routes recovery links to reset-password", async () => {
    search = "token_hash=abc&type=recovery";
    verifyEmailLink.mockResolvedValue({ next: "/account/reset-password/" });
    render(<ConfirmLanding />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/account/reset-password/"),
    );
    const params = verifyEmailLink.mock.calls[0][1] as URLSearchParams;
    expect(params.get("token_hash")).toBe("abc");
  });

  it("shows the error for a bad link", async () => {
    search = "type=email";
    verifyEmailLink.mockResolvedValue({ error: "This link is incomplete." });
    render(<ConfirmLanding />);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "incomplete",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
