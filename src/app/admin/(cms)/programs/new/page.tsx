import { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { createProgram } from "../actions";
import ProgramForm from "../ProgramForm";

export const metadata: Metadata = {
  title: "New program",
};

export default async function NewProgramPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="New program"
        backHref="/admin/programs"
        backLabel="All programs"
      />
      <ProgramForm action={createProgram} />
    </>
  );
}
