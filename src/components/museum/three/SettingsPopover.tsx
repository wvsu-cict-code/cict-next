"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { saveSettings, type MuseumSettings } from "@/lib/museum/settings";

export function SettingsPopover({
  settings,
  onChange,
}: {
  settings: MuseumSettings;
  onChange(next: MuseumSettings): void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function commit(patch: Partial<MuseumSettings>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    saveSettings(next);
    onChange(next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="pointer-events-auto inline-flex min-h-11 items-center rounded-full border border-white/40 bg-black/45 px-4 text-sm font-semibold text-white hover:bg-white/10"
        >
          Settings
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-museum-overlay
        align="end"
        className="w-72 border-white/20 bg-[#1c2128] text-white"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="museum-look">Look sensitivity</Label>
            <Slider
              id="museum-look"
              aria-label="Look sensitivity"
              min={0.5}
              max={2}
              step={0.1}
              value={[draft.lookSensitivity]}
              onValueChange={([lookSensitivity]) => {
                if (lookSensitivity !== undefined) commit({ lookSensitivity });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="museum-speed">Movement speed</Label>
            <Slider
              id="museum-speed"
              aria-label="Movement speed"
              min={0.5}
              max={2}
              step={0.1}
              value={[draft.moveSpeed]}
              onValueChange={([moveSpeed]) => {
                if (moveSpeed !== undefined) commit({ moveSpeed });
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="museum-invert">Invert look</Label>
            <Switch
              id="museum-invert"
              aria-label="Invert look"
              checked={draft.invertLook}
              onCheckedChange={(invertLook) => commit({ invertLook })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Graphics quality</Label>
            <Select
              value={draft.quality}
              onValueChange={(quality) => {
                if (quality === "low" || quality === "high")
                  commit({ quality });
              }}
            >
              <SelectTrigger aria-label="Graphics quality" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-museum-overlay>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
