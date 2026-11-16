import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LikeButton } from "./LikeButton";

const session = vi.hoisted(() => ({
  current: {
    status: "signed-out" as "signed-in" | "signed-out",
    user: null as { id: string } | null,
    displayName: null as string | null,
  },
}));

vi.mock("@/lib/auth/session", () => ({
  useSession: () => session.current,
}));

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({
    from: () => ({
      select: () => ({
        in: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ error: null }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/programs/bsemc/museum/",
  useSearchParams: () => new URLSearchParams(""),
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

describe("LikeButton", () => {
  it("asks a signed-out visitor to sign in", () => {
    session.current = { status: "signed-out", user: null, displayName: null };
    render(<LikeButton work={{ id: "w1", like_count: 2 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Like, 2" }));
    expect(
      screen.getByText("Sign in with your WVSU account to like exhibits."),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Sign In" }).getAttribute("href")).toBe(
      `/account/sign-in/?next=${encodeURIComponent("/programs/bsemc/museum/")}`,
    );
  });
});
