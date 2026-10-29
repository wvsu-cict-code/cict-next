const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-dark focus:ring-2 focus:ring-orange-dark/20 focus:outline-none";

interface BaseFieldProps {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
}

function FieldShell({
  label,
  name,
  hint,
  required,
  children,
}: BaseFieldProps & { children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-neutral-800"
      >
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export function TextField({
  defaultValue,
  type = "text",
  placeholder,
  readOnly,
  ...props
}: BaseFieldProps & {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "password" | "number" | "datetime-local";
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <FieldShell {...props}>
      <input
        id={props.name}
        name={props.name}
        type={type}
        step={type === "number" ? "any" : undefined}
        required={props.required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${inputClass} ${readOnly ? "bg-neutral-100 text-neutral-500" : ""}`}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  defaultValue,
  rows = 4,
  ...props
}: BaseFieldProps & { defaultValue?: string | null; rows?: number }) {
  return (
    <FieldShell {...props}>
      <textarea
        id={props.name}
        name={props.name}
        rows={rows}
        required={props.required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function SelectField({
  defaultValue,
  options,
  ...props
}: BaseFieldProps & {
  defaultValue?: string | null;
  options: { value: string; label: string }[];
}) {
  return (
    <FieldShell {...props}>
      <select
        id={props.name}
        name={props.name}
        required={props.required}
        defaultValue={defaultValue ?? undefined}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  defaultChecked,
}: Omit<BaseFieldProps, "required"> & { defaultChecked?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="accent-orange-dark h-4 w-4"
        />
        {label}
      </label>
      {hint && <p className="pl-6 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 md:grid-cols-2">{children}</div>;
}
