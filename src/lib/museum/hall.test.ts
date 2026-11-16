import { describe, expect, it } from "vitest";
import { HALL, layoutHall, type Box } from "./hall";

function expectBox(actual: Box, expected: Box) {
  expect(actual.minX).toBeCloseTo(expected.minX, 5);
  expect(actual.maxX).toBeCloseTo(expected.maxX, 5);
  expect(actual.minZ).toBeCloseTo(expected.minZ, 5);
  expect(actual.maxZ).toBeCloseTo(expected.maxZ, 5);
}

describe("layoutHall", () => {
  it("an empty gallery gives the minimum 24 m hall with no slots", () => {
    const layout = layoutHall([]);

    expect(HALL.width).toBe(12);
    expect(HALL.wallHeight).toBe(5);
    expect(HALL.eyeHeight).toBe(1.6);
    expect(layout.width).toBe(12);
    expect(layout.length).toBe(24);
    expect(layout.slots).toEqual([]);
    expect(layout.spawn).toEqual({ x: 0, z: -1.5, yaw: 0 });
    expect(layout.obstacles).toHaveLength(1);
    expectBox(layout.obstacles[0], { minX: -1, maxX: 1, minZ: -13, maxZ: -11 });
  });

  it("seven works alternate sides and the hall grows to fit them", () => {
    const layout = layoutHall(
      Array.from({ length: 7 }, (_, i) => ({ id: `w${i + 1}`, aspect: 1 })),
    );

    expect(layout.length).toBe(32);
    expect(layout.width).toBe(12);
    expect(layout.slots.map((slot) => slot.workId)).toEqual([
      "w1",
      "w2",
      "w3",
      "w4",
      "w5",
      "w6",
      "w7",
    ]);
    expect(layout.slots.map((slot) => slot.side)).toEqual([
      "left",
      "right",
      "left",
      "right",
      "left",
      "right",
      "left",
    ]);
    expect(layout.slots.map((slot) => slot.x)).toEqual([
      -6, 6, -6, 6, -6, 6, -6,
    ]);
    expect(layout.slots.map((slot) => slot.z)).toEqual([
      -6, -6, -11, -11, -16, -16, -21,
    ]);
    for (const slot of layout.slots) {
      expect(slot.rotationY).toBeCloseTo(
        slot.side === "left" ? Math.PI / 2 : -Math.PI / 2,
        5,
      );
      expect(slot.width).toBeCloseTo(2.2, 5);
      expect(slot.height).toBeCloseTo(2.2, 5);
    }

    expect(layout.obstacles).toHaveLength(5);
    expectBox(layout.obstacles[0], { minX: -1, maxX: 1, minZ: -17, maxZ: -15 });
    expectBox(layout.obstacles[1], {
      minX: -2.8,
      maxX: -2.2,
      minZ: -9.7,
      maxZ: -7.3,
    });
    expectBox(layout.obstacles[2], {
      minX: 2.2,
      maxX: 2.8,
      minZ: -9.7,
      maxZ: -7.3,
    });
    expectBox(layout.obstacles[3], {
      minX: -2.8,
      maxX: -2.2,
      minZ: -19.7,
      maxZ: -17.3,
    });
    expectBox(layout.obstacles[4], {
      minX: 2.2,
      maxX: 2.8,
      minZ: -19.7,
      maxZ: -17.3,
    });
  });

  it("a wide work keeps its aspect within 3.2 × 2.2", () => {
    const slot = layoutHall([{ id: "wide", aspect: 2 }]).slots[0];

    expect(slot.width).toBeCloseTo(3.2, 5);
    expect(slot.height).toBeCloseTo(1.6, 5);
    expect(slot.width / slot.height).toBeCloseTo(2, 5);
    expect(slot.width).toBeLessThanOrEqual(3.2);
    expect(slot.height).toBeLessThanOrEqual(2.2);
  });
});
