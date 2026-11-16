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
let session: {
  status: string;
  user: { id: string; email?: string } | null;
  displayName: string | null;
};
let search = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(search),
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
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/session", () => ({ useSession: () => session }));
vi.mock("@/lib/auth/client", () => ({
  signOut: (...a: unknown[]) => signOut(...a),
}));
vi.mock("./MySubmissions", () => ({
  MySubmissions: () => <div data-testid="my-submissions" />,
}));

afterEach(cleanup);

describe("AccountHome", () => {
  beforeEach(() => {
    replace.mockReset();
    signOut.mockReset().mockResolvedValue({});
    search = "";
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
      user: { id: "u1", email: "ana@wvsu.edu.ph" },
      displayName: "Ana",
    };
    render(<AccountHome />);
    expect(screen.getByText(/Ana/)).toBeTruthy();
    expect(screen.getByTestId("my-submissions")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it("shows the submitted banner when submitted=1", () => {
    search = "submitted=1";
    session = {
      status: "signed-in",
      user: { id: "u1", email: "ana@wvsu.edu.ph" },
      displayName: "Ana",
    };
    render(<AccountHome />);
    expect(
      screen.getByText(
        /Submitted for review\. We'll let you know when it's approved\./,
      ),
    ).toBeTruthy();
  });
});
