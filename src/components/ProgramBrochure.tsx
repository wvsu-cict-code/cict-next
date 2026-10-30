import type { ReactNode } from "react";
import { brochureFor } from "@/lib/programs/brochure";

const body = "text-ink-soft max-w-[68ch] text-base leading-relaxed md:text-lg";

/** One part of a program page: its title on the left, content on the right. */
export function ProgramSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-rule grid gap-6 border-t py-12 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
      <h2 className="text-ink text-3xl leading-[1.1] font-medium">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/**
 * Brochure description and highlighted subjects for a degree.
 * Programs that are not in the brochure keep the CMS description.
 */
export function ProgramBrochure({
  code,
  description,
}: {
  code: string;
  description: string;
}) {
  const brochure = brochureFor(code);
  const text = brochure?.description ?? description;

  return (
    <>
      <ProgramSection title="Program description">
        {brochure?.lead ? (
          <p className="text-ink mb-4 max-w-[60ch] text-lg leading-relaxed font-medium md:text-xl">
            {brochure.lead}
          </p>
        ) : null}
        <div className={`${body} whitespace-pre-line`}>{text}</div>
        {brochure?.highlight ? (
          <p className="border-theme-red text-ink mt-6 max-w-[68ch] border-l-2 pl-4 text-base leading-relaxed">
            {brochure.highlight}
          </p>
        ) : null}
      </ProgramSection>

      {brochure ? (
        <ProgramSection title="Key subjects">
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            {brochure.groups.map((group) => (
              <section key={group.label}>
                <h3 className="text-ink text-xl font-medium">{group.label}</h3>
                {group.note ? (
                  <p className="text-ink-soft mt-1 text-sm">{group.note}</p>
                ) : null}
                <ul className="border-rule mt-4 border-t">
                  {group.subjects.map((subject) => (
                    <li
                      key={subject.code}
                      className="border-rule flex items-baseline gap-4 border-b py-3"
                    >
                      <span className="text-theme-red w-20 shrink-0 text-xs font-semibold tracking-[0.08em] uppercase">
                        {subject.code}
                      </span>
                      <span className="text-ink min-w-0 text-base leading-snug">
                        {subject.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </ProgramSection>
      ) : null}
    </>
  );
}
