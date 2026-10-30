import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import PageHeader, { SecondaryLink } from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { siteUrl } from "@/lib/site";
import { deleteDepartment, updateDepartment } from "../../actions";
import DepartmentForm from "../../DepartmentForm";

export const metadata: Metadata = {
  title: "Edit department",
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditDepartmentPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: department } = await supabase
    .from("departments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!department) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${department.name}`}
        backHref="/admin/faculty"
        backLabel="Faculty"
        actions={
          <>
            <SecondaryLink
              href={siteUrl(`/faculty-profiles/${department.slug}`)}
              icon="eye"
              external
            >
              View on site
            </SecondaryLink>
            <DeleteButton
              action={deleteDepartment.bind(null, department.slug)}
              confirmMessage={`Delete ${department.name} AND all of its faculty members? This cannot be undone.`}
            />
          </>
        }
      />
      {saved && <SavedNotice />}
      <DepartmentForm
        department={department}
        action={updateDepartment.bind(null, department.slug)}
      />
    </>
  );
}
