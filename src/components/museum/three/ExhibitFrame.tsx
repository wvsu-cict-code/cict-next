/* eslint-disable react/no-unknown-property */
"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type Texture } from "three";
import type { StudentWork } from "@/lib/cms/content";
import {
  CATEGORY_MEDIA,
  CATEGORY_TINT,
  type Category,
} from "@/lib/museum/categories";
import type { HallSlot } from "@/lib/museum/hall";
import { exhibitImageUrl, useExhibitTexture } from "./useExhibitTexture";

const OSWALD = "/fonts/Oswald.ttf";

/** Height of a frame's centre, and how far it stands off the wall, in metres. */
const FRAME_Y = 1.7;
const STAND_OFF = 0.08;
/** The label's size and the height of its centre, just under eye level. */
const PLACARD = { width: 0.86, height: 0.46, y: 1.42 } as const;

type Attrs = Record<string, string | number>;
type IconNode = [string, Attrs][];

/** Lucide outlines, drawn onto the category panel when a texture is missing. */
const GLYPH: Record<Category, IconNode> = {
  game: [
    ["line", { x1: 6, x2: 10, y1: 11, y2: 11 }],
    ["line", { x1: 8, x2: 8, y1: 9, y2: 13 }],
    ["line", { x1: 15, x2: 15.01, y1: 12, y2: 12 }],
    ["line", { x1: 18, x2: 18.01, y1: 10, y2: 10 }],
    [
      "path",
      {
        d: "M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",
      },
    ],
  ],
  interactive_media: [
    ["path", { d: "M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" }],
    ["path", { d: "M10 19v-3.96 3.15" }],
    ["path", { d: "M7 19h5" }],
    ["rect", { width: 6, height: 10, x: 16, y: 12, rx: 2 }],
  ],
  xr_3d: [
    [
      "path",
      {
        d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
      },
    ],
    ["path", { d: "m3.3 7 8.7 5 8.7-5" }],
    ["path", { d: "M12 22V12" }],
  ],
  digital_art: [
    ["rect", { width: 18, height: 18, x: 3, y: 3, rx: 2, ry: 2 }],
    ["circle", { cx: 9, cy: 9, r: 2 }],
    ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }],
  ],
  animation: [
    ["path", { d: "m12.296 3.464 3.02 3.956" }],
    [
      "path",
      {
        d: "M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z",
      },
    ],
    ["path", { d: "M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }],
    ["path", { d: "m6.18 5.276 3.1 3.899" }],
  ],
  short_film: [
    ["rect", { width: 18, height: 18, x: 3, y: 3, rx: 2 }],
    ["path", { d: "M7 3v18" }],
    ["path", { d: "M3 7.5h4" }],
    ["path", { d: "M3 12h18" }],
    ["path", { d: "M3 16.5h4" }],
    ["path", { d: "M17 3v18" }],
    ["path", { d: "M17 7.5h4" }],
    ["path", { d: "M17 16.5h4" }],
  ],
  sound_design: [
    [
      "path",
      {
        d: "M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2",
      },
    ],
  ],
};

function drawGlyph(ctx: CanvasRenderingContext2D, node: IconNode) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.75;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [tag, attrs] of node) {
    ctx.beginPath();
    if (tag === "path" && typeof attrs.d === "string") {
      ctx.stroke(new Path2D(attrs.d));
      continue;
    }
    if (tag === "rect") {
      const x = Number(attrs.x ?? 0);
      const y = Number(attrs.y ?? 0);
      const w = Number(attrs.width);
      const h = Number(attrs.height);
      const r = Number(attrs.rx ?? attrs.ry ?? 0);
      ctx.roundRect(x, y, w, h, r);
      ctx.stroke();
      continue;
    }
    if (tag === "circle") {
      ctx.arc(
        Number(attrs.cx),
        Number(attrs.cy),
        Number(attrs.r),
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      continue;
    }
    if (tag === "line") {
      ctx.moveTo(Number(attrs.x1), Number(attrs.y1));
      ctx.lineTo(Number(attrs.x2), Number(attrs.y2));
      ctx.stroke();
    }
  }
}

function categoryTexture(category: Category): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const tint = CATEGORY_TINT[category];
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, tint.from);
    gradient.addColorStop(1, tint.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    const icon = 220;
    const scale = icon / 24;
    ctx.save();
    ctx.translate((512 - icon) / 2, (512 - icon) / 2);
    ctx.scale(scale, scale);
    drawGlyph(ctx, GLYPH[category]);
    ctx.restore();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function useCategoryArt(category: Category): CanvasTexture {
  const texture = useMemo(() => categoryTexture(category), [category]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Wall label beside the frame, at eye height, like a museum caption. */
function Placard({ title, student }: { title: string; student: string }) {
  const invalidate = useThree((state) => state.invalidate);
  const inner = PLACARD.width - 0.16;
  return (
    <group>
      <mesh>
        <boxGeometry args={[PLACARD.width, PLACARD.height, 0.03]} />
        <meshStandardMaterial color="#1c2128" roughness={0.6} />
      </mesh>
      <mesh position={[-PLACARD.width / 2 + 0.012, 0, 0.002]}>
        <boxGeometry args={[0.024, PLACARD.height, 0.03]} />
        <meshBasicMaterial color="#e8661f" toneMapped={false} />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[-PLACARD.width / 2 + 0.1, PLACARD.height / 2 - 0.07, 0.02]}
          font={OSWALD}
          fontSize={0.075}
          color="#f6f3ee"
          maxWidth={inner}
          lineHeight={1.15}
          anchorX="left"
          anchorY="top"
          textAlign="left"
          // Two lines of title. A longer one is cut off, not spilled on the wall.
          clipRect={[0, -0.19, inner, 0]}
          onSync={() => invalidate()}
        >
          {title}
        </Text>
        <Text
          position={[
            -PLACARD.width / 2 + 0.1,
            -PLACARD.height / 2 + 0.07,
            0.02,
          ]}
          font={OSWALD}
          fontSize={0.05}
          color="#c9c3ba"
          maxWidth={inner}
          anchorX="left"
          anchorY="bottom"
          textAlign="left"
          clipRect={[0, 0, inner, 0.07]}
          onSync={() => invalidate()}
        >
          {student}
        </Text>
      </Suspense>
    </group>
  );
}

function PlayMarker() {
  return (
    <group position={[0, 0, 0.04]}>
      <mesh>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#102033" transparent opacity={0.72} />
      </mesh>
      <mesh position={[0.025, 0, 0.01]}>
        <circleGeometry args={[0.09, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function WaveformMarker() {
  const heights = [0.1, 0.18, 0.12, 0.22, 0.14, 0.2, 0.11];
  return (
    <group position={[0, 0, 0.04]}>
      <mesh>
        <planeGeometry args={[0.74, 0.36]} />
        <meshBasicMaterial color="#102033" transparent opacity={0.72} />
      </mesh>
      {heights.map((height, index) => (
        <mesh key={height + index} position={[(index - 3) * 0.08, 0, 0.01]}>
          <planeGeometry args={[0.035, height]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/** Light pools are decoration. A click on one must not pick the exhibit. */
function noRaycast() {}

function LightPool({
  position,
  rotation,
  size,
  glow,
  opacity,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  glow: Texture;
  opacity: number;
}) {
  return (
    <mesh position={position} rotation={rotation} raycast={noRaycast}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={glow}
        color="#ffe7c7"
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

export function ExhibitFrame({
  slot,
  work,
  glow,
}: {
  slot: HallSlot;
  work: StudentWork;
  /** Shared soft-falloff texture for the light pools. */
  glow: Texture;
}) {
  const loaded = useExhibitTexture(exhibitImageUrl(work));
  const placeholder = useCategoryArt(work.category);
  const photo: Texture | null = loaded && loaded !== "failed" ? loaded : null;
  const map = photo ?? placeholder;
  const into = slot.side === "left" ? STAND_OFF : -STAND_OFF;
  const media = CATEGORY_MEDIA[work.category];

  return (
    <group
      position={[slot.x + into, FRAME_Y, slot.z]}
      rotation={[0, slot.rotationY, 0]}
      userData={{ exhibitId: work.id }}
    >
      {/* The track lamp's wash on the wall, and its spill on the floor. */}
      <LightPool
        position={[0, 0.35, -STAND_OFF + 0.01]}
        size={[slot.width + 3.4, slot.height + 3.2]}
        glow={glow}
        opacity={0.85}
      />
      <LightPool
        position={[0, -FRAME_Y + 0.012, 1.15]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[slot.width + 1.8, 2.9]}
        glow={glow}
        opacity={0.4}
      />
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[slot.width + 0.16, slot.height + 0.16, 0.04]} />
        <meshStandardMaterial color="#14181e" roughness={0.55} />
      </mesh>
      {/* Unlit, so the work shows its own colours whatever the hall lighting. */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[slot.width, slot.height]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {media === "video" ? <PlayMarker /> : null}
      {media === "audio" ? <WaveformMarker /> : null}
      <group
        position={[
          slot.width / 2 + 0.2 + PLACARD.width / 2,
          PLACARD.y - FRAME_Y,
          -STAND_OFF + 0.02,
        ]}
      >
        <Placard title={work.title} student={work.student} />
      </group>
    </group>
  );
}
