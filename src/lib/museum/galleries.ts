import type { GalleryId } from "./categories";

const GALLERY_ORDER: readonly GalleryId[] = ["a", "b", "c"];

export function availableGalleries(
  counts: Record<GalleryId, number>,
): GalleryId[] {
  return GALLERY_ORDER.filter((id) => counts[id] > 0);
}
