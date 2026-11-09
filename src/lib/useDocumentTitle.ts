"use client";

import { useEffect } from "react";

/**
 * Sets the tab title once a page's content has loaded, using the same
 * template as the static metadata ("<title> | CICT").
 */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) document.title = `${title} | CICT`;
  }, [title]);
}
