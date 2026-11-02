import { ProgramSection } from "@/components/ProgramBrochure";

/**
 * Jobs graduates of a program can go into, edited in the CMS. Hidden when the
 * list is empty, or missing from program data cached before careers existed.
 */
export function ProgramCareers({
  careers,
}: {
  careers: string[] | null | undefined;
}) {
  if (!careers?.length) return null;

  return (
    <ProgramSection title="Possible careers">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {careers.map((career) => (
          <li
            key={career}
            className="border-rule text-ink flex min-h-14 items-center gap-3 rounded-lg border bg-white px-4 py-3 text-base leading-snug"
          >
            <svg
              viewBox="0 0 24 24"
              className="text-theme-red h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
            </svg>
            {career}
          </li>
        ))}
      </ul>
    </ProgramSection>
  );
}
