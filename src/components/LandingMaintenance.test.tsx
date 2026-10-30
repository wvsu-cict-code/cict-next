import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingMaintenance } from "@/components/LandingMaintenance";
import type { ContentResult } from "@/lib/cms/useContent";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/maintenance";

let result: ContentResult<unknown> = { status: "loading" };
vi.mock("@/lib/cms/useContent", () => ({ useContent: () => result }));

const settings = (maintenance_mode: boolean, maintenance_message = "") => ({
  status: "ready" as const,
  data: { id: true, maintenance_mode, maintenance_message },
});

function renderLanding() {
  return render(
    <LandingMaintenance>
      <p>Home content</p>
    </LandingMaintenance>,
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("LandingMaintenance", () => {
  it("shows the home page when maintenance mode is off", () => {
    result = settings(false);
    renderLanding();
    expect(screen.getByText("Home content")).toBeTruthy();
    expect(screen.queryByText("We'll be right back.")).toBeNull();
  });

  it("replaces the home page with the CMS message when maintenance mode is on", () => {
    result = settings(true, "Back on Monday.");
    renderLanding();
    expect(screen.queryByText("Home content")).toBeNull();
    expect(screen.getByText("We'll be right back.")).toBeTruthy();
    expect(screen.getByText("Back on Monday.")).toBeTruthy();
  });

  it("uses the default message when the CMS message is empty", () => {
    result = settings(true, "  ");
    renderLanding();
    expect(screen.getByText(DEFAULT_MAINTENANCE_MESSAGE)).toBeTruthy();
  });

  it("hides the home page only briefly while the setting loads", () => {
    result = { status: "loading" };
    renderLanding();
    const wrapper = screen.getByText("Home content").parentElement!;
    expect(wrapper.className).toContain("invisible");

    act(() => vi.advanceTimersByTime(1200));
    expect(wrapper.className).not.toContain("invisible");
  });

  it("shows the home page when the setting can't be loaded", () => {
    result = { status: "error", retry: () => {} };
    renderLanding();
    const wrapper = screen.getByText("Home content").parentElement!;
    expect(wrapper.className).not.toContain("invisible");
  });
});
