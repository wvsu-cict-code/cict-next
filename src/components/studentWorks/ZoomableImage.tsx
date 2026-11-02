"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { StudentWork } from "@/lib/cms/content";
import type { Size } from "@/lib/studentWorks/layout";
import {
  MAX_SCALE,
  MIN_SCALE,
  RESET,
  panBy,
  zoomAt,
  type ZoomState,
} from "@/lib/studentWorks/zoom";

const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_DISTANCE = 24;
/** A press that moves further than this is a drag, not a tap. */
const TAP_SLOP = 10;
const BUTTON_STEP = 2;
const DOUBLE_TAP_SCALE = 2;
/** Wheel events this close to a detected trackpad scroll belong to it. */
const TRACKPAD_STREAM_MS = 300;

const zoomButton =
  "inline-flex h-11 min-w-11 items-center justify-center rounded border border-white/40 px-3 text-lg text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";

type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Props = {
  work: StudentWork;
  onZoomedChange(zoomed: boolean): void;
};

/**
 * A work's image that can be zoomed by pinch, wheel, double-tap/click and
 * buttons, and panned by dragging while zoomed. Single-pointer gestures at
 * scale 1 bubble up so the spotlight can still swipe between works.
 */
export function ZoomableImage(props: Props) {
  // A fresh instance per work: no zoom state (or a requested zoom file)
  // carries over to the next piece, even for one render.
  return <ZoomView key={props.work.id} {...props} />;
}

function ZoomView({ work, onZoomedChange }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLImageElement>(null);
  const zoomInRef = useRef<HTMLButtonElement>(null);
  const zoomOutRef = useRef<HTMLButtonElement>(null);
  const focusAfterRender = useRef<HTMLButtonElement | null>(null);
  // The ref is the source of truth during gestures (many events per frame);
  // the state mirrors it for rendering.
  const zoomRef = useRef<ZoomState>(RESET);
  const [zoom, setZoom] = useState<ZoomState>(RESET);
  const [animate, setAnimate] = useState(false);
  const [gesturing, setGesturing] = useState(false);
  const [zoomRequested, setZoomRequested] = useState(false);
  const [zoomLoaded, setZoomLoaded] = useState(false);

  const pointers = useRef(new Map<number, Point>());
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const multiTouch = useRef(false);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const lastPointerType = useRef<string | null>(null);
  const onZoomedChangeRef = useRef(onZoomedChange);

  useEffect(() => {
    onZoomedChangeRef.current = onZoomedChange;
  });

  function measure(): { image: Size; viewport: Size } {
    const img = displayRef.current;
    const viewport = viewportRef.current;
    return {
      // clientWidth/Height ignore transforms, so this is the size at scale 1.
      image: { width: img?.clientWidth ?? 0, height: img?.clientHeight ?? 0 },
      viewport: {
        width: viewport?.clientWidth ?? 0,
        height: viewport?.clientHeight ?? 0,
      },
    };
  }

  /** A client point relative to the viewport centre. */
  function focusOf(clientX: number, clientY: number): Point {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2),
    };
  }

  function apply(next: ZoomState, animated = false) {
    const previous = zoomRef.current;
    zoomRef.current = next;
    setZoom(next);
    setAnimate(animated && !prefersReducedMotion());
    if (next.scale > MIN_SCALE && work.zoom_url) setZoomRequested(true);
    const wasZoomed = previous.scale > MIN_SCALE;
    const isZoomed = next.scale > MIN_SCALE;
    if (wasZoomed !== isZoomed) onZoomedChange(isZoomed);
  }

  function zoomTo(scale: number, focus: Point, animated = false) {
    const { image, viewport } = measure();
    apply(zoomAt(zoomRef.current, scale, focus, image, viewport), animated);
  }

  /** Button zoom; moves focus off a button that this disables. */
  function zoomByButton(next: ZoomState | number, button: HTMLButtonElement) {
    if (typeof next === "number") zoomTo(next, { x: 0, y: 0 }, true);
    else apply(next, true);
    if (button !== document.activeElement) return;
    const scale = zoomRef.current.scale;
    // The other button may only be enabled by the coming render.
    if (scale >= MAX_SCALE) focusAfterRender.current = zoomOutRef.current;
    else if (scale <= MIN_SCALE) focusAfterRender.current = zoomInRef.current;
  }

  useEffect(() => {
    focusAfterRender.current?.focus();
    focusAfterRender.current = null;
  });

  function toggleAt(clientX: number, clientY: number) {
    if (zoomRef.current.scale > MIN_SCALE) apply(RESET, true);
    else zoomTo(DOUBLE_TAP_SCALE, focusOf(clientX, clientY), true);
  }

  // Moving to another work (or a video) unmounts this; the spotlight must
  // not stay "zoomed".
  useEffect(() => {
    const notify = onZoomedChangeRef;
    return () => notify.current(false);
  }, []);

  // Latest handlers for the native listeners below.
  const handlers = useRef({ zoomTo, apply, measure });
  useEffect(() => {
    handlers.current = { zoomTo, apply, measure };
  });

  // React's onWheel is passive, so preventDefault needs a native listener.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let trackpadAt = -Infinity;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      // Two-finger trackpad scrolls come in pixels, often sideways or
      // fractional; mouse wheels scroll straight down in whole steps.
      const now = Date.now();
      if (
        !event.ctrlKey &&
        event.deltaMode === 0 &&
        (event.deltaX !== 0 ||
          !Number.isInteger(event.deltaY) ||
          now - trackpadAt <= TRACKPAD_STREAM_MS)
      ) {
        trackpadAt = now;
        if (zoomRef.current.scale > MIN_SCALE) {
          const { image, viewport: size } = handlers.current.measure();
          handlers.current.apply(
            panBy(zoomRef.current, -event.deltaX, -event.deltaY, image, size),
          );
          return;
        }
      }
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      // Trackpad pinches arrive as small ctrl+wheel deltas: zoom faster.
      const factor = Math.exp(
        (-event.deltaY * unit) / (event.ctrlKey ? 100 : 300),
      );
      const rect = viewport.getBoundingClientRect();
      handlers.current.zoomTo(zoomRef.current.scale * factor, {
        x: event.clientX - (rect.left + rect.width / 2),
        y: event.clientY - (rect.top + rect.height / 2),
      });
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  // Keep the image in view when the viewport changes size.
  useEffect(() => {
    const onResize = () => {
      const { image, viewport } = handlers.current.measure();
      const current = zoomRef.current;
      const next = panBy(current, 0, 0, image, viewport);
      if (
        next.scale !== current.scale ||
        next.x !== current.x ||
        next.y !== current.y
      ) {
        handlers.current.apply(next);
      }
    };
    const viewport = viewportRef.current;
    if (typeof ResizeObserver !== "undefined" && viewport) {
      const observer = new ResizeObserver(onResize);
      observer.observe(viewport);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Whether the spotlight must not see this event as part of a swipe. */
  function swallow(event: PointerEvent) {
    if (
      zoomRef.current.scale > MIN_SCALE ||
      multiTouch.current ||
      pointers.current.size > 1
    ) {
      event.stopPropagation();
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    lastPointerType.current = event.pointerType;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size > 1) {
      multiTouch.current = true;
      press.current = null;
    } else {
      press.current = { x: event.clientX, y: event.clientY, moved: false };
    }
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured.
    }
    // Swipes at scale 1 don't move the image, so they don't promote it.
    if (zoomRef.current.scale > MIN_SCALE || multiTouch.current) {
      setGesturing(true);
    }
    swallow(event);
  }

  function onPointerMove(event: PointerEvent) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    swallow(event);
    const current = { x: event.clientX, y: event.clientY };
    if (press.current && distance(press.current, current) > TAP_SLOP) {
      press.current.moved = true;
    }

    if (pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.entries()).slice(0, 2);
      if (event.pointerId !== a[0] && event.pointerId !== b[0]) return;
      const before = [a[1], b[1]];
      pointers.current.set(event.pointerId, current);
      const after = [pointers.current.get(a[0])!, pointers.current.get(b[0])!];
      const startDistance = distance(before[0], before[1]);
      if (startDistance === 0) return;
      const ratio = distance(after[0], after[1]) / startDistance;
      const from = midpoint(before[0], before[1]);
      const to = midpoint(after[0], after[1]);
      const { image, viewport } = measure();
      const scaled = zoomAt(
        zoomRef.current,
        zoomRef.current.scale * ratio,
        focusOf(from.x, from.y),
        image,
        viewport,
      );
      apply(panBy(scaled, to.x - from.x, to.y - from.y, image, viewport));
      return;
    }

    pointers.current.set(event.pointerId, current);
    if (zoomRef.current.scale > MIN_SCALE) {
      const { image, viewport } = measure();
      apply(
        panBy(
          zoomRef.current,
          current.x - previous.x,
          current.y - previous.y,
          image,
          viewport,
        ),
      );
    }
  }

  function endPointer(event: PointerEvent, cancelled: boolean) {
    if (!pointers.current.has(event.pointerId)) return;
    swallow(event);
    const wasTap =
      !cancelled &&
      !multiTouch.current &&
      press.current !== null &&
      !press.current.moved &&
      distance(press.current, { x: event.clientX, y: event.clientY }) <=
        TAP_SLOP;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      multiTouch.current = false;
      press.current = null;
      setGesturing(false);
    }
    // Mice double-click through onDoubleClick instead.
    if (!wasTap || event.pointerType === "mouse") return;
    const now = Date.now();
    const tapAt = { x: event.clientX, y: event.clientY };
    const last = lastTap.current;
    if (
      last &&
      now - last.time <= DOUBLE_TAP_MS &&
      distance(last, tapAt) <= DOUBLE_TAP_DISTANCE
    ) {
      lastTap.current = null;
      toggleAt(tapAt.x, tapAt.y);
    } else {
      lastTap.current = { time: now, ...tapAt };
    }
  }

  const alt = `${work.title} by ${work.student}`;
  const zoomed = zoom.scale > MIN_SCALE;
  const showZoomVersion = zoomRequested && zoomLoaded;
  const transition =
    animate && !gesturing ? "transform 200ms ease-out" : "none";

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <div
        ref={viewportRef}
        data-testid="zoom-viewport"
        className={`flex w-full min-w-0 items-center justify-center overflow-hidden ${
          zoomed ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endPointer(event, false)}
        onPointerCancel={(event) => endPointer(event, true)}
        onDoubleClick={(event) => {
          // Touch double-taps are handled on pointerup; some browsers follow
          // them with a dblclick that would undo the zoom.
          if (lastPointerType.current && lastPointerType.current !== "mouse")
            return;
          toggleAt(event.clientX, event.clientY);
        }}
      >
        <div
          data-testid="zoom-image"
          className="relative max-w-full"
          style={{
            transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
            transformOrigin: "center",
            transition,
            // Only while a gesture runs: with will-change left on, Chrome
            // keeps the scale-1 raster and the zoomed image turns blurry.
            willChange: gesturing ? "transform" : "auto",
          }}
        >
          {/* The display image always sets the box, so swapping in the zoom
              version can't change its size. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- the static site can't optimize images */}
          <img
            ref={displayRef}
            src={work.image_url ?? undefined}
            alt={showZoomVersion ? "" : alt}
            aria-hidden={showZoomVersion || undefined}
            draggable={false}
            className={`max-h-[calc(55dvh-8.25rem)] max-w-full rounded object-contain select-none lg:max-h-[calc(80vh-3.25rem)] ${
              showZoomVersion ? "invisible" : ""
            }`}
          />
          {zoomRequested && work.zoom_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- the static site can't optimize images
            <img
              key={work.zoom_url}
              src={work.zoom_url}
              alt={showZoomVersion ? alt : ""}
              aria-hidden={!showZoomVersion || undefined}
              draggable={false}
              onLoad={() => setZoomLoaded(true)}
              className={`absolute inset-0 h-full w-full rounded object-contain select-none ${
                showZoomVersion ? "" : "invisible"
              }`}
            />
          ) : null}
        </div>
      </div>
      <div
        role="group"
        aria-label="Zoom"
        className="mt-2 flex items-center gap-2"
      >
        <button
          type="button"
          ref={zoomOutRef}
          aria-label="Zoom out"
          disabled={!zoomed}
          onClick={(event) =>
            zoomByButton(zoom.scale / BUTTON_STEP, event.currentTarget)
          }
          className={zoomButton}
        >
          <span aria-hidden>−</span>
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          disabled={!zoomed}
          onClick={(event) => zoomByButton(RESET, event.currentTarget)}
          className={zoomButton}
        >
          <span aria-hidden className="text-sm">
            1:1
          </span>
        </button>
        <button
          type="button"
          ref={zoomInRef}
          aria-label="Zoom in"
          disabled={zoom.scale >= MAX_SCALE}
          onClick={(event) =>
            zoomByButton(zoom.scale * BUTTON_STEP, event.currentTarget)
          }
          className={zoomButton}
        >
          <span aria-hidden>+</span>
        </button>
      </div>
    </div>
  );
}
