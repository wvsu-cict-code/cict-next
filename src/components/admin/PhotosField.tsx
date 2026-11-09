"use client";

import { useContext, useEffect, useId, useRef, useState } from "react";
import { AdminFormBusyContext } from "@/components/admin/AdminForm";
import { Icon } from "@/components/admin/icons";
import { inputClass } from "@/components/admin/fields";
import ImageEditor from "@/components/admin/ImageEditor";
import { aspectRatio } from "@/lib/imageEdit/geometry";
import { autoEdit } from "@/lib/imageEdit/render";
import { uploadPhoto } from "@/lib/photoUpload";
import { MAX_PHOTOS, type Photo } from "@/lib/photos";
import { getBrowserClient } from "@/lib/supabase/browser";
import {
  checkImageFile,
  DISPLAY_MAX,
  IMAGE_TYPES,
} from "@/lib/studentWorks/images";
import { moveItem } from "@/lib/studentWorks/order";

interface PhotosFieldProps {
  name: string;
  folder: "posts" | "events";
  defaultValue?: Photo[];
}

const iconButton =
  "text-ink-soft hover:bg-paper hover:text-ink flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30";

const errorText = (err: unknown) =>
  err instanceof Error ? err.message : "The upload failed.";

/**
 * A gallery editor: each picked photo opens in the image editor (crop, turn,
 * adjust) before it's uploaded straight from the browser. Photos can be
 * reordered, removed, described and edited again, and the list is submitted
 * as JSON in a hidden input. While uploads run the surrounding AdminForm
 * can't be submitted.
 */
export default function PhotosField({
  name,
  folder,
  defaultValue = [],
}: PhotosFieldProps) {
  const [items, setItems] = useState(() =>
    // Ids come from the index so server and client render the same markup
    defaultValue.map((photo, id) => ({ id, photo })),
  );
  // Ids for uploaded photos; only read in the upload handler
  const nextId = useRef(defaultValue.length);
  const photos = items.map((item) => item.photo);
  const refocus = useRef<{ id: number; dir: "up" | "down" } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  // New photos waiting in the editor, one at a time
  const [batch, setBatch] = useState<{ files: File[]; index: number } | null>(
    null,
  );
  // An already-added photo being edited again
  const [reediting, setReediting] = useState<{
    id: number;
    url: string;
  } | null>(null);
  // Uploads run one after another, in the order they were queued
  const chain = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef(0);
  // New photos picked but not in the list yet, so the cap counts them
  const incoming = useRef(0);
  const { setBusy, markDirty } = useContext(AdminFormBusyContext);
  const busyKey = useId();
  const changed = useRef(false);

  // Tell the form about edits its onChange can't see
  useEffect(() => {
    if (!changed.current) {
      changed.current = true;
      return;
    }
    markDirty();
  }, [items, markDirty]);

  // After a move, put focus back on the moved photo's button
  useEffect(() => {
    const target = refocus.current;
    refocus.current = null;
    if (!target) return;
    const row = listRef.current?.querySelector(
      `[data-photo-id="${target.id}"]`,
    );
    const pick = (dir: string) =>
      row?.querySelector<HTMLButtonElement>(`[data-move="${dir}"]`);
    const other = target.dir === "up" ? "down" : "up";
    const button = pick(target.dir)?.disabled ? pick(other) : pick(target.dir);
    button?.focus();
  }, [items]);

  // Don't leave the form stuck busy if this field unmounts mid-upload
  useEffect(() => () => setBusy(busyKey, false), [setBusy, busyKey]);

  /** Queues an upload; the form stays busy until the queue is empty. */
  function enqueue(label: string, task: () => Promise<void>) {
    pending.current++;
    setBusy(busyKey, true);
    setProgress((prev) => ({
      done: prev?.done ?? 0,
      total: (prev?.total ?? 0) + 1,
    }));
    chain.current = chain.current.then(async () => {
      try {
        await task();
      } catch (err) {
        setErrors((prev) => [...prev, `${label}: ${errorText(err)}`]);
      } finally {
        pending.current--;
        if (pending.current === 0) {
          setProgress(null);
          setBusy(busyKey, false);
        } else {
          setProgress((prev) => prev && { ...prev, done: prev.done + 1 });
        }
      }
    });
  }

  /** Uploads a new photo (made by `prepare`) and adds it to the end. */
  function addPhoto(name: string, prepare: () => Promise<File>) {
    enqueue(name, async () => {
      try {
        const uploaded = await uploadPhoto(
          getBrowserClient(),
          await prepare(),
          folder,
        );
        setItems((prev) =>
          prev.length >= MAX_PHOTOS
            ? prev
            : [...prev, { id: nextId.current++, photo: uploaded }],
        );
      } finally {
        incoming.current--;
      }
    });
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const chosen = Array.from(input.files ?? []);
    input.value = "";
    if (chosen.length === 0) return;

    const room = Math.max(0, MAX_PHOTOS - items.length - incoming.current);
    const picked = chosen.slice(0, room);
    const skipped = chosen.length - picked.length;
    const failures: string[] = skipped
      ? [
          `Only ${MAX_PHOTOS} photos can be added; ${skipped} ${skipped === 1 ? "file was" : "files were"} skipped.`,
        ]
      : [];
    // Turn away unusable files now rather than in the editor
    const usable = picked.filter((file) => {
      const problem = checkImageFile(file);
      if (problem) failures.push(`${file.name}: ${problem}`);
      return !problem;
    });
    setErrors(failures);
    if (usable.length === 0) return;

    incoming.current += usable.length;
    setBatch({ files: usable, index: 0 });
  }

  /** Moves the batch on to its next photo, or closes the editor. */
  function nextInBatch() {
    setBatch((prev) =>
      prev && prev.index + 1 < prev.files.length
        ? { ...prev, index: prev.index + 1 }
        : null,
    );
  }

  /** Leaves out the batch's photos from `from` on. */
  function dropFromBatch(from: number) {
    if (!batch) return;
    const dropped = batch.files.length - from;
    incoming.current -= dropped;
    setBatch(null);
    return dropped;
  }

  const current = batch?.files[batch.index];

  const update = (index: number, patch: Partial<Photo>) =>
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, photo: { ...item.photo, ...patch } } : item,
      ),
    );

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <ol ref={listRef} className="space-y-2">
          {items.map(({ id, photo }, i) => (
            <li
              key={id}
              data-photo-id={id}
              className="border-rule flex gap-3 rounded-xl border bg-white p-2"
            >
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="bg-paper h-[4.5rem] w-[4.5rem] rounded-lg object-cover"
                />
                <span className="bg-navy/85 absolute top-1 left-1 rounded px-1.5 text-[11px] leading-5 font-semibold text-white tabular-nums">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  type="text"
                  aria-label={`Alt text for photo ${i + 1}`}
                  className={`${inputClass} !min-h-9 !py-1.5`}
                  placeholder="Describe the photo"
                  value={photo.alt}
                  onChange={(e) => update(i, { alt: e.target.value })}
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className={iconButton}
                    aria-label={`Edit photo ${i + 1}`}
                    title="Crop or adjust"
                    onClick={() => setReediting({ id, url: photo.url })}
                  >
                    <Icon name="crop" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    disabled={i === 0}
                    aria-label={`Move photo ${i + 1} up`}
                    title="Move up"
                    data-move="up"
                    onClick={() => {
                      refocus.current = { id, dir: "up" };
                      setItems((prev) => moveItem(prev, i, i - 1));
                    }}
                  >
                    <Icon name="chevron" className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    disabled={i === photos.length - 1}
                    aria-label={`Move photo ${i + 1} down`}
                    title="Move down"
                    data-move="down"
                    onClick={() => {
                      refocus.current = { id, dir: "down" };
                      setItems((prev) => moveItem(prev, i, i + 1));
                    }}
                  >
                    <Icon name="chevron" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={`${iconButton} ml-auto hover:!text-red-700`}
                    aria-label={`Remove photo ${i + 1}`}
                    title="Remove"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, index) => index !== i))
                    }
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <label className="border-rule hover:border-theme-red/60 hover:bg-theme-red/[0.03] flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-white px-4 py-3 transition-colors">
        <span className="bg-theme-red/10 text-theme-red flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Icon name="upload" className="h-4 w-4" />
        </span>
        <span className="text-ink text-sm font-semibold">Add photos</span>
        <input
          type="file"
          multiple
          accept={IMAGE_TYPES.join(",")}
          className="sr-only"
          disabled={batch !== null || photos.length >= MAX_PHOTOS}
          onChange={onPick}
        />
      </label>

      <p className="text-ink-soft text-xs" role="status">
        {progress
          ? `Uploading ${progress.done + 1} of ${progress.total}…`
          : null}
      </p>
      {errors.map((message) => (
        <p key={message} role="alert" className="text-xs text-red-800">
          {message}
        </p>
      ))}

      <input type="hidden" name={name} value={JSON.stringify(photos)} />

      {batch && current && (
        <ImageEditor
          key={`new-${batch.index}-${current.name}`}
          source={current}
          maxSize={DISPLAY_MAX}
          title="Add photo"
          step={{ index: batch.index + 1, total: batch.files.length }}
          applyLabel={
            batch.index + 1 < batch.files.length ? "Add & next" : "Add photo"
          }
          skipLabel="Skip photo"
          onApply={(file) => {
            addPhoto(current.name, async () => file);
            nextInBatch();
          }}
          onSkip={() => {
            incoming.current--;
            nextInBatch();
          }}
          onApplyRest={(aspect) => {
            const rest = batch.files.slice(batch.index);
            setBatch(null);
            for (const file of rest) {
              addPhoto(file.name, () =>
                autoEdit(file, aspectRatio(aspect), DISPLAY_MAX),
              );
            }
          }}
          onCancel={() => {
            const dropped = dropFromBatch(batch.index);
            if (dropped) {
              setErrors((prev) => [
                ...prev,
                `Stopped editing; ${dropped} ${dropped === 1 ? "photo wasn't" : "photos weren't"} added.`,
              ]);
            }
          }}
        />
      )}

      {reediting && (
        <ImageEditor
          key={`edit-${reediting.id}`}
          source={reediting.url}
          maxSize={DISPLAY_MAX}
          applyLabel="Save changes"
          onApply={(file) => {
            const { id } = reediting;
            setReediting(null);
            enqueue("Edited photo", async () => {
              const uploaded = await uploadPhoto(
                getBrowserClient(),
                file,
                folder,
              );
              setItems((prev) =>
                prev.map((item) =>
                  item.id === id
                    ? { ...item, photo: { ...uploaded, alt: item.photo.alt } }
                    : item,
                ),
              );
            });
          }}
          onCancel={() => setReediting(null)}
        />
      )}
    </div>
  );
}
