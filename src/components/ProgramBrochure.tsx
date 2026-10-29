import { brochureFor } from "@/lib/programs/brochure";

const heading =
  "text-orange-light mb-8 text-3xl font-medium md:text-[40px] md:font-normal";

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
      <div className="mb-12 md:mb-16">
        <h2 className={heading}>Program Description</h2>
        {brochure?.lead ? (
          <p className="font-minor mb-4 text-base leading-relaxed font-medium tracking-tight text-black md:text-lg">
            {brochure.lead}
          </p>
        ) : null}
        <div className="font-minor text-justify text-sm leading-relaxed tracking-tight whitespace-pre-line text-black md:text-base">
          {text}
        </div>
        {brochure?.highlight ? (
          <p className="font-minor border-orange-light mt-6 border-l-2 pl-4 text-sm leading-relaxed tracking-tight text-black md:text-base">
            {brochure.highlight}
          </p>
        ) : null}
      </div>

      {brochure ? (
        <div className="mb-12 md:mb-16">
          <h2 className={heading}>Key Subjects</h2>
          <div className="max-w-3xl space-y-10">
            {brochure.groups.map((group) => (
              <section key={group.label}>
                <h3 className="text-xl font-medium text-black">
                  {group.label}
                </h3>
                {group.note ? (
                  <p className="font-minor mt-1 text-sm text-neutral-600">
                    {group.note}
                  </p>
                ) : null}
                <ul className="mt-3 border-t border-neutral-200">
                  {group.subjects.map((subject) => (
                    <li
                      key={subject.code}
                      className="flex flex-col gap-1 border-b border-neutral-200 py-3 sm:flex-row sm:items-baseline sm:gap-6"
                    >
                      <span className="shrink-0 text-sm font-medium text-black sm:w-40">
                        {subject.code}
                      </span>
                      <span className="font-minor min-w-0 text-sm leading-relaxed text-black md:text-base">
                        {subject.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
