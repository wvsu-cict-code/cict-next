import { Metadata } from "next";
import FacultyDirectory from "@/components/faculty/FacultyDirectory";
import { getDepartments } from "@/lib/cms/queries";

// Content edits revalidate on demand from the CMS; this is a fallback.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Faculty Directory",
  alternates: {
    canonical: "/faculty-profiles",
  },
};

export default async function FacultyProfilesPage() {
  const departments = await getDepartments();
  return <FacultyDirectory departments={departments} />;
}
