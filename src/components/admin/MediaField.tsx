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
 */
export default function MediaField({
  label,
  name,
  defaultValue,
  accept = "image/*",
  kind = "image",
  hint,
}: MediaFieldProps) {
  return (
    <fieldset className="space-y-3 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-semibold text-neutral-800">
        {label}
      </legend>

      {defaultValue &&
        (kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaultValue}
            alt=""
            className="h-32 w-auto rounded border border-neutral-200 bg-neutral-50 object-contain"
          />
        ) : (
          <a
            href={defaultValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-dark text-sm break-all underline"
          >
            {defaultValue}
          </a>
        ))}

      <div className="space-y-1.5">
        <label
          htmlFor={`${name}_file`}
          className="block text-xs font-medium text-neutral-600"
        >
          Upload new {kind === "image" ? "image" : "file"}
        </label>
        <input
          id={`${name}_file`}
          name={`${name}_file`}
          type="file"
          accept={accept}
          className="file:bg-orange-dark block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={name}
          className="block text-xs font-medium text-neutral-600"
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
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {defaultValue && (
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            name={`${name}_remove`}
            className="accent-orange-dark"
          />
          Remove current {kind === "image" ? "image" : "file"}
        </label>
      )}

      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </fieldset>
  );
}
