import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, loadSettings } from "@/lib/museum/settings";
import { SettingsPopover } from "./SettingsPopover";

const KEY = "cict.museum.settings.v1";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("SettingsPopover", () => {
  beforeEach(() => {
    localStorage.clear();
    HTMLElement.prototype.hasPointerCapture ||= () => false;
    HTMLElement.prototype.setPointerCapture ||= () => {};
    HTMLElement.prototype.releasePointerCapture ||= () => {};
  });

  it("settings changes persist via saveSettings", () => {
    const onChange = vi.fn();
    render(<SettingsPopover settings={DEFAULT_SETTINGS} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("switch", { name: "Invert look" }));

    expect(loadSettings().invertLook).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY) ?? "{}")).toMatchObject({
      invertLook: true,
      lookSensitivity: 1,
      moveSpeed: 1,
      quality: "high",
    });
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_SETTINGS,
      invertLook: true,
    });

    const sensitivity = screen.getByRole("slider", {
      name: "Look sensitivity",
    });
    sensitivity.focus();
    fireEvent.keyDown(sensitivity, { key: "ArrowRight" });
    expect(loadSettings().lookSensitivity).toBeGreaterThan(1);
  });
});
