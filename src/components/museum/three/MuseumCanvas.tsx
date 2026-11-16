"use client";

import { Canvas } from "@react-three/fiber";
import { HALL } from "@/lib/museum/hall";
import type { MuseumCanvasProps } from "../loadMuseumCanvas";
import { Hall } from "./Hall";
import { PlayerRig } from "./PlayerRig";

export default function MuseumCanvas({
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
      shadows={low ? false : "basic"}
      gl={{ antialias: !low }}
      camera={{
        fov: 60,
        near: 0.1,
        far: 200,
        position: [0, HALL.eyeHeight, layout.spawn.z],
      }}
      className="h-full w-full touch-none"
    >
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
      <Hall layout={layout} works={works} quality={settings.quality} />
    </Canvas>
  );
}
