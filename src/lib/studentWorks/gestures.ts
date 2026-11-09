const SWIPE_DISTANCE = 60;
const CLOSE_DISTANCE = 100;

/** Maps a touch swipe to a lightbox action; never fires while zoomed. */
export function classifySwipe(
  dx: number,
  dy: number,
  zoomed: boolean,
): "next" | "previous" | "close" | null {
  if (zoomed) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx <= -SWIPE_DISTANCE) return "next";
    if (dx >= SWIPE_DISTANCE) return "previous";
    return null;
  }
  return dy >= CLOSE_DISTANCE ? "close" : null;
}
