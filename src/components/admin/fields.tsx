export const inputClass =
  "text-ink placeholder:text-ink-soft/50 border-rule w-full min-h-11 rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:border-theme-red focus:ring-3 focus:ring-theme-red/15 focus:outline-none";

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
      <label htmlFor={name} className="text-ink block text-sm font-semibold">
        {label}
        {required && <span className="text-theme-red"> *</span>}
      </label>
      {children}
      {hint && <p className="text-ink-soft text-xs leading-relaxed">{hint}</p>}
    </div>
  );
}

export function TextField({
  defaultValue,
  type = "text",
  placeholder,
  readOnly,
  onValueChange,
  ...props
}: BaseFieldProps & {
  defaultValue?: string | number | null;
  onValueChange?: (value: string) => void;
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
        onChange={onValueChange && ((e) => onValueChange(e.target.value))}
        className={`${inputClass} ${readOnly ? "!bg-paper text-ink-soft cursor-not-allowed" : ""}`}
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
  value,
  onValueChange,
  options,
  ...props
}: BaseFieldProps & {
  defaultValue?: string | null;
  /** Makes the select controlled; pair with onValueChange. */
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <FieldShell {...props}>
      <select
        id={props.name}
        name={props.name}
        required={props.required}
        defaultValue={
          value === undefined ? (defaultValue ?? undefined) : undefined
        }
        value={value}
        onChange={onValueChange && ((e) => onValueChange(e.target.value))}
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
    <label className="border-rule hover:border-ink/30 flex cursor-pointer items-start justify-between gap-4 rounded-xl border bg-white p-4 transition-colors">
      <span>
        <span className="text-ink block text-sm font-semibold">{label}</span>
        {hint && (
          <span className="text-ink-soft mt-1 block text-xs leading-relaxed">
            {hint}
          </span>
        )}
      </span>
      {/* A switch: the real checkbox stays in the form, styled as a track */}
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        role="switch"
        className="bg-rule checked:bg-theme-red focus-visible:ring-theme-red/30 relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full transition-colors duration-200 before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform before:duration-200 checked:before:translate-x-5 focus-visible:ring-3 focus-visible:outline-none"
      />
    </label>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}
