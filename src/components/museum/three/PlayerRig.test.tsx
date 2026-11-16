import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HallLayout } from "@/lib/museum/hall";
import { DEFAULT_SETTINGS } from "@/lib/museum/settings";
import { PlayerRig } from "./PlayerRig";

vi.mock("@react-three/fiber", () => ({
  useThree: (selector: (state: object) => unknown) =>
    selector({
      camera: {
        position: { set() {} },
        rotation: { order: "YXZ", y: 0, x: 0 },
      },
      gl: { domElement: document.createElement("canvas") },
      scene: { children: [] },
      invalidate() {},
    }),
  useFrame() {},
}));

vi.mock("three", () => ({
  Raycaster: class {
    setFromCamera() {}
    intersectObjects() {
      return [];
    }
  },
  Vector2: class {
    x = 0;
    y = 0;
  },
}));

const layout: HallLayout = {
  width: 12,
  length: 24,
  slots: [
    {
      workId: "sunrise",
      x: -6,
      z: -6,
      rotationY: Math.PI / 2,
      width: 2,
      height: 2,
      side: "left",
    },
  ],
  obstacles: [],
  spawn: { x: 0, z: -1.5, yaw: 0 },
};

function rig(homeTick: number, onFocusExhibit: (id: string | null) => void) {
  return (
    <StrictMode>
      <PlayerRig
        layout={layout}
        target="sunrise"
        targetToken={1}
        homeTick={homeTick}
        settings={DEFAULT_SETTINGS}
        move={{ forward: 0, strafe: 0 }}
        onFocusExhibit={onFocusExhibit}
        onPlayerMove={() => {}}
      />
    </StrictMode>
  );
}

describe("PlayerRig", () => {
  afterEach(() => {
    cleanup();
  });

  it("a repeated effect with the same home tick does not cancel a visit", () => {
    const onFocusExhibit = vi.fn();
    const view = render(rig(0, onFocusExhibit));

    expect(onFocusExhibit).toHaveBeenCalledWith("sunrise");
    expect(onFocusExhibit).not.toHaveBeenCalledWith(null);

    onFocusExhibit.mockClear();
    view.rerender(rig(0, onFocusExhibit));
    expect(onFocusExhibit).not.toHaveBeenCalledWith(null);

    view.rerender(rig(1, onFocusExhibit));
    expect(onFocusExhibit).toHaveBeenCalledWith(null);
  });
});
