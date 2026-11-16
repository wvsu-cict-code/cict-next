"use client";

import { useEffect, useRef, useState } from "react";
import { Card, FormSection, buttonClass } from "@/components/admin/PageHeader";
import { Icon } from "@/components/admin/icons";
import { inputClass } from "@/components/admin/fields";
import { COVER, SQUARE } from "@/lib/socialPack/brand";
import {
  buildPack,
  canvasRenderer,
  loadImage,
  loadSiteFonts,
} from "@/lib/socialPack/build";
import {
  drawCover,
  drawSquare,
  type CoverInput,
  type Fonts,
  type LoadedImage,
} from "@/lib/socialPack/draw";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/socialPack/crop";
import { LAYOUTS, type LayoutId, type Rect } from "@/lib/socialPack/layouts";
import {
  fewImagesWarning,
  fileNames,
  packPhotoUrls,
  zipName,
  type PackSource,
} from "@/lib/socialPack/pack";
import {
  useComposer,
  type ComposerAction,
  type ComposerState,
  type ComposerTextField,
} from "./useComposer";

const SEAL_URL = "/wvsu-seal.png";
const LOGO_URL = "/icons/cictlogo.png";
const PREVIEW_WIDTH = 240;
const THUMB_PREVIEW = 188;
/** Cover pixels moved per arrow key press (with Shift: ×4). */
const KEY_STEP = 20;
/** How long one image may take before it counts as unavailable. */
const IMAGE_TIMEOUT_MS = 15_000;
/** Wheel delta that doubles (or halves) the zoom. */
const WHEEL_PER_DOUBLING = 350;

type Assets = {
  fonts: Fonts;
  logos: LoadedImage[];
  /** Photos that loaded, by URL. */
  images: Map<string, LoadedImage>;
};

/** The image, or null if it fails to load or stalls past the timeout. */
function loadOrNull(url: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), IMAGE_TIMEOUT_MS);
    loadImage(url).then(
      (image) => {
        clearTimeout(timer);
        resolve(image);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

async function loadAssets(source: PackSource): Promise<Assets> {
  const urls = packPhotoUrls(source).map((p) => p.url);
  const [fonts, seal, logo, ...photos] = await Promise.all([
    loadSiteFonts(),
    loadOrNull(SEAL_URL),
    loadOrNull(LOGO_URL),
    ...urls.map(loadOrNull),
  ]);
  const images = new Map<string, LoadedImage>();
  for (const photo of photos) if (photo) images.set(photo.url, photo);
  return {
    fonts,
    logos: [seal, logo].filter((l): l is LoadedImage => l !== null),
    images,
  };
}

/** Loads fonts, logos and every photo, then opens the editor. */
export default function Composer({
  source,
  notice = null,
}: {
  source: PackSource;
  /** Set when the item isn't public yet, so its caption link won't work. */
  notice?: string | null;
}) {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAssets(source).then(
      (loaded) => !cancelled && setAssets(loaded),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (failed) {
    return (
      <Notice tone="error">
        The composer couldn&apos;t load its fonts. Reload the page to try again.
      </Notice>
    );
  }
  if (!assets) {
    return (
      <p role="status" className="text-ink-soft text-sm">
        Loading photos…
      </p>
    );
  }
  return <Editor source={source} assets={assets} notice={notice} />;
}

function fileLabel(url: string): string {
  const last = url.split(/[?#]/)[0].split("/").filter(Boolean).pop() ?? url;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function slotAt(layout: LayoutId, x: number, y: number): number {
  return LAYOUTS[layout].slots.findIndex(
    (r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height,
  );
}

const percent = (n: number, of: number) => `${(n / of) * 100}%`;

function rectStyle(r: Rect): React.CSSProperties {
  return {
    left: percent(r.x, COVER.width),
    top: percent(r.y, COVER.height),
    width: percent(r.width, COVER.width),
    height: percent(r.height, COVER.height),
  };
}

function coverInput(state: ComposerState, assets: Assets): CoverInput {
  return {
    layout: state.layout,
    slots: state.slots.map((slot) => ({
      image: (slot.url && assets.images.get(slot.url)) || null,
      crop: slot.crop,
    })),
    title: state.title,
    label: state.label,
    date: state.date,
    summary: state.summary,
    logos: assets.logos,
  };
}

function Editor({
  source,
  assets,
  notice,
}: {
  source: PackSource;
  assets: Assets;
  notice: string | null;
}) {
  const photos = packPhotoUrls(source);
  const available = photos.flatMap((p) => assets.images.get(p.url) ?? []);
  const unavailable = photos
    .filter((p) => !assets.images.has(p.url))
    .map((p) => p.url);

  // Only photos that loaded can go in a slot
  const [state, dispatch] = useComposer({
    ...source,
    coverImageUrl:
      source.coverImageUrl && assets.images.has(source.coverImageUrl)
        ? source.coverImageUrl
        : null,
    photos: source.photos.filter((p) => assets.images.has(p.url)),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);

  const cover = coverInput(state, assets);
  const warning = fewImagesWarning(available.length - skipped.length);
  const leftOut = [...unavailable, ...skipped];
  // The two cover halves come first
  const photoFileNames = fileNames(available.length).slice(2);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const pack = await buildPack(
        { source, cover, photos: available },
        canvasRenderer(assets.fonts),
      );
      setSkipped(pack.skipped);
      const url = URL.createObjectURL(
        new Blob([pack.zip as Uint8Array<ArrayBuffer>], {
          type: "application/zip",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = zipName(source.slug);
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      console.error(error);
      setError("The zip couldn't be made. Try again, or reload the page.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <div className="space-y-6 lg:sticky lg:top-10">
        <Card className="space-y-4">
          <h2 className="text-ink text-lg font-medium">Cover preview</h2>
          <Preview
            state={state}
            dispatch={dispatch}
            cover={cover}
            assets={assets}
          />
          <p className="text-ink-soft text-xs leading-relaxed">
            Click a photo to select it, drag to move it, scroll to zoom. The red
            line is where the cover is cut into two images.
          </p>
        </Card>
        {available.length > 0 && (
          <Card className="space-y-3">
            <h2 className="text-ink text-sm font-semibold">Photo images</h2>
            <ul className="grid grid-cols-3 gap-2">
              {available.map((image, i) => (
                <li key={image.url} className="space-y-1">
                  <SquarePreview image={image} fonts={assets.fonts} />
                  <p className="text-ink-soft text-center text-xs">
                    {photoFileNames[i]}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <FormSection title="Collage layout">
          <LayoutPicker
            layout={state.layout}
            onChange={(layout) => dispatch({ type: "setLayout", layout })}
          />
        </FormSection>

        <FormSection
          title="Photos"
          description="Click a photo to put it in the next empty slot of the collage. Click it again to take it out."
        >
          {photos.length === 0 ? (
            <p className="text-ink-soft text-sm">
              This has no photos, so the cover gets a plain navy background.
            </p>
          ) : (
            <PhotoPicker
              photos={photos}
              state={state}
              loaded={assets.images}
              onToggle={(url) => dispatch({ type: "togglePhoto", url })}
            />
          )}
        </FormSection>

        <FormSection
          title="Crop"
          description="Pick a slot, then drag the photo in the preview to move it. Scroll over the preview or use the slider to zoom."
        >
          <CropControls state={state} dispatch={dispatch} />
        </FormSection>

        <FormSection
          title="Text on the cover"
          description="Changes here only affect this export, not the article."
        >
          <TextInputs
            state={state}
            onChange={(field, value) =>
              dispatch({ type: "setText", field, value })
            }
          />
        </FormSection>

        <Card className="space-y-4">
          {notice && <Notice tone="warning">{notice}</Notice>}
          {warning && <Notice tone="warning">{warning}</Notice>}
          {leftOut.length > 0 && (
            <Notice tone="warning">
              Left out because it couldn&apos;t be loaded for export:{" "}
              {leftOut.map((url, i) => (
                <span key={url}>
                  {i > 0 && ", "}
                  <span title={url} className="font-semibold">
                    {fileLabel(url)}
                  </span>
                </span>
              ))}
            </Notice>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={download}
              disabled={busy}
              className={buttonClass.primary}
            >
              <Icon name="download" className="h-4 w-4" />
              {busy ? "Preparing…" : "Download zip"}
            </button>
            <p className="text-ink-soft text-xs">
              {zipName(source.slug)}: {available.length - skipped.length + 2}{" "}
              images and caption.txt
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "warning" | "error";
  children: React.ReactNode;
}) {
  const colors =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${colors}`}
    >
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Preview({
  state,
  dispatch,
  cover,
  assets,
}: {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
  cover: CoverInput;
  assets: Assets;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const selected = state.slots[state.selectedSlot];
  const selectedImage = selected?.url ? assets.images.get(selected.url) : null;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawCover(ctx, cover, assets.fonts);
  }, [cover, assets.fonts]);

  // React's onWheel is passive, so it can't stop the page from scrolling
  const { layout } = state;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      const { x, y } = toCover(canvas, e);
      const index = slotAt(layout, x, y);
      if (index < 0) return;
      e.preventDefault();
      dispatch({ type: "selectSlot", index });
      dispatch({
        type: "zoom",
        factor: 2 ** (-e.deltaY / WHEEL_PER_DOUBLING),
      });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [layout, dispatch]);

  function pan(dx: number, dy: number) {
    if (selectedImage) dispatch({ type: "pan", dx, dy, image: selectedImage });
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = toCover(e.currentTarget, e);
    const index = slotAt(state.layout, x, y);
    if (index < 0) return;
    dispatch({ type: "selectSlot", index });
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current) return;
    const scale = coverScale(e.currentTarget);
    const dx = (e.clientX - drag.current.x) * scale;
    const dy = (e.clientY - drag.current.y) * scale;
    drag.current = { x: e.clientX, y: e.clientY };
    pan(dx, dy);
  }

  function endDrag() {
    drag.current = null;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    pan(...move);
  }

  const selectedRect = LAYOUTS[state.layout].slots[state.selectedSlot];

  return (
    <div
      className="relative mx-auto overflow-hidden rounded shadow-[0_2px_10px_rgba(16,32,51,0.25)]"
      style={{ width: PREVIEW_WIDTH }}
    >
      <canvas
        ref={canvasRef}
        width={COVER.width}
        height={COVER.height}
        tabIndex={0}
        aria-label={`Cover preview. Slot ${state.selectedSlot + 1} is selected; arrow keys move its photo.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="focus-visible:ring-theme-red/40 block h-auto w-full cursor-grab touch-none focus-visible:ring-4 focus-visible:outline-none active:cursor-grabbing"
      />
      {selectedRect && (
        <div
          aria-hidden
          className="pointer-events-none absolute outline-2 -outline-offset-2 outline-[#f57c00]"
          style={rectStyle(selectedRect)}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 border-t-2 border-dashed border-red-600"
      />
    </div>
  );
}

function coverScale(canvas: HTMLCanvasElement): number {
  return COVER.width / canvas.getBoundingClientRect().width;
}

function toCover(
  canvas: HTMLCanvasElement,
  e: { clientX: number; clientY: number },
) {
  const box = canvas.getBoundingClientRect();
  const scale = COVER.width / box.width;
  return {
    x: (e.clientX - box.left) * scale,
    y: (e.clientY - box.top) * scale,
  };
}

function SquarePreview({ image, fonts }: { image: LoadedImage; fonts: Fonts }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(
      THUMB_PREVIEW / SQUARE,
      0,
      0,
      THUMB_PREVIEW / SQUARE,
      0,
      0,
    );
    drawSquare(ctx, image, fonts);
  }, [image, fonts]);
  return (
    <canvas
      ref={ref}
      width={THUMB_PREVIEW}
      height={THUMB_PREVIEW}
      className="block aspect-square h-auto w-full rounded-sm"
      aria-hidden
    />
  );
}

function LayoutPicker({
  layout,
  onChange,
}: {
  layout: LayoutId;
  onChange: (layout: LayoutId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.keys(LAYOUTS) as LayoutId[]).map((id) => {
        const on = id === layout;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(id)}
            className={`flex w-24 flex-col items-center gap-2 rounded-lg border-2 p-2 text-xs transition-colors ${
              on
                ? "border-theme-red text-ink"
                : "border-rule text-ink-soft hover:border-ink/40"
            }`}
          >
            <span aria-hidden className="relative block h-16 w-8">
              {LAYOUTS[id].slots.map((rect, i) => (
                <span
                  key={i}
                  className={`absolute rounded-[2px] border border-white ${on ? "bg-theme-red/60" : "bg-ink/25"}`}
                  style={rectStyle(rect)}
                />
              ))}
            </span>
            <span className="text-center leading-tight">
              {LAYOUTS[id].label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PhotoPicker({
  photos,
  state,
  loaded,
  onToggle,
}: {
  photos: { url: string; alt: string }[];
  state: ComposerState;
  loaded: Map<string, LoadedImage>;
  onToggle: (url: string) => void;
}) {
  const full = state.slots.every((s) => s.url !== null);
  const someUnused = photos.some(
    (p) => loaded.has(p.url) && !state.slots.some((s) => s.url === p.url),
  );
  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-3">
        {photos.map((photo, i) => {
          const slot = state.slots.findIndex((s) => s.url === photo.url);
          const ok = loaded.has(photo.url);
          const name = photo.alt || `Photo ${i + 1}`;
          const status = !ok
            ? "unavailable"
            : slot >= 0
              ? `in slot ${slot + 1}`
              : "not in the collage";
          return (
            <li key={photo.url}>
              <button
                type="button"
                disabled={!ok || (slot < 0 && full)}
                aria-pressed={slot >= 0}
                aria-label={`${name}, ${status}`}
                title={
                  !ok ? `${fileLabel(photo.url)} couldn't be loaded` : name
                }
                onClick={() => onToggle(photo.url)}
                className={`relative block h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors disabled:cursor-not-allowed ${
                  slot >= 0
                    ? "border-theme-red"
                    : "hover:border-ink/30 border-transparent"
                } ${ok && slot < 0 && full ? "opacity-50" : ""}`}
              >
                {ok ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="bg-paper text-ink-soft/60 flex h-full w-full items-start justify-center pt-4">
                    <Icon name="image" className="h-7 w-7" />
                  </span>
                )}
                {slot >= 0 && (
                  <span className="bg-theme-red absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white">
                    {slot + 1}
                  </span>
                )}
                {!ok && (
                  <span className="bg-ink/70 absolute inset-x-0 bottom-0 py-0.5 text-center text-[10px] font-semibold text-white">
                    Unavailable
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {full && someUnused && (
        <p className="text-ink-soft text-xs">
          Every slot is full. Take a photo out, or pick a layout with more
          slots, to use another one.
        </p>
      )}
    </div>
  );
}

function CropControls({
  state,
  dispatch,
}: {
  state: ComposerState;
  dispatch: React.Dispatch<ComposerAction>;
}) {
  const selected = state.slots[state.selectedSlot];
  const zoom = selected?.crop.zoom ?? MIN_ZOOM;
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
      <fieldset>
        <legend className="text-ink mb-1.5 text-sm font-semibold">Slot</legend>
        <div className="flex gap-1.5">
          {state.slots.map((slot, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === state.selectedSlot}
              aria-label={`Slot ${i + 1}${slot.url ? "" : " (empty)"}`}
              onClick={() => dispatch({ type: "selectSlot", index: i })}
              className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                i === state.selectedSlot
                  ? "border-theme-red bg-theme-red text-white"
                  : "border-rule text-ink hover:border-ink/40 bg-white"
              } ${slot.url ? "" : "border-dashed"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="min-w-48 flex-1 space-y-1.5">
        <label
          htmlFor="social-zoom"
          className="text-ink block text-sm font-semibold"
        >
          Zoom
        </label>
        <input
          id="social-zoom"
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={zoom}
          disabled={!selected?.url}
          onChange={(e) =>
            dispatch({ type: "zoom", factor: Number(e.target.value) / zoom })
          }
          className="accent-theme-red w-full disabled:opacity-40"
        />
      </div>
      {!selected?.url && (
        <p className="text-ink-soft w-full text-xs">
          Slot {state.selectedSlot + 1} is empty. Pick a photo for it above.
        </p>
      )}
    </div>
  );
}

const TEXT_FIELDS: {
  field: ComposerTextField;
  label: string;
  rows?: number;
}[] = [
  { field: "title", label: "Title", rows: 2 },
  { field: "summary", label: "Summary", rows: 4 },
  { field: "label", label: "Label" },
  { field: "date", label: "Date" },
];

function TextInputs({
  state,
  onChange,
}: {
  state: ComposerState;
  onChange: (field: ComposerTextField, value: string) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {TEXT_FIELDS.map(({ field, label, rows }) => {
        const id = `social-${field}`;
        return (
          <div
            key={field}
            className={`space-y-1.5 ${rows ? "sm:col-span-2" : ""}`}
          >
            <label
              htmlFor={id}
              className="text-ink block text-sm font-semibold"
            >
              {label}
            </label>
            {rows ? (
              <textarea
                id={id}
                rows={rows}
                value={state[field]}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputClass}
              />
            ) : (
              <input
                id={id}
                type="text"
                value={state[field]}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputClass}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
