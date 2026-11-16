import {
  AudioWaveform,
  Box,
  Clapperboard,
  Film,
  Gamepad2,
  Image,
  MonitorSmartphone,
  type LucideIcon,
} from "lucide-react";

/** Must match the `exhibit_category` database enum, value for value and in order. */
export type Category =
  | "game"
  | "interactive_media"
  | "xr_3d"
  | "digital_art"
  | "animation"
  | "short_film"
  | "sound_design";

export const CATEGORIES: readonly Category[] = [
  "game",
  "interactive_media",
  "xr_3d",
  "digital_art",
  "animation",
  "short_film",
  "sound_design",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  game: "Games",
  interactive_media: "Interactive Media",
  xr_3d: "3D & XR",
  digital_art: "Digital Art",
  animation: "Animations",
  short_film: "Short Films",
  sound_design: "Sound Design",
};

export const CATEGORY_SINGULAR: Record<Category, string> = {
  game: "Game",
  interactive_media: "Interactive media",
  xr_3d: "3D & XR",
  digital_art: "Digital art",
  animation: "Animation",
  short_film: "Short film",
  sound_design: "Sound design",
};

export type CategoryMedia = "cover_link" | "image" | "video" | "audio";

export const CATEGORY_MEDIA: Record<Category, CategoryMedia> = {
  game: "cover_link",
  interactive_media: "cover_link",
  xr_3d: "cover_link",
  digital_art: "image",
  animation: "video",
  short_film: "video",
  sound_design: "audio",
};

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  game: Gamepad2,
  interactive_media: MonitorSmartphone,
  xr_3d: Box,
  digital_art: Image,
  animation: Clapperboard,
  short_film: Film,
  sound_design: AudioWaveform,
};

export const CATEGORY_TINT: Record<Category, { from: string; to: string }> = {
  game: { from: "#7c3aed", to: "#4c1d95" },
  interactive_media: { from: "#a855f7", to: "#581c87" },
  animation: { from: "#3b82f6", to: "#1e3a8a" },
  short_film: { from: "#2563eb", to: "#172554" },
  digital_art: { from: "#14b8a6", to: "#134e4a" },
  xr_3d: { from: "#c2763a", to: "#7c3f12" },
  sound_design: { from: "#6366f1", to: "#312e81" },
};

export type GalleryId = "a" | "b" | "c";

export const GALLERIES: {
  id: GalleryId;
  label: string;
  name: string;
  categories: Category[];
}[] = [
  {
    id: "a",
    label: "Gallery A",
    name: "Games & Interactive Media",
    categories: ["game", "interactive_media"],
  },
  {
    id: "b",
    label: "Gallery B",
    name: "Animation, Film & Sound",
    categories: ["animation", "short_film", "sound_design"],
  },
  {
    id: "c",
    label: "Gallery C",
    name: "Digital Art & 3D",
    categories: ["digital_art", "xr_3d"],
  },
];

export function galleryOf(category: Category): GalleryId {
  const gallery = GALLERIES.find((g) => g.categories.includes(category));
  if (!gallery) throw new Error(`Category ${category} has no gallery`);
  return gallery.id;
}
