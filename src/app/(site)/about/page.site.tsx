import type { Metadata } from "next";
import Link from "next/link";
import { MissionVision } from "@/components/MissionVision";
import {
  PageHeader,
  SectionHeading,
  container,
  primaryButton,
} from "@/components/PageHeader";
import { ArrowIcon } from "@/components/PhotoSlot";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  ...pageMetadata({
    title: "About | WVSU CICT",
    description:
      "Mission, vision, and history of the WVSU College of Information and Communications Technology.",
    path: "/about",
  }),
};

export default function About() {
  return (
    <article className="bg-white">
      <PageHeader
        eyebrow="About CICT"
        title="Innovative education for a digital tomorrow."
        image="/temp-photos/classroom.jpg"
      />

      <section className={`${container} py-16 md:py-20`}>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          <SectionHeading eyebrow="Our history" title="Since 2002" />
          <p className="text-ink-soft max-w-[68ch] text-base leading-relaxed md:text-lg">
            Founded in <strong>2002</strong> under BOR Resolution No. 34, the
            College of Information and Communications Technology (CICT) began as
            the{" "}
            <strong>
              Institute of Information and Communications Technology (IICT)
            </strong>{" "}
            and launched the{" "}
            <strong>BS in Information Technology (BSIT)</strong> and{" "}
            <strong>BS in Information Management (BSIM)</strong> programs in AY
            2002-2003, producing its first graduates soon after.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f8fa]">
        <div className={`${container} py-16 md:py-20`}>
          <MissionVision />
        </div>
      </section>

      <section className={`${container} py-16 md:py-20`}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading
            title="Have a question for the college?"
            intro="Write to the CICT office about programs, visits, and enrollment."
          />
          <Link href="/contact" className={primaryButton}>
            Contact us
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
