"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { ContentClient } from "@/lib/cms/content";
import { getBrowserClient } from "@/lib/supabase/browser";

export type ContentResult<T> =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "ready"; data: T };

type Settled<T> =
  | { request: string; ok: true; data: T }
  | { request: string; ok: false };

/**
 * Loads CMS content in the browser on every page load (no caching, so
 * published changes show up immediately). `key` identifies what is being
 * loaded: when it changes the content reloads, and a slower response for
 * the previous key is ignored. A null key waits without loading.
 */
export function useContent<T>(
  key: string | null,
  load: (client: ContentClient) => Promise<T>,
): ContentResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const request = key === null ? null : `${key}#${attempt}`;

  const runLoad = useEffectEvent(() => load(getBrowserClient()));

  useEffect(() => {
    if (request === null) return;
    let current = true;
    runLoad().then(
      (data) => current && setSettled({ request, ok: true, data }),
      () => current && setSettled({ request, ok: false }),
    );
    return () => {
      current = false;
    };
  }, [request]);

  // Anything settled for an older request counts as still loading
  if (request === null || settled?.request !== request) {
    return { status: "loading" };
  }
  if (!settled.ok) {
    return { status: "error", retry: () => setAttempt((n) => n + 1) };
  }
  return { status: "ready", data: settled.data };
}
