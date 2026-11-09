"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { AdminFormBusyContext } from "@/components/admin/AdminForm";
import { Icon } from "@/components/admin/icons";
import { inputClass } from "@/components/admin/fields";
import ImageEditor from "@/components/admin/ImageEditor";
import type { AspectId } from "@/lib/imageEdit/geometry";
import { checkImageFile } from "@/lib/studentWorks/images";

interface MediaFieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  accept?: string;
  kind?: "image" | "file";
  hint?: string;
  /** Crop shape the image editor starts with. */
  aspect?: AspectId;
}

/** Longest edge of an edited image; keeps uploads well under the action limit. */
const EDITED_MAX = 2400;

/** Photos (not vector or animated images) can be opened in the editor. */
const isEditableUrl = (url: string) => /\.(jpe?g|png|webp)(\?.*)?$/i.test(url);

/** Puts a file into a file input, the way picking it would. */
function setInputFile(input: HTMLInputElement, file: File | null) {
  const transfer = new DataTransfer();
  if (file) transfer.items.add(file);
  input.files = transfer.files;
}

/**
 * Upload a file or paste a URL/path. Submits `${name}` (URL),
 * `${name}_file` (upload) and `${name}_remove`; see resolveMediaField().
 * A picked photo opens in the image editor (crop, turn, adjust) and is
 * previewed before it's uploaded; the current image can be edited too.
 */
export default function MediaField({
  label,
  name,
  defaultValue,
  accept = "image/*",
  kind = "image",
  hint,
  aspect = "free",
}: MediaFieldProps) {
  const [picked, setPicked] = useState<File | null>(null);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  // What's open in the editor; `fresh` is a new pick not accepted yet
  const [editing, setEditing] = useState<{
    source: File | string;
    fresh: boolean;
  } | null>(null);
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // The file as picked, so editing again starts from the full photo
  const [original, setOriginal] = useState<File | null>(null);
  const { markDirty } = useContext(AdminFormBusyContext);

  useEffect(() => {
    if (!picked || kind !== "image") return;
    const url = URL.createObjectURL(picked);
    setPickedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [picked, kind]);

  const preview = picked ? pickedUrl : remove ? null : defaultValue;
  const noun = kind === "image" ? "image" : "file";
  const editSource =
    kind !== "image"
      ? null
      : original && picked
        ? original
        : !picked && !remove && defaultValue && isEditableUrl(defaultValue)
          ? defaultValue
          : null;

  /** Use `file` as the upload, as if it had been picked. */
  function choose(file: File | null, wasEdited: boolean) {
    const input = inputRef.current;
    if (!input) return;
    try {
      setInputFile(input, file);
    } catch {
      setError("Your browser couldn't attach the edited image.");
      return;
    }
    setPicked(file);
    setEdited(wasEdited && file !== null);
    if (file) setRemove(false);
    markDirty();
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    if (file && kind === "image" && !checkImageFile(file)) {
      // Hold the upload until the editor is done with it
      setEditing({ source: file, fresh: true });
      return;
    }
    setOriginal(null);
    setPicked(file);
    setEdited(false);
  }

  return (
    <fieldset className="@container space-y-4">
      <legend className="text-ink mb-1.5 text-sm font-semibold">{label}</legend>

      <div className="flex flex-col gap-4 @md:flex-row @md:items-start">
        {kind === "image" ? (
          <div className="border-rule bg-paper flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border @md:w-44">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <Icon name="image" className="text-ink-soft/40 h-8 w-8" />
            )}
          </div>
        ) : defaultValue && !remove ? (
          <a
            href={defaultValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-red text-sm break-all underline"
          >
            {defaultValue}
          </a>
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          <label
            htmlFor={`${name}_file`}
            className="border-rule hover:border-theme-red/60 hover:bg-theme-red/[0.03] flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-white px-4 py-3 transition-colors"
          >
            <span className="bg-theme-red/10 text-theme-red flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <Icon name="upload" className="h-4 w-4" />
            </span>
            <span className="min-w-0 text-sm">
              <span className="text-ink block font-semibold">
                {picked ? picked.name : `Upload a new ${noun}`}
              </span>
              <span className="text-ink-soft block text-xs">
                {picked
                  ? edited
                    ? "Edited · uploads when you save"
                    : "Uploads when you save"
                  : "Click to choose a file"}
              </span>
            </span>
            <input
              ref={inputRef}
              id={`${name}_file`}
              name={`${name}_file`}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={onPick}
            />
          </label>

          {editSource && (
            <button
              type="button"
              className="border-rule text-ink hover:border-theme-red/60 inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium transition-colors"
              onClick={() => setEditing({ source: editSource, fresh: false })}
            >
              <Icon name="crop" className="h-4 w-4" />
              {picked ? "Edit again" : `Crop or adjust ${noun}`}
            </button>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-800">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor={name}
              className="text-ink-soft block text-xs font-medium"
            >
              …or use a URL / site path
            </label>
            <input
              id={name}
              name={name}
              type="text"
              defaultValue={defaultValue ?? ""}
              placeholder={
                kind === "image" ? "/program_assets/bsit.svg" : "https://…"
              }
              className={inputClass}
            />
          </div>

          {defaultValue && (
            <label className="text-ink-soft flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name={`${name}_remove`}
                checked={remove}
                onChange={(e) => setRemove(e.target.checked)}
                className="accent-theme-red h-4 w-4"
              />
              Remove current {noun}
            </label>
          )}

          {hint && <p className="text-ink-soft text-xs">{hint}</p>}
        </div>
      </div>

      {editing && (
        <ImageEditor
          source={editing.source}
          initialAspect={aspect}
          maxSize={EDITED_MAX}
          title={`Edit ${label.toLowerCase()}`}
          applyLabel="Use edited image"
          skipLabel={
            editing.source instanceof File ? "Use original" : undefined
          }
          onApply={(file) => {
            if (editing.source instanceof File) setOriginal(editing.source);
            setEditing(null);
            choose(file, true);
          }}
          onSkip={() => {
            // Only files get a skip button
            const file = editing.source as File;
            setOriginal(file);
            setEditing(null);
            choose(file, false);
          }}
          onCancel={() => {
            setEditing(null);
            // Closing on a new pick puts back what was there before
            if (editing.fresh) choose(picked, edited);
          }}
        />
      )}
    </fieldset>
  );
}
