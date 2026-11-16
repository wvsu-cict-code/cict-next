import { Metadata } from "next";
import PageHeader, {
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import {
  reorderStudentWorks,
  setStudentWorkFeatured,
  setStudentWorkVisible,
} from "./actions";
import StatusTabs, { resolveWorkListStatus } from "./StatusTabs";
import WorkList from "./WorkList";

export const metadata: Metadata = {
  title: "Student works",
};

interface PageProps {
  searchParams: Promise<{ status?: string | string[] }>;
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const EMPTY: Record<ReturnType<typeof resolveWorkListStatus>, string> = {
  pending: "No submissions waiting for review.",
  approved: "No approved works yet.",
  rejected: "No rejected submissions.",
  all: "No student works yet.",
};

export default async function AdminStudentWorksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: works, error } = await supabase
    .from("student_works")
    .select("*")
    .order("sort_order")
    .order("created_at");

  if (error) throw new Error(error.message);

  const pendingCount = works.filter((work) => work.status === "pending").length;
  const status = resolveWorkListStatus(one(params.status), pendingCount);
  const shown =
    status === "all" ? works : works.filter((work) => work.status === status);

  return (
    <>
      <PageHeader
        title="Student works"
        description="Review student submissions. On Approved, drag or use the arrows to set the order."
        actions={
          <PrimaryLink href="/admin/student-works/new">
            New student work
          </PrimaryLink>
        }
      />

      <StatusTabs status={status} pendingCount={pendingCount} />

      {shown.length === 0 ? (
        <EmptyState
          title={EMPTY[status]}
          action={
            status === "all" || status === "approved" ? (
              <PrimaryLink href="/admin/student-works/new">
                New student work
              </PrimaryLink>
            ) : undefined
          }
        />
      ) : (
        <WorkList
          works={shown}
          canReorder={status === "approved"}
          onReorder={reorderStudentWorks}
          onToggleVisible={setStudentWorkVisible}
          onToggleFeatured={setStudentWorkFeatured}
        />
      )}
    </>
  );
}
