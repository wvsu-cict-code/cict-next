import { describe, expect, it } from "vitest";
import { layoutHall, type HallLayout, type HallSlot } from "./hall";
import {
  applyLook,
  exhibitInView,
  orderedSlots,
  standInFront,
  stepPlayer,
  type Player,
} from "./movement";

function player(x: number, z: number, yaw = 0, pitch = 0): Player {
  return { x, z, yaw, pitch };
}

describe("stepPlayer", () => {
  const hall = layoutHall([]);

  it("the player cannot walk through a wall, the pillar or a bench", () => {
    const rightOk = stepPlayer(
      player(5, -5),
      { forward: 0, strafe: 1 },
      0.64 / 3,
      1,
      hall,
    );
    expect(rightOk.x).toBeCloseTo(5.64, 5);
    expect(rightOk.z).toBeCloseTo(-5, 5);

    const rightWall = stepPlayer(
      player(5, -5),
      { forward: 0, strafe: 1 },
      0.66 / 3,
      1,
      hall,
    );
    expect(rightWall.x).toBeCloseTo(5, 5);
    expect(rightWall.z).toBeCloseTo(-5, 5);

    const backOk = stepPlayer(
      player(0, -1, Math.PI),
      { forward: 1, strafe: 0 },
      0.6 / 3,
      1,
      hall,
    );
    expect(backOk.z).toBeCloseTo(-0.4, 5);
    const entrance = stepPlayer(
      player(0, -1, Math.PI),
      { forward: 1, strafe: 0 },
      0.7 / 3,
      1,
      hall,
    );
    expect(entrance.z).toBeCloseTo(-1, 5);

    const farOk = stepPlayer(
      player(0, -23),
      { forward: 1, strafe: 0 },
      0.6 / 3,
      1,
      hall,
    );
    expect(farOk.z).toBeCloseTo(-23.6, 5);
    const farWall = stepPlayer(
      player(0, -23),
      { forward: 1, strafe: 0 },
      0.7 / 3,
      1,
      hall,
    );
    expect(farWall.z).toBeCloseTo(-23, 5);

    const pillarOk = stepPlayer(
      player(0, -10),
      { forward: 1, strafe: 0 },
      0.64 / 3,
      1,
      hall,
    );
    expect(pillarOk.z).toBeCloseTo(-10.64, 5);
    const pillar = stepPlayer(
      player(0, -10),
      { forward: 1, strafe: 0 },
      0.66 / 3,
      1,
      hall,
    );
    expect(pillar.x).toBeCloseTo(0, 5);
    expect(pillar.z).toBeCloseTo(-10, 5);

    const withBench = layoutHall([
      { id: "a", aspect: 1 },
      { id: "b", aspect: 1 },
      { id: "c", aspect: 1 },
      { id: "d", aspect: 1 },
    ]);
    const benchOk = stepPlayer(
      player(-2.5, -6),
      { forward: 1, strafe: 0 },
      0.9 / 3,
      1,
      withBench,
    );
    expect(benchOk.x).toBeCloseTo(-2.5, 5);
    expect(benchOk.z).toBeCloseTo(-6.9, 5);
    const bench = stepPlayer(
      player(-2.5, -6),
      { forward: 1, strafe: 0 },
      1 / 3,
      1,
      withBench,
    );
    expect(bench.x).toBeCloseTo(-2.5, 5);
    expect(bench.z).toBeCloseTo(-6, 5);
  });

  it("the player slides along a wall instead of stopping dead", () => {
    const start = player(5.5, -4);
    const slid = stepPlayer(start, { forward: 1, strafe: 1 }, 1, 1, hall);

    expect(slid.x).toBeCloseTo(5.5, 5);
    expect(slid.z).toBeCloseTo(-7, 5);
    expect(slid.yaw).toBe(0);
    expect(slid.pitch).toBe(0);
    expect(start).toEqual({ x: 5.5, z: -4, yaw: 0, pitch: 0 });

    const fast = stepPlayer(
      player(0, -5),
      { forward: 1, strafe: 0 },
      0.5,
      2,
      hall,
    );
    expect(fast.x).toBeCloseTo(0, 5);
    expect(fast.z).toBeCloseTo(-8, 5);
  });
});

describe("exhibitInView", () => {
  const layout = layoutHall([
    { id: "left-work", aspect: 1 },
    { id: "right-work", aspect: 1 },
  ]);

  it("exhibitInView returns the facing work within 6 m and null when looking away", () => {
    const facing = player(-3.4, -6, Math.PI / 2);
    expect(exhibitInView(facing, layout)).toBe("left-work");
    expect(exhibitInView({ ...facing, yaw: 0 }, layout)).toBeNull();

    expect(exhibitInView(player(0, -6, Math.PI / 2), layout)).toBe("left-work");
    expect(exhibitInView(player(1, -6, Math.PI / 2), layout)).toBeNull();

    expect(exhibitInView(player(-3.4, -6, Math.PI / 2 + 0.34), layout)).toBe(
      "left-work",
    );
    expect(
      exhibitInView(player(-3.4, -6, Math.PI / 2 + 0.5), layout),
    ).toBeNull();
  });
});

describe("standInFront", () => {
  it("standInFront faces the frame", () => {
    const layout = layoutHall([
      { id: "left-work", aspect: 1 },
      { id: "right-work", aspect: 1 },
    ]);
    const left = layout.slots[0];
    const right = layout.slots[1];

    const leftPose = standInFront(left);
    expect(leftPose.x).toBeCloseTo(-3.4, 5);
    expect(leftPose.z).toBeCloseTo(-6, 5);
    expect(leftPose.yaw).toBeCloseTo(Math.PI / 2, 5);

    const rightPose = standInFront(right);
    expect(rightPose.x).toBeCloseTo(3.4, 5);
    expect(rightPose.z).toBeCloseTo(-6, 5);
    expect(rightPose.yaw).toBeCloseTo(-Math.PI / 2, 5);

    for (const [slot, pose] of [
      [left, leftPose],
      [right, rightPose],
    ] as const) {
      const lookX = -Math.sin(pose.yaw);
      const lookZ = -Math.cos(pose.yaw);
      const vx = slot.x - pose.x;
      const vz = slot.z - pose.z;
      const distance = Math.hypot(vx, vz);
      expect(distance).toBeCloseTo(2.6, 5);
      expect((lookX * vx + lookZ * vz) / distance).toBeCloseTo(1, 5);
    }
  });
});

describe("applyLook", () => {
  it("pitch is clamped and invert flips dy", () => {
    const p = player(1, -2, 0.5, 0.25);

    const down = applyLook(p, 0, 0.125, 2, false);
    expect(down.pitch).toBeCloseTo(0, 5);
    expect(down.yaw).toBeCloseTo(0.5, 5);
    expect(down.x).toBe(1);
    expect(down.z).toBe(-2);

    const inverted = applyLook(p, 0, 0.125, 2, true);
    expect(inverted.pitch).toBeCloseTo(0.5, 5);
    expect(inverted.yaw).toBeCloseTo(0.5, 5);

    const turned = applyLook(p, 0.25, 0, 2, false);
    expect(turned.yaw).toBeCloseTo(0, 5);
    expect(turned.pitch).toBeCloseTo(0.25, 5);

    expect(applyLook(p, 0, 3, 1, false).pitch).toBeCloseTo(-1.1, 5);
    expect(applyLook(p, 0, -3, 1, false).pitch).toBeCloseTo(1.1, 5);
    expect(applyLook(player(0, 0), 0, 3, 1, true).pitch).toBeCloseTo(1.1, 5);
  });
});

describe("orderedSlots", () => {
  it("orders slots from the entrance to the far end, left before right", () => {
    const layout: HallLayout = {
      width: 12,
      length: 24,
      spawn: { x: 0, z: -1.5, yaw: 0 },
      obstacles: [],
      slots: [
        slot("far-right", "right", -16),
        slot("near-right", "right", -6),
        slot("near-left", "left", -6),
      ],
    };

    expect(orderedSlots(layout).map((entry) => entry.workId)).toEqual([
      "near-left",
      "near-right",
      "far-right",
    ]);
  });
});

function slot(workId: string, side: "left" | "right", z: number): HallSlot {
  return {
    workId,
    side,
    x: side === "left" ? -6 : 6,
    z,
    rotationY: side === "left" ? Math.PI / 2 : -Math.PI / 2,
    width: 2.2,
    height: 2.2,
  };
}
