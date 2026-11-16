import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountHome } from "./AccountHome";

const replace = vi.fn();
const signOut = vi.fn();
let session: { status: string; user: unknown; displayName: string | null };
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/session", () => ({ useSession: () => session }));
vi.mock("@/lib/auth/client", () => ({
  signOut: (...a: unknown[]) => signOut(...a),
}));

afterEach(cleanup);

describe("AccountHome", () => {
  beforeEach(() => {
    replace.mockReset();
    signOut.mockReset().mockResolvedValue({});
  });

  it("account page sends signed-out visitors to sign-in with next=/account/", async () => {
    session = { status: "signed-out", user: null, displayName: null };
    render(<AccountHome />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/account/sign-in/?next=%2Faccount%2F",
      ),
    );
  });

  it("does not redirect while loading", () => {
    session = { status: "loading", user: null, displayName: null };
    render(<AccountHome />);
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows the name and signs out", async () => {
    session = {
      status: "signed-in",
      user: { email: "ana@wvsu.edu.ph" },
      displayName: "Ana",
    };
    render(<AccountHome />);
    expect(screen.getByText(/Ana/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
