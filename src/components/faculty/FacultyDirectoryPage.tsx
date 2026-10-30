"use client";

import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import FacultyDirectory, {
  FacultyPageHeader,
} from "@/components/faculty/FacultyDirectory";
import { container } from "@/components/PageHeader";
import { loadDepartments } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";

/** Loads the departments, then renders the interactive faculty directory. */
export default function FacultyDirectoryPage() {
  const departments = useContent("departments", loadDepartments);

  if (departments.status === "ready") {
    return <FacultyDirectory departments={departments.data} />;
  }
  return (
    <div className="bg-white">
      <FacultyPageHeader />
      <div className={`${container} pb-16`}>
        {departments.status === "error" ? (
          <ContentError onRetry={departments.retry} />
        ) : (
          <ContentPlaceholder className="h-[60vh] w-full rounded-2xl" />
        )}
      </div>
    </div>
  );
}
