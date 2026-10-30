import { sdgsFor, type Sdg } from "@/lib/sdg";

const tileSize = {
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-sm",
};

function Tile({ goal, size }: { goal: Sdg; size: keyof typeof tileSize }) {
  return (
    <span
      aria-hidden
      className={`font-major inline-flex shrink-0 items-center justify-center rounded-md leading-none font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${tileSize[size]}`}
      style={{ backgroundColor: goal.color }}
    >
      {goal.number}
    </span>
  );
}

/**
 * The Sustainable Development Goals a post supports, as numbered tiles in
 * the official SDG colors. Shows nothing when the post has none. Past `max`
 * tiles the rest fold into a "+N" tile so cards keep their layout.
 */
export function SdgBadges({
  sdgs,
  max = 4,
  size = "sm",
  className = "",
}: {
  sdgs: readonly number[] | null | undefined;
  max?: number;
  size?: keyof typeof tileSize;
  className?: string;
}) {
  const goals = sdgsFor(sdgs);
  if (goals.length === 0) return null;

  const shown = goals.length > max ? goals.slice(0, max - 1) : goals;
  const hidden = goals.slice(shown.length);

  return (
    <ul
      aria-label="Sustainable Development Goals"
      className={`flex flex-wrap items-center gap-1 ${className}`}
    >
      {shown.map((goal) => (
        <li key={goal.number} title={`SDG ${goal.number}: ${goal.name}`}>
          <Tile goal={goal} size={size} />
          <span className="sr-only">
            SDG {goal.number}: {goal.name}
          </span>
        </li>
      ))}
      {hidden.length > 0 && (
        <li
          title={hidden
            .map((goal) => `SDG ${goal.number}: ${goal.name}`)
            .join("\n")}
        >
          <span
            aria-hidden
            className={`text-ink inline-flex shrink-0 items-center justify-center rounded-md bg-white/90 leading-none font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${tileSize[size]}`}
          >
            +{hidden.length}
          </span>
          <span className="sr-only">
            and{" "}
            {hidden
              .map((goal) => `SDG ${goal.number}: ${goal.name}`)
              .join(", ")}
          </span>
        </li>
      )}
    </ul>
  );
}

/** Every goal a post supports, with its name; for the article page. */
export function SdgList({
  sdgs,
}: {
  sdgs: readonly number[] | null | undefined;
}) {
  const goals = sdgsFor(sdgs);
  if (goals.length === 0) return null;

  return (
    <section
      aria-labelledby="article-sdgs"
      className="border-rule mt-12 border-t pt-8"
    >
      <h2
        id="article-sdgs"
        className="text-ink-soft text-xs font-semibold tracking-[0.18em] uppercase"
      >
        Sustainable Development Goals
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => (
          <li key={goal.number} className="flex items-center gap-3">
            <Tile goal={goal} size="md" />
            <span className="text-ink text-sm leading-snug">
              <span className="text-ink-soft">SDG {goal.number}:</span>{" "}
              {goal.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
