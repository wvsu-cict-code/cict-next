"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const inflight = useRef<Promise<void> | null>(null);
  // Bumped on retry and unmount so late results are dropped.
  const generation = useRef(0);

  const commit = (next: State) => {
    loaded.current = next;
    setState(next);
  };

  useEffect(() => {
    const mine = ++generation.current;
    inflight.current = null;
    loaded.current = INITIAL;
    setState(INITIAL);

    const first = fetchStudentWorks(getBrowserClient(), {
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
    inflight.current = first;
    void first.finally(() => {
      if (inflight.current === first) inflight.current = null;
    });

    return () => {
      // A counter, not a DOM node: the latest value is what we want here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
    };
  }, [attempt]);

  const loadMore = useCallback((): Promise<void> => {
    if (inflight.current) return inflight.current;
    const current = loaded.current;
    if (current.status !== "ready" || current.works.length >= current.total) {
      return Promise.resolve();
    }

    const mine = generation.current;
    const pending: Promise<void> = fetchStudentWorks(getBrowserClient(), {
      offset: current.works.length,
      limit: WORKS_PAGE_SIZE,
    })
      .then(({ works, total }) => {
        if (generation.current !== mine) return;
        const seen = new Set(loaded.current.works.map((w) => w.id));
        commit({
          status: "ready",
          works: [
            ...loaded.current.works,
            ...works.filter((w) => !seen.has(w.id)),
          ],
          total,
        });
      })
      // A failed page keeps what is on screen; the next call tries again.
      .catch(() => {})
      .finally(() => {
        if (inflight.current === pending) inflight.current = null;
      });
    inflight.current = pending;
    return pending;
  }, []);

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
