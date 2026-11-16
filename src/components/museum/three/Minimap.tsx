"use client";

import type { HallLayout } from "@/lib/museum/hall";
import type { Player } from "@/lib/museum/movement";

const VIEW = 160;

/**
 * Hall outline with the entrance at the bottom. Yaw 0 looks up the hall,
 * which is toward −z, so the visitor arrow points up at yaw 0.
 */
export function Minimap({
  layout,
  player,
  focusId,
}: {
  layout: HallLayout;
  player: Player;
  focusId: string | null;
}) {
  const scale = Math.min(
    (VIEW - 16) / layout.width,
    (VIEW - 16) / layout.length,
  );
  const drawnW = layout.width * scale;
  const drawnH = layout.length * scale;
  const originX = (VIEW - drawnW) / 2;
  const originY = (VIEW - drawnH) / 2;
  const xOf = (x: number) => originX + (x + layout.width / 2) * scale;
  const yOf = (z: number) => originY + (layout.length + z) * scale;
  const yawDeg = (-player.yaw * 180) / Math.PI;

  return (
    <svg
      role="img"
      aria-label="Museum minimap"
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="pointer-events-none h-36 w-36 text-white"
    >
      <rect
        x={xOf(-layout.width / 2)}
        y={yOf(-layout.length)}
        width={drawnW}
        height={drawnH}
        fill="rgba(0,0,0,0.45)"
        stroke="currentColor"
        strokeOpacity={0.7}
      />
      {layout.slots.map((slot) => {
        const focused = slot.workId === focusId;
        return (
          <circle
            key={slot.workId}
            cx={xOf(slot.x)}
            cy={yOf(slot.z)}
            r={focused ? 4.5 : 3}
            fill={focused ? "#ff9470" : "currentColor"}
          />
        );
      })}
      <polygon
        points="0,-7 5,6 -5,6"
        fill="#ff9470"
        transform={`translate(${xOf(player.x)} ${yOf(player.z)}) rotate(${yawDeg})`}
      />
    </svg>
  );
}
