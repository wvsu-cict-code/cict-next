"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { StudentWork } from "@/lib/cms/content";
import { tileImage } from "@/lib/studentWorks/layout";
import { moveItem } from "@/lib/studentWorks/order";

type Result = Promise<{ error?: string }>;

const KIND_LABELS: Record<StudentWork["kind"], string> = {
  art: "Digital art",
  video: "Video",
  game: "Game",
};

const buttonClass =
  "text-ink-soft hover:bg-paper hover:text-ink flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-30";

export default function WorkList({
  works: initial,
  onReorder,
  onToggleVisible,
}: {
  works: StudentWork[];
  onReorder(ids: string[]): Result;
  onToggleVisible(id: string, visible: boolean): Result;
}) {
  const [works, setWorks] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const dragFrom = useRef<number | null>(null);

  async function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= works.length) return;
    const previous = works;
    const next = moveItem(works, from, to);
    setWorks(next);
    setError(null);
    const result = await onReorder(next.map((w) => w.id));
    if (result.error) {
      setWorks(previous);
      setError(result.error);
    }
  }

  async function toggle(work: StudentWork) {
    const visible = !work.visible;
    setError(null);
    setWorks((list) =>
      list.map((w) => (w.id === work.id ? { ...w, visible } : w)),
    );
    const result = await onToggleVisible(work.id, visible);
    if (result.error) {
      setWorks((list) =>
        list.map((w) => (w.id === work.id ? { ...w, visible: work.visible } : w)),
      );
      setError(result.error);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <ul className="space-y-2">
        {works.map((work, index) => {
          const image = tileImage(work);
          return (
            <li
              key={work.id}
              draggable
              onDragStart={() => {
                dragFrom.current = index;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragFrom.current;
                dragFrom.current = null;
                if (from !== null) void reorder(from, index);
              }}
              className="border-line flex items-center gap-3 rounded-xl border bg-white p-2 pr-3"
            >
              <span
                aria-hidden="true"
                className="text-ink-soft/50 cursor-grab px-1 select-none"
                title="Drag to reorder"
              >
                ⋮⋮
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt=""
                onError={(e) => {
                  if (image.fallbackSrc && e.currentTarget.src !== image.fallbackSrc) {
                    e.currentTarget.src = image.fallbackSrc;
                  }
                }}
                className="bg-paper h-14 w-20 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/student-works/${work.id}`}
                  data-title
                  className="text-ink hover:text-theme-red block truncate font-semibold"
                >
                  {work.title}
                </Link>
                <p className="text-ink-soft truncate text-sm">{work.student}</p>
                <p className="text-ink-soft/80 mt-0.5 flex items-center gap-2 text-xs">
                  <span>{KIND_LABELS[work.kind]}</span>
                  {!work.visible && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
                      Hidden
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  className={buttonClass}
                  aria-label={`${work.visible ? "Hide" : "Show"} ${work.title}`}
                  onClick={() => void toggle(work)}
                >
                  <Icon name={work.visible ? "eye" : "eye-off"} className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  aria-label={`Move ${work.title} up`}
                  disabled={index === 0}
                  onClick={() => void reorder(index, index - 1)}
                >
                  <Icon name="chevron" className="h-[18px] w-[18px] rotate-180" />
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  aria-label={`Move ${work.title} down`}
                  disabled={index === works.length - 1}
                  onClick={() => void reorder(index, index + 1)}
                >
                  <Icon name="chevron" className="h-[18px] w-[18px]" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
