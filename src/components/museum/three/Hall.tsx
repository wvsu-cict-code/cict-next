/* eslint-disable react/no-unknown-property */
"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Matrix4,
  RepeatWrapping,
  SRGBColorSpace,
  type DirectionalLight,
  type InstancedMesh,
  type Object3D,
} from "three";
import type { StudentWork } from "@/lib/cms/content";
import { GALLERIES, type GalleryId } from "@/lib/museum/categories";
import {
  HALL,
  type Box,
  type HallLayout,
  type HallSlot,
} from "@/lib/museum/hall";
import type { MuseumSettings } from "@/lib/museum/settings";
import { ExhibitFrame } from "./ExhibitFrame";

const OSWALD = "/fonts/Oswald.ttf";

const PAINT = {
  wall: "#e6e1d8",
  ceiling: "#12161c",
  beam: "#222932",
  rail: "#0d1116",
  baseboard: "#2a3038",
  pillar: "#566070",
  orange: "#e8661f",
  bench: "#8f8981",
  benchBase: "#4a443e",
  lamp: "#fff1dc",
  ink: "#1d232b",
  paper: "#f6f3ee",
  muted: "#c9c3ba",
} as const;

/** Floor tiles are this many metres square. */
const TILE = 2;
/** How far a track lamp hangs out from its wall. */
const LAMP_REACH = 1.6;
/** End-wall signs stay this narrow so the pillar hides them from the entrance. */
const SIGN_WIDTH = 3.4;

type BoxSpec = {
  position: [number, number, number];
  size: [number, number, number];
};

function useInvalidateOnChange(value: unknown) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, value]);
}

/** One draw call for a run of same-coloured boxes. */
function Boxes({
  items,
  castShadow = false,
  children,
}: {
  items: BoxSpec[];
  castShadow?: boolean;
  children: ReactNode;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const matrix = new Matrix4();
    items.forEach((item, index) => {
      matrix.makeScale(...item.size);
      matrix.setPosition(...item.position);
      target.setMatrixAt(index, matrix);
    });
    target.instanceMatrix.needsUpdate = true;
    target.computeBoundingSphere();
    invalidate();
  }, [items, invalidate]);

  if (items.length === 0) return null;
  return (
    <instancedMesh
      key={items.length}
      ref={mesh}
      args={[undefined, undefined, items.length]}
      castShadow={castShadow}
    >
      <boxGeometry />
      {children}
    </instancedMesh>
  );
}

function Glyph({
  children,
  position,
  fontSize,
  color,
  maxWidth,
  letterSpacing = 0,
  lineHeight = 1.15,
}: {
  children: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
  maxWidth: number;
  letterSpacing?: number;
  lineHeight?: number;
}) {
  const invalidate = useThree((state) => state.invalidate);
  return (
    <Suspense fallback={null}>
      <Text
        position={position}
        font={OSWALD}
        fontSize={fontSize}
        color={color}
        maxWidth={maxWidth}
        letterSpacing={letterSpacing}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={lineHeight}
        onSync={() => invalidate()}
      >
        {children}
      </Text>
    </Suspense>
  );
}

function isPillar(box: Box): boolean {
  return box.maxX - box.minX >= HALL.pillarSize - 0.01;
}

/** Polished concrete tile with a seam on every edge. Repeats across the floor. */
function floorTexture(width: number, length: number): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#a6a097";
    ctx.fillRect(0, 0, size, size);
    // A fixed seed keeps the mottling the same on every visit.
    let seed = 20261116;
    const next = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 520; i += 1) {
      const shade = next() > 0.5 ? 255 : 0;
      const extent = 6 + next() * 34;
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${0.012 + next() * 0.03})`;
      ctx.fillRect(next() * size, next() * size, extent, extent * 0.6);
    }
    ctx.strokeStyle = "rgba(52,48,43,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(width / TILE, length / TILE);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Soft round falloff. Tinted and stretched into the light pools on walls and floor. */
function glowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.72)");
    gradient.addColorStop(0.8, "rgba(255,255,255,0.2)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Lines across the hall, midway between exhibit rows: beams and orange panels. */
function bayLines(length: number): number[] {
  const lines: number[] = [];
  for (
    let z = -(HALL.start - HALL.spacing / 2);
    z > -length + 1;
    z -= HALL.spacing
  ) {
    lines.push(z);
  }
  return lines;
}

/** Overhead light. With shadows on, one map covers the whole hall floor. */
function CeilingLight({
  layout,
  shadows,
}: {
  layout: HallLayout;
  shadows: boolean;
}) {
  const light = useRef<DirectionalLight>(null);
  const target = useRef<Object3D>(null);
  const invalidate = useThree((state) => state.invalidate);
  const midZ = -layout.length / 2;

  useLayoutEffect(() => {
    if (!light.current || !target.current) return;
    light.current.target = target.current;
    const camera = light.current.shadow.camera;
    camera.left = -layout.width / 2 - 0.5;
    camera.right = layout.width / 2 + 0.5;
    camera.top = layout.length / 2 + 2;
    camera.bottom = -layout.length / 2 - 2;
    camera.near = 1;
    camera.far = 40;
    camera.updateProjectionMatrix();
    invalidate();
  }, [layout.length, layout.width, invalidate]);

  return (
    <>
      {/* Leans toward the entrance so shadows fall where the visitor sees them. */}
      <directionalLight
        ref={light}
        position={[0, 20, midZ - 7]}
        intensity={1.2}
        color="#fff4e6"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
      <object3D ref={target} position={[0, 0, midZ]} />
    </>
  );
}

/** BSEMC lockup on one face of the pillar. `facing` is +1 for the entrance side. */
function PillarFace({ z, facing }: { z: number; facing: 1 | -1 }) {
  return (
    <group position={[0, 0, z]} rotation={[0, facing === 1 ? 0 : Math.PI, 0]}>
      <Glyph
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color={PAINT.orange}
        maxWidth={1.8}
        letterSpacing={0.35}
      >
        BSEMC
      </Glyph>
      <Glyph
        position={[0, 2.58, 0]}
        fontSize={0.42}
        color={PAINT.paper}
        maxWidth={1.8}
        lineHeight={1.08}
      >
        {"Virtual\nMuseum"}
      </Glyph>
      <Glyph
        position={[0, 1.74, 0]}
        fontSize={0.15}
        color={PAINT.muted}
        maxWidth={1.8}
      >
        {"Student Creative\nShowcase"}
      </Glyph>
    </group>
  );
}

/** The gallery's name on an end wall. `facing` is +1 for the far wall. */
function GallerySign({
  gallery,
  z,
  facing,
}: {
  gallery: GalleryId;
  z: number;
  facing: 1 | -1;
}) {
  const entry = GALLERIES.find((item) => item.id === gallery);
  if (!entry) return null;
  return (
    <group position={[0, 0, z]} rotation={[0, facing === 1 ? 0 : Math.PI, 0]}>
      <Glyph
        position={[0, 3.3, 0]}
        fontSize={0.2}
        color={PAINT.orange}
        maxWidth={SIGN_WIDTH}
        letterSpacing={0.3}
      >
        {entry.label.toUpperCase()}
      </Glyph>
      <Glyph
        position={[0, 2.62, 0]}
        fontSize={0.34}
        color={PAINT.ink}
        maxWidth={SIGN_WIDTH}
      >
        {entry.name}
      </Glyph>
      <mesh position={[0, 1.98, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.02]} />
        <meshBasicMaterial color={PAINT.orange} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Room({ layout, gallery }: { layout: HallLayout; gallery: GalleryId }) {
  const length = layout.length;
  const width = layout.width;
  const half = width / 2;
  const top = HALL.wallHeight;
  const midZ = -length / 2;
  const pillarZ = midZ;
  const pillarHalf = HALL.pillarSize / 2;

  const floor = useMemo(() => floorTexture(width, length), [width, length]);
  useEffect(() => () => floor.dispose(), [floor]);

  const dressing = useMemo(() => {
    const lines = bayLines(length);
    const beams: BoxSpec[] = lines.map((z) => ({
      position: [0, top - 0.15, z],
      size: [width, 0.3, 0.3],
    }));
    const panels: BoxSpec[] = lines.flatMap((z) =>
      [-1, 1].map(
        (side): BoxSpec => ({
          position: [side * (half - 0.03), top - 1.1, z],
          size: [0.06, 2.2, 0.9],
        }),
      ),
    );
    const rails: BoxSpec[] = [-1, 1].map((side) => ({
      position: [side * (half - LAMP_REACH), top - 0.34, midZ],
      size: [0.06, 0.06, length - 0.4],
    }));
    const lamps: BoxSpec[] = layout.slots.map((slot) => ({
      position: [
        slot.x + (slot.side === "left" ? LAMP_REACH : -LAMP_REACH),
        top - 0.5,
        slot.z,
      ],
      size: [0.13, 0.28, 0.13],
    }));
    const bulbs: BoxSpec[] = lamps.map((lamp) => ({
      position: [lamp.position[0], top - 0.655, lamp.position[2]],
      size: [0.09, 0.03, 0.09],
    }));
    // Light strips sit over each exhibit row, between the beams.
    const strips: BoxSpec[] = [];
    for (let z = -HALL.start; z > -length + 1; z -= HALL.spacing) {
      strips.push(
        { position: [-1.9, top - 0.012, z], size: [1.7, 0.02, 0.16] },
        { position: [1.9, top - 0.012, z], size: [1.7, 0.02, 0.16] },
      );
    }
    strips.push(
      { position: [-1.9, top - 0.012, -1.2], size: [1.7, 0.02, 0.16] },
      { position: [1.9, top - 0.012, -1.2], size: [1.7, 0.02, 0.16] },
    );
    const baseboards: BoxSpec[] = [
      { position: [-half + 0.02, 0.06, midZ], size: [0.04, 0.12, length] },
      { position: [half - 0.02, 0.06, midZ], size: [0.04, 0.12, length] },
      { position: [0, 0.06, -0.02], size: [width, 0.12, 0.04] },
      { position: [0, 0.06, -length + 0.02], size: [width, 0.12, 0.04] },
    ];
    const benches = layout.obstacles.filter((box) => !isPillar(box));
    const seats: BoxSpec[] = benches.map((box) => ({
      position: [(box.minX + box.maxX) / 2, 0.28, (box.minZ + box.maxZ) / 2],
      size: [box.maxX - box.minX, 0.4, box.maxZ - box.minZ],
    }));
    const plinths: BoxSpec[] = benches.map((box) => ({
      position: [(box.minX + box.maxX) / 2, 0.04, (box.minZ + box.maxZ) / 2],
      size: [box.maxX - box.minX - 0.12, 0.08, box.maxZ - box.minZ - 0.12],
    }));
    return {
      beams,
      panels,
      rails,
      lamps,
      bulbs,
      strips,
      baseboards,
      seats,
      plinths,
    };
  }, [layout, length, width, half, top, midZ]);

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, midZ]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial map={floor} roughness={0.5} metalness={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, top, midZ]}>
        <planeGeometry args={[width, length]} />
        <meshBasicMaterial color={PAINT.ceiling} />
      </mesh>
      <mesh position={[-half, top / 2, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, top]} />
        <meshStandardMaterial color={PAINT.wall} roughness={0.85} />
      </mesh>
      <mesh position={[half, top / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, top]} />
        <meshStandardMaterial color={PAINT.wall} roughness={0.85} />
      </mesh>
      <mesh position={[0, top / 2, -length]}>
        <planeGeometry args={[width, top]} />
        <meshStandardMaterial color={PAINT.wall} roughness={0.85} />
      </mesh>
      <mesh position={[0, top / 2, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, top]} />
        <meshStandardMaterial color={PAINT.wall} roughness={0.85} />
      </mesh>

      <Boxes items={dressing.baseboards}>
        <meshStandardMaterial color={PAINT.baseboard} roughness={0.7} />
      </Boxes>
      <Boxes items={dressing.beams}>
        <meshBasicMaterial color={PAINT.beam} />
      </Boxes>
      <Boxes items={dressing.rails}>
        <meshStandardMaterial color={PAINT.rail} roughness={0.6} />
      </Boxes>
      <Boxes items={dressing.lamps}>
        <meshStandardMaterial color={PAINT.rail} roughness={0.5} />
      </Boxes>
      <Boxes items={dressing.bulbs}>
        <meshBasicMaterial color={PAINT.lamp} toneMapped={false} />
      </Boxes>
      <Boxes items={dressing.strips}>
        <meshBasicMaterial color={PAINT.lamp} toneMapped={false} />
      </Boxes>
      <Boxes items={dressing.panels}>
        <meshStandardMaterial
          color={PAINT.orange}
          roughness={0.5}
          emissive={PAINT.orange}
          emissiveIntensity={0.5}
        />
      </Boxes>
      <Boxes items={dressing.seats} castShadow>
        <meshStandardMaterial color={PAINT.bench} roughness={0.8} />
      </Boxes>
      <Boxes items={dressing.plinths}>
        <meshStandardMaterial color={PAINT.benchBase} roughness={0.8} />
      </Boxes>

      <mesh position={[0, top / 2, pillarZ]} castShadow>
        <boxGeometry args={[HALL.pillarSize, top, HALL.pillarSize]} />
        <meshStandardMaterial color={PAINT.pillar} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.2, pillarZ]}>
        <boxGeometry
          args={[HALL.pillarSize + 0.04, 0.4, HALL.pillarSize + 0.04]}
        />
        <meshStandardMaterial
          color={PAINT.orange}
          roughness={0.5}
          emissive={PAINT.orange}
          emissiveIntensity={0.5}
        />
      </mesh>
      <PillarFace z={pillarZ + pillarHalf + 0.012} facing={1} />
      <PillarFace z={pillarZ - pillarHalf - 0.012} facing={-1} />

      <GallerySign gallery={gallery} z={-length + 0.02} facing={1} />
      <GallerySign gallery={gallery} z={-0.02} facing={-1} />
    </group>
  );
}

export function Hall({
  layout,
  works,
  gallery,
  quality,
}: {
  layout: HallLayout;
  works: StudentWork[];
  gallery: GalleryId;
  quality: MuseumSettings["quality"];
}) {
  useInvalidateOnChange(layout);
  useInvalidateOnChange(quality);
  useInvalidateOnChange(gallery);
  const byId = useMemo(
    () => new Map(works.map((work) => [work.id, work])),
    [works],
  );
  const glow = useMemo(() => glowTexture(), []);
  useEffect(() => () => glow.dispose(), [glow]);

  return (
    <group>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffeeda", "#6f6a63", 0.75]} />
      <CeilingLight layout={layout} shadows={quality === "high"} />
      <Room layout={layout} gallery={gallery} />
      {layout.slots.map((slot: HallSlot) => {
        const work = byId.get(slot.workId);
        if (!work) return null;
        return (
          <ExhibitFrame key={slot.workId} slot={slot} work={work} glow={glow} />
        );
      })}
    </group>
  );
}
