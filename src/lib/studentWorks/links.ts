const DEFAULT_LABEL = "Play the game";

/** Button label for a game's store link, based on where it is hosted. */
export function storeLabel(url: string): string {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return DEFAULT_LABEL;
  }
  if (hostname === "itch.io" || hostname.endsWith(".itch.io")) return "Play on itch.io";
  if (hostname === "play.google.com") return "Get it on Google Play";
  if (hostname === "apps.apple.com") return "Download on the App Store";
  return DEFAULT_LABEL;
}

/** True for http(s) URLs only, so links can't smuggle in other schemes. */
export function isWebUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
