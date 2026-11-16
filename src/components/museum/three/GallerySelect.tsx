"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { GALLERIES, type GalleryId } from "@/lib/museum/categories";
import { availableGalleries } from "@/lib/museum/galleries";

function isGalleryId(value: string): value is GalleryId {
  return value === "a" || value === "b" || value === "c";
}

export function GallerySelect({
  counts,
  value,
  onChange,
}: {
  counts: Record<GalleryId, number>;
  value: GalleryId;
  onChange(id: GalleryId): void;
}) {
  const current =
    GALLERIES.find((gallery) => gallery.id === value) ?? GALLERIES[0];
  const open = availableGalleries(counts);

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isGalleryId(next)) onChange(next);
      }}
    >
      <SelectTrigger
        aria-label="Gallery"
        className="pointer-events-auto h-auto min-h-11 w-56 border-white/40 bg-black/45 text-white hover:bg-white/10"
      >
        <span className="flex flex-col items-start text-left">
          <span className="font-semibold">{current.label}</span>
          <span className="text-xs font-normal text-white/70">
            {current.name}
          </span>
        </span>
      </SelectTrigger>
      <SelectContent
        data-museum-overlay
        className="border-white/20 bg-[#1c2128] text-white"
      >
        {open.map((id) => {
          const gallery = GALLERIES.find((item) => item.id === id);
          if (!gallery) return null;
          return (
            <SelectItem key={id} value={id}>
              <span className="flex flex-col">
                <span>{gallery.label}</span>
                <span className="text-xs text-white/70">{gallery.name}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
