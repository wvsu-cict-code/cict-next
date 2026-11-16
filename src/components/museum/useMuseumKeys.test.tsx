import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/museum/settings";
import { SettingsPopover } from "./three/SettingsPopover";
import { useMuseumKeys, type MoveInput } from "./useMuseumKeys";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

function Stage({
  onMove,
  onInteract,
  onToggleMap,
}: {
  onMove: (input: MoveInput) => void;
  onInteract: () => void;
  onToggleMap: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useMuseumKeys(ref, {
    move: onMove,
    interact: onInteract,
    toggleMap: onToggleMap,
  });
  return (
    <>
      <div ref={ref} tabIndex={0} data-testid="museum-stage">
        <div data-museum-overlay>
          <SettingsPopover settings={DEFAULT_SETTINGS} onChange={() => {}} />
          <select aria-label="Native quality">
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
          <div role="textbox" aria-label="Exhibit caption" contentEditable />
        </div>
      </div>
      <input type="search" aria-label="Search exhibits" />
    </>
  );
}

function setup() {
  const onMove = vi.fn();
  const onInteract = vi.fn();
  const onToggleMap = vi.fn();
  render(
    <Stage onMove={onMove} onInteract={onInteract} onToggleMap={onToggleMap} />,
  );
  const stage = screen.getByTestId("museum-stage");
  return { onMove, onInteract, onToggleMap, stage };
}

describe("useMuseumKeys", () => {
  it("museum keys move the player only while the museum has focus", () => {
    const { onMove, onInteract, onToggleMap, stage } = setup();

    fireEvent.keyDown(stage, { key: "w" });
    fireEvent.keyDown(document, { key: "w" });
    fireEvent.keyDown(window, { key: "d" });
    expect(onMove).not.toHaveBeenCalled();

    stage.focus();
    fireEvent.keyDown(stage, { key: "w" });
    expect(onMove).toHaveBeenLastCalledWith({ forward: 1, strafe: 0 });
    fireEvent.keyDown(stage, { key: "d" });
    expect(onMove).toHaveBeenLastCalledWith({ forward: 1, strafe: 1 });
    fireEvent.keyUp(stage, { key: "w" });
    expect(onMove).toHaveBeenLastCalledWith({ forward: 0, strafe: 1 });
    fireEvent.keyUp(stage, { key: "d" });
    expect(onMove).toHaveBeenLastCalledWith({ forward: 0, strafe: 0 });

    const arrow = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      bubbles: true,
      cancelable: true,
    });
    stage.dispatchEvent(arrow);
    expect(arrow.defaultPrevented).toBe(true);
    expect(onMove).toHaveBeenLastCalledWith({ forward: 0, strafe: -1 });
    fireEvent.keyUp(stage, { key: "ArrowLeft" });

    const space = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    const movesBeforeSpace = onMove.mock.calls.length;
    stage.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(onMove.mock.calls.length).toBe(movesBeforeSpace);

    const letter = new KeyboardEvent("keydown", {
      key: "w",
      bubbles: true,
      cancelable: true,
    });
    stage.dispatchEvent(letter);
    expect(letter.defaultPrevented).toBe(false);
    expect(onMove).toHaveBeenLastCalledWith({ forward: 1, strafe: 0 });
    fireEvent.keyUp(stage, { key: "w" });

    fireEvent.keyDown(stage, { key: "e" });
    expect(onInteract).toHaveBeenCalledOnce();
    fireEvent.keyDown(stage, { key: "e", repeat: true });
    expect(onInteract).toHaveBeenCalledOnce();
    fireEvent.keyDown(stage, { key: "m" });
    expect(onToggleMap).toHaveBeenCalledOnce();

    const movesWhileFocused = onMove.mock.calls.length;
    fireEvent.keyDown(document, { key: "w" });
    fireEvent.keyDown(window, { key: "e" });
    expect(onMove.mock.calls.length).toBe(movesWhileFocused);
    expect(onInteract).toHaveBeenCalledOnce();

    stage.blur();
    fireEvent.keyDown(stage, { key: "w" });
    fireEvent.keyDown(stage, { key: "e" });
    fireEvent.keyDown(stage, { key: "m" });
    expect(onMove.mock.calls.length).toBe(movesWhileFocused);
    expect(onInteract).toHaveBeenCalledOnce();
    expect(onToggleMap).toHaveBeenCalledOnce();
  });

  it("typing W in the browse search or the settings popover does not move the player", () => {
    const { onMove, onInteract, onToggleMap, stage } = setup();

    const search = screen.getByRole("searchbox", { name: "Search exhibits" });
    search.focus();
    fireEvent.keyDown(search, { key: "w" });
    fireEvent.keyDown(search, { key: "e" });
    fireEvent.keyDown(search, { key: "m" });
    const searchArrow = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      bubbles: true,
      cancelable: true,
    });
    search.dispatchEvent(searchArrow);
    expect(searchArrow.defaultPrevented).toBe(false);

    stage.focus();
    screen
      .getByRole("button", { name: "Settings" })
      .dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "w",
          bubbles: true,
          cancelable: true,
        }),
      );
    screen.getByLabelText("Native quality").dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "e",
        bubbles: true,
        cancelable: true,
      }),
    );
    screen.getByRole("textbox", { name: "Exhibit caption" }).dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "m",
        bubbles: true,
        cancelable: true,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const invert = screen.getByRole("switch", { name: "Invert look" });
    invert.focus();
    fireEvent.keyDown(invert, { key: "w" });
    fireEvent.keyDown(invert, { key: "e" });
    fireEvent.keyDown(invert, { key: "m" });

    expect(onMove).not.toHaveBeenCalled();
    expect(onInteract).not.toHaveBeenCalled();
    expect(onToggleMap).not.toHaveBeenCalled();

    stage.focus();
    fireEvent.keyDown(stage, { key: "w" });
    expect(onMove).toHaveBeenCalledWith({ forward: 1, strafe: 0 });
  });
});
