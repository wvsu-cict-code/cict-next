"use client";

import { useMediaQuery } from "../useMediaQuery";

const kbd =
  "mx-0.5 inline-flex min-w-5 items-center justify-center rounded border border-white/40 px-1 font-sans text-xs text-white";

/** Desktop shows the key legend. A coarse pointer gets the touch hint instead. */
export function ControlsBar() {
  const coarse = useMediaQuery("(pointer: coarse)");
  if (coarse) {
    return (
      <p className="pointer-events-none text-center text-sm text-white/80">
        Drag to look · Tap a work
      </p>
    );
  }

  return (
    <p className="pointer-events-none text-center text-sm text-white/80">
      <kbd className={kbd}>W</kbd> <kbd className={kbd}>A</kbd>{" "}
      <kbd className={kbd}>S</kbd> <kbd className={kbd}>D</kbd>
      {" Move · Look · "}
      <kbd className={kbd}>E</kbd>
      {" Interact · "}
      <kbd className={kbd}>M</kbd>
      {" Map"}
    </p>
  );
}
