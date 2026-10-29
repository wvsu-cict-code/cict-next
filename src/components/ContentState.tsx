/** Stand-in for content that is still loading; size it with `className`. */
export function ContentPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-neutral-200 ${className}`}
    />
  );
}

/** Shown in place of content when Supabase can't be reached. */
export function ContentError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <p className="text-gray-500">We couldn&apos;t load this content.</p>
      <button
        type="button"
        onClick={onRetry}
        className="font-minor bg-orange-dark hover:bg-orange-light rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
