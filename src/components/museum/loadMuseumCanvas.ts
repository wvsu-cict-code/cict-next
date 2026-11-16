import type { ComponentType } from "react";
import type { StudentWork } from "@/lib/cms/content";
import type { GalleryId } from "@/lib/museum/categories";
import type { HallLayout } from "@/lib/museum/hall";
import type { Player } from "@/lib/museum/movement";
import type { MuseumSettings } from "@/lib/museum/settings";

export type MuseumCanvasProps = {
  gallery: GalleryId;
  works: StudentWork[];
  layout: HallLayout;
  target: string | null;
  settings: MuseumSettings;
  onFocusExhibit(id: string | null): void;
  onPlayerMove(p: Player): void;
};

/**
 * The only import of the museum three chunk. Pages load it from here
 * after the visitor enters, so the rest of the site never parses three.
 */
export function loadMuseumCanvas(): Promise<{
  default: ComponentType<MuseumCanvasProps>;
}> {
  return import("./three/MuseumCanvas");
}
