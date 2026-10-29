import { Metadata } from "next";
import FacultyDetail from "@/components/faculty/FacultyDetail";
import { getDepartmentWithFaculty, getDepartments } from "@/lib/cms/queries";

// Content edits revalidate on demand from the CMS; this is a fallback.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ dept: string }>;
}

export async function generateStaticParams() {
  const departments = await getDepartments();
  return departments.map((dept) => ({ dept: dept.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { dept } = await params;
  const data = await getDepartmentWithFaculty(dept);

  return {
    title: data ? `${data.department.name} Faculty` : "Department Not Found",
    alternates: {
      canonical: `/faculty-profiles/${dept}`,
    },
  };
}

export default async function FacultyDepartmentPage({ params }: PageProps) {
  const { dept } = await params;
  const data = await getDepartmentWithFaculty(dept);

  return (
    <FacultyDetail
      dept={data?.department ?? null}
      faculty={data?.faculty ?? []}
    />
  );
}
