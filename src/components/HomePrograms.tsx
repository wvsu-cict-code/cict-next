"use client";

import Link from "next/link";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { fetchPrograms } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";

const course_container =
  "w-25 h-24 md:w-58 md:h-54 flex flex-col justify-center items-center gap-2 md:gap-6 bg-white pt-3 md:pt-6 duration-200 hover:scale-105 hover:shadow-xl hover:-translate-y-1";

/** Program tiles in the home page's "Offered Programs" table. */
export function HomePrograms() {
  const programs = useContent("programs", fetchPrograms);

  if (programs.status === "error") {
    return <ContentError onRetry={programs.retry} />;
  }

  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
      {programs.status === "loading"
        ? Array.from({ length: 6 }, (_, index) => (
            <ContentPlaceholder
              key={index}
              className="h-24 w-25 rounded-none md:h-54 md:w-58"
            />
          ))
        : programs.data.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className={` ${course_container} `}
            >
              {program.logo_url && (
                <img
                  src={program.logo_url}
                  className="h-auto w-12 md:w-24"
                  alt={`${program.code} logo`}
                />
              )}
              <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                {program.code}
              </h3>
            </Link>
          ))}
    </div>
  );
}
