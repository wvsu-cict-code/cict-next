import { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { createStudentWork } from "../actions";
import WorkForm from "../WorkForm";

export const metadata: Metadata = {
  title: "New student work",
};

export default async function NewStudentWorkPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="New student work"
        backHref="/admin/student-works"
        backLabel="All student works"
      />
      <WorkForm action={createStudentWork} />
    </>
  );
}
