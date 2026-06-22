import Image from "next/image";
import Link from "next/link";
import programsData from "../data/programs.json";
import { Metadata } from "next";

// --- SEO METADATA CONFIGURATION ---
export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore our undergraduate and graduate degree programs and take the next step toward your goals.",
  alternates: {
    canonical: "/programs",
  },
  openGraph: {
    title: "Programs",
    description:
      "Explore our undergraduate and graduate degree programs and take the next step toward your goals.",
  },
};

interface Program {
  id: string;
  code: string;
  name: string;
  href: string;
  logo: string;
}

const PROGRAMS: Program[] = programsData as Program[];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex h-103 w-auto md:h-148 md:w-full md:flex-row">
        <div className="absolute h-100 w-full md:relative md:h-full md:w-1/2">
          <Image
            src="/program_assets/cict.webp"
            alt="WVSU CICT Building"
            fill
            className="object-cover opacity-70 md:opacity-100"
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          {/* Overlay: Only visible on Mobile to make text readable */}
          <div className="from-orange-dark/70 via-orange-dark/20 absolute inset-0 bg-linear-to-t to-transparent md:hidden" />
        </div>
        <div className="md:bg-orange-light relative z-10 flex h-full w-full flex-col justify-center px-6 text-center text-white md:w-1/2 md:p-20 md:text-left">
          <h1 className="mb-6 text-5xl font-medium drop-shadow-xl md:drop-shadow-none">
            Programs and Curriculum
          </h1>
          <p className="mx-auto max-w-md text-base leading-relaxed font-light tracking-tight drop-shadow-xl md:mx-0 md:drop-shadow-none">
            Explore our undergraduate and graduate degree programs and take the
            next step toward your goals.
          </p>
        </div>
      </section>
      {/* Courses Offered Section */}
      <section className="mx-auto max-w-6xl px-6 pt-9 md:pt-27">
        <h2 className="mb-9 pb-9 text-center text-4xl font-medium tracking-tighter md:mb-16 md:pb-15 md:text-6xl">
          Courses Offered
        </h2>

        <div className="grid grid-cols-1 gap-x-8 gap-y-17 pb-80 sm:grid-cols-2 md:grid-cols-3 md:gap-y-22 md:pb-42">
          {PROGRAMS.map((program: Program) => (
            <Link
              key={program.id}
              href={program.href}
              className="group relative flex cursor-pointer flex-col items-center rounded-lg border border-gray-100 bg-white p-4 pt-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8 md:pt-12"
            >
              {/* Floating Icon Circle */}
              <div className="border-orange-light absolute -top-8 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 bg-white transition-all duration-300 group-hover:scale-110 group-hover:border-orange-500">
                <div className="flex h-50 w-50 items-center justify-center rounded-full p-2">
                  <Image
                    src={program.logo}
                    alt={`${program.code} logo`}
                    width={50}
                    height={50}
                    className="object-contain"
                  />
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
      </section>
    </main>
  );
}
