"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { programPhoto } from "@/components/HomePrograms";
import { PageHeader, container } from "@/components/PageHeader";
import { ProgramBrochure, ProgramSection } from "@/components/ProgramBrochure";
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

        {/* INFO CARD */}
        {/*<div className="w-auto mx-auto bg-white border-[1.5] border-black rounded-2xl p-8 mb-45 md:mt-0 md:mb-0 md:px-35 md:py-4 flex flex-col sm:flex-row md:flex-row justify-between gap-10 shadow-sm">


                    <a
                        href={program.curriculum_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-12 group cursor-pointer w-full md:w-auto hover:opacity-80 transition-opacity"
                    >

                        <div className="shrink-0 w-15 h-15 md:w-20 md:h-20 rounded-full bg-orange-light text-white flex items-center justify-center shadow-md">
                            <Image
                                src="/program_assets/pdf-icon.svg"
                                alt=""
                                width={30}
                                height={30}
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-bold text-sm md:text-base text-black leading-tight tracking-tight">
                                [PDF] Curriculum Details
                            </span>
                            <span className="text-black text-sm md:text-base tracking-tight">
                                Press button to download
                            </span>
                        </div>
                    </a>



                    <div className="flex items-center gap-12 w-full md:w-auto">

                        <div className="shrink-0 w-15 h-15 md:w-20 md:h-20 rounded-full bg-orange-light text-white flex items-center justify-center shadow-md">
                            <Image
                                src="/program_assets/cap-icon.svg"
                                alt=""
                                width={40}
                                height={40}
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-bold text-sm md:text-base text-black leading-tight tracking-tight">
                                Program Duration
                            </span>
                            <span className="text-black text-sm md:text-base tracking-tight">
                                {program.duration}
                            </span>
                            <span className="text-black text-sm md:text-base tracking-tight">
                                {program.semesters}
                            </span>
                        </div>
                    </div>

                </div>*/}
      </div>
    </div>
  );
}
