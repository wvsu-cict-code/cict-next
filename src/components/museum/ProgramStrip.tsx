"use client";

import Link from "next/link";
import { container } from "@/components/PageHeader";
import { fetchProgram } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";

const STATIC_NAME =
  "Bachelor of Science in Entertainment and Multimedia Computing";

/** The mockup's line for this strip. It is not the long program description. */
const MUSEUM_LINE =
  "The BSEMC Virtual Museum showcases the creative, technical, and artistic works of our students. Explore, interact, and support emerging talent from the Division of Entertainment and Multimedia Computing.";

export function ProgramStrip() {
  const result = useContent("program:bsemc", (client) =>
    fetchProgram(client, "bsemc"),
  );
  const program = result.status === "ready" ? result.data : null;

  return (
    <section aria-label="Program" className="border-rule bg-surface border-b">
      <div
        className={`${container} grid gap-6 py-8 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:items-center md:gap-10 md:py-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto_auto]`}
      >
        <h2 className="text-ink text-xl leading-tight font-medium md:text-2xl">
          {program?.name || STATIC_NAME}
        </h2>
        {program ? (
          <>
            <p className="text-ink-soft max-w-[58ch] text-sm leading-relaxed md:text-base">
              {MUSEUM_LINE}
            </p>
            <div>
              <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
                Program
              </p>
              <Link
                href="/programs/bsemc/"
                className="text-ink mt-1 inline-flex min-h-11 items-center text-lg font-medium underline-offset-4 hover:underline"
              >
                {program.code}
              </Link>
            </div>
            {program.duration || program.semesters ? (
              <div>
                <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
                  Duration
                </p>
                {program.duration ? (
                  <p className="text-ink mt-1 text-lg leading-snug">
                    {program.duration}
                  </p>
                ) : null}
                {program.semesters ? (
                  <p className="text-ink-soft text-sm leading-snug">
                    {program.semesters}
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
