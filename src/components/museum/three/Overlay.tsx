"use client";

import { useEffect, useState } from "react";
import type { StudentWork } from "@/lib/cms/content";
import type { GalleryId } from "@/lib/museum/categories";
import type { HallLayout } from "@/lib/museum/hall";
import type { Player } from "@/lib/museum/movement";
import type { MuseumSettings } from "@/lib/museum/settings";
import { ControlsBar } from "./ControlsBar";
import { GallerySelect } from "./GallerySelect";
import { InfoPanel } from "./InfoPanel";
import { Minimap } from "./Minimap";
import { SettingsPopover } from "./SettingsPopover";

const chip =
  "pointer-events-auto inline-flex min-h-11 items-center rounded-full border border-white/40 bg-black/45 px-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10";

export function Overlay({
  layout,
  player,
  works,
  focusId,
  mapOpen,
  settings,
  galleryId,
  counts,
  onExit,
  onFullscreen,
  onSettings,
  onGallery,
  onPrev,
  onNext,
  onCloseInfo,
  onOpenDetail,
}: {
  layout: HallLayout;
  player: Player;
  works: StudentWork[];
  focusId: string | null;
  mapOpen: boolean;
  settings: MuseumSettings;
  galleryId: GalleryId;
  counts: Record<GalleryId, number>;
  onExit(): void;
  onFullscreen(): void;
  onSettings(next: MuseumSettings): void;
  onGallery(id: GalleryId): void;
  onPrev(): void;
  onNext(): void;
  onCloseInfo(): void;
  onOpenDetail(id: string): void;
}) {
  const focused = works.find((work) => work.id === focusId) ?? null;
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  useEffect(() => {
    const section = document.getElementById("museum-3d");
    setFullscreenSupported(
      document.fullscreenEnabled === true &&
        section !== null &&
        typeof section.requestFullscreen === "function",
    );
  }, []);

  return (
    <div
      data-museum-overlay
      className="pointer-events-none absolute inset-0 z-10"
    >
      <div className="pointer-events-none absolute top-4 right-4 left-4 flex items-start justify-between gap-3">
        <button type="button" className={chip} onClick={onExit}>
          Exit to Lobby
        </button>
        <div className="flex flex-wrap items-start justify-end gap-2">
          {fullscreenSupported ? (
            <button type="button" className={chip} onClick={onFullscreen}>
              Fullscreen
            </button>
          ) : null}
          <SettingsPopover settings={settings} onChange={onSettings} />
          <GallerySelect
            counts={counts}
            value={galleryId}
            onChange={onGallery}
          />
        </div>
      </div>

      {mapOpen ? (
        <div className="absolute bottom-4 left-4">
          <Minimap layout={layout} player={player} focusId={focusId} />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-3 px-4">
        <div className="pointer-events-auto flex gap-2">
          <button type="button" className={chip} onClick={onPrev}>
            Previous exhibit
          </button>
          <button type="button" className={chip} onClick={onNext}>
            Next exhibit
          </button>
        </div>
        <ControlsBar />
      </div>

      {focused ? (
        <InfoPanel
          work={focused}
          onClose={onCloseInfo}
          onOpenDetail={onOpenDetail}
        />
      ) : null}
    </div>
  );
}
