"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { ContentClient } from "@/lib/cms/content";
import { getBrowserClient } from "@/lib/supabase/browser";

export type ContentResult<T> =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "ready"; data: T };

/**
 * How long to wait before showing the error state. Supabase's client retries
 * failed reads, so a stalled connection could otherwise keep the placeholder
 * up for minutes.
 */
export const CONTENT_TIMEOUT_MS = 15_000;

type Settled<T> =
  | { request: string; ok: true; data: T }
  | { request: string; ok: false };

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

/** Drops the session cache. Tests use this so one case can't leak into the next. */
export function clearContentCache() {
  cache.clear();
  inflight.clear();
}

/** Stores a result another query already paid for, such as a row from a list. */
export function rememberContent<T>(key: string, data: T) {
  cache.set(key, data);
}

/**
 * Starts a load, or joins the one already running for this key.
 * A forced start replaces a stalled request so Retry doesn't wait on it.
 */
function startRequest<T>(
  key: string,
  run: () => Promise<T>,
  force = false,
): Promise<T> {
  if (!force) {
    const existing = inflight.get(key);
    if (existing) return existing as Promise<T>;
  }

  const pending = Promise.resolve()
    .then(run)
    .then((data) => {
      if (inflight.get(key) === pending) cache.set(key, data);
      return data;
    })
    .finally(() => {
      if (inflight.get(key) === pending) inflight.delete(key);
    });

  inflight.set(key, pending);
  return pending;
}

/** Warms the session cache before the visitor opens that page. */
export function prefetchContent<T>(
  key: string,
  load: (client: ContentClient) => Promise<T>,
) {
  return startRequest(key, () => load(getBrowserClient()));
}

/**
 * Loads CMS content in the browser. The last result for a key is shown
 * immediately on the next visit, and a refresh runs behind it so a published
 * edit still replaces the page. `key` identifies what is being loaded: when
 * it changes, a slower response for the previous key is ignored. A null key
 * waits without loading.
 */
export function useContent<T>(
  key: string | null,
  load: (client: ContentClient) => Promise<T>,
): ContentResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const request = key === null ? null : `${key}#${attempt}`;
  const hasCache = key !== null && cache.has(key);

  const runLoad = useEffectEvent(() => load(getBrowserClient()));

  useEffect(() => {
    if (request === null || key === null) return;
    let current = true;
    const timer = setTimeout(() => {
      if (!current || cache.has(key)) return;
      setSettled({ request, ok: false });
    }, CONTENT_TIMEOUT_MS);

    startRequest(key, runLoad, attempt > 0).then(
      (data) => {
        if (!current) return;
        setSettled({ request, ok: true, data });
      },
      () => {
        if (!current || cache.has(key)) return;
        setSettled({ request, ok: false });
      },
    );

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [request, key, attempt]);

  const retry = () => {
    if (key !== null) inflight.delete(key);
    setAttempt((n) => n + 1);
  };

  if (request === null) return { status: "loading" };

  // A settled response for this attempt wins. A failed refresh keeps the
  // previous result on screen instead of swapping it for the error panel.
  if (settled?.request === request) {
    if (settled.ok) return { status: "ready", data: settled.data };
    if (hasCache) return { status: "ready", data: cache.get(key) as T };
    return { status: "error", retry };
  }

  if (hasCache) return { status: "ready", data: cache.get(key) as T };
  return { status: "loading" };
}
