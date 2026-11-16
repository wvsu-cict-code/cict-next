import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ControlsBar } from "./ControlsBar";

function media(coarse: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: coarse && query === "(pointer: coarse)",
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("ControlsBar", () => {
  it("controls bar switches to touch hints on coarse pointers", () => {
    media(false);
    const { unmount } = render(<ControlsBar />);
    expect(
      screen
        .getByText(/Move · Look/)
        .textContent?.replace(/\s+/g, " ")
        .trim(),
    ).toBe("W A S D Move · Look · E Interact · M Map");
    expect(document.querySelectorAll("kbd")).toHaveLength(6);
    unmount();

    media(true);
    render(<ControlsBar />);
    expect(screen.getByText("Drag to look · Tap a work")).toBeTruthy();
    expect(document.querySelector("kbd")).toBeNull();
  });
});
