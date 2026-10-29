"use client";

import Link from "next/link";
import { ArrowCircle, PhotoSlot } from "@/components/PhotoSlot";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { loadPrograms } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";

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
        <li key={program.id} className="min-w-0">
          <Link
            href={`/programs/${program.id}`}
            className="ease-draw group block overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(16,32,51,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <PhotoSlot label="Photo coming" className="aspect-[16/10] w-full" />
            <span className="flex items-center gap-3 px-4 py-4">
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
