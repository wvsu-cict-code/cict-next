import type { StudentWork } from "@/lib/cms/content";
import { youtubeThumbnail } from "@/lib/studentWorks/youtube";

export type Size = { width: number; height: number };

/** Width ÷ height of a work's tile. */
export function workAspect(
  work: Pick<StudentWork, "kind" | "orientation" | "image_width" | "image_height">,
): number {
  if (work.kind === "video") return work.orientation === "vertical" ? 9 / 16 : 16 / 9;
  if (work.image_width && work.image_height) return work.image_width / work.image_height;
  return 4 / 3;
}

/** Image for a gallery tile, falling back to the YouTube thumbnail for videos. */
export function tileImage(work: StudentWork): { src: string; fallbackSrc?: string } {
  if (work.image_url) return { src: work.image_url };
  const id = work.youtube_id ?? "";
  if (work.orientation === "vertical") {
    return { src: youtubeThumbnail(id, "hqdefault") };
  }
  return {
    src: youtubeThumbnail(id, "maxresdefault"),
    fallbackSrc: youtubeThumbnail(id, "hqdefault"),
  };
}

/** Number of gallery columns for a container width. */
export function columnCountFor(width: number): number {
  return width < 640 ? 2 : 3;
}

/** Packs tiles into the shortest column; box height includes the caption. */
export function masonryLayout(
  aspects: number[],
  options: { width: number; columns: number; gap: number; captionHeight: number },
): { boxes: { x: number; y: number; width: number; height: number }[]; height: number } {
  const { width, columns, gap, captionHeight } = options;
  const columnWidth = (width - gap * (columns - 1)) / columns;
  const heights = Array.from({ length: columns }, () => 0);

  const boxes = aspects.map((aspect) => {
    let column = 0;
    for (let i = 1; i < columns; i++) {
      if (heights[i] < heights[column]) column = i;
    }
    const height = columnWidth / aspect + captionHeight;
    const box = { x: column * (columnWidth + gap), y: heights[column], width: columnWidth, height };
    heights[column] += height + gap;
    return box;
  });

  const tallest = Math.max(...heights);
  return { boxes, height: boxes.length ? tallest - gap : 0 };
}
