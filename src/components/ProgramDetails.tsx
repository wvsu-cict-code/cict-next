"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { programPhoto } from "@/components/HomePrograms";
import { PageHeader, container } from "@/components/PageHeader";
import { ProgramBrochure, ProgramSection } from "@/components/ProgramBrochure";
import { StudentWorksSection } from "@/components/studentWorks/StudentWorksSection";
import { fetchProgram } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { PROGRAMS_PREFIX, segmentFromPathname } from "@/lib/routes";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

/**
 * A program's details. The ID comes from the address bar: on the school site
 * every program URL is served by the same exported template page.
 */
export default function ProgramDetails() {
  const id = segmentFromPathname(usePathname(), PROGRAMS_PREFIX);
  const result = useContent(
    id === null ? "missing" : `program:${id}`,
    (client) =>
      id === null ? Promise.resolve(null) : fetchProgram(client, id),
  );
  const program = result.status === "ready" ? result.data : null;
  useDocumentTitle(program?.name);

  if (result.status === "error") {
    return <ContentError onRetry={result.retry} />;
  }

  if (result.status === "loading") {
    return (
      <div className="bg-white">
        <ContentPlaceholder className="h-80 w-full rounded-none" />
        <div className={`${container} grid gap-4 py-16`}>
          <ContentPlaceholder className="h-8 w-64" />
          <ContentPlaceholder className="h-4 w-full max-w-3xl" />
          <ContentPlaceholder className="h-4 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <PageHeader
        eyebrow="Programs"
        title="Program not found"
        intro="This program doesn't exist or is no longer offered."
        back={{ href: "/programs", label: "All programs" }}
      />
    );
  }

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow={program.code}
        title={program.name}
        image={programPhoto(program)}
        back={{ href: "/programs", label: "All programs" }}
        aside={
          program.logo_url ? (
            <Image
              src={program.logo_url}
              alt=""
              width={160}
              height={160}
              className="h-40 w-40 object-contain opacity-90 brightness-0 invert"
            />
          ) : null
        }
      />

      <div className={`${container} py-16 md:py-20`}>
        <ProgramBrochure
          code={program.code}
          description={program.description}
        />

        <ProgramSection title="Program objectives">
          <p className="text-ink-soft max-w-[68ch] text-base leading-relaxed whitespace-pre-line md:text-lg">
            {program.objectives}
          </p>
        </ProgramSection>

        <ProgramFacts
          duration={program.duration}
          semesters={program.semesters}
          curriculumUrl={uploadedFileUrl(program.curriculum_pdf_url)}
        />

        {program.id === "bsemc" && <StudentWorksSection />}
      </div>
    </div>
  );
}

/**
 * Only files uploaded through the CMS (absolute Supabase Storage URLs) are
 * linked. Older rows hold a site path to a PDF that was never published.
 */
function uploadedFileUrl(url: string | null) {
  return url && /^https?:\/\//.test(url) ? url : null;
}

/** Length of study and the curriculum download, when the CMS has them. */
function ProgramFacts({
  duration,
  semesters,
  curriculumUrl,
}: {
  duration: string | null;
  semesters: string | null;
  curriculumUrl: string | null;
}) {
  if (!duration && !semesters && !curriculumUrl) return null;

  return (
    <ProgramSection title="At a glance">
      <dl className="grid gap-8 sm:grid-cols-2">
        {duration || semesters ? (
          <div>
            <dt className="text-theme-red text-xs font-semibold tracking-[0.08em] uppercase">
              Program length
            </dt>
            <dd className="text-ink mt-2 text-lg leading-snug">
              {[duration, semesters].filter(Boolean).join(" · ")}
            </dd>
          </div>
        ) : null}
        {curriculumUrl ? (
          <div>
            <dt className="text-theme-red text-xs font-semibold tracking-[0.08em] uppercase">
              Curriculum
            </dt>
            <dd className="mt-2">
              <a
                href={curriculumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink decoration-theme-red/40 hover:decoration-theme-red text-lg underline underline-offset-4"
              >
                Download the curriculum (PDF)
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </ProgramSection>
  );
}
