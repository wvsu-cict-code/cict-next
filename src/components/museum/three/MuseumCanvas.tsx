/* eslint-disable react/no-unknown-property */
"use client";

import { useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { fovForAspect } from "@/lib/museum/camera";
import { HALL } from "@/lib/museum/hall";
import type { MuseumCanvasProps } from "../loadMuseumCanvas";
import { Hall } from "./Hall";
import { PlayerRig } from "./PlayerRig";

/** Beyond the hall, and what the far end of a long hall fades into. */
const BACKDROP = "#0d1117";

/** Fits the field of view to the canvas shape whenever it is resized. */
function Lens() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    if (!("isPerspectiveCamera" in camera) || height === 0) return;
    const lens = camera as PerspectiveCamera;
    lens.fov = fovForAspect(width / height);
    lens.updateProjectionMatrix();
    invalidate();
  }, [camera, width, height, invalidate]);

  return null;
}

export default function MuseumCanvas({
  gallery,
  layout,
  works,
  target,
  targetToken,
  homeTick,
  settings,
  move,
  onFocusExhibit,
  onPlayerMove,
}: MuseumCanvasProps) {
  const low = settings.quality === "low";
  return (
    <Canvas
      frameloop="demand"
      dpr={low ? 1 : [1, 2]}
      shadows={low ? false : "percentage"}
      gl={{ antialias: !low }}
      camera={{
        fov: 60,
        near: 0.1,
        far: 200,
        position: [0, HALL.eyeHeight, layout.spawn.z],
      }}
      className="h-full w-full touch-none"
    >
      <color attach="background" args={[BACKDROP]} />
      <fog attach="fog" args={[BACKDROP, 30, 130]} />
      <Lens />
      <PlayerRig
        layout={layout}
        target={target}
        targetToken={targetToken}
        homeTick={homeTick}
        settings={settings}
        move={move}
        onFocusExhibit={onFocusExhibit}
        onPlayerMove={onPlayerMove}
      />
      <Hall
        layout={layout}
        works={works}
        gallery={gallery}
        quality={settings.quality}
      />
    </Canvas>
  );
}
