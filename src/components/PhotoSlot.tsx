/**
 * Stand-in for a photograph that is not on the site yet.
 * Pass `src` when the image is ready. Until then, the frame keeps its size.
 */
export function PhotoSlot({
  label,
  src,
  alt = "",
  className = "",
}: {
  label: string;
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  return (
    <div className={`h-full w-full overflow-hidden bg-[#16324f] ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-full w-full items-end bg-[linear-gradient(160deg,#1c446c_0%,#0e243c_72%)] p-4">
          <p
            aria-hidden
            className="text-xs font-medium tracking-wide text-white/75"
          >
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <path
        d="M4 10h12M11 5l5 5-5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowCircle({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current ${className}`}
    >
      <ArrowIcon />
    </span>
  );
}
