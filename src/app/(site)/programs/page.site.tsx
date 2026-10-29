import Image from "next/image";
import { Metadata } from "next";
import ProgramsList from "@/components/ProgramsList";

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

        <ProgramsList />
      </section>
    </main>
  );
}
