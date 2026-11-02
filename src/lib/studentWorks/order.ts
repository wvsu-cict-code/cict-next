/** Returns a copy of `list` with the item at `from` moved to `to` (clamped). */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const result = [...list];
  if (from < 0 || from >= result.length) return result;
  const target = Math.min(result.length - 1, Math.max(0, to));
  const [item] = result.splice(from, 1);
  result.splice(target, 0, item);
  return result;
}
