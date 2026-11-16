import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { HALL } from "./hall";
import { fovForAspect, placeCamera, viewingDistance } from "./camera";

function axes(camera: PerspectiveCamera) {
  return {
    up: new Vector3(0, 1, 0).applyQuaternion(camera.quaternion),
    forward: new Vector3(0, 0, -1).applyQuaternion(camera.quaternion),
  };
}

/** React Three Fiber aims a new camera at the origin unless given a rotation. */
function fiberCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera();
  camera.position.set(0, HALL.eyeHeight, -1.5);
  camera.lookAt(0, 0, 0);
  return camera;
}

describe("placeCamera", () => {
  it("stands the camera upright after the canvas aimed it at the origin", () => {
    const camera = fiberCamera();

    placeCamera(camera, { x: 0, z: -1.5, yaw: 0, pitch: 0 });

    const { up, forward } = axes(camera);
    expect(up.x).toBeCloseTo(0, 5);
    expect(up.y).toBeCloseTo(1, 5);
    expect(up.z).toBeCloseTo(0, 5);
    expect(forward.x).toBeCloseTo(0, 5);
    expect(forward.y).toBeCloseTo(0, 5);
    expect(forward.z).toBeCloseTo(-1, 5);
  });

  it("puts the eye at standing height over the player", () => {
    const camera = fiberCamera();

    placeCamera(camera, { x: 2, z: -9, yaw: 0, pitch: 0 });

    expect(camera.position.toArray()).toEqual([2, HALL.eyeHeight, -9]);
  });

  it("positive yaw turns toward −x and the horizon stays level", () => {
    const camera = fiberCamera();

    placeCamera(camera, { x: 0, z: -6, yaw: Math.PI / 2, pitch: 0 });

    const { up, forward } = axes(camera);
    expect(forward.x).toBeCloseTo(-1, 5);
    expect(forward.z).toBeCloseTo(0, 5);
    expect(up.y).toBeCloseTo(1, 5);
  });

  it("positive pitch looks up and negative pitch looks down", () => {
    const camera = fiberCamera();

    placeCamera(camera, { x: 0, z: -6, yaw: 0, pitch: 0.5 });
    expect(axes(camera).forward.y).toBeCloseTo(Math.sin(0.5), 5);

    placeCamera(camera, { x: 0, z: -6, yaw: 0, pitch: -0.5 });
    expect(axes(camera).forward.y).toBeCloseTo(-Math.sin(0.5), 5);
  });
});

function horizontalFov(vertical: number, aspect: number): number {
  const half = Math.tan((vertical * Math.PI) / 360) * aspect;
  return (Math.atan(half) * 360) / Math.PI;
}

describe("fovForAspect", () => {
  it("keeps 60° on ordinary landscape screens", () => {
    expect(fovForAspect(16 / 9)).toBeCloseTo(60, 5);
    expect(fovForAspect(4 / 3)).toBeCloseTo(60, 5);
    expect(fovForAspect(1)).toBeCloseTo(60, 5);
  });

  it("narrows on a wide strip so the edges do not stretch past 100°", () => {
    const fov = fovForAspect(1920 / 697);

    expect(fov).toBeLessThan(60);
    expect(horizontalFov(fov, 1920 / 697)).toBeCloseTo(100, 3);
  });

  it("never narrows below 40°", () => {
    expect(fovForAspect(8)).toBe(40);
  });

  it("widens on portrait screens, up to 75°", () => {
    expect(fovForAspect(0.8)).toBeGreaterThan(60);
    expect(fovForAspect(9 / 16)).toBe(75);
  });

  it("falls back to 60° for a canvas with no size yet", () => {
    expect(fovForAspect(0)).toBe(60);
    expect(fovForAspect(Number.NaN)).toBe(60);
  });
});

describe("viewingDistance", () => {
  const tall = { width: 2.2, height: 2.2 };
  const wide = { width: 3.2, height: 1.8 };

  it("keeps the usual 2.6 m on an ordinary landscape screen", () => {
    expect(viewingDistance(tall, 60, 16 / 9)).toBeCloseTo(2.6, 5);
    expect(viewingDistance(wide, 60, 16 / 9)).toBeCloseTo(2.6, 5);
  });

  it("steps back on a wide strip until the whole frame fits the height", () => {
    const aspect = 1920 / 697;
    const fov = fovForAspect(aspect);
    const distance = viewingDistance(tall, fov, aspect);

    expect(distance).toBeGreaterThan(2.6);
    const visibleHeight = 2 * distance * Math.tan((fov * Math.PI) / 360);
    expect(visibleHeight).toBeGreaterThan(tall.height + 0.16);
  });

  it("steps back on a phone until the whole frame fits the width", () => {
    const aspect = 0.7;
    const fov = fovForAspect(aspect);
    const distance = viewingDistance(wide, fov, aspect);

    const visibleWidth =
      2 * distance * Math.tan((fov * Math.PI) / 360) * aspect;
    expect(visibleWidth).toBeGreaterThan(wide.width + 0.16);
  });

  it("never backs into the pillar", () => {
    expect(viewingDistance(wide, 40, 0.3)).toBe(4.4);
  });

  it("falls back to 2.6 m when the camera has no lens to measure", () => {
    expect(viewingDistance(tall, Number.NaN, Number.NaN)).toBe(2.6);
    expect(viewingDistance(tall, 60, 0)).toBe(2.6);
  });
});
