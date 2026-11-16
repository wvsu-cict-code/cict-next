import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "./ResetPasswordForm";

const replace = vi.fn();
const updatePassword = vi.fn().mockResolvedValue({});
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/client", () => ({
  updatePassword: (...a: unknown[]) => updatePassword(...a),
}));

afterEach(cleanup);

describe("ResetPasswordForm", () => {
  it("saves the new password and goes to the account page", async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save password" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/account/"));
    expect(updatePassword).toHaveBeenCalledWith({}, "password123");
  });
});
