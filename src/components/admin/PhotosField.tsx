"use client";

import { useContext, useEffect, useId, useRef, useState } from "react";
import { AdminFormBusyContext } from "@/components/admin/AdminForm";
import { Icon } from "@/components/admin/icons";
import { inputClass } from "@/components/admin/fields";
import { uploadPhoto } from "@/lib/photoUpload";
import { MAX_PHOTOS, type Photo } from "@/lib/photos";
import { getBrowserClient } from "@/lib/supabase/browser";
import { IMAGE_TYPES } from "@/lib/studentWorks/images";
import { moveItem } from "@/lib/studentWorks/order";

interface PhotosFieldProps {
  name: string;
  folder: "posts" | "events";
  defaultValue?: Photo[];
}

const smallButton =
  "border-rule text-ink-soft hover:text-theme-red rounded-md border bg-white px-2 py-1 text-xs disabled:opacity-40";

/**
 * A gallery editor: uploads photos straight from the browser, lets the editor
 * reorder, remove and describe them, and submits the list as JSON in a hidden
 * input. While uploads run the surrounding AdminForm can't be submitted.
 */
export default function PhotosField({
  name,
  folder,
  defaultValue = [],
}: PhotosFieldProps) {
  const [photos, setPhotos] = useState<Photo[]>(defaultValue);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
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
  }, [photos, markDirty]);

  // Don't leave the form stuck busy if this field unmounts mid-upload
  useEffect(() => () => setBusy(busyKey, false), [setBusy, busyKey]);

  const uploading = progress !== null;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    if (picked.length === 0) return;

    setErrors([]);
    setBusy(busyKey, true);
    const failures: string[] = [];
    try {
      for (let i = 0; i < picked.length; i++) {
        setProgress({ current: i + 1, total: picked.length });
        try {
          const uploaded = await uploadPhoto(
            getBrowserClient(),
            picked[i],
            folder,
          );
          setPhotos((prev) =>
            prev.length >= MAX_PHOTOS ? prev : [...prev, uploaded],
          );
        } catch (err) {
          failures.push(
            `${picked[i].name}: ${err instanceof Error ? err.message : "The upload failed."}`,
          );
        }
      }
    } finally {
      setProgress(null);
      setBusy(busyKey, false);
      setErrors(failures);
    }
  }

  const update = (index: number, patch: Partial<Photo>) =>
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, i) => (
            <li
              key={`${photo.url}-${i}`}
              className="border-rule space-y-2 rounded-xl border bg-white p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="bg-paper aspect-[4/3] w-full rounded-lg object-cover"
              />
              <input
                type="text"
                aria-label={`Alt text for photo ${i + 1}`}
                className={inputClass}
                placeholder="Describe the photo"
                value={photo.alt}
                onChange={(e) => update(i, { alt: e.target.value })}
              />
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className={smallButton}
                  disabled={i === 0}
                  aria-label={`Move left (photo ${i + 1})`}
                  onClick={() => setPhotos(moveItem(photos, i, i - 1))}
                >
                  Move left
                </button>
                <button
                  type="button"
                  className={smallButton}
                  disabled={i === photos.length - 1}
                  aria-label={`Move right (photo ${i + 1})`}
                  onClick={() => setPhotos(moveItem(photos, i, i + 1))}
                >
                  Move right
                </button>
                <button
                  type="button"
                  className={smallButton}
                  aria-label={`Remove (photo ${i + 1})`}
                  onClick={() =>
                    setPhotos(photos.filter((_, index) => index !== i))
                  }
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
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
          disabled={uploading || photos.length >= MAX_PHOTOS}
          onChange={onPick}
        />
      </label>

      <p className="text-ink-soft text-xs" role="status">
        {progress
          ? `Uploading ${progress.current} of ${progress.total}…`
          : null}
      </p>
      {errors.map((message) => (
        <p key={message} role="alert" className="text-xs text-red-800">
          {message}
        </p>
      ))}

      <input type="hidden" name={name} value={JSON.stringify(photos)} />
    </div>
  );
}
