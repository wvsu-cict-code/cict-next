"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { fetchPrograms } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";

/** Program cards on the Programs page. */
export default function ProgramsList() {
  const programs = useContent("programs", fetchPrograms);

  if (programs.status === "error") {
    return <ContentError onRetry={programs.retry} />;
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-17 pb-80 sm:grid-cols-2 md:grid-cols-3 md:gap-y-22 md:pb-42">
      {programs.status === "loading"
        ? Array.from({ length: 6 }, (_, index) => (
            <ContentPlaceholder
              key={index}
              className="h-72 w-full rounded-lg"
            />
          ))
        : programs.data.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="group relative flex cursor-pointer flex-col items-center rounded-lg border border-gray-100 bg-white p-4 pt-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8 md:pt-12"
            >
              {/* Floating Icon Circle */}
              <div className="border-orange-light absolute -top-8 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 bg-white transition-all duration-300 group-hover:scale-110 group-hover:border-orange-500">
                <div className="flex h-50 w-50 items-center justify-center rounded-full p-2">
                  {program.logo_url && (
                    <Image
                      src={program.logo_url}
                      alt={`${program.code} logo`}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>

              <h3 className="mb-3 pt-10 text-2xl font-medium tracking-tighter md:mb-2 md:text-3xl">
                {program.code}
              </h3>
              <p className="mb-14 h-10 px-10 text-sm leading-tight font-normal tracking-tight md:text-base">
                {program.name}
              </p>
              <div className="transform text-black transition-colors group-hover:translate-x-1 group-hover:text-orange-500">
                →
              </div>
            </Link>
          ))}
    </div>
  );
}
