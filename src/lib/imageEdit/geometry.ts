export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Rotation = 0 | 90 | 180 | 270;
export type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export const ASPECTS = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
] as const;

export type AspectId = (typeof ASPECTS)[number]["id"];

export function aspectRatio(id: AspectId): number | null {
  return ASPECTS.find((a) => a.id === id)?.ratio ?? null;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Smallest crop edge in image pixels (never more than the image allows). */
export function minCropSize(image: Size): number {
  return Math.min(32, image.width, image.height);
}

/** The image's size after a quarter-turn rotation. */
export function rotatedSize(size: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
}

export function rotateBy(rotation: Rotation, quarterTurns: number): Rotation {
  return ((((rotation + quarterTurns * 90) % 360) + 360) % 360) as Rotation;
}

/** Mirrors a crop when the image it sits on is flipped. */
export function flipRect(rect: Rect, image: Size, axis: "x" | "y"): Rect {
  return axis === "x"
    ? { ...rect, x: image.width - rect.x - rect.width }
    : { ...rect, y: image.height - rect.y - rect.height };
}

/** The largest rect with the given ratio that fits inside bounds, centered. */
export function fitAspect(bounds: Rect, ratio: number | null): Rect {
  if (!ratio) return { ...bounds };
  const width =
    bounds.width / bounds.height > ratio ? bounds.height * ratio : bounds.width;
  const height = width / ratio;
  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + (bounds.height - height) / 2,
    width,
    height,
  };
}

/** Slides a crop by dx/dy image pixels, keeping it on the image. */
export function moveCrop(crop: Rect, image: Size, dx: number, dy: number) {
  return {
    ...crop,
    x: clamp(crop.x + dx, 0, image.width - crop.width),
    y: clamp(crop.y + dy, 0, image.height - crop.height),
  };
}

/**
 * Drags one handle of a crop by dx/dy image pixels. With a ratio, the crop
 * keeps that shape: corners pivot on the opposite corner, edges grow the
 * other side evenly. The crop never leaves the image or drops below
 * minCropSize().
 */
export function resizeCrop(
  start: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  image: Size,
  ratio: number | null,
): Rect {
  const min = minCropSize(image);
  const left = start.x;
  const top = start.y;
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");

  if (!ratio) {
    const l = west ? clamp(left + dx, 0, right - min) : left;
    const r = east ? clamp(right + dx, left + min, image.width) : right;
    const t = north ? clamp(top + dy, 0, bottom - min) : top;
    const b = south ? clamp(bottom + dy, top + min, image.height) : bottom;
    return { x: l, y: t, width: r - l, height: b - t };
  }

  const minWidth = Math.max(min, min * ratio);
  const fit = (width: number, maxWidth: number) =>
    clamp(width, Math.min(minWidth, maxWidth), maxWidth);

  if ((west || east) && (north || south)) {
    // Corner: the opposite corner stays put
    const anchorX = west ? right : left;
    const anchorY = north ? bottom : top;
    const fromX = start.width + (west ? -dx : dx);
    const fromY = (start.height + (north ? -dy : dy)) * ratio;
    const wanted = Math.abs(dx) >= Math.abs(dy) * ratio ? fromX : fromY;
    const roomX = west ? anchorX : image.width - anchorX;
    const roomY = north ? anchorY : image.height - anchorY;
    const width = fit(wanted, Math.min(roomX, roomY * ratio));
    const height = width / ratio;
    return {
      x: west ? anchorX - width : anchorX,
      y: north ? anchorY - height : anchorY,
      width,
      height,
    };
  }

  if (west || east) {
    // Side edge: width follows the drag, height grows evenly around the middle
    const anchorX = west ? right : left;
    const roomX = west ? anchorX : image.width - anchorX;
    const width = fit(
      start.width + (west ? -dx : dx),
      Math.min(roomX, image.height * ratio),
    );
    const height = width / ratio;
    const middle = start.y + start.height / 2;
    return {
      x: west ? anchorX - width : anchorX,
      y: clamp(middle - height / 2, 0, image.height - height),
      width,
      height,
    };
  }

  // Top or bottom edge
  const anchorY = north ? bottom : top;
  const roomY = north ? anchorY : image.height - anchorY;
  const height =
    fit(
      (start.height + (north ? -dy : dy)) * ratio,
      Math.min(roomY * ratio, image.width),
    ) / ratio;
  const width = height * ratio;
  const middle = start.x + start.width / 2;
  return {
    x: clamp(middle - width / 2, 0, image.width - width),
    y: north ? anchorY - height : anchorY,
    width,
    height,
  };
}

/** Rounds a crop to whole pixels that still lie on the image. */
export function pixelRect(rect: Rect, image: Size): Rect {
  const x = clamp(Math.round(rect.x), 0, image.width - 1);
  const y = clamp(Math.round(rect.y), 0, image.height - 1);
  return {
    x,
    y,
    width: clamp(Math.round(rect.width), 1, image.width - x),
    height: clamp(Math.round(rect.height), 1, image.height - y),
  };
}
