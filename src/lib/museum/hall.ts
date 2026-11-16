export type Box = { minX: number; maxX: number; minZ: number; maxZ: number };

export type HallSlot = {
  workId: string;
  x: number;
  z: number;
  rotationY: number;
  width: number;
  height: number;
  side: "left" | "right";
};

export type HallLayout = {
  width: number;
  length: number;
  slots: HallSlot[];
  obstacles: Box[];
  spawn: { x: number; z: number; yaw: number };
};

/** Metres. Entrance is z = 0; the hall runs toward −z. Yaw 0 looks down the hall. */
export const HALL = {
  width: 12,
  wallHeight: 5,
  eyeHeight: 1.6,
  spacing: 5,
  start: 6,
  endMargin: 6,
  minLength: 24,
  frameMaxWidth: 3.2,
  frameMaxHeight: 2.2,
  pillarSize: 2,
  benchLength: 2.4,
  benchDepth: 0.6,
  benchOffsetX: 2.5,
  spawnZ: -1.5,
  spawnYaw: 0,
} as const;

function fitFrame(aspect: number): { width: number; height: number } {
  const width = Math.min(HALL.frameMaxWidth, HALL.frameMaxHeight * aspect);
  return { width, height: width / aspect };
}

function benchBox(x: number, z: number): Box {
  const halfX = HALL.benchDepth / 2;
  const halfZ = HALL.benchLength / 2;
  return { minX: x - halfX, maxX: x + halfX, minZ: z - halfZ, maxZ: z + halfZ };
}

export function layoutHall(
  works: { id: string; aspect: number }[],
): HallLayout {
  const pairs = Math.ceil(works.length / 2);
  const length = Math.max(
    HALL.minLength,
    HALL.start + pairs * HALL.spacing + HALL.endMargin,
  );

  const slots: HallSlot[] = works.map((work, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const frame = fitFrame(work.aspect);
    return {
      workId: work.id,
      side,
      x: side === "left" ? -HALL.width / 2 : HALL.width / 2,
      z: -(HALL.start + Math.floor(index / 2) * HALL.spacing),
      // PlaneGeometry faces +z. π/2 turns a left-wall frame toward +x.
      rotationY: side === "left" ? Math.PI / 2 : -Math.PI / 2,
      width: frame.width,
      height: frame.height,
    };
  });

  const pillarZ = -length / 2;
  const pillarHalf = HALL.pillarSize / 2;
  const obstacles: Box[] = [
    {
      minX: -pillarHalf,
      maxX: pillarHalf,
      minZ: pillarZ - pillarHalf,
      maxZ: pillarZ + pillarHalf,
    },
  ];

  // A bench pair in every other gap between exhibit rows, long axis along z.
  for (let gap = 0; gap < pairs - 1; gap += 2) {
    const z = -(HALL.start + gap * HALL.spacing + HALL.spacing / 2);
    obstacles.push(
      benchBox(-HALL.benchOffsetX, z),
      benchBox(HALL.benchOffsetX, z),
    );
  }

  return {
    width: HALL.width,
    length,
    slots,
    obstacles,
    spawn: { x: 0, z: HALL.spawnZ, yaw: HALL.spawnYaw },
  };
}
