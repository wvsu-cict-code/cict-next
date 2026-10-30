import { Metadata } from "next";
import FacultyDirectoryPage from "@/components/faculty/FacultyDirectoryPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Faculty Directory",
  ...pageMetadata({
    title: "Faculty directory | WVSU CICT",
    description:
      "Meet the faculty and staff of the College of Information and Communications Technology, by department.",
    path: "/faculty-profiles",
  }),
};

export default function FacultyProfilesPage() {
  return <FacultyDirectoryPage />;
}
