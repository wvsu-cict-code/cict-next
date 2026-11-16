"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { HALL } from "@/lib/museum/hall";
import { standInFront, type Player } from "@/lib/museum/movement";
import type { MuseumCanvasProps } from "../loadMuseumCanvas";
import { Hall } from "./Hall";

const GLIDE_MS = 800;

type Glide = { from: Player; to: Player; start: number };

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function mixAngle(from: number, to: number, t: number): number {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * t;
}

function placeCamera(
  camera: {
    position: { set(x: number, y: number, z: number): void };
    rotation: { order: string; y: number; x: number };
  },
  player: Player,
) {
  camera.position.set(player.x, HALL.eyeHeight, player.z);
  camera.rotation.order = "YXZ";
  camera.rotation.y = player.yaw;
  // Positive pitch looks up. Three's positive x rotation looks down.
  camera.rotation.x = -player.pitch;
}

function CameraRig({
  layout,
  target,
  onFocusExhibit,
  onPlayerMove,
}: Pick<
  MuseumCanvasProps,
  "layout" | "target" | "onFocusExhibit" | "onPlayerMove"
>) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const player = useRef<Player>({
    x: layout.spawn.x,
    z: layout.spawn.z,
    yaw: layout.spawn.yaw,
    pitch: 0,
  });
  const glide = useRef<Glide | null>(null);

  useEffect(() => {
    const slot = target
      ? layout.slots.find((item) => item.workId === target)
      : undefined;
    if (!slot) {
      player.current = {
        x: layout.spawn.x,
        z: layout.spawn.z,
        yaw: layout.spawn.yaw,
        pitch: 0,
      };
      glide.current = null;
      onPlayerMove(player.current);
      onFocusExhibit(null);
      invalidate();
      return;
    }

    const stand = standInFront(slot);
    const next: Player = { x: stand.x, z: stand.z, yaw: stand.yaw, pitch: 0 };
    onFocusExhibit(target);
    if (prefersReducedMotion()) {
      player.current = next;
      glide.current = null;
      onPlayerMove(next);
      invalidate();
      return;
    }
    glide.current = {
      from: { ...player.current },
      to: next,
      start: performance.now(),
    };
    invalidate();
  }, [layout, target, invalidate, onFocusExhibit, onPlayerMove]);

  useFrame(() => {
    const motion = glide.current;
    if (motion) {
      const t = Math.min(1, (performance.now() - motion.start) / GLIDE_MS);
      const ease = 1 - (1 - t) ** 3;
      player.current = {
        x: mix(motion.from.x, motion.to.x, ease),
        z: mix(motion.from.z, motion.to.z, ease),
        yaw: mixAngle(motion.from.yaw, motion.to.yaw, ease),
        pitch: mix(motion.from.pitch, motion.to.pitch, ease),
      };
      onPlayerMove(player.current);
      if (t >= 1) glide.current = null;
      else invalidate();
    }
    placeCamera(camera, player.current);
  });

  return null;
}

export default function MuseumCanvas({
  layout,
  works,
  target,
  settings,
  onFocusExhibit,
  onPlayerMove,
}: MuseumCanvasProps) {
  const low = settings.quality === "low";
  return (
    <Canvas
      frameloop="demand"
      dpr={low ? 1 : [1, 2]}
      shadows={low ? false : "basic"}
      gl={{ antialias: !low }}
      camera={{
        fov: 60,
        near: 0.1,
        far: 200,
        position: [0, HALL.eyeHeight, layout.spawn.z],
      }}
      className="h-full w-full"
    >
      <CameraRig
        layout={layout}
        target={target}
        onFocusExhibit={onFocusExhibit}
        onPlayerMove={onPlayerMove}
      />
      <Hall layout={layout} works={works} quality={settings.quality} />
    </Canvas>
  );
}
