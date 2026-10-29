import { Metadata } from "next";
import PageHeader, { Card } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { createDepartment } from "../../actions";
import DepartmentForm from "../../DepartmentForm";

export const metadata: Metadata = {
  title: "New department",
};

export default async function NewDepartmentPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="New department"
        backHref="/admin/faculty"
        backLabel="Faculty"
      />
      <Card>
        <DepartmentForm action={createDepartment} />
      </Card>
    </>
  );
}
