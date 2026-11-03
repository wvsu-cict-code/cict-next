export type Rect = { x: number; y: number; width: number; height: number };
export type LayoutId = "two" | "three" | "one-two" | "four";

const r = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

export const LAYOUTS: Record<LayoutId, { label: string; slots: Rect[] }> = {
  two: { label: "Two photos", slots: [r(0, 0, 940, 940), r(0, 940, 940, 940)] },
  three: {
    label: "Three photos",
    slots: [r(0, 0, 940, 800), r(0, 800, 940, 540), r(0, 1340, 940, 540)],
  },
  "one-two": {
    label: "One large, two small",
    slots: [r(0, 0, 940, 1080), r(0, 1080, 470, 800), r(470, 1080, 470, 800)],
  },
  four: {
    label: "Four photos",
    slots: [
      r(0, 0, 940, 470),
      r(0, 470, 940, 470),
      r(0, 940, 940, 470),
      r(0, 1410, 940, 470),
    ],
  },
};

export const DEFAULT_LAYOUT: LayoutId = "three";
