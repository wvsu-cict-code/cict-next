// Light and dark mode for the public site.
//
// The page's theme lives in <html data-theme="light|dark">. A visitor's own
// pick is saved in localStorage; until they pick, the site follows their
// device's setting.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "cict-theme";

/** Fired on window when the theme changes, so every toggle stays in sync. */
export const THEME_EVENT = "cict-themechange";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** The saved pick, or null when the visitor hasn't chosen (or storage is blocked). */
export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Switch to `theme` and remember it for later visits. */
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still works for this page
  }
  apply(theme);
}

/**
 * Calls `onChange` whenever the theme changes: from a toggle, or from the
 * device setting while the visitor hasn't picked one. Returns an unsubscribe.
 */
export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia?.(DARK_QUERY);
  const followSystem = () => {
    if (storedTheme() === null) apply(systemTheme());
  };
  // Another tab changed the pick
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) apply(storedTheme() ?? systemTheme());
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  media?.addEventListener("change", followSystem);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
    media?.removeEventListener("change", followSystem);
  };
}

/**
 * Runs before the page paints (inlined in <head>-order by ThemeScript) so a
 * dark-mode visitor never sees a white flash. Keep it tiny and ES5.
 */
export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)})()`;
