"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { ProgramBrochure } from "@/components/ProgramBrochure";
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
      <main className="min-h-screen bg-white pb-20">
        <ContentPlaceholder className="h-98 w-full rounded-none md:min-h-154" />
      </main>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <h1 className="font-major text-2xl font-bold text-neutral-900 uppercase">
          Program not found
        </h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20 font-sans">
      <section className="bg-orange-light relative flex h-98 w-auto flex-col items-center justify-center overflow-hidden px-6 text-center md:min-h-154 md:w-full md:px-20">
        {/* Dynamic Background Watermark */}
        {/* Left SVG */}
        {program.logo_url && (
          <div className="absolute bottom-0 -left-20 h-60 w-60 opacity-0 md:bottom-12 md:-left-50 md:h-125 md:w-125 md:opacity-20">
            <Image
              src={program.logo_url}
              alt=""
              fill
              className="object-contain object-bottom-left brightness-0 invert"
              priority
            />
          </div>
        )}

        {/* Right SVG */}
        {program.logo_url && (
          <div className="absolute top-10 -right-20 h-80 w-80 opacity-20 md:top-1/2 md:-right-50 md:h-125 md:w-125 md:-translate-y-1/2 md:opacity-20">
            <Image
              src={program.logo_url}
              alt=""
              fill
              className="object-contain object-right brightness-0 invert"
              priority
            />
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-8 left-6 z-20 md:top-24 md:left-20">
          <Link
            href="/programs"
            className="group text-orange-light relative flex w-fit cursor-pointer items-center gap-4 rounded-full bg-white px-8 py-4 shadow-lg transition-all duration-700 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="text-orange-light flex items-center justify-center transition-transform group-hover:-translate-x-1">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-orange-light text-[13px] font-bold tracking-tighter uppercase">
              Back to Programs
            </span>
          </Link>
        </div>

        {/* Program Title */}
        <h1 className="relative z-10 mt-10 max-w-2xl text-left text-[40px] leading-12 font-semibold text-white drop-shadow-sm md:mt-0 md:max-w-6xl md:text-center md:text-7xl md:leading-tight md:font-normal">
          {program.name}
        </h1>
      </section>

      {/* CONTENT SECTION */}
      <div className="mx-auto mb-15 max-w-7xl px-7 pt-8 md:pt-20">
        <ProgramBrochure
          code={program.code}
          description={program.description}
        />

        {/* 2. Objectives */}
        <div className="mb-20">
          <h2 className="text-orange-light mb-8 text-3xl font-medium md:text-[40px] md:font-normal">
            Program Objectives
          </h2>
          <p className="text-justify text-sm leading-relaxed tracking-tight whitespace-pre-line text-black md:text-base">
            {program.objectives}
          </p>
        </div>

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
    </main>
  );
}
