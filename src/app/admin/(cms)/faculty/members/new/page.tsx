import { Metadata } from "next";
import PageHeader, { Card } from "@/components/admin/PageHeader";
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
      <Card>
        {departments.length === 0 ? (
          <p className="text-sm text-neutral-500">Create a department first.</p>
        ) : (
          <MemberForm
            departments={departments}
            defaultDepartment={department}
            action={createMember}
          />
        )}
      </Card>
    </>
  );
}
