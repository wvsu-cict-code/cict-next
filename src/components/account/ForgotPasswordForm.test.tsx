import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

const requestPasswordReset = vi.fn().mockResolvedValue({});
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/client", () => ({
  requestPasswordReset: (...a: unknown[]) => requestPasswordReset(...a),
}));

afterEach(cleanup);

describe("ForgotPasswordForm", () => {
  it("sends the link and shows a generic confirmation", async () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("WVSU email"), {
      target: { value: "ana@wvsu.edu.ph" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    await waitFor(() =>
      expect(screen.getByText(/we.ve sent a reset link/i)).toBeTruthy(),
    );
    expect(requestPasswordReset).toHaveBeenCalledWith({}, "ana@wvsu.edu.ph");
  });
});
