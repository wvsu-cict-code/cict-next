"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export type MoveInput = { forward: number; strafe: number };

export type MuseumKeyHandlers = {
  move(input: MoveInput): void;
  interact(): void;
  toggleMap(): void;
};

const HOLDABLE = [
  "w",
  "a",
  "s",
  "d",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
] as const;

type HoldId = (typeof HOLDABLE)[number];

function holdId(
  event: KeyboardEvent,
): HoldId | "interact" | "map" | "space" | null {
  switch (event.code) {
    case "KeyW":
      return "w";
    case "KeyA":
      return "a";
    case "KeyS":
      return "s";
    case "KeyD":
      return "d";
    case "ArrowUp":
      return "ArrowUp";
    case "ArrowDown":
      return "ArrowDown";
    case "ArrowLeft":
      return "ArrowLeft";
    case "ArrowRight":
      return "ArrowRight";
    case "KeyE":
      return "interact";
    case "KeyM":
      return "map";
    case "Space":
      return "space";
    default:
      break;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  switch (key) {
    case "w":
    case "a":
    case "s":
    case "d":
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      return key;
    case "e":
      return "interact";
    case "m":
      return "map";
    case " ":
      return "space";
    default:
      return null;
  }
}

function isHold(id: HoldId | "interact" | "map" | "space"): id is HoldId {
  return (HOLDABLE as readonly string[]).includes(id);
}

function vector(held: Set<HoldId>): MoveInput {
  const forward =
    (held.has("w") || held.has("ArrowUp") ? 1 : 0) -
    (held.has("s") || held.has("ArrowDown") ? 1 : 0);
  const strafe =
    (held.has("d") || held.has("ArrowRight") ? 1 : 0) -
    (held.has("a") || held.has("ArrowLeft") ? 1 : 0);
  return { forward, strafe };
}

function ignoredTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("[data-museum-overlay]")) return true;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }
  return target instanceof HTMLElement && target.isContentEditable;
}

/**
 * WASD / arrows, E and M while `container` itself holds focus.
 * Listeners stay on that element: keys typed elsewhere never arrive.
 */
export function useMuseumKeys(
  container: RefObject<HTMLElement | null>,
  handlers: MuseumKeyHandlers,
): void {
  const handlersRef = useRef(handlers);
  useLayoutEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const held = new Set<HoldId>();

    function publish() {
      handlersRef.current.move(vector(held));
    }

    function onKeyDown(event: KeyboardEvent) {
      if (document.activeElement !== node) return;
      if (ignoredTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const id = holdId(event);
      if (!id) return;
      if (id === "space" || id.startsWith("Arrow")) event.preventDefault();
      if (id === "interact") {
        if (!event.repeat) handlersRef.current.interact();
        return;
      }
      if (id === "map") {
        if (!event.repeat) handlersRef.current.toggleMap();
        return;
      }
      if (id === "space" || !isHold(id)) return;
      held.add(id);
      publish();
    }

    function onKeyUp(event: KeyboardEvent) {
      const id = holdId(event);
      if (!id || !isHold(id) || !held.has(id)) return;
      held.delete(id);
      publish();
    }

    function onFocusOut(event: FocusEvent) {
      const next = event.relatedTarget;
      if (next instanceof Node && node.contains(next)) return;
      if (held.size === 0) return;
      held.clear();
      publish();
    }

    node.addEventListener("keydown", onKeyDown);
    node.addEventListener("keyup", onKeyUp);
    node.addEventListener("focusout", onFocusOut);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      node.removeEventListener("keyup", onKeyUp);
      node.removeEventListener("focusout", onFocusOut);
    };
  }, [container]);
}
