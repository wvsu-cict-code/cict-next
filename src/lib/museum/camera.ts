import { HALL } from "./hall";
import { STAND_DISTANCE, type Player } from "./movement";

type CameraLike = {
  position: { set(x: number, y: number, z: number): unknown };
  rotation: { set(x: number, y: number, z: number, order?: "YXZ"): unknown };
};

/**
 * Puts the camera at the player's eye. It writes the whole rotation, roll
 * included: React Three Fiber aims a new camera at the origin, which from the
 * hall entrance leaves a half-turn of roll behind, and the hall then renders
 * upside down. Positive pitch looks up.
 */
export function placeCamera(camera: CameraLike, player: Player): void {
  camera.position.set(player.x, HALL.eyeHeight, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
}

const LANDSCAPE_FOV = 60;
const MIN_FOV = 40;
const PORTRAIT_FOV = 75;
const MAX_HORIZONTAL_FOV = 100;

function verticalFor(horizontal: number, aspect: number): number {
  const half = Math.tan((horizontal * Math.PI) / 360) / aspect;
  return (Math.atan(half) * 360) / Math.PI;
}

/**
 * Vertical field of view in degrees for a canvas of this width ÷ height.
 * A wide, short canvas narrows it so works near the edges don't stretch.
 * A portrait canvas widens it so a phone still sees both walls.
 */
export function fovForAspect(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return LANDSCAPE_FOV;
  if (aspect >= 1) {
    const fitted = verticalFor(MAX_HORIZONTAL_FOV, aspect);
    return Math.max(MIN_FOV, Math.min(LANDSCAPE_FOV, fitted));
  }
  return Math.min(PORTRAIT_FOV, verticalFor(LANDSCAPE_FOV, aspect));
}

/** The frame's dark surround, and the share of the view a work may fill. */
const FRAME_BORDER = 0.16;
const FILL = 0.8;
/** Any further back from a wall and the visitor would stand in the pillar. */
const MAX_STAND_DISTANCE = 4.4;

/**
 * How far from its wall to stand so a whole frame fits a view with this
 * vertical field of view (degrees) and width ÷ height.
 */
export function viewingDistance(
  frame: { width: number; height: number },
  fov: number,
  aspect: number,
): number {
  const halfV = Math.tan((fov * Math.PI) / 360);
  const halfH = halfV * aspect;
  if (!Number.isFinite(halfH) || halfV <= 0 || halfH <= 0) {
    return STAND_DISTANCE;
  }
  const forHeight = (frame.height + FRAME_BORDER) / 2 / FILL / halfV;
  const forWidth = (frame.width + FRAME_BORDER) / 2 / FILL / halfH;
  return Math.min(
    MAX_STAND_DISTANCE,
    Math.max(STAND_DISTANCE, forHeight, forWidth),
  );
}
