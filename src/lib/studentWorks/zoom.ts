import type { Size } from "@/lib/studentWorks/layout";

export type ZoomState = { scale: number; x: number; y: number };

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
export const RESET: ZoomState = { scale: MIN_SCALE, x: 0, y: 0 };

function clampOffset(value: number, imageSize: number, viewportSize: number, scale: number) {
  const limit = Math.max(0, (imageSize * scale - viewportSize) / 2);
  return Math.min(limit, Math.max(-limit, value));
}

function clampState(state: ZoomState, image: Size, viewport: Size): ZoomState {
  if (state.scale <= MIN_SCALE) return RESET;
  return {
    scale: state.scale,
    x: clampOffset(state.x, image.width, viewport.width, state.scale),
    y: clampOffset(state.y, image.height, viewport.height, state.scale),
  };
}

/** Zooms to `scale`, keeping the image point under `focus` (relative to the viewport centre) fixed. */
export function zoomAt(
  state: ZoomState,
  scale: number,
  focus: { x: number; y: number },
  image: Size,
  viewport: Size,
): ZoomState {
  const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  const ratio = next / state.scale;
  return clampState(
    {
      scale: next,
      x: focus.x - (focus.x - state.x) * ratio,
      y: focus.y - (focus.y - state.y) * ratio,
    },
    image,
    viewport,
  );
}

/** Pans a zoomed image, keeping it covering the viewport. */
export function panBy(
  state: ZoomState,
  dx: number,
  dy: number,
  image: Size,
  viewport: Size,
): ZoomState {
  return clampState({ ...state, x: state.x + dx, y: state.y + dy }, image, viewport);
}
