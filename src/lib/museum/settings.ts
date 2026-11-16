export type MuseumSettings = {
  lookSensitivity: number;
  moveSpeed: number;
  invertLook: boolean;
  quality: "low" | "high";
};

export const DEFAULT_SETTINGS: MuseumSettings = {
  lookSensitivity: 1,
  moveSpeed: 1,
  invertLook: false,
  quality: "high",
};

const KEY = "cict.museum.settings.v1";
const MIN_SETTING = 0.5;
const MAX_SETTING = 2;

function coarsePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function defaults(): MuseumSettings {
  return {
    ...DEFAULT_SETTINGS,
    quality: coarsePointer() ? "low" : DEFAULT_SETTINGS.quality,
  };
}

function clampSetting(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  if (value < MIN_SETTING) return MIN_SETTING;
  if (value > MAX_SETTING) return MAX_SETTING;
  return value;
}

export function loadSettings(): MuseumSettings {
  const base = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return base;
    const stored = parsed as Record<string, unknown>;
    const quality = stored.quality;
    return {
      lookSensitivity: clampSetting(
        stored.lookSensitivity,
        base.lookSensitivity,
      ),
      moveSpeed: clampSetting(stored.moveSpeed, base.moveSpeed),
      invertLook:
        typeof stored.invertLook === "boolean"
          ? stored.invertLook
          : base.invertLook,
      quality: quality === "low" || quality === "high" ? quality : base.quality,
    };
  } catch {
    return base;
  }
}

export function saveSettings(settings: MuseumSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Private mode and quota errors leave the previous settings in place.
  }
}
