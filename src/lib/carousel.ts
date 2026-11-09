import { useSyncExternalStore } from "react";

/** Wraps an index into 0..count-1, so stepping past either end loops. */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/** How far a finger must travel sideways to count as a swipe. */
export const SWIPE_MIN = 50;

/**
 * Which way a finger movement steps the carousel: 1 (next) for a swipe
 * left, -1 (previous) for a swipe right, 0 for a tap or a mostly vertical
 * movement (scrolling the page).
 */
export function swipeStep(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}

/**
 * The track's translateX that centers slide `index`, given slides of width
 * var(--slide) with var(--gap) between them. The track is as wide as the
 * viewport, so 50% of it is the viewport's middle.
 */
export function centerSlide(index: number): string {
  return `translateX(calc(50% - ${index + 0.5} * var(--slide) - ${index} * var(--gap)))`;
}

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  media?.addEventListener("change", onChange);
  return () => media?.removeEventListener("change", onChange);
}

/** Whether the visitor asked for less motion (false on the server). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    () => false,
  );
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Whether the page's tab is showing (true on the server). */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
}
