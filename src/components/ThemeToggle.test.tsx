import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_SCRIPT, THEME_STORAGE_KEY } from "@/lib/theme";
import { ThemeToggle } from "./ThemeToggle";

type Listener = (event: { matches: boolean }) => void;

/** A fake prefers-color-scheme query whose answer the test can flip. */
function mockSystem(dark: boolean) {
  const listeners = new Set<Listener>();
  const media = {
    matches: dark,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn(() => media) as unknown as typeof window.matchMedia;
  return {
    set(next: boolean) {
      media.matches = next;
      listeners.forEach((fn) => fn({ matches: next }));
    },
  };
}

const runScript = () => new Function(THEME_SCRIPT)();
const theme = () => document.documentElement.dataset.theme;

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });
  afterEach(cleanup);

  it("starts from the device setting when the visitor hasn't picked", () => {
    mockSystem(true);
    runScript();
    expect(theme()).toBe("dark");
    mockSystem(false);
    runScript();
    expect(theme()).toBe("light");
  });

  it("starts from the visitor's saved pick over the device setting", () => {
    mockSystem(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    runScript();
    expect(theme()).toBe("light");
  });

  it("ignores a garbage saved value", () => {
    mockSystem(true);
    localStorage.setItem(THEME_STORAGE_KEY, "purple");
    runScript();
    expect(theme()).toBe("dark");
  });

  it("switches and remembers the pick", () => {
    mockSystem(false);
    runScript();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Switch to dark mode" });
    fireEvent.click(button);
    expect(theme()).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light mode" }),
    );
    expect(theme()).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("follows device changes until the visitor picks, then sticks", () => {
    const system = mockSystem(false);
    runScript();
    render(<ThemeToggle />);
    act(() => system.set(true));
    expect(theme()).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light mode" }),
    );
    act(() => system.set(true));
    expect(theme()).toBe("light");
  });

  it("still switches when storage is blocked", () => {
    mockSystem(false);
    runScript();
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    render(<ThemeToggle />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );
    expect(theme()).toBe("dark");
    setItem.mockRestore();
  });
});
