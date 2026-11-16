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
import type { Player } from "@/lib/museum/movement";
import {
  fetchExhibit,
  fetchGalleryCounts,
  fetchGalleryWorks,
} from "@/lib/museum/queries";
import { DEFAULT_SETTINGS, loadSettings } from "@/lib/museum/settings";
import type { MuseumSettings } from "@/lib/museum/settings";
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
      setPreferred(null);
      setPreferenceReady(true);
      return;
    }
    setPreferenceReady(false);
    fetchExhibit(getBrowserClient(), target)
      .then((work) => {
        if (cancel) return;
        const gallery = work ? galleryOf(work.category) : null;
        setPreferred(gallery && countsData[gallery] > 0 ? gallery : null);
        setPreferenceReady(true);
      })
      .catch(() => {
        if (cancel) return;
        setPreferred(null);
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

  const onPlayerMove = useCallback((_player: Player) => {}, []);
  const onFocusExhibit = useCallback((_id: string | null) => {}, []);

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

        {showCanvas && CanvasView ? (
          <div className="h-[70vh] min-h-[28rem] w-full">
            <CanvasView
              key={galleryId}
              gallery={galleryId as GalleryId}
              works={workList as StudentWork[]}
              layout={layout}
              target={target}
              settings={settings}
              onFocusExhibit={onFocusExhibit}
              onPlayerMove={onPlayerMove}
            />
          </div>
        ) : null}
      </section>
    </MuseumContext.Provider>
  );
}
