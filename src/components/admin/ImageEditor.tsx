"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/admin/icons";
import {
  ADJUST_MAX,
  ADJUST_MIN,
  cssFilter,
  isUnadjusted,
  NO_ADJUSTMENTS,
  type Adjustments,
} from "@/lib/imageEdit/adjust";
import type { Suggestion } from "@/lib/imageEdit/analyze";
import {
  ASPECTS,
  aspectRatio,
  fitAspect,
  flipRect,
  moveCrop,
  pixelRect,
  resizeCrop,
  rotateBy,
  type AspectId,
  type Handle,
  type Rect,
  type Size,
} from "@/lib/imageEdit/geometry";
import {
  drawOriented,
  exportEdited,
  loadImage,
  releaseCanvas,
  suggestFor,
  UPRIGHT,
  type Loaded,
  type Orientation,
} from "@/lib/imageEdit/render";
import { fitWithin } from "@/lib/studentWorks/images";

export interface ImageEditorProps {
  /** A picked file, or the URL of an image that's already uploaded. */
  source: File | string;
  /** The crop shape to start with; the smart crop uses it. */
  initialAspect?: AspectId;
  /** Longest edge of the saved image, in pixels. */
  maxSize: number;
  title?: string;
  /** Position in a batch of photos, e.g. 2 of 5. */
  step?: { index: number; total: number };
  applyLabel?: string;
  /** Shows a second way out besides Apply, e.g. "Skip photo". */
  skipLabel?: string;
  onApply: (file: File) => void | Promise<void>;
  onSkip?: () => void;
  onCancel: () => void;
  /** Batches only: smart-crop this photo and the rest without opening each. */
  onApplyRest?: (aspect: AspectId) => void;
}

const PREVIEW_MAX = 1600;
const STAGE_PADDING = 24;

const HANDLES: { id: Handle; className: string }[] = [
  { id: "nw", className: "left-0 top-0 cursor-nwse-resize" },
  { id: "n", className: "left-1/2 top-0 cursor-ns-resize" },
  { id: "ne", className: "left-full top-0 cursor-nesw-resize" },
  { id: "e", className: "left-full top-1/2 cursor-ew-resize" },
  { id: "se", className: "left-full top-full cursor-nwse-resize" },
  { id: "s", className: "left-1/2 top-full cursor-ns-resize" },
  { id: "sw", className: "left-0 top-full cursor-nesw-resize" },
  { id: "w", className: "left-0 top-1/2 cursor-ew-resize" },
];

const SLIDERS: { key: keyof Adjustments; label: string }[] = [
  { key: "brightness", label: "Brightness" },
  { key: "contrast", label: "Contrast" },
  { key: "saturation", label: "Saturation" },
];

function describeTrim(trimmed: Suggestion["trimmed"]): string | null {
  const sides = (["top", "bottom", "left", "right"] as const).filter(
    (side) => trimmed[side],
  );
  if (sides.length === 0) return null;
  const list =
    sides.length === 1
      ? sides[0]
      : `${sides.slice(0, -1).join(", ")} and ${sides[sides.length - 1]}`;
  return `Trimmed a blank border from the ${list}.`;
}

const toolButton =
  "flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 px-2.5 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-40";

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  showLabel = false,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${toolButton} ${showLabel ? "" : "w-9 px-0"}`}
      aria-label={showLabel ? undefined : label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} className="h-4 w-4 shrink-0" />
      {showLabel && <span>{label}</span>}
    </button>
  );
}

/**
 * A full-screen photo editor: crop (free or to a ratio, with a smart crop
 * that trims blank borders and centers on the detail), turn, mirror, and
 * adjust brightness, contrast and saturation. Hands back the edited image
 * as a new file; nothing is uploaded here.
 */
export default function ImageEditor({
  source,
  initialAspect = "free",
  maxSize,
  title = "Edit photo",
  step,
  applyLabel = "Apply",
  skipLabel,
  onApply,
  onSkip,
  onCancel,
  onApplyRest,
}: ImageEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const orientedRef = useRef<HTMLCanvasElement | null>(null);
  const loadedRef = useRef<Loaded | null>(null);
  const drag = useRef<{
    mode: "move" | Handle;
    x: number;
    y: number;
    start: Rect;
  } | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "saving">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  // Bumped whenever the oriented image is redrawn, to repaint the preview
  const [imageSize, setImageSize] = useState<Size | null>(null);
  const [orientation, setOrientation] = useState<Orientation>(UPRIGHT);
  const [aspect, setAspect] = useState<AspectId>(initialAspect);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [adjust, setAdjust] = useState<Adjustments>(NO_ADJUSTMENTS);
  const [note, setNote] = useState<string | null>(null);
  const [stage, setStage] = useState<Size>({ width: 0, height: 0 });

  /** Redraws the working image for an orientation; returns it. */
  function orient(next: Orientation) {
    const loaded = loadedRef.current;
    if (!loaded) return null;
    releaseCanvas(orientedRef.current);
    const canvas = drawOriented(loaded.bitmap, next);
    orientedRef.current = canvas;
    setImageSize({ width: canvas.width, height: canvas.height });
    return canvas;
  }

  /** Runs the smart crop for a ratio and says what it trimmed. */
  function smartCrop(
    canvas: HTMLCanvasElement,
    id: AspectId,
    announce: boolean,
  ) {
    const suggestion = suggestFor(canvas, aspectRatio(id));
    setCrop(suggestion.crop);
    const trim = describeTrim(suggestion.trimmed);
    setNote(trim ?? (announce ? "No blank borders found." : null));
  }

  // Opened only after a click, so this never renders on the server
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal?.();
  }, []);

  // Load the image once per editor
  useEffect(() => {
    let cancelled = false;
    loadImage(source)
      .then((loaded) => {
        if (cancelled) {
          loaded.bitmap.close();
          return;
        }
        loadedRef.current = loaded;
        const canvas = orient(UPRIGHT);
        if (canvas) smartCrop(canvas, initialAspect, false);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "The image couldn't be opened.",
        );
      });
    return () => {
      cancelled = true;
      loadedRef.current?.bitmap.close();
      loadedRef.current = null;
      releaseCanvas(orientedRef.current);
      orientedRef.current = null;
    };
    // The editor is remounted (via key) for a new source
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the stage size current so the image fits it
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setStage({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const ready = status === "ready" && crop && imageSize;
  const ratio = aspectRatio(aspect);
  const scale = imageSize
    ? Math.max(
        0,
        Math.min(
          (stage.width - STAGE_PADDING * 2) / imageSize.width,
          (stage.height - STAGE_PADDING * 2) / imageSize.height,
        ),
      )
    : 0;
  const showImage = Boolean(imageSize && crop && scale > 0);

  // Paint a screen-sized copy of the working image once it's on screen
  useEffect(() => {
    const oriented = orientedRef.current;
    const preview = previewRef.current;
    if (!oriented || !preview || !imageSize) return;
    const size = fitWithin(imageSize, PREVIEW_MAX);
    preview.width = size.width;
    preview.height = size.height;
    preview
      .getContext("2d")
      ?.drawImage(oriented, 0, 0, size.width, size.height);
  }, [imageSize, showImage]);

  function rotate(quarterTurns: number) {
    const next = {
      ...orientation,
      rotation: rotateBy(orientation.rotation, quarterTurns),
    };
    setOrientation(next);
    const canvas = orient(next);
    if (canvas) smartCrop(canvas, aspect, false);
  }

  function flip(axis: "x" | "y") {
    const next =
      axis === "x"
        ? { ...orientation, flipX: !orientation.flipX }
        : { ...orientation, flipY: !orientation.flipY };
    setOrientation(next);
    orient(next);
    if (crop && imageSize) setCrop(flipRect(crop, imageSize, axis));
  }

  function chooseAspect(id: AspectId) {
    setAspect(id);
    if (orientedRef.current) smartCrop(orientedRef.current, id, false);
  }

  function showWholeImage() {
    if (!imageSize) return;
    setCrop(fitAspect({ x: 0, y: 0, ...imageSize }, ratio));
    setNote(null);
  }

  function resetAll() {
    setAspect(initialAspect);
    setAdjust(NO_ADJUSTMENTS);
    setOrientation(UPRIGHT);
    const canvas = orient(UPRIGHT);
    if (canvas) smartCrop(canvas, initialAspect, false);
  }

  function startDrag(e: React.PointerEvent, mode: "move" | Handle) {
    if (!crop || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, x: e.clientX, y: e.clientY, start: crop };
  }

  function onDrag(e: React.PointerEvent) {
    const current = drag.current;
    if (!current || !imageSize || scale === 0) return;
    const dx = (e.clientX - current.x) / scale;
    const dy = (e.clientY - current.y) / scale;
    setCrop(
      current.mode === "move"
        ? moveCrop(current.start, imageSize, dx, dy)
        : resizeCrop(current.start, current.mode, dx, dy, imageSize, ratio),
    );
  }

  function onCropKey(e: React.KeyboardEvent) {
    if (!crop || !imageSize) return;
    const stepPx =
      (e.shiftKey ? 0.1 : 0.01) * Math.max(imageSize.width, imageSize.height);
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-stepPx, 0],
      ArrowRight: [stepPx, 0],
      ArrowUp: [0, -stepPx],
      ArrowDown: [0, stepPx],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setCrop(moveCrop(crop, imageSize, move[0], move[1]));
  }

  async function apply() {
    const oriented = orientedRef.current;
    const loaded = loadedRef.current;
    if (!oriented || !loaded || !crop) return;
    setStatus("saving");
    setError(null);
    try {
      const file = await exportEdited(
        oriented,
        { crop, adjust },
        { max: maxSize, hasAlpha: loaded.hasAlpha, name: loaded.name },
      );
      await onApply(file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The photo couldn't be saved.",
      );
      setStatus("ready");
    }
  }

  const output =
    crop && imageSize ? fitWithin(pixelRect(crop, imageSize), maxSize) : null;
  const busy = status !== "ready";
  const rest = step ? step.total - step.index : 0;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="image-editor-title"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-neutral-900 p-0 text-white backdrop:bg-black/70"
      onCancel={(e) => {
        e.preventDefault();
        if (status !== "saving") onCancel();
      }}
      // Keep editor input from marking the surrounding form as edited
      onChange={(e) => e.stopPropagation()}
      onInput={(e) => e.stopPropagation()}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Icon name="crop" className="h-5 w-5 text-white/60" />
          <h2 id="image-editor-title" className="text-base font-semibold">
            {title}
            {step && step.total > 1 && (
              <span className="ml-2 font-normal text-white/60 tabular-nums">
                {step.index} of {step.total}
              </span>
            )}
          </h2>
          <button
            type="button"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close editor"
            title="Close"
            disabled={status === "saving"}
            onClick={onCancel}
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        {/* On phones the photo and the tools scroll together */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <div
            ref={stageRef}
            className="relative h-[55vh] shrink-0 overflow-hidden bg-neutral-950 select-none lg:h-auto lg:flex-1 lg:shrink"
          >
            {!ready && !error && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
                Opening image…
              </p>
            )}
            {imageSize && crop && scale > 0 && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: imageSize.width * scale,
                  height: imageSize.height * scale,
                }}
              >
                <canvas
                  ref={previewRef}
                  className="block h-full w-full"
                  style={{ filter: cssFilter(adjust) }}
                />
                <div
                  role="group"
                  tabIndex={0}
                  aria-label="Crop area. Drag to move, drag the edges to resize, or use the arrow keys to move it."
                  className="absolute cursor-move touch-none outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  style={{
                    left: crop.x * scale,
                    top: crop.y * scale,
                    width: crop.width * scale,
                    height: crop.height * scale,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                  }}
                  onPointerDown={(e) => startDrag(e, "move")}
                  onPointerMove={onDrag}
                  onPointerUp={() => (drag.current = null)}
                  onPointerCancel={() => (drag.current = null)}
                  onKeyDown={onCropKey}
                >
                  <div className="pointer-events-none absolute inset-0 border border-white/90">
                    <div className="absolute inset-y-0 left-1/3 border-l border-white/35" />
                    <div className="absolute inset-y-0 left-2/3 border-l border-white/35" />
                    <div className="absolute inset-x-0 top-1/3 border-t border-white/35" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-white/35" />
                  </div>
                  {HANDLES.map((handle) => (
                    <span
                      key={handle.id}
                      aria-hidden
                      className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center ${handle.className}`}
                      onPointerDown={(e) => startDrag(e, handle.id)}
                    >
                      <span
                        className={`block rounded-sm bg-white shadow ${
                          handle.id.length === 2
                            ? "h-3.5 w-3.5"
                            : handle.id === "n" || handle.id === "s"
                              ? "h-1.5 w-6"
                              : "h-6 w-1.5"
                        }`}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="shrink-0 space-y-5 border-t border-white/10 p-4 lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                Crop
              </h3>
              <div
                role="radiogroup"
                aria-label="Aspect ratio"
                className="flex flex-wrap gap-1.5"
              >
                {ASPECTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={aspect === option.id}
                    disabled={busy}
                    className={`h-8 rounded-full border px-3 text-sm tabular-nums transition-colors disabled:opacity-40 ${
                      aspect === option.id
                        ? "border-white bg-white text-neutral-900"
                        : "border-white/20 text-white/85 hover:border-white/50"
                    }`}
                    onClick={() => chooseAspect(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <ToolButton
                  icon="sparkle"
                  label="Smart crop"
                  showLabel
                  disabled={busy}
                  onClick={() =>
                    orientedRef.current &&
                    smartCrop(orientedRef.current, aspect, true)
                  }
                />
                <ToolButton
                  icon="image"
                  label="Whole image"
                  showLabel
                  disabled={busy}
                  onClick={showWholeImage}
                />
              </div>
              <p className="min-h-4 text-xs text-white/60" role="status">
                {note}
              </p>
            </section>

            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                Turn &amp; flip
              </h3>
              <div className="flex gap-1.5">
                <ToolButton
                  icon="rotate-left"
                  label="Rotate left"
                  disabled={busy}
                  onClick={() => rotate(-1)}
                />
                <ToolButton
                  icon="rotate-right"
                  label="Rotate right"
                  disabled={busy}
                  onClick={() => rotate(1)}
                />
                <ToolButton
                  icon="flip-x"
                  label="Flip horizontally"
                  disabled={busy}
                  onClick={() => flip("x")}
                />
                <ToolButton
                  icon="flip-y"
                  label="Flip vertically"
                  disabled={busy}
                  onClick={() => flip("y")}
                />
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Adjust
                </h3>
                {!isUnadjusted(adjust) && (
                  <button
                    type="button"
                    className="text-xs text-white/60 underline hover:text-white"
                    onClick={() => setAdjust(NO_ADJUSTMENTS)}
                  >
                    Reset colors
                  </button>
                )}
              </div>
              {SLIDERS.map(({ key, label }) => (
                <label key={key} className="block space-y-1">
                  <span className="flex justify-between text-sm text-white/85">
                    {label}
                    <span className="text-white/50 tabular-nums">
                      {adjust[key] - 100 > 0 ? "+" : ""}
                      {adjust[key] - 100}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={ADJUST_MIN}
                    max={ADJUST_MAX}
                    value={adjust[key]}
                    disabled={busy}
                    className="w-full accent-white"
                    onChange={(e) =>
                      setAdjust((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    onDoubleClick={() =>
                      setAdjust((prev) => ({ ...prev, [key]: 100 }))
                    }
                  />
                </label>
              ))}
            </section>

            <ToolButton
              icon="reset"
              label="Start over"
              showLabel
              disabled={busy}
              onClick={resetAll}
            />
          </aside>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-neutral-900 px-4 py-3">
          <p className="mr-auto hidden text-xs text-white/60 tabular-nums sm:block">
            {output ? `${output.width} × ${output.height} px` : ""}
          </p>
          {error && (
            <p role="alert" className="w-full text-sm text-red-300 sm:w-auto">
              {error}
            </p>
          )}
          {onSkip && skipLabel && (
            <button
              type="button"
              className="h-10 flex-1 rounded-lg px-3 text-sm text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40 sm:flex-none sm:px-4"
              disabled={status === "saving"}
              onClick={onSkip}
            >
              {skipLabel}
            </button>
          )}
          {onApplyRest && rest > 0 && (
            <button
              type="button"
              className="h-10 flex-1 rounded-lg border border-white/20 px-3 text-sm whitespace-nowrap text-white hover:border-white/50 disabled:opacity-40 sm:flex-none sm:px-4"
              disabled={status === "saving"}
              onClick={() => onApplyRest(aspect)}
              title="Apply the smart crop to this photo and the rest without opening each one"
            >
              <span className="sm:hidden">Smart-crop all ({rest + 1})</span>
              <span className="hidden sm:inline">
                Smart-crop this and the rest ({rest + 1})
              </span>
            </button>
          )}
          <button
            type="button"
            className="bg-theme-red h-10 flex-1 rounded-lg px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 sm:flex-none sm:px-5"
            disabled={!ready || busy}
            onClick={apply}
          >
            {status === "saving" ? "Saving…" : applyLabel}
          </button>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
