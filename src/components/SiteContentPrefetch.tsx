"use client";

import { useEffect } from "react";
import {
  loadDepartments,
  loadHomeNews,
  loadNewsAnnouncements,
  loadPrograms,
} from "@/lib/cms/siteContent";
import { prefetchContent } from "@/lib/cms/useContent";

/**
 * Fetches the public sections once, when the site shell mounts, so the first
 * click onto Programs, News, or Faculty can render from the session cache.
 */
export function SiteContentPrefetch() {
  useEffect(() => {
    const pending = [
      prefetchContent("programs", loadPrograms),
      prefetchContent("home-news", loadHomeNews),
      prefetchContent("news-announcements", loadNewsAnnouncements),
      prefetchContent("departments", loadDepartments),
    ];
    for (const request of pending) void request.catch(() => {});
  }, []);

  return null;
}
