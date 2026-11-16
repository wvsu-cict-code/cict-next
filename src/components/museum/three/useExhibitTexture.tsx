"use client";

import { useEffect, useState } from "react";
import { SRGBColorSpace, TextureLoader, type Texture } from "three";
import type { StudentWork } from "@/lib/cms/content";
import { CATEGORY_MEDIA } from "@/lib/museum/categories";
import { youtubeThumbnail } from "@/lib/studentWorks/youtube";

/** Webp on the work, or the YouTube thumbnail when a legacy video has no poster. */
export function exhibitImageUrl(
  work: Pick<
    StudentWork,
    "image_url" | "youtube_id" | "category" | "video_url"
  >,
): string | null {
  if (work.image_url) return work.image_url;
  if (
    CATEGORY_MEDIA[work.category] === "video" &&
    !work.video_url &&
    work.youtube_id
  ) {
    return youtubeThumbnail(work.youtube_id, "hqdefault");
  }
  return null;
}

/** Loads a wall texture. `"failed"` means the frame should use its category panel. */
export function useExhibitTexture(
  url: string | null,
): Texture | null | "failed" {
  const [result, setResult] = useState<Texture | null | "failed">(null);

  useEffect(() => {
    if (!url) {
      setResult(null);
      return;
    }

    let alive = true;
    const loaded: { current: Texture | null } = { current: null };
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        if (!alive) {
          texture.dispose();
          return;
        }
        loaded.current = texture;
        setResult(texture);
      },
      undefined,
      () => {
        if (alive) setResult("failed");
      },
    );

    return () => {
      alive = false;
      loaded.current?.dispose();
      loaded.current = null;
    };
  }, [url]);

  return result;
}
