import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import PageHeader from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { deleteMember, updateMember } from "../../actions";
import MemberForm from "../../MemberForm";

export const metadata: Metadata = {
  title: "Edit faculty member",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditMemberPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: member }, { data: departments, error }] = await Promise.all([
    supabase.from("faculty_members").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("departments")
      .select("slug, name")
      .order("sort_order")
      .order("name"),
  ]);
  if (error) throw new Error(error.message);
  if (!member) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${member.name}`}
        backHref="/admin/faculty"
        backLabel="Faculty"
        actions={
          <DeleteButton
            action={deleteMember.bind(null, member.id)}
            confirmMessage={`Remove ${member.name} from the directory?`}
          />
        }
      />
      {saved && <SavedNotice />}
      <MemberForm
        member={member}
        departments={departments}
        action={updateMember.bind(null, member.id)}
      />
    </>
  );
}
