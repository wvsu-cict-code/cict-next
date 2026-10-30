import { Metadata } from "next";
import { HomePrograms } from "@/components/HomePrograms";
import { PageHeader, SectionHeading, container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

// --- SEO METADATA CONFIGURATION ---
export const metadata: Metadata = {
  title: "Programs",
  ...pageMetadata({
    title: "Programs and curriculum | WVSU CICT",
    description:
      "Explore our undergraduate and graduate degree programs and take the next step toward your goals.",
    path: "/programs",
  }),
};

export default function ProgramsPage() {
  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Programs"
        title="Programs and curriculum"
        intro="Explore our undergraduate and graduate degree programs and take the next step toward your goals."
        image="/program_assets/cict.webp"
      />

      <section className="bg-[#f7f8fa]">
        <div className={`${container} py-16 md:py-24`}>
          <SectionHeading
            eyebrow="Courses offered"
            title="Choose a program"
            intro="Open a program to see its description, key subjects, and objectives."
          />
          <div className="mt-10">
            <HomePrograms />
          </div>
        </div>
      </section>
    </div>
  );
}
