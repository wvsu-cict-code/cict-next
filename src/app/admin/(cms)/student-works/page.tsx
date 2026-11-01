import { Metadata } from "next";
import PageHeader, {
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { reorderStudentWorks, setStudentWorkVisible } from "./actions";
import WorkList from "./WorkList";

export const metadata: Metadata = {
  title: "Student works",
};

export default async function AdminStudentWorksPage() {
  const { supabase } = await requireAdmin();
  const { data: works, error } = await supabase
    .from("student_works")
    .select("*")
    .order("sort_order")
    .order("created_at");

  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Student works"
        description="Featured student works shown on the website. Drag, or use the arrows, to set the order."
        actions={
          <PrimaryLink href="/admin/student-works/new">
            New student work
          </PrimaryLink>
        }
      />

      {works.length === 0 ? (
        <EmptyState
          title="No student works yet."
          action={
            <PrimaryLink href="/admin/student-works/new">
              New student work
            </PrimaryLink>
          }
        />
      ) : (
        <WorkList
          works={works}
          onReorder={reorderStudentWorks}
          onToggleVisible={setStudentWorkVisible}
        />
      )}
    </>
  );
}
