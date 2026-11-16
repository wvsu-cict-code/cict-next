/* eslint-disable react/no-unknown-property */
"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { Object3D, SpotLight } from "three";
import type { StudentWork } from "@/lib/cms/content";
import {
  HALL,
  type Box,
  type HallLayout,
  type HallSlot,
} from "@/lib/museum/hall";
import type { MuseumSettings } from "@/lib/museum/settings";
import { ExhibitFrame } from "./ExhibitFrame";

const OSWALD = "/fonts/Oswald.ttf";
const PILLAR_COPY = "BSEMC\nVirtual Museum\nStudent Creative Showcase";

function useInvalidateOnChange(value: unknown) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, value]);
}

function Glyph({
  children,
  position,
  fontSize,
  color,
  maxWidth,
}: {
  children: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
  maxWidth: number;
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
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={1.15}
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

function FrameSpot({ slot }: { slot: HallSlot }) {
  const light = useRef<SpotLight>(null);
  const target = useRef<Object3D>(null);
  const invalidate = useThree((state) => state.invalidate);
  const into = slot.side === "left" ? 1.6 : -1.6;
  useLayoutEffect(() => {
    if (!light.current || !target.current) return;
    light.current.target = target.current;
    invalidate();
  }, [invalidate]);

  return (
    <>
      <spotLight
        ref={light}
        position={[slot.x + into, HALL.wallHeight - 0.25, slot.z]}
        angle={0.5}
        penumbra={0.65}
        intensity={28}
        distance={12}
        decay={2}
        color="#fff1df"
        castShadow
      />
      <object3D
        ref={target}
        position={[slot.x + (slot.side === "left" ? 0.15 : -0.15), 1.7, slot.z]}
      />
    </>
  );
}

function Room({ layout }: { layout: HallLayout }) {
  const wall = "#e9e6e1";
  const length = layout.length;
  const width = layout.width;
  const midZ = -length / 2;
  const pillarZ = midZ;
  const benches = layout.obstacles.filter((box) => !isPillar(box));

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, midZ]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#b5b0a8" roughness={0.6} metalness={0} />
      </mesh>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, HALL.wallHeight, midZ]}
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#1d232b" roughness={0.9} />
      </mesh>
      <mesh
        position={[-width / 2, HALL.wallHeight / 2, midZ]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, HALL.wallHeight]} />
        <meshStandardMaterial color={wall} roughness={0.6} />
      </mesh>
      <mesh
        position={[width / 2, HALL.wallHeight / 2, midZ]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, HALL.wallHeight]} />
        <meshStandardMaterial color={wall} roughness={0.6} />
      </mesh>
      <mesh position={[0, HALL.wallHeight / 2, -length]} receiveShadow>
        <planeGeometry args={[width, HALL.wallHeight]} />
        <meshStandardMaterial color={wall} roughness={0.6} />
      </mesh>
      <mesh
        position={[0, HALL.wallHeight / 2, 0]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, HALL.wallHeight]} />
        <meshStandardMaterial color={wall} roughness={0.6} />
      </mesh>

      <mesh position={[-width / 2 + 0.08, HALL.wallHeight - 0.32, midZ]}>
        <boxGeometry args={[0.06, 0.42, length]} />
        <meshStandardMaterial color="#e8661f" roughness={0.45} />
      </mesh>
      <mesh position={[width / 2 - 0.08, HALL.wallHeight - 0.32, midZ]}>
        <boxGeometry args={[0.06, 0.42, length]} />
        <meshStandardMaterial color="#e8661f" roughness={0.45} />
      </mesh>

      <mesh position={[0, HALL.wallHeight / 2, pillarZ]} castShadow>
        <boxGeometry
          args={[HALL.pillarSize, HALL.wallHeight, HALL.pillarSize]}
        />
        <meshStandardMaterial color="#dedad4" roughness={0.6} />
      </mesh>
      <Glyph
        position={[0, 2.15, pillarZ + HALL.pillarSize / 2 + 0.02]}
        fontSize={0.16}
        color="#1d232b"
        maxWidth={1.7}
      >
        {PILLAR_COPY}
      </Glyph>

      {benches.map((box) => {
        const sizeX = box.maxX - box.minX;
        const sizeZ = box.maxZ - box.minZ;
        return (
          <mesh
            key={`${box.minX}:${box.minZ}`}
            position={[
              (box.minX + box.maxX) / 2,
              0.24,
              (box.minZ + box.maxZ) / 2,
            ]}
            castShadow
          >
            <boxGeometry args={[sizeX, 0.48, sizeZ]} />
            <meshStandardMaterial color="#6e6258" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Hall({
  layout,
  works,
  quality,
}: {
  layout: HallLayout;
  works: StudentWork[];
  quality: MuseumSettings["quality"];
}) {
  useInvalidateOnChange(layout);
  useInvalidateOnChange(quality);
  const byId = useMemo(
    () => new Map(works.map((work) => [work.id, work])),
    [works],
  );

  return (
    <group>
      <ambientLight intensity={quality === "low" ? 0.9 : 0.28} />
      <hemisphereLight
        args={["#f7f4ef", "#8a847c", quality === "low" ? 0.45 : 0.3]}
      />
      <Room layout={layout} />
      {layout.slots.map((slot) => {
        const work = byId.get(slot.workId);
        if (!work) return null;
        return (
          <group key={slot.workId}>
            {quality === "high" ? <FrameSpot slot={slot} /> : null}
            <ExhibitFrame slot={slot} work={work} quality={quality} />
          </group>
        );
      })}
    </group>
  );
}
