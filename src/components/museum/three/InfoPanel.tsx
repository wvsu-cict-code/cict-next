"use client";

import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { StudentWork } from "@/lib/cms/content";
import { CATEGORY_ICON, CATEGORY_LABELS } from "@/lib/museum/categories";
import { useSaved } from "@/lib/museum/saved";
import { shareExhibit } from "@/lib/museum/share";
import { useMediaQuery } from "../useMediaQuery";
import { LikeButton } from "../LikeButton";

const actionButton =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-current/40 px-3 text-sm font-semibold hover:bg-current/10";

function PanelBody({
  work,
  title,
  onClose,
  onOpenDetail,
}: {
  work: StudentWork;
  title: ReactNode;
  onClose(): void;
  onOpenDetail(id: string): void;
}) {
  const saved = useSaved();
  const on = saved.isSaved(work.id);
  const [notice, setNotice] = useState<string | null>(null);
  const Icon = CATEGORY_ICON[work.category];

  async function share() {
    const result = await shareExhibit(work, window.location.origin);
    if (result === "copied") setNotice("Link copied");
    else if (result === "shared") setNotice("Shared");
    else setNotice(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        {title}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-sm font-semibold"
        >
          Close
        </button>
      </div>
      <Badge variant="secondary" className="w-fit">
        <Icon aria-hidden />
        {CATEGORY_LABELS[work.category]}
      </Badge>
      <p className="text-sm">{work.student}</p>
      {work.description ? (
        <p className="text-sm text-current/80">{work.description}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <LikeButton work={work} />
        <button
          type="button"
          className={actionButton}
          onClick={() => void share()}
        >
          Share
        </button>
        <button
          type="button"
          className={actionButton}
          aria-pressed={on}
          onClick={() => saved.toggle(work.id)}
        >
          {on ? "Saved" : "Save"}
        </button>
      </div>
      {notice ? (
        <p role="status" className="text-sm">
          {notice}
        </p>
      ) : null}
      <button
        type="button"
        className="min-h-11 self-start text-sm font-semibold"
        onClick={() => onOpenDetail(work.id)}
      >
        View Details →
      </button>
    </div>
  );
}

export function InfoPanel({
  work,
  onClose,
  onOpenDetail,
}: {
  work: StudentWork;
  onClose(): void;
  onOpenDetail(id: string): void;
}) {
  const phone = useMediaQuery("(max-width: 767px)");
  const title = <h2 className="text-xl font-medium">{work.title}</h2>;

  if (phone) {
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="bottom"
          data-museum-overlay
          className="bg-[#1c2128] text-white"
          showCloseButton={false}
        >
          <SheetDescription className="sr-only">
            Exhibit details
          </SheetDescription>
          <PanelBody
            work={work}
            title={
              <SheetTitle className="text-xl text-white">
                {work.title}
              </SheetTitle>
            }
            onClose={onClose}
            onOpenDetail={onOpenDetail}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      aria-label="Exhibit info"
      className="pointer-events-auto absolute top-20 right-4 z-20 w-80 max-w-[calc(100%-2rem)] rounded-2xl border border-white/15 bg-black/60 p-4 text-white shadow-lg backdrop-blur-md"
    >
      <PanelBody
        work={work}
        title={title}
        onClose={onClose}
        onOpenDetail={onOpenDetail}
      />
    </aside>
  );
}
