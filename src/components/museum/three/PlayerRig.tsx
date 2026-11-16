"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Raycaster, Vector2, type Object3D } from "three";
import { HALL } from "@/lib/museum/hall";
import {
  applyLook,
  standInFront,
  stepPlayer,
  type Player,
} from "@/lib/museum/movement";
import type { MuseumCanvasProps } from "../loadMuseumCanvas";

const GLIDE_MS = 800;
const DRAG_PX = 6;
/** applyLook treats deltas as radians. Scale pointer pixels before that. */
const LOOK_PER_PX = 0.002;
const MAX_DT = 0.05;

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
  camera.rotation.x = -player.pitch;
}

function exhibitIdOf(object: Object3D): string | null {
  let current: Object3D | null = object;
  while (current) {
    const id = current.userData.exhibitId;
    if (typeof id === "string") return id;
    current = current.parent;
  }
  return null;
}

export function PlayerRig({
  layout,
  target,
  targetToken,
  homeTick,
  settings,
  move,
  onFocusExhibit,
  onPlayerMove,
}: Pick<
  MuseumCanvasProps,
  | "layout"
  | "target"
  | "targetToken"
  | "homeTick"
  | "settings"
  | "move"
  | "onFocusExhibit"
  | "onPlayerMove"
>) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const player = useRef<Player>({
    x: layout.spawn.x,
    z: layout.spawn.z,
    yaw: layout.spawn.yaw,
    pitch: 0,
  });
  const glide = useRef<Glide | null>(null);
  const settingsRef = useRef(settings);
  const moveRef = useRef(move);
  const layoutRef = useRef(layout);
  const onFocusRef = useRef(onFocusExhibit);
  const onMoveRef = useRef(onPlayerMove);
  const startGlideRef = useRef<(to: Player) => void>(() => {});
  const aimed = useRef<string | null>(null);
  const homeTickSeen = useRef(homeTick);

  function publish(next: Player) {
    player.current = next;
    onMoveRef.current(next);
  }

  useLayoutEffect(() => {
    settingsRef.current = settings;
    moveRef.current = move;
    layoutRef.current = layout;
    onFocusRef.current = onFocusExhibit;
    onMoveRef.current = onPlayerMove;
    startGlideRef.current = (to) => {
      if (prefersReducedMotion()) {
        glide.current = null;
        player.current = to;
        onMoveRef.current(to);
        invalidate();
        return;
      }
      glide.current = {
        from: { ...player.current },
        to,
        start: performance.now(),
      };
      invalidate();
    };
  }, [settings, move, layout, onFocusExhibit, onPlayerMove, invalidate]);

  useEffect(() => {
    onMoveRef.current(player.current);
    invalidate();
  }, [invalidate, layout]);

  useEffect(() => {
    if (!target) return;
    const slot = layout.slots.find((item) => item.workId === target);
    if (!slot) return;
    const stand = standInFront(slot);
    startGlideRef.current({ x: stand.x, z: stand.z, yaw: stand.yaw, pitch: 0 });
    const aim = `${target}:${targetToken}`;
    if (aimed.current === aim) return;
    aimed.current = aim;
    onFocusRef.current(target);
  }, [target, targetToken, layout]);

  useEffect(() => {
    // A remounted hall already starts at the entrance. Glide home only when
    // Exit changes the tick. Strict Mode replays this effect on the same
    // instance, and that replay must not cancel a visit.
    if (homeTickSeen.current === homeTick) return;
    homeTickSeen.current = homeTick;
    const spawn = layoutRef.current.spawn;
    startGlideRef.current({
      x: spawn.x,
      z: spawn.z,
      yaw: spawn.yaw,
      pitch: 0,
    });
    onFocusRef.current(null);
  }, [homeTick]);

  useEffect(() => {
    if (move.forward === 0 && move.strafe === 0) return;
    glide.current = null;
    invalidate();
  }, [move, invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let drag: {
      id: number;
      lastX: number;
      lastY: number;
      originX: number;
      originY: number;
      moved: boolean;
    } | null = null;

    function pick(event: PointerEvent): string | null {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        const id = exhibitIdOf(hit.object);
        if (id) return id;
      }
      return null;
    }

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return;
      drag = {
        id: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        originX: event.clientX,
        originY: event.clientY,
        moved: false,
      };
      el.setPointerCapture?.(event.pointerId);
    }

    function onMove(event: PointerEvent) {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      if (
        Math.hypot(
          event.clientX - drag.originX,
          event.clientY - drag.originY,
        ) >= DRAG_PX
      ) {
        drag.moved = true;
      }
      if (!drag.moved) return;
      glide.current = null;
      const current = settingsRef.current;
      publish(
        applyLook(
          player.current,
          dx * LOOK_PER_PX,
          dy * LOOK_PER_PX,
          current.lookSensitivity,
          current.invertLook,
        ),
      );
      invalidate();
    }

    function onUp(event: PointerEvent) {
      if (!drag || drag.id !== event.pointerId) return;
      const moved = drag.moved;
      drag = null;
      if (el.hasPointerCapture?.(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      if (moved) return;
      const id = pick(event);
      if (!id) return;
      const slot = layoutRef.current.slots.find((item) => item.workId === id);
      if (!slot) return;
      const stand = standInFront(slot);
      startGlideRef.current({
        x: stand.x,
        z: stand.z,
        yaw: stand.yaw,
        pitch: 0,
      });
      onFocusRef.current(id);
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [camera, gl, scene, invalidate]);

  useFrame((_, dt) => {
    const motion = glide.current;
    if (motion) {
      const t = Math.min(1, (performance.now() - motion.start) / GLIDE_MS);
      const ease = 1 - (1 - t) ** 3;
      publish({
        x: mix(motion.from.x, motion.to.x, ease),
        z: mix(motion.from.z, motion.to.z, ease),
        yaw: mixAngle(motion.from.yaw, motion.to.yaw, ease),
        pitch: mix(motion.from.pitch, motion.to.pitch, ease),
      });
      if (t >= 1) glide.current = null;
      else invalidate();
    } else {
      const input = moveRef.current;
      if (input.forward !== 0 || input.strafe !== 0) {
        const stepped = stepPlayer(
          player.current,
          input,
          Math.min(dt, MAX_DT),
          settingsRef.current.moveSpeed,
          layoutRef.current,
        );
        if (stepped.x !== player.current.x || stepped.z !== player.current.z) {
          publish(stepped);
        }
        invalidate();
      }
    }
    placeCamera(camera, player.current);
  });

  return null;
}
