import { Metadata } from "next";
import PageHeader, {
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { createMember } from "../../actions";
import MemberForm from "../../MemberForm";

export const metadata: Metadata = {
  title: "New faculty member",
};

interface PageProps {
  searchParams: Promise<{ department?: string }>;
}

export default async function NewMemberPage({ searchParams }: PageProps) {
  const { department } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: departments, error } = await supabase
    .from("departments")
    .select("slug, name")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="New faculty member"
        backHref="/admin/faculty"
        backLabel="Faculty"
      />
      {departments.length === 0 ? (
        <EmptyState
          title="Create a department first."
          action={
            <PrimaryLink href="/admin/faculty/departments/new">
              New department
            </PrimaryLink>
          }
        />
      ) : (
        <MemberForm
          departments={departments}
          defaultDepartment={department}
          action={createMember}
        />
      )}
    </>
  );
}
