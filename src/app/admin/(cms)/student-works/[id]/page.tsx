import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import PageHeader, { SecondaryLink } from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { siteUrl } from "@/lib/site";
import { deleteStudentWork, updateStudentWork } from "../actions";
import WorkForm from "../WorkForm";

export const metadata: Metadata = {
  title: "Edit student work",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditStudentWorkPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: work } = await supabase
    .from("student_works")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!work) notFound();

  return (
    <>
      <PageHeader
        title="Edit student work"
        backHref="/admin/student-works"
        backLabel="All student works"
        actions={
          <>
            <SecondaryLink
              href={siteUrl("/programs/bsemc")}
              icon="eye"
              external
            >
              View on site
            </SecondaryLink>
            <DeleteButton
              action={deleteStudentWork.bind(null, work.id)}
              confirmMessage={`Delete "${work.title}"? This cannot be undone.`}
            />
          </>
        }
      />
      {saved && <SavedNotice />}
      <WorkForm work={work} action={updateStudentWork.bind(null, work.id)} />
    </>
  );
}
