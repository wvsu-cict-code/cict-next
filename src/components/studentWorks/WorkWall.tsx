"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { StudentWork } from "@/lib/cms/content";
import {
  columnCountFor,
  masonryLayout,
  workAspect,
} from "@/lib/studentWorks/layout";
import { CAPTION_HEIGHT, WorkTile } from "./WorkTile";

const GAP = 16;

/**
 * Masonry wall: every piece keeps its own shape. Tiles are absolutely
 * positioned in DOM (and so tab) order from a layout computed for the
 * measured width. Nothing renders until the width is known.
 */
export function WorkWall({
  works,
  onOpen,
  tileRefs,
}: {
  works: StudentWork[];
  onOpen(index: number): void;
  /** Tile buttons by index, so the spotlight can return focus on close. */
  tileRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () =>
      width > 0
        ? masonryLayout(works.map(workAspect), {
            width,
            columns: columnCountFor(width),
            gap: GAP,
            captionHeight: CAPTION_HEIGHT,
          })
        : null,
    [works, width],
  );

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ height: layout?.height ?? 0 }}
    >
      {layout
        ? works.map((work, index) => {
            const box = layout.boxes[index];
            return (
              <div
                key={work.id}
                className="absolute top-0 left-0"
                style={{
                  width: box.width,
                  height: box.height,
                  transform: `translate(${box.x}px, ${box.y}px)`,
                }}
              >
                <WorkTile
                  work={work}
                  onOpen={() => onOpen(index)}
                  buttonRef={(node) => {
                    tileRefs.current[index] = node;
                  }}
                />
              </div>
            );
          })
        : null}
    </div>
  );
}
