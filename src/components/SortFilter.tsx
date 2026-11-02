"use client";

interface SortFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const SortFilter: React.FC<SortFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: "", label: "Sort articles" },
    { value: "name-asc", label: "Name A → Z" },
    { value: "name-desc", label: "Name Z → A" },
    { value: "date-new", label: "Newest" },
    { value: "date-old", label: "Oldest" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort articles"
      className="border-rule text-ink focus:border-theme-red min-h-11 w-full cursor-pointer rounded-full border bg-white px-4 text-sm outline-none sm:w-56"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SortFilter;
