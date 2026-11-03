import type { Rect } from "./layouts";

export type Crop = { focusX: number; focusY: number; zoom: number };

export const CENTERED: Crop = { focusX: 0.5, focusY: 0.5, zoom: 1 };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

type Size = { width: number; height: number };

function regionSize(image: Size, slot: Rect, zoom: number) {
  const slotAspect = slot.width / slot.height;
  const base =
    image.width / image.height > slotAspect
      ? { width: image.height * slotAspect, height: image.height }
      : { width: image.width, height: image.width / slotAspect };
  return { width: base.width / zoom, height: base.height / zoom };
}

/** The region of the image that cover-fits the slot. */
export function sourceRect(image: Size, slot: Rect, crop: Crop): Rect {
  const { width, height } = regionSize(image, slot, crop.zoom);
  return {
    x: clamp(crop.focusX, 0, 1) * (image.width - width),
    y: clamp(crop.focusY, 0, 1) * (image.height - height),
    width,
    height,
  };
}

/** dx/dy are slot pixels; dragging right moves the photo right. */
export function panCrop(
  crop: Crop,
  image: Size,
  slot: Rect,
  dx: number,
  dy: number,
): Crop {
  const region = sourceRect(image, slot, crop);
  const scale = region.width / slot.width;
  const rangeX = image.width - region.width;
  const rangeY = image.height - region.height;
  return {
    ...crop,
    focusX:
      rangeX > 0 ? clamp((region.x - dx * scale) / rangeX, 0, 1) : crop.focusX,
    focusY:
      rangeY > 0 ? clamp((region.y - dy * scale) / rangeY, 0, 1) : crop.focusY,
  };
}

export function zoomCrop(crop: Crop, factor: number): Crop {
  return { ...crop, zoom: clamp(crop.zoom * factor, MIN_ZOOM, MAX_ZOOM) };
}
