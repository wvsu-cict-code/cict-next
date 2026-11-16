"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ContentError } from "@/components/ContentState";
import { container, outlineButtonOnDark } from "@/components/PageHeader";
import type { StudentWork } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { galleryOf, type GalleryId } from "@/lib/museum/categories";
import { availableGalleries } from "@/lib/museum/galleries";
import { layoutHall } from "@/lib/museum/hall";
import {
  exhibitInView,
  orderedSlots,
  type Player,
} from "@/lib/museum/movement";
import {
  fetchExhibit,
  fetchGalleryCounts,
  fetchGalleryWorks,
} from "@/lib/museum/queries";
import { DEFAULT_SETTINGS, loadSettings } from "@/lib/museum/settings";
import type { MuseumSettings } from "@/lib/museum/settings";
import { useMuseumKeys, type MoveInput } from "./useMuseumKeys";
import { Overlay } from "./three/Overlay";
import { hasWebGL } from "@/lib/museum/webgl";
import { workAspect } from "@/lib/studentWorks/layout";
import { getBrowserClient } from "@/lib/supabase/browser";
import { loadMuseumCanvas, type MuseumCanvasProps } from "./loadMuseumCanvas";

type Phase = "poster" | "loading" | "ready" | "no-webgl";

export type MuseumContextValue = {
  visitExhibit(id: string): void;
  webgl: boolean;
};

export const MuseumContext = createContext<MuseumContextValue | null>(null);

function reducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function browseExhibits(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("browse")?.scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
  });
}

export function MuseumSection({
  initialExhibitId,
  onOpenDetail,
  children,
}: {
  initialExhibitId?: string;
  onOpenDetail?: (id: string) => void;
  children?: ReactNode;
}) {
  // Poster until the browser is known, so the server HTML matches hydration.
  const [webgl, setWebgl] = useState(false);
  const [phase, setPhase] = useState<Phase>("poster");
  const [target, setTarget] = useState<string | null>(initialExhibitId ?? null);
  const [settings, setSettings] = useState<MuseumSettings>(DEFAULT_SETTINGS);
  const [CanvasView, setCanvasView] =
    useState<ComponentType<MuseumCanvasProps> | null>(null);
  const [chunkError, setChunkError] = useState(false);
  const [chunkAttempt, setChunkAttempt] = useState(0);
  const [preferred, setPreferred] = useState<GalleryId | null>(null);
  const [preferenceReady, setPreferenceReady] = useState(false);
  const onOpenDetailRef = useRef(onOpenDetail);
  const handedOff = useRef<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player>({
    x: 0,
    z: -1.5,
    yaw: 0,
    pitch: 0,
  });
  const [move, setMove] = useState<MoveInput>({ forward: 0, strafe: 0 });
  const [homeTick, setHomeTick] = useState(0);
  const [targetToken, setTargetToken] = useState(0);
  const focusIdRef = useRef(focusId);

  const entered = phase === "loading" || phase === "ready";

  useEffect(() => {
    onOpenDetailRef.current = onOpenDetail;
  }, [onOpenDetail]);

  useLayoutEffect(() => {
    const ok = hasWebGL();
    setWebgl(ok);
    if (!ok) setPhase("no-webgl");
  }, []);

  const enter = useCallback(() => {
    if (!webgl) return;
    setPhase((current) => (current === "poster" ? "loading" : current));
  }, [webgl]);

  const visitExhibit = useCallback(
    (id: string) => {
      if (!webgl) {
        onOpenDetailRef.current?.(id);
        return;
      }
      setTarget(id);
      setPhase((current) => (current === "poster" ? "loading" : current));
    },
    [webgl],
  );

  useEffect(() => {
    if (initialExhibitId) setTarget(initialExhibitId);
  }, [initialExhibitId]);

  useEffect(() => {
    window.addEventListener("museum:enter", enter);
    return () => window.removeEventListener("museum:enter", enter);
  }, [enter]);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (!entered || CanvasView) return;
    let cancel = false;
    loadMuseumCanvas()
      .then((mod) => {
        if (cancel) return;
        setCanvasView(() => mod.default);
        setChunkError(false);
        setPhase("ready");
      })
      .catch(() => {
        if (!cancel) setChunkError(true);
      });
    return () => {
      cancel = true;
    };
  }, [entered, CanvasView, chunkAttempt]);

  const counts = useContent(
    entered ? "museum-gallery-counts" : null,
    (client) => fetchGalleryCounts(client),
  );
  const countsData = counts.status === "ready" ? counts.data : null;

  useEffect(() => {
    if (!entered || !countsData) return;
    let cancel = false;
    if (!target) {
      setPreferenceReady(true);
      return;
    }
    // Keep the hall that is already up. Swap only after this lookup
    // resolves to a different gallery. key={galleryId} remounts then.
    fetchExhibit(getBrowserClient(), target)
      .then((work) => {
        if (cancel) return;
        const gallery = work ? galleryOf(work.category) : null;
        const next = gallery && countsData[gallery] > 0 ? gallery : null;
        if (next) {
          setPreferred((current) => (current === next ? current : next));
        }
        setPreferenceReady(true);
      })
      .catch(() => {
        if (cancel) return;
        setPreferenceReady(true);
      });
    return () => {
      cancel = true;
    };
  }, [entered, countsData, target]);

  const galleryId: GalleryId | null =
    !entered || !countsData || !preferenceReady
      ? null
      : preferred && countsData[preferred] > 0
        ? preferred
        : (availableGalleries(countsData)[0] ?? "a");

  const worksResult = useContent(
    galleryId ? `museum-gallery-works:${galleryId}` : null,
    (client) => fetchGalleryWorks(client, galleryId as GalleryId),
  );
  const workList = worksResult.status === "ready" ? worksResult.data : null;

  useEffect(() => {
    if (!webgl || !target || !preferenceReady || !workList) return;
    if (workList.some((work) => work.id === target)) return;
    if (handedOff.current === target) return;
    const open = onOpenDetailRef.current;
    if (!open) return;
    handedOff.current = target;
    open(target);
  }, [webgl, target, preferenceReady, workList]);

  const layout = useMemo(
    () =>
      layoutHall(
        (workList ?? []).map((work: StudentWork) => ({
          id: work.id,
          aspect: workAspect(work),
        })),
      ),
    [workList],
  );
  const layoutRef = useRef(layout);
  useLayoutEffect(() => {
    layoutRef.current = layout;
    focusIdRef.current = focusId;
  }, [layout, focusId]);

  const onPlayerMove = useCallback((next: Player) => {
    setPlayer((current) =>
      current.x === next.x &&
      current.z === next.z &&
      current.yaw === next.yaw &&
      current.pitch === next.pitch
        ? current
        : next,
    );
  }, []);
  const onFocusExhibit = useCallback((id: string | null) => {
    setFocusId(id);
  }, []);
  const onSettings = useCallback((next: MuseumSettings) => {
    setSettings(next);
  }, []);
  const onGallery = useCallback((id: GalleryId) => {
    setPreferred(id);
    setTarget(null);
    setFocusId(null);
    setHomeTick((tick) => tick + 1);
  }, []);
  const onExit = useCallback(() => {
    setTarget(null);
    setTargetToken((token) => token + 1);
    setHomeTick((tick) => tick + 1);
    setFocusId(null);
  }, []);
  const onFullscreen = useCallback(() => {
    const section = sectionRef.current;
    if (!section || typeof section.requestFullscreen !== "function") return;
    if (document.fullscreenElement === section) {
      void document.exitFullscreen?.();
      return;
    }
    void section.requestFullscreen();
  }, []);
  const onStep = useCallback((direction: -1 | 1) => {
    const slots = orderedSlots(layoutRef.current);
    if (slots.length === 0) return;
    const index = slots.findIndex((slot) => slot.workId === focusIdRef.current);
    const next =
      index === -1
        ? slots[direction === 1 ? 0 : slots.length - 1]
        : slots[(index + direction + slots.length) % slots.length];
    setTarget(next.workId);
    setTargetToken((token) => token + 1);
    setFocusId(next.workId);
  }, []);

  const museum = useMemo(
    () => ({ visitExhibit, webgl }),
    [visitExhibit, webgl],
  );

  const showCanvas =
    phase === "ready" &&
    CanvasView !== null &&
    galleryId !== null &&
    workList !== null &&
    counts.status !== "error" &&
    worksResult.status !== "error";

  return (
    <MuseumContext.Provider value={museum}>
      {children}
      <section
        ref={sectionRef}
        id="museum-3d"
        data-theme="dark"
        className="bg-navy relative scroll-mt-24 text-white"
      >
        {phase === "no-webgl" ? (
          <div
            className={`${container} flex min-h-[24rem] flex-col items-start justify-center gap-4 py-16`}
          >
            <h2 className="text-3xl font-medium md:text-4xl">
              3D museum unavailable
            </h2>
            <p className="max-w-[46ch] text-base text-white/80">
              This browser can&apos;t display the 3D museum. Every exhibit is
              still in the list below.
            </p>
            <a
              href="#browse"
              onClick={browseExhibits}
              className={outlineButtonOnDark}
            >
              Browse Exhibits
            </a>
          </div>
        ) : null}

        {phase === "poster" ? (
          <button
            type="button"
            onClick={enter}
            className="flex min-h-[32rem] w-full flex-col items-start justify-center px-4 py-16 text-left md:px-8"
          >
            <span className="mx-auto flex w-full max-w-[1400px] flex-col items-start">
              <span className="text-orange-light text-xs font-semibold tracking-[0.18em] uppercase">
                BSEMC
              </span>
              <span className="mt-3 block text-4xl font-medium md:text-5xl">
                Walk the gallery
              </span>
              <span className="mt-4 text-base text-white/80">
                Click to enter
              </span>
            </span>
          </button>
        ) : null}

        {entered && chunkError ? (
          <div className={`${container} flex min-h-[32rem] items-center py-16`}>
            <ContentError
              onRetry={() => {
                setChunkError(false);
                setCanvasView(null);
                setChunkAttempt((attempt) => attempt + 1);
              }}
            />
          </div>
        ) : null}

        {entered && !chunkError && counts.status === "error" ? (
          <div className={`${container} flex min-h-[32rem] items-center py-16`}>
            <ContentError onRetry={counts.retry} />
          </div>
        ) : null}

        {entered &&
        !chunkError &&
        counts.status !== "error" &&
        worksResult.status === "error" ? (
          <div className={`${container} flex min-h-[32rem] items-center py-16`}>
            <ContentError onRetry={worksResult.retry} />
          </div>
        ) : null}

        {entered &&
        !chunkError &&
        !showCanvas &&
        counts.status !== "error" &&
        worksResult.status !== "error" ? (
          <p
            role="status"
            className={`${container} flex min-h-[32rem] items-center py-16 text-white/80`}
          >
            Loading the gallery…
          </p>
        ) : null}

        {showCanvas && CanvasView && galleryId && workList && countsData ? (
          <MuseumStage
            CanvasView={CanvasView}
            galleryId={galleryId}
            works={workList}
            layout={layout}
            target={target}
            targetToken={targetToken}
            homeTick={homeTick}
            settings={settings}
            move={move}
            player={player}
            focusId={focusId}
            counts={countsData}
            onMove={setMove}
            onPlayerMove={onPlayerMove}
            onFocusExhibit={onFocusExhibit}
            onExit={onExit}
            onFullscreen={onFullscreen}
            onSettings={onSettings}
            onGallery={onGallery}
            onPrev={() => onStep(-1)}
            onNext={() => onStep(1)}
            onCloseInfo={() => setFocusId(null)}
            onOpenDetail={(id) => onOpenDetailRef.current?.(id)}
          />
        ) : null}
      </section>
    </MuseumContext.Provider>
  );
}

function mapStartsOpen(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const phone = window.matchMedia("(max-width: 767px)").matches;
  return !coarse && !phone;
}

function MuseumStage({
  CanvasView,
  galleryId,
  works,
  layout,
  target,
  targetToken,
  homeTick,
  settings,
  move,
  player,
  focusId,
  counts,
  onMove,
  onPlayerMove,
  onFocusExhibit,
  onExit,
  onFullscreen,
  onSettings,
  onGallery,
  onPrev,
  onNext,
  onCloseInfo,
  onOpenDetail,
}: {
  CanvasView: ComponentType<MuseumCanvasProps>;
  galleryId: GalleryId;
  works: StudentWork[];
  layout: MuseumCanvasProps["layout"];
  target: string | null;
  targetToken: number;
  homeTick: number;
  settings: MuseumSettings;
  move: MoveInput;
  player: Player;
  focusId: string | null;
  counts: Record<GalleryId, number>;
  onMove(input: MoveInput): void;
  onPlayerMove(player: Player): void;
  onFocusExhibit(id: string | null): void;
  onExit(): void;
  onFullscreen(): void;
  onSettings(next: MuseumSettings): void;
  onGallery(id: GalleryId): void;
  onPrev(): void;
  onNext(): void;
  onCloseInfo(): void;
  onOpenDetail(id: string): void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef(layout);
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    layoutRef.current = layout;
    playerRef.current = player;
  }, [layout, player]);
  const [mapOpen, setMapOpen] = useState(mapStartsOpen);

  useMuseumKeys(stageRef, {
    move: onMove,
    interact: () => {
      const id = exhibitInView(playerRef.current, layoutRef.current);
      if (id) onFocusExhibit(id);
    },
    toggleMap: () => setMapOpen((open) => !open),
  });

  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      data-testid="museum-stage"
      aria-label="Museum gallery"
      className="relative h-[70vh] min-h-[28rem] w-full outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      onPointerDown={(event) => {
        const hit = event.target;
        if (!(hit instanceof Element)) return;
        if (hit.closest("[data-museum-overlay]")) return;
        stageRef.current?.focus();
      }}
    >
      <CanvasView
        key={galleryId}
        gallery={galleryId}
        works={works}
        layout={layout}
        target={target}
        targetToken={targetToken}
        homeTick={homeTick}
        settings={settings}
        move={move}
        onFocusExhibit={onFocusExhibit}
        onPlayerMove={onPlayerMove}
      />
      <Overlay
        layout={layout}
        player={player}
        works={works}
        focusId={focusId}
        mapOpen={mapOpen}
        settings={settings}
        galleryId={galleryId}
        counts={counts}
        onExit={onExit}
        onFullscreen={onFullscreen}
        onSettings={onSettings}
        onGallery={onGallery}
        onPrev={onPrev}
        onNext={onNext}
        onCloseInfo={onCloseInfo}
        onOpenDetail={onOpenDetail}
      />
    </div>
  );
}
