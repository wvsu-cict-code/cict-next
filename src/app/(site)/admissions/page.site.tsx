import type { Metadata } from "next";
import Link from "next/link";
import { CmsPage } from "@/components/CmsPage";
import { primaryButton } from "@/components/PageHeader";
import { ArrowIcon } from "@/components/PhotoSlot";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Admissions",
  ...pageMetadata({
    title: "Admissions | WVSU CICT",
    description:
      "How to apply to the WVSU College of Information and Communications Technology: requirements, steps, key dates, and scholarships.",
    path: "/admissions",
  }),
};

/** Text comes from the CMS (Pages → Admissions). */
export default function Admissions() {
  return (
    <CmsPage
      slug="admissions"
      eyebrow="Admissions"
      fallbackTitle="Admissions"
      image="/temp-photos/students.jpg"
      fallback={
        <>
          <p className="text-ink-soft text-base leading-relaxed md:text-lg">
            Requirements and key dates for the coming school year will be posted
            here. Until then, the CICT office can answer questions about
            applying, shifting, and our programs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/contact" className={primaryButton}>
              Contact the CICT office
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/programs"
              className="text-ink hover:text-theme-red text-base font-semibold underline underline-offset-4"
            >
              Explore our programs
            </Link>
          </div>
        </>
      }
    />
  );
}
