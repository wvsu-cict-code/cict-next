"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONTENT_TIMEOUT_MS } from "@/lib/cms/useContent";
import { fetchStudentWorks, type StudentWork } from "@/lib/cms/content";
import { getBrowserClient } from "@/lib/supabase/browser";

export const WORKS_PAGE_SIZE = 12;

type State = {
  status: "loading" | "error" | "ready";
  works: StudentWork[];
  total: number;
};

const INITIAL: State = { status: "loading", works: [], total: 0 };

/**
 * Loads the visible student works a batch at a time. `loadMore` is safe to
 * call from several places at once (the scroll sentinel and the spotlight's
 * next button): callers share one request, so a page is never fetched twice.
 */
export function useStudentWorks() {
  const [state, setState] = useState<State>(INITIAL);
  const [attempt, setAttempt] = useState(0);

  // Mirrors what has been loaded so loadMore can read it synchronously.
  const loaded = useRef<State>(INITIAL);
  const inflight = useRef<Promise<boolean> | null>(null);
  // Bumped on retry and unmount so late results are dropped.
  const generation = useRef(0);

  const commit = useCallback((next: State) => {
    loaded.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    const mine = ++generation.current;
    inflight.current = null;
    loaded.current = INITIAL;
    setState(INITIAL);

    fetchStudentWorks(getBrowserClient(), {
      offset: 0,
      limit: WORKS_PAGE_SIZE,
    }).then(
      ({ works, total }) => {
        if (generation.current !== mine) return;
        commit({ status: "ready", works, total });
      },
      () => {
        if (generation.current !== mine) return;
        commit({ status: "error", works: [], total: 0 });
      },
    );

    return () => {
      // A counter, not a DOM node: the latest value is what we want here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
    };
  }, [attempt, commit]);

  /**
   * Fetches the next batch. Resolves true when that batch was added, false
   * when it failed, timed out, was dropped as stale, or there is nothing
   * more to load. Never rejects. Concurrent callers share one request.
   */
  const loadMore = useCallback((): Promise<boolean> => {
    if (inflight.current) return inflight.current;
    const current = loaded.current;
    if (current.status !== "ready" || current.works.length >= current.total) {
      return Promise.resolve(false);
    }

    const mine = generation.current;
    let settled = false;
    const pending: Promise<boolean> = new Promise<boolean>((resolve) => {
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (inflight.current === pending) inflight.current = null;
        resolve(ok);
      };
      // A hung request must not block every later call. Its late result is
      // ignored (settled), since the next call refetches the same offset.
      const timer = setTimeout(() => finish(false), CONTENT_TIMEOUT_MS);

      fetchStudentWorks(getBrowserClient(), {
        offset: current.works.length,
        limit: WORKS_PAGE_SIZE,
      }).then(
        ({ works, total }) => {
          if (settled) return;
          if (generation.current !== mine) return finish(false);
          const seen = new Set(loaded.current.works.map((w) => w.id));
          commit({
            status: "ready",
            works: [
              ...loaded.current.works,
              ...works.filter((w) => !seen.has(w.id)),
            ],
            total,
          });
          finish(true);
        },
        () => finish(false),
      );
    });
    inflight.current = pending;
    return pending;
  }, [commit]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    status: state.status,
    works: state.works,
    total: state.total,
    hasMore: state.status === "ready" && state.works.length < state.total,
    loadMore,
    retry,
  };
}
