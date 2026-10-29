import { Metadata } from "next";
import FacultyDirectoryPage from "@/components/faculty/FacultyDirectoryPage";

export const metadata: Metadata = {
  title: "Faculty Directory",
  alternates: {
    canonical: "/faculty-profiles",
  },
};

export default function FacultyProfilesPage() {
  return <FacultyDirectoryPage />;
}
