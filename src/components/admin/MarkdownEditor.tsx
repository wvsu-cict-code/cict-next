"use client";

import { useRef, useState, useTransition } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface MarkdownEditorProps {
  name: string;
  label: string;
  defaultValue?: string;
  uploadImage?: (
    formData: FormData,
  ) => Promise<{ url?: string; error?: string }>;
}

export default function MarkdownEditor({
  name,
  label,
  defaultValue = "",
  uploadImage,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploadError, setUploadError] = useState<string>();
  const [isUploading, startUpload] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Uploads the picked image and inserts Markdown for it at the cursor
  const handleImage = (file: File) => {
    if (!uploadImage) return;
    setUploadError(undefined);
    startUpload(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      if (!result.url) {
        setUploadError(result.error ?? "Upload failed.");
        return;
      }
      const snippet = `\n![${file.name.replace(/\.[^.]+$/, "")}](${result.url})\n`;
      const position = textareaRef.current?.selectionStart ?? value.length;
      setValue(
        (current) =>
          current.slice(0, position) + snippet + current.slice(position),
      );
      setTab("write");
    });
  };

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-semibold rounded-t-md border border-b-0 ${
      active
        ? "bg-white text-neutral-900"
        : "bg-neutral-100 text-neutral-500 hover:text-neutral-800"
    }`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between">
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-neutral-800"
        >
          {label}
        </label>
        <div className="flex items-end gap-1">
          {uploadImage && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImage(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileRef.current?.click()}
                className="text-orange-dark mr-2 mb-1 text-xs font-semibold hover:underline disabled:opacity-50"
              >
                {isUploading ? "Uploading…" : "+ Insert image"}
              </button>
            </>
          )}
          <button
            type="button"
            className={tabClass(tab === "write")}
            onClick={() => setTab("write")}
          >
            Write
          </button>
          <button
            type="button"
            className={tabClass(tab === "preview")}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

      {/* The textarea stays mounted so its value is always submitted */}
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        rows={18}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`focus:border-orange-dark w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm focus:outline-none ${
          tab === "write" ? "block" : "hidden"
        }`}
      />
      {tab === "preview" && (
        <div className="min-h-64 rounded-md border border-neutral-300 bg-white px-6 py-4">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-neutral-400 italic">
              Nothing to preview yet.
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Supports Markdown: <code>## Heading</code>, <code>**bold**</code>,{" "}
        <code>- list</code>, <code>[link](https://…)</code>,{" "}
        <code>![alt](image-url)</code>.
      </p>
    </div>
  );
}
