import { useReducer } from "react";
import { CENTERED, panCrop, zoomCrop, type Crop } from "@/lib/socialPack/crop";
import {
  DEFAULT_LAYOUT,
  LAYOUTS,
  type LayoutId,
} from "@/lib/socialPack/layouts";
import {
  formatCoverDate,
  packPhotoUrls,
  type PackSource,
} from "@/lib/socialPack/pack";
import { summaryFor } from "@/lib/socialPack/text";

export type ComposerSlot = { url: string | null; crop: Crop };

export type ComposerState = {
  layout: LayoutId;
  slots: ComposerSlot[];
  selectedSlot: number;
  title: string;
  summary: string;
  label: string;
  date: string;
};

export type ComposerTextField = "title" | "summary" | "label" | "date";

export type ComposerAction =
  | { type: "setLayout"; layout: LayoutId }
  | { type: "togglePhoto"; url: string }
  | { type: "selectSlot"; index: number }
  /** dx/dy in cover pixels; image is the selected slot's photo size. */
  | {
      type: "pan";
      dx: number;
      dy: number;
      image: { width: number; height: number };
    }
  | { type: "zoom"; factor: number }
  | { type: "setText"; field: ComposerTextField; value: string };

const DEFAULT_LABEL = "UPFLASH";

const emptySlot = (): ComposerSlot => ({ url: null, crop: CENTERED });

export function initialComposerState(source: PackSource): ComposerState {
  const photos = packPhotoUrls(source);
  return {
    layout: DEFAULT_LAYOUT,
    slots: LAYOUTS[DEFAULT_LAYOUT].slots.map((_, i) => ({
      url: photos[i]?.url ?? null,
      crop: CENTERED,
    })),
    selectedSlot: 0,
    title: source.title,
    summary: summaryFor(source.summary, source.body),
    label: DEFAULT_LABEL,
    date: formatCoverDate(source.date),
  };
}

function updateSelectedCrop(
  state: ComposerState,
  update: (crop: Crop) => Crop,
): ComposerState {
  const slot = state.slots[state.selectedSlot];
  if (!slot?.url) return state;
  const slots = [...state.slots];
  slots[state.selectedSlot] = { ...slot, crop: update(slot.crop) };
  return { ...state, slots };
}

export function composerReducer(
  state: ComposerState,
  action: ComposerAction,
): ComposerState {
  switch (action.type) {
    case "setLayout": {
      const count = LAYOUTS[action.layout].slots.length;
      const slots = Array.from(
        { length: count },
        (_, i) => state.slots[i] ?? emptySlot(),
      );
      return {
        ...state,
        layout: action.layout,
        slots,
        selectedSlot: Math.min(state.selectedSlot, count - 1),
      };
    }
    case "togglePhoto": {
      const used = state.slots.findIndex((s) => s.url === action.url);
      const target =
        used >= 0 ? used : state.slots.findIndex((s) => s.url === null);
      if (target < 0) return state;
      const slots = [...state.slots];
      slots[target] =
        used >= 0 ? emptySlot() : { url: action.url, crop: CENTERED };
      return { ...state, slots };
    }
    case "selectSlot":
      if (action.index < 0 || action.index >= state.slots.length) return state;
      return { ...state, selectedSlot: action.index };
    case "pan": {
      const rect = LAYOUTS[state.layout].slots[state.selectedSlot];
      return updateSelectedCrop(state, (crop) =>
        panCrop(crop, action.image, rect, action.dx, action.dy),
      );
    }
    case "zoom":
      return updateSelectedCrop(state, (crop) => zoomCrop(crop, action.factor));
    case "setText":
      return { ...state, [action.field]: action.value };
  }
}

export function useComposer(source: PackSource) {
  return useReducer(composerReducer, source, initialComposerState);
}
