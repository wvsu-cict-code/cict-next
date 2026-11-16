"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudentWork } from "@/lib/cms/content";
import { useSession } from "@/lib/auth/session";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

type LikeSnapshot = { liked: boolean; count: number | null };

const overrides = new Map<string, LikeSnapshot>();
const version = new Map<string, number>();
const known = new Set<string>();
const attempts = new Map<string, number>();
const listeners = new Set<() => void>();
let queued: string[] = [];
let flushing = false;
let generation = 0;
/** undefined until a session has been seen; null is a signed-out visitor. */
let cacheUserId: string | null | undefined;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function resetLikeCache() {
  generation += 1;
  overrides.clear();
  version.clear();
  known.clear();
  attempts.clear();
  queued = [];
  flushing = false;
}

/** Drops the in-memory like cache. Tests use this between cases. */
export function clearLikeCache() {
  resetLikeCache();
  cacheUserId = undefined;
  emit();
}

/** Hearts belong to one user. A sign-out or account switch must not keep them. */
function adoptUser(userId: string | null) {
  if (cacheUserId === undefined) {
    cacheUserId = userId;
    return;
  }
  if (cacheUserId === userId) return;
  cacheUserId = userId;
  resetLikeCache();
  emit();
}

export async function fetchMyLikes(
  client: Client,
  workIds: string[],
): Promise<Set<string>> {
  if (workIds.length === 0) return new Set();
  const { data, error } = await client
    .from("work_likes")
    .select("work_id")
    .in("work_id", workIds);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.work_id));
}

export async function setLiked(
  client: Client,
  workId: string,
  liked: boolean,
): Promise<{ error?: string }> {
  try {
    if (liked) {
      const { error } = await client.from("work_likes").insert({ work_id: workId });
      return error ? { error: error.message } : {};
    }
    const { error } = await client
      .from("work_likes")
      .delete()
      .eq("work_id", workId);
    return error ? { error: error.message } : {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not update like",
    };
  }
}

async function flush(gen: number) {
  while (gen === generation && queued.length > 0) {
    const ids = [...new Set(queued)].filter((id) => !known.has(id));
    queued = [];
    if (ids.length === 0) continue;
    const started = new Map(ids.map((id) => [id, version.get(id) ?? 0]));
    let likes: Set<string>;
    try {
      likes = await fetchMyLikes(getBrowserClient(), ids);
    } catch {
      if (gen !== generation) return;
      // The ids were already taken out of the queue. Put a failed load back
      // once so it is tried again, and never record it as known.
      for (const id of ids) {
        if ((version.get(id) ?? 0) !== started.get(id)) continue;
        const n = (attempts.get(id) ?? 0) + 1;
        attempts.set(id, n);
        if (n === 1 && !queued.includes(id)) queued.push(id);
      }
      return;
    }
    if (gen !== generation) return;
    let changed = false;
    for (const id of ids) {
      if ((version.get(id) ?? 0) !== started.get(id)) continue;
      attempts.delete(id);
      known.add(id);
      if (overrides.has(id)) continue;
      if (likes.has(id)) {
        overrides.set(id, { liked: true, count: null });
        changed = true;
      }
    }
    if (changed) emit();
  }
}

function queueHydrate(id: string) {
  if (known.has(id)) return;
  if (!queued.includes(id)) queued.push(id);
  if (flushing) return;
  flushing = true;
  const gen = generation;
  void flush(gen).finally(() => {
    if (gen !== generation) return;
    flushing = false;
    if (queued.length > 0) queueHydrate(queued[0]);
  });
}

function applyToggle(id: string, baseCount: number) {
  const previous = overrides.get(id) ?? null;
  const liked = previous?.liked ?? false;
  const count = previous?.count ?? baseCount;
  const nextLiked = !liked;
  const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));
  const mine = (version.get(id) ?? 0) + 1;
  version.set(id, mine);
  overrides.set(id, { liked: nextLiked, count: nextCount });
  emit();
  void setLiked(getBrowserClient(), id, nextLiked).then((result) => {
    if (version.get(id) !== mine) return;
    if (!result.error) return;
    if (previous) overrides.set(id, previous);
    else overrides.delete(id);
    emit();
  });
}

export function useLike(work: Pick<StudentWork, "id" | "like_count">) {
  const session = useSession();
  const snapshot = useSyncExternalStore(
    subscribe,
    () => overrides.get(work.id) ?? null,
    () => null,
  );
  const [promptSignIn, setPromptSignIn] = useState(false);
  const userId = session.status === "signed-in" ? (session.user?.id ?? null) : null;

  useEffect(() => {
    adoptUser(userId);
    if (!userId) return;
    queueHydrate(work.id);
  }, [userId, work.id]);

  const toggle = useCallback(() => {
    if (session.status === "signed-out") {
      setPromptSignIn(true);
      return;
    }
    if (session.status !== "signed-in") return;
    applyToggle(work.id, work.like_count);
  }, [session.status, work.id, work.like_count]);

  return {
    liked: snapshot?.liked ?? false,
    count: snapshot?.count ?? work.like_count,
    toggle,
    promptSignIn,
    dismissPrompt: () => setPromptSignIn(false),
  };
}
