import { SDGS } from "@/lib/sdg";

/**
 * The 17 Sustainable Development Goals as toggles. Each is a real checkbox
 * named `sdgs` (read with parseSdgs()), styled as a tile that takes on the
 * goal's color when picked.
 */
export default function SdgPicker({
  defaultValue = [],
}: {
  defaultValue?: readonly number[] | null;
}) {
  const picked = new Set(defaultValue ?? []);

  return (
    <fieldset>
      <legend className="sr-only">Sustainable Development Goals</legend>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {SDGS.map((goal) => (
          <label
            key={goal.number}
            style={{ "--sdg": goal.color } as React.CSSProperties}
            className="group border-rule hover:border-ink/30 has-focus-visible:ring-theme-red/30 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white p-2 pr-3 transition-colors has-checked:border-(--sdg) has-checked:bg-[color-mix(in_srgb,var(--sdg)_8%,white)] has-focus-visible:ring-3"
          >
            <input
              type="checkbox"
              name="sdgs"
              value={goal.number}
              defaultChecked={picked.has(goal.number)}
              className="sr-only"
            />
            <span
              aria-hidden
              className="font-major flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--sdg) text-sm font-medium text-white opacity-55 grayscale transition group-has-checked:opacity-100 group-has-checked:grayscale-0"
            >
              {goal.number}
            </span>
            <span className="text-ink-soft group-has-checked:text-ink min-w-0 text-sm leading-snug group-has-checked:font-semibold">
              {goal.name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
