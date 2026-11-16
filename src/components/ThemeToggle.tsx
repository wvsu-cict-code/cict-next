"use client";

import { useSyncExternalStore } from "react";
import {
  currentTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

// The server can't know the visitor's theme, so it renders a neutral button
const serverTheme = () => null;

/** Sun/moon button that switches the site between light and dark mode. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore<Theme | null>(
    subscribeTheme,
    currentTheme,
    serverTheme,
  );
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={theme ? `Switch to ${next} mode` : "Switch color theme"}
      title={theme ? `Switch to ${next} mode` : undefined}
      className={`text-ink hover:bg-paper inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {theme === "dark" ? (
          // Sun: tap for light mode
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
          </>
        ) : (
          // Moon: tap for dark mode
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  );
}
