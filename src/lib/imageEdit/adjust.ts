/** Color adjustments as percentages; 100 leaves the image unchanged. */
export type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
};

export const NO_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

export const ADJUST_MIN = 50;
export const ADJUST_MAX = 150;

export function isUnadjusted(adjust: Adjustments): boolean {
  return (
    adjust.brightness === 100 &&
    adjust.contrast === 100 &&
    adjust.saturation === 100
  );
}

/** The CSS filter that previews the adjustments in the editor. */
export function cssFilter(adjust: Adjustments): string {
  if (isUnadjusted(adjust)) return "none";
  return `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturation}%)`;
}

const clamp255 = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : n);

/**
 * Applies the adjustments to RGBA pixels in place, with the same math as the
 * CSS filter preview (brightness, then contrast, then saturation), so the
 * saved image matches what the editor showed.
 */
export function applyAdjustments(
  data: Uint8ClampedArray,
  adjust: Adjustments,
): void {
  if (isUnadjusted(adjust)) return;
  const b = adjust.brightness / 100;
  const c = adjust.contrast / 100;
  const s = adjust.saturation / 100;

  // Brightness and contrast act on each channel alone: precompute them
  const curve = new Float32Array(256);
  for (let v = 0; v < 256; v++) {
    const bright = clamp255(v * b);
    curve[v] = clamp255((bright - 127.5) * c + 127.5);
  }

  // Saturation mixes channels (the matrix from the Filter Effects spec)
  const rr = 0.213 + 0.787 * s;
  const rg = 0.715 - 0.715 * s;
  const rb = 0.072 - 0.072 * s;
  const gr = 0.213 - 0.213 * s;
  const gg = 0.715 + 0.285 * s;
  const gb = 0.072 - 0.072 * s;
  const br = 0.213 - 0.213 * s;
  const bg = 0.715 - 0.715 * s;
  const bb = 0.072 + 0.928 * s;
  const saturate = s !== 1;

  for (let i = 0; i < data.length; i += 4) {
    const r = curve[data[i]];
    const g = curve[data[i + 1]];
    const bl = curve[data[i + 2]];
    if (saturate) {
      // Uint8ClampedArray rounds and clamps on write
      data[i] = rr * r + rg * g + rb * bl;
      data[i + 1] = gr * r + gg * g + gb * bl;
      data[i + 2] = br * r + bg * g + bb * bl;
    } else {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = bl;
    }
  }
}
