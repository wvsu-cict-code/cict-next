import { THEME_SCRIPT } from "@/lib/theme";

/**
 * Sets <html data-theme> before the page paints. Render it first in every
 * public layout; it's left out of the CMS, whose CSP blocks inline scripts.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
