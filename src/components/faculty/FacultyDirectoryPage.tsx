"use client";

import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import FacultyDirectory from "@/components/faculty/FacultyDirectory";
import { fetchDepartments } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";

/** Loads the departments, then renders the interactive faculty directory. */
export default function FacultyDirectoryPage() {
  const departments = useContent("departments", fetchDepartments);

  if (departments.status === "ready") {
    return <FacultyDirectory departments={departments.data} />;
  }
  if (departments.status === "error") {
    return <ContentError onRetry={departments.retry} />;
  }
  return <ContentPlaceholder className="mx-auto my-12 h-[70vh] w-11/12" />;
}
