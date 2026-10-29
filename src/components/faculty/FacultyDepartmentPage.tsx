"use client";

import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import FacultyDetail from "@/components/faculty/FacultyDetail";
import { fetchDepartmentWithFaculty } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { FACULTY_PREFIX, segmentFromPathname } from "@/lib/routes";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

/**
 * A department's faculty. The slug comes from the address bar: on the school
 * site every department URL is served by the same exported template page.
 */
export default function FacultyDepartmentPage() {
  const slug = segmentFromPathname(usePathname(), FACULTY_PREFIX);
  const result = useContent(
    slug === null ? "missing" : `department:${slug}`,
    (client) =>
      slug === null
        ? Promise.resolve(null)
        : fetchDepartmentWithFaculty(client, slug),
  );
  const data = result.status === "ready" ? result.data : null;
  useDocumentTitle(data ? `${data.department.name} Faculty` : undefined);

  if (result.status === "error") {
    return <ContentError onRetry={result.retry} />;
  }
  if (result.status === "loading") {
    return <ContentPlaceholder className="mx-auto my-12 h-[70vh] w-11/12" />;
  }
  return (
    <FacultyDetail
      dept={data?.department ?? null}
      faculty={data?.faculty ?? []}
    />
  );
}
