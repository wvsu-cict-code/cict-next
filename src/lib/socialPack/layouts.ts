export type Rect = { x: number; y: number; width: number; height: number };
export type LayoutId = "two" | "three" | "one-two" | "four";

const r = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

export const LAYOUTS: Record<LayoutId, { label: string; slots: Rect[] }> = {
  two: {
    label: "Two photos",
    slots: [r(0, 0, 940, 750), r(0, 750, 940, 750)],
  },
  three: {
    label: "Three photos",
    slots: [r(0, 0, 940, 640), r(0, 640, 940, 430), r(0, 1070, 940, 430)],
  },
  "one-two": {
    label: "One large, two small",
    slots: [r(0, 0, 940, 860), r(0, 860, 470, 640), r(470, 860, 470, 640)],
  },
  four: {
    label: "Four photos",
    slots: [
      r(0, 0, 940, 375),
      r(0, 375, 940, 375),
      r(0, 750, 940, 375),
      r(0, 1125, 940, 375),
    ],
  },
};

export const DEFAULT_LAYOUT: LayoutId = "three";
