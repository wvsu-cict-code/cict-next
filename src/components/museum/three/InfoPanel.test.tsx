import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "@/components/studentWorks/fixtures";
import { clearLikeCache } from "@/lib/museum/likes";
import { InfoPanel } from "./InfoPanel";

vi.mock("@/lib/auth/session", () => ({
  useSession: () => ({ status: "signed-out", user: null, displayName: null }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({}),
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

const work = makeWork({
  id: "sunrise",
  title: "Sunrise",
  student: "Ana Cruz",
  description: "A dawn study",
  category: "game",
  like_count: 4,
});

function media(matches: (query: string) => boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("InfoPanel", () => {
  beforeEach(() => {
    localStorage.clear();
    clearLikeCache();
    media(() => false);
    const share = navigator.share;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    return () => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: share,
      });
    };
  });

  afterEach(() => {
    cleanup();
    clearLikeCache();
    localStorage.clear();
  });

  it("info panel shows like count, share copies the link, save toggles", async () => {
    render(
      <InfoPanel work={work} onClose={() => {}} onOpenDetail={() => {}} />,
    );

    expect(screen.getByRole("heading", { name: "Sunrise" })).toBeTruthy();
    expect(screen.getByText("Games")).toBeTruthy();
    expect(screen.getByText("Ana Cruz")).toBeTruthy();
    expect(screen.getByText("A dawn study")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Like, 4" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(await screen.findByText("Link copied")).toBeTruthy();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${window.location.origin}/programs/bsemc/museum/?exhibit=sunrise`,
    );

    const save = screen.getByRole("button", { name: "Save" });
    fireEvent.click(save);
    expect(
      screen
        .getByRole("button", { name: "Saved" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    expect(
      screen.getByRole("button", { name: "Save" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("close clears the focus and view details opens the exhibit", () => {
    const onClose = vi.fn();
    const onOpenDetail = vi.fn();
    render(
      <InfoPanel work={work} onClose={onClose} onOpenDetail={onOpenDetail} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Details →" }));
    expect(onOpenDetail).toHaveBeenCalledWith("sunrise");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("info panel is a bottom sheet on a phone", () => {
    media((query) => query === "(max-width: 767px)");
    render(
      <InfoPanel work={work} onClose={() => {}} onOpenDetail={() => {}} />,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Sunrise" })).toBeTruthy();
  });
});
