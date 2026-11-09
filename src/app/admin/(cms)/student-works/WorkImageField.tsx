"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/icons";
import ImageEditor from "@/components/admin/ImageEditor";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { UploadedWorkImage } from "@/lib/studentWorks/form";
import {
  checkImageFile,
  IMAGE_TYPES,
  uploadWorkImage,
  ZOOM_MAX,
} from "@/lib/studentWorks/images";

interface WorkImageFieldProps {
  name: "image";
  label: string;
  hint?: string;
  withZoom: boolean;
  defaultValue?: UploadedWorkImage | null;
}

/**
 * Opens a picked image in the image editor, then resizes and uploads it
 * straight from the browser and submits the result as JSON in a hidden
 * `image` input ("" when there is no image). The uploaded image can be
 * edited again, starting from its full-size original. While an upload
 * runs, a hidden invalid input stops the form submitting.
 */
export default function WorkImageField({
  name,
  label,
  hint,
  withZoom,
  defaultValue,
}: WorkImageFieldProps) {
  const [image, setImage] = useState<UploadedWorkImage | null>(
    defaultValue ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<File | string | null>(null);
  const inputId = `${name}_file`;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    const problem = checkImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setEditing(file);
  }

  async function upload(file: File) {
    setEditing(null);
    setError(null);
    setUploading(true);
    try {
      setImage(await uploadWorkImage(getBrowserClient(), file, { withZoom }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="@container space-y-4">
      <legend className="text-ink mb-1.5 text-sm font-semibold">{label}</legend>

      <div className="flex flex-col gap-4 @md:flex-row @md:items-start">
        <div className="border-rule bg-paper flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border @md:w-44">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.image_url}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <Icon name="image" className="text-ink-soft/40 h-8 w-8" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <label
            htmlFor={inputId}
            className="border-rule hover:border-theme-red/60 hover:bg-theme-red/[0.03] flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-white px-4 py-3 transition-colors"
          >
            <span className="bg-theme-red/10 text-theme-red flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <Icon name="upload" className="h-4 w-4" />
            </span>
            <span className="min-w-0 text-sm">
              <span className="text-ink block font-semibold">
                {uploading
                  ? "Uploading…"
                  : image
                    ? "Replace image"
                    : "Upload an image"}
              </span>
              <span className="text-ink-soft block text-xs">
                PNG, JPEG or WebP
              </span>
            </span>
            <input
              id={inputId}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              className="sr-only"
              disabled={uploading}
              onChange={onPick}
            />
          </label>

          {image && !uploading && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="border-rule text-ink hover:border-theme-red/60 inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium transition-colors"
                onClick={() => setEditing(image.original_url)}
              >
                <Icon name="crop" className="h-4 w-4" />
                Crop or adjust image
              </button>
              <button
                type="button"
                className="text-ink-soft hover:text-theme-red text-xs underline"
                onClick={() => setImage(null)}
              >
                Remove image
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-800">
              {error}
            </p>
          )}
          {hint && <p className="text-ink-soft text-xs">{hint}</p>}
        </div>
      </div>

      <input
        type="hidden"
        name={name}
        value={image ? JSON.stringify(image) : ""}
      />
      {editing && (
        <ImageEditor
          source={editing}
          maxSize={ZOOM_MAX}
          title={`Edit ${label.toLowerCase()}`}
          applyLabel={
            image && typeof editing === "string"
              ? "Save changes"
              : "Use edited image"
          }
          skipLabel={editing instanceof File ? "Use original" : undefined}
          onApply={upload}
          onSkip={() => editing instanceof File && upload(editing)}
          onCancel={() => setEditing(null)}
        />
      )}
      {uploading && (
        <input
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          required
          defaultValue=""
          ref={(el) =>
            el?.setCustomValidity("Wait for the image to finish uploading.")
          }
        />
      )}
    </fieldset>
  );
}
