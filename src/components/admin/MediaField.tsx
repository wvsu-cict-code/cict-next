"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import { inputClass } from "@/components/admin/fields";

interface MediaFieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  accept?: string;
  kind?: "image" | "file";
  hint?: string;
}

/**
 * Upload a file or paste a URL/path. Submits `${name}` (URL),
 * `${name}_file` (upload) and `${name}_remove`; see resolveMediaField().
 * A picked image is previewed before it's uploaded.
 */
export default function MediaField({
  label,
  name,
  defaultValue,
  accept = "image/*",
  kind = "image",
  hint,
}: MediaFieldProps) {
  const [picked, setPicked] = useState<File | null>(null);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  useEffect(() => {
    if (!picked || kind !== "image") return;
    const url = URL.createObjectURL(picked);
    setPickedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [picked, kind]);

  const preview = picked ? pickedUrl : remove ? null : defaultValue;
  const noun = kind === "image" ? "image" : "file";

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
                {picked ? "Uploads when you save" : "Click to choose a file"}
              </span>
            </span>
            <input
              id={`${name}_file`}
              name={`${name}_file`}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => setPicked(e.target.files?.[0] ?? null)}
            />
          </label>

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
    </fieldset>
  );
}
