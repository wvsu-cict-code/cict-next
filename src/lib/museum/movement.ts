import type { Box, HallLayout, HallSlot } from "./hall";

export type Player = { x: number; z: number; yaw: number; pitch: number };

const RADIUS = 0.35;
const BASE_SPEED = 3;
const PITCH_LIMIT = 1.1;
export const STAND_DISTANCE = 2.6;

/** Yaw 0 looks toward −z. Positive yaw turns toward −x. */
function lookVector(yaw: number): { x: number; z: number } {
  return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
}

function rightVector(yaw: number): { x: number; z: number } {
  return { x: Math.cos(yaw), z: -Math.sin(yaw) };
}

function hitsBox(x: number, z: number, box: Box): boolean {
  const closestX = Math.min(Math.max(x, box.minX), box.maxX);
  const closestZ = Math.min(Math.max(z, box.minZ), box.maxZ);
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < RADIUS * RADIUS;
}

function blocked(x: number, z: number, layout: HallLayout): boolean {
  const half = layout.width / 2;
  if (x < -half + RADIUS || x > half - RADIUS) return true;
  if (z > -RADIUS || z < -layout.length + RADIUS) return true;
  return layout.obstacles.some((box) => hitsBox(x, z, box));
}

export function stepPlayer(
  p: Player,
  input: { forward: number; strafe: number },
  dt: number,
  speed: number,
  layout: HallLayout,
): Player {
  const facing = lookVector(p.yaw);
  const right = rightVector(p.yaw);
  const distance = BASE_SPEED * speed * dt;
  const dx = (input.forward * facing.x + input.strafe * right.x) * distance;
  const dz = (input.forward * facing.z + input.strafe * right.z) * distance;

  let x = p.x + dx;
  if (blocked(x, p.z, layout)) x = p.x;
  let z = p.z + dz;
  if (blocked(x, z, layout)) z = p.z;
  return { x, z, yaw: p.yaw, pitch: p.pitch };
}

export function applyLook(
  p: Player,
  dx: number,
  dy: number,
  sensitivity: number,
  invert: boolean,
): Player {
  const lookDy = invert ? -dy : dy;
  const pitch = Math.min(
    PITCH_LIMIT,
    Math.max(-PITCH_LIMIT, p.pitch - lookDy * sensitivity),
  );
  return { x: p.x, z: p.z, yaw: p.yaw - dx * sensitivity, pitch };
}

export function exhibitInView(
  p: Player,
  layout: HallLayout,
  maxDistance = 6,
  maxAngle = 0.35,
): string | null {
  const facing = lookVector(p.yaw);
  let bestId: string | null = null;
  let bestDistance = Infinity;

  for (const slot of layout.slots) {
    const vx = slot.x - p.x;
    const vz = slot.z - p.z;
    const distance = Math.hypot(vx, vz);
    if (distance > maxDistance || distance >= bestDistance) continue;
    if (distance > 0) {
      const dot = (facing.x * vx + facing.z * vz) / distance;
      const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
      if (angle > maxAngle) continue;
    }
    bestId = slot.workId;
    bestDistance = distance;
  }

  return bestId;
}

export function standInFront(
  slot: HallSlot,
  distance = STAND_DISTANCE,
): {
  x: number;
  z: number;
  yaw: number;
} {
  const intoHall = slot.side === "left" ? 1 : -1;
  return {
    x: slot.x + intoHall * distance,
    z: slot.z,
    yaw: intoHall === 1 ? Math.PI / 2 : -Math.PI / 2,
  };
}

export function orderedSlots(layout: HallLayout): HallSlot[] {
  return [...layout.slots].sort((a, b) => {
    if (a.z !== b.z) return b.z - a.z;
    if (a.side === b.side) return 0;
    return a.side === "left" ? -1 : 1;
  });
}
