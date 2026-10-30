"use client";

import { useEffect } from "react";
import {
  loadDepartments,
  loadEvents,
  loadHomeNews,
  loadNewsAnnouncements,
  loadPrograms,
  loadSearch,
} from "@/lib/cms/siteContent";
import { fetchSiteSettings } from "@/lib/cms/content";
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
      prefetchContent("events", loadEvents),
      prefetchContent("departments", loadDepartments),
      prefetchContent("search", loadSearch),
      prefetchContent("site-settings", fetchSiteSettings),
    ];
    for (const request of pending) void request.catch(() => {});
  }, []);

  return null;
}
