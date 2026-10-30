"use client";

import Link from "next/link";
import { ArrowCircle, PhotoSlot } from "@/components/PhotoSlot";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { loadPrograms } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";

// Stand-in card photos until real program photography is added.
const TEMP_PROGRAM_PHOTOS: Record<string, string> = {
  blis: "/temp-photos/program-blis.jpg",
  bscs: "/temp-photos/program-bscs.jpg",
  bsemc: "/temp-photos/program-bsemc.jpg",
  bsis: "/temp-photos/program-bsis.jpg",
  bsit: "/temp-photos/program-bsit.jpg",
  mit: "/temp-photos/program-mit.jpg",
};

export function programPhoto(program: { id: string; code: string }) {
  return (
    TEMP_PROGRAM_PHOTOS[program.id] ??
    TEMP_PROGRAM_PHOTOS[program.code.toLowerCase()]
  );
}

export function HomePrograms() {
  const programs = useContent("programs", loadPrograms);

  if (programs.status === "error") {
    return <ContentError onRetry={programs.retry} />;
  }

  if (programs.status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <ContentPlaceholder key={index} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (programs.data.length === 0) {
    return (
      <p className="text-ink-soft text-base">No programs are listed yet.</p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {programs.data.map((program) => (
        <li key={program.id} className="flex min-w-0">
          <Link
            href={`/programs/${program.id}`}
            className="ease-draw group flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(16,32,51,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(16,32,51,0.12)]"
          >
            <div className="aspect-[16/10] shrink-0">
              <PhotoSlot label="Photo coming" src={programPhoto(program)} />
            </div>
            <span className="flex flex-1 items-center gap-3 px-4 py-4">
              {program.logo_url ? (
                <img
                  src={program.logo_url}
                  alt=""
                  className="h-10 w-10 shrink-0 object-contain"
                />
              ) : (
                <span className="bg-theme-red/10 h-10 w-10 shrink-0 rounded-full" />
              )}
              <span className="min-w-0 flex-1">
                <span className="font-major text-ink block text-lg leading-none">
                  {program.code}
                </span>
                {program.name && program.name !== program.code && (
                  <span className="text-ink-soft mt-1 block text-sm leading-snug">
                    {program.name}
                  </span>
                )}
              </span>
              <ArrowCircle className="text-ink-soft group-hover:border-theme-red group-hover:text-theme-red" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
