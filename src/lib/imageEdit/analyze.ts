import { fitAspect, type Rect, type Size } from "./geometry";

/** RGBA pixels, laid out like ImageData. */
export type Pixels = { data: Uint8ClampedArray; width: number; height: number };

export type Sides = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type Side = keyof Sides;

/** How far (per channel, 0–255) a pixel may stray and still be "blank". */
const TOLERANCE = 18;
/** Share of a line that must match for it to count as blank. */
const MATCH_SHARE = 0.97;
/**
 * Lines that mostly match (like the rows a small caption runs through) may
 * sit inside a band, as long as a blank line follows them.
 */
const LOOSE_SHARE = 0.75;
/** Never trim more than this share of the image from one side. */
const MAX_TRIM_SHARE = 0.45;

function lineLength(px: Pixels, side: Side, span: [number, number]) {
  return side === "top" || side === "bottom" ? px.width : span[1] - span[0];
}

/** Index into px.data of the i-th pixel on the line `offset` in from `side`. */
function pixelIndex(
  px: Pixels,
  side: Side,
  offset: number,
  i: number,
  span: [number, number],
) {
  let x: number;
  let y: number;
  if (side === "top" || side === "bottom") {
    x = i;
    y = side === "top" ? offset : px.height - 1 - offset;
  } else {
    y = span[0] + i;
    x = side === "left" ? offset : px.width - 1 - offset;
  }
  return (y * px.width + x) * 4;
}

function lineMean(px: Pixels, side: Side, span: [number, number]) {
  const length = lineLength(px, side, span);
  const sum = [0, 0, 0];
  for (let i = 0; i < length; i++) {
    const at = pixelIndex(px, side, 0, i, span);
    sum[0] += px.data[at];
    sum[1] += px.data[at + 1];
    sum[2] += px.data[at + 2];
  }
  return sum.map((s) => s / Math.max(1, length));
}

/** Share of the line's pixels that are close to `ref`. */
function matchShare(
  px: Pixels,
  side: Side,
  offset: number,
  ref: number[],
  span: [number, number],
) {
  const length = lineLength(px, side, span);
  if (length === 0) return 0;
  let matching = 0;
  for (let i = 0; i < length; i++) {
    const at = pixelIndex(px, side, offset, i, span);
    if (
      Math.abs(px.data[at] - ref[0]) <= TOLERANCE &&
      Math.abs(px.data[at + 1] - ref[1]) <= TOLERANCE &&
      Math.abs(px.data[at + 2] - ref[2]) <= TOLERANCE
    ) {
      matching++;
    }
  }
  return matching / length;
}

/** Average per-channel difference between two lines. */
function lineDifference(
  px: Pixels,
  side: Side,
  a: number,
  b: number,
  span: [number, number],
) {
  const length = lineLength(px, side, span);
  let total = 0;
  for (let i = 0; i < length; i++) {
    const at = pixelIndex(px, side, a, i, span);
    const bt = pixelIndex(px, side, b, i, span);
    total +=
      Math.abs(px.data[at] - px.data[bt]) +
      Math.abs(px.data[at + 1] - px.data[bt + 1]) +
      Math.abs(px.data[at + 2] - px.data[bt + 2]);
  }
  return total / Math.max(1, length * 3);
}

/** How sharply a border must end (average per-channel change, 0–255). */
const EDGE_MIN = 12;

/** How many lines in from `side` are a flat, single-colored band. */
function bandDepth(px: Pixels, side: Side, span: [number, number]) {
  const lines = side === "top" || side === "bottom" ? px.height : px.width;
  const depthLimit = Math.floor(lines * MAX_TRIM_SHARE);
  const ref = lineMean(px, side, span);
  // The band runs while lines mostly match, and ends on its last blank line
  let depth = 0;
  for (let line = 0; line < depthLimit; line++) {
    const share = matchShare(px, side, line, ref, span);
    if (share < (line === 0 ? MATCH_SHARE : LOOSE_SHARE)) break;
    if (share >= MATCH_SHARE) depth = line + 1;
  }
  // A one-line "band" is just a dark or bright edge, not a border
  if (depth < 2 || depth >= lines - 1) return 0;

  // A border ends at a hard edge; a sky that slowly changes color doesn't.
  // Look one line further too, as downscaling blurs the edge across two.
  const last = depth - 1;
  const edge = Math.max(
    lineDifference(px, side, last, depth, span),
    lineDifference(px, side, last, Math.min(depth + 1, lines - 1), span),
  );
  return edge >= EDGE_MIN ? depth : 0;
}

/**
 * Finds blank bands along the image edges, like the empty footer Facebook
 * adds to some downloads or letterbox bars, and returns the area inside
 * them plus how much was trimmed from each side (in pixels of px).
 */
export function detectContentBounds(px: Pixels): {
  bounds: Rect;
  trimmed: Sides;
} {
  const full: [number, number] = [0, px.height];
  let top = bandDepth(px, "top", full);
  let bottom = bandDepth(px, "bottom", full);
  // Downscaled samples blend the band into the first row of the photo;
  // trim one more line so no sliver of border is left behind.
  if (top) top = Math.min(top + 1, px.height - 1);
  if (bottom) bottom = Math.min(bottom + 1, px.height - top - 1);
  // Bands meeting in the middle mean a plain image, not a framed one
  if (top + bottom > px.height * 0.8) top = bottom = 0;

  // Side bands are measured between the top and bottom ones, so a white
  // footer doesn't stop a black side bar from being found
  const rows: [number, number] = [top, px.height - bottom];
  let left = bandDepth(px, "left", rows);
  let right = bandDepth(px, "right", rows);
  if (left) left = Math.min(left + 1, px.width - 1);
  if (right) right = Math.min(right + 1, px.width - left - 1);
  if (left + right > px.width * 0.8) left = right = 0;

  return {
    bounds: {
      x: left,
      y: top,
      width: px.width - left - right,
      height: px.height - top - bottom,
    },
    trimmed: { top, right, bottom, left },
  };
}

/** Edge strength per pixel: where the detail in a photo is. */
export function edgeEnergy(px: Pixels): Float32Array {
  const { width, height, data } = px;
  const luma = new Float32Array(width * height);
  for (let i = 0; i < luma.length; i++) {
    luma[i] =
      0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const energy = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const dx = x + 1 < width ? Math.abs(luma[i + 1] - luma[i]) : 0;
      const dy = y + 1 < height ? Math.abs(luma[i + width] - luma[i]) : 0;
      energy[i] = dx + dy;
    }
  }
  return energy;
}

/**
 * Slides `window` along the one axis where it has room inside `bounds` and
 * returns the spot that holds the most detail. Ties (and flat photos) favor
 * the middle.
 */
export function placeByEnergy(
  energy: Float32Array,
  size: Size,
  bounds: Rect,
  window: Size,
): Rect {
  const slackX = Math.floor(bounds.width - window.width);
  const slackY = Math.floor(bounds.height - window.height);
  const centered = {
    x: bounds.x + (bounds.width - window.width) / 2,
    y: bounds.y + (bounds.height - window.height) / 2,
    ...window,
  };
  const horizontal = slackX >= 1;
  const slack = horizontal ? slackX : slackY;
  if (slack < 1) return centered;

  // Total detail in each column (or row) of the bounds
  const x0 = Math.floor(bounds.x);
  const y0 = Math.floor(bounds.y);
  const lines = Math.floor(horizontal ? bounds.width : bounds.height);
  const across = Math.floor(horizontal ? bounds.height : bounds.width);
  const sums = new Float64Array(lines + 1);
  for (let line = 0; line < lines; line++) {
    let total = 0;
    for (let k = 0; k < across; k++) {
      const x = horizontal ? x0 + line : x0 + k;
      const y = horizontal ? y0 + k : y0 + line;
      if (x < size.width && y < size.height)
        total += energy[y * size.width + x];
    }
    sums[line + 1] = sums[line] + total;
  }

  const span = Math.round(horizontal ? window.width : window.height);
  let best = slack / 2;
  let bestScore = -Infinity;
  for (let start = 0; start <= slack; start++) {
    const inside = sums[Math.min(lines, start + span)] - sums[start];
    // Up to 15% less credit at the far ends, so equal detail stays centered
    const offCenter = Math.abs(start - slack / 2) / (slack / 2);
    // (+1 so a flat photo, with no detail anywhere, still prefers the middle)
    const score = (inside + 1) * (1 - 0.15 * offCenter);
    if (score > bestScore) {
      bestScore = score;
      best = start;
    }
  }

  return horizontal
    ? { ...centered, x: bounds.x + best }
    : { ...centered, y: bounds.y + best };
}

export type Suggestion = {
  /** The crop, in pixels of `full`. */
  crop: Rect;
  /** Which edges had a blank band cut off. */
  trimmed: Record<Side, boolean>;
};

/**
 * Suggests a crop for an image: drops blank borders, then (with a ratio)
 * places the largest crop of that shape over the part with the most detail.
 * `px` is a small copy of the image used for analysis; `full` is the size
 * the crop is returned in.
 */
export function suggestCrop(
  px: Pixels,
  full: Size,
  ratio: number | null,
): Suggestion {
  const { bounds, trimmed } = detectContentBounds(px);
  let crop = bounds;
  if (ratio) {
    const fitted = fitAspect(bounds, ratio);
    crop = placeByEnergy(edgeEnergy(px), px, bounds, fitted);
  }

  const sx = full.width / px.width;
  const sy = full.height / px.height;
  let scaled: Rect = {
    x: crop.x * sx,
    y: crop.y * sy,
    width: crop.width * sx,
    height: crop.height * sy,
  };
  // The two scales differ slightly after rounding; restore the exact ratio
  if (ratio) scaled = fitAspect(scaled, ratio);

  return {
    crop: scaled,
    trimmed: {
      top: trimmed.top > 0,
      right: trimmed.right > 0,
      bottom: trimmed.bottom > 0,
      left: trimmed.left > 0,
    },
  };
}
