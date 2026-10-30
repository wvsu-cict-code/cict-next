"use client";

import { useRef, useState, useTransition } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Icon } from "@/components/admin/icons";

type Tool = { label: string; text: string } & (
  | { prefix: string }
  | { before: string; after: string; placeholder: string }
);

const TOOLS: Tool[] = [
  { label: "Heading", text: "H", prefix: "## " },
  {
    label: "Bold",
    text: "B",
    before: "**",
    after: "**",
    placeholder: "bold text",
  },
  {
    label: "Italic",
    text: "I",
    before: "_",
    after: "_",
    placeholder: "italic text",
  },
  { label: "Bulleted list", text: "•", prefix: "- " },
  {
    label: "Link",
    text: "Link",
    before: "[",
    after: "](https://)",
    placeholder: "link text",
  },
];

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

  // Wraps the selection (or a placeholder) in Markdown, e.g. **bold**
  const wrapSelection = (
    before: string,
    after: string,
    placeholder: string,
  ) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || placeholder;
    setValue(
      value.slice(0, start) + before + selected + after + value.slice(end),
    );
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };

  // Adds a prefix such as "## " or "- " to the start of the current line
  const prefixLine = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    setValue(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const applyTool = (tool: Tool) => {
    if ("prefix" in tool) prefixLine(tool.prefix);
    else wrapSelection(tool.before, tool.after, tool.placeholder);
  };

  const tabClass = (active: boolean) =>
    `min-h-8 rounded-md px-3 text-xs font-semibold transition-colors ${
      active ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-ink block text-sm font-semibold">
        {label}
      </label>

      <div className="border-rule focus-within:border-theme-red focus-within:ring-theme-red/15 overflow-hidden rounded-xl border bg-white transition-colors focus-within:ring-3">
        <div className="border-rule bg-paper/60 flex flex-wrap items-center justify-between gap-2 border-b px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            {tab === "write" &&
              TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  title={tool.label}
                  aria-label={tool.label}
                  onClick={() => applyTool(tool)}
                  className={`text-ink-soft hover:text-ink min-h-8 min-w-8 rounded-md px-2 text-sm transition-colors hover:bg-white ${
                    tool.text === "B"
                      ? "font-bold"
                      : tool.text === "I"
                        ? "italic"
                        : "font-semibold"
                  }`}
                >
                  {tool.text}
                </button>
              ))}
            {uploadImage && tab === "write" && (
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
                  className="text-ink-soft hover:text-ink inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors hover:bg-white disabled:opacity-50"
                >
                  <Icon name="image" className="h-4 w-4" />
                  {isUploading ? "Uploading…" : "Image"}
                </button>
              </>
            )}
          </div>
          <div
            role="tablist"
            aria-label="Editor mode"
            className="bg-rule/50 flex rounded-lg p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "write"}
              className={tabClass(tab === "write")}
              onClick={() => setTab("write")}
            >
              Write
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={tabClass(tab === "preview")}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </div>
        </div>

        {/* The textarea stays mounted so its value is always submitted */}
        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          rows={18}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`text-ink w-full resize-y px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none ${
            tab === "write" ? "block" : "hidden"
          }`}
        />
        {tab === "preview" && (
          <div className="min-h-[27rem] px-6 py-5">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-ink-soft text-sm italic">
                Nothing to preview yet.
              </p>
            )}
          </div>
        )}
      </div>

      {uploadError && (
        <p role="alert" className="text-xs text-red-700">
          {uploadError}
        </p>
      )}

      <p className="text-ink-soft text-xs">
        Supports Markdown: <code>## Heading</code>, <code>**bold**</code>,{" "}
        <code>- list</code>, <code>[link](https://…)</code>,{" "}
        <code>![alt](image-url)</code>.
      </p>
    </div>
  );
}
