"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "cict.museum.saved.v1";
const EMPTY: string[] = [];

let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY;
let cacheValid = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseIds(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length > 0 ? ids : EMPTY;
  } catch {
    return EMPTY;
  }
}

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (cacheValid && raw === cachedRaw) return cachedIds;
    cachedRaw = raw;
    cacheValid = true;
    const ids = parseIds(raw);
    cachedIds = ids;
    return cachedIds;
  } catch {
    if (cacheValid && cachedRaw === null && cachedIds.length === 0) return cachedIds;
    cachedRaw = null;
    cacheValid = true;
    cachedIds = EMPTY;
    return cachedIds;
  }
}

export function getSavedIds(): string[] {
  return readSaved();
}

export function toggleSaved(id: string): string[] {
  const current = readSaved();
  const next = current.includes(id)
    ? current.filter((saved) => saved !== id)
    : [...current, id];
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    cachedRaw = raw;
    cachedIds = next;
    cacheValid = true;
  } catch {
    // Keep the last list that storage actually held.
  }
  emit();
  return readSaved();
}

export function useSaved() {
  const ids = useSyncExternalStore(subscribe, readSaved, () => EMPTY);
  const toggle = useCallback((id: string) => {
    toggleSaved(id);
  }, []);
  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, isSaved, toggle };
}
