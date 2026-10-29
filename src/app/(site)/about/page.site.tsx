import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/PhotoSlot";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mission, vision, and history of the WVSU College of Information and Communications Technology.",
};

export default function About() {
  return (
    <article className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <p className="text-theme-red flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
          <span className="bg-theme-red h-px w-8" aria-hidden />
          About CICT
        </p>
        <h1 className="text-ink mt-3 text-4xl leading-[1.1] font-medium md:text-5xl">
          Innovative education for a digital tomorrow.
        </h1>
        <p className="text-ink-soft mt-5 text-base leading-relaxed md:text-lg">
          Founded in <strong>2002</strong> under BOR Resolution No. 34, the
          College of Information and Communications Technology (CICT) began as
          the{" "}
          <strong>
            Institute of Information and Communications Technology (IICT)
          </strong>{" "}
          and launched the <strong>BS in Information Technology (BSIT)</strong>{" "}
          and <strong>BS in Information Management (BSIM)</strong> programs in
          AY 2002-2003, producing its first graduates soon after.
        </p>

        <h2 className="text-ink mt-12 text-3xl font-medium">Mission</h2>
        <p className="text-ink-soft mt-4 text-base leading-relaxed md:text-lg">
          The WVSU-CICT aims to develop professionals who shall be able to meet
          the growing manpower demand by expanding the ICT industries in the
          country. Being the lead institution of higher learning in{" "}
          <strong>Western Visayas.</strong>
        </p>

        <h2 className="text-ink mt-12 text-3xl font-medium">Vision</h2>
        <p className="text-ink-soft mt-4 text-base leading-relaxed md:text-lg">
          To be the leading provider of ICT education in{" "}
          <strong>Western Visayas</strong>, aligned with the broader mandate of
          WVSU as the lead institution of higher learning in the region.
        </p>

        <Link
          href="/contact"
          className="ease-draw bg-theme-red hover:bg-accent-deep mt-10 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors duration-200"
        >
          Contact us
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
