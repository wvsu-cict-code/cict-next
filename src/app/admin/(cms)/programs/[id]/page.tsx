import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import PageHeader, { Card } from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { siteUrl } from "@/lib/site";
import { deleteProgram, updateProgram } from "../actions";
import ProgramForm from "../ProgramForm";

export const metadata: Metadata = {
  title: "Edit program",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProgramPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!program) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${program.code}`}
        backHref="/admin/programs"
        backLabel="All programs"
        actions={
          <>
            <a
              href={siteUrl(`/programs/${program.id}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
            >
              View on site ↗
            </a>
            <DeleteButton
              action={deleteProgram.bind(null, program.id)}
              confirmMessage={`Delete ${program.code}? Its page will stop working.`}
            />
          </>
        }
      />
      {saved && <SavedNotice />}
      <Card>
        <ProgramForm
          program={program}
          action={updateProgram.bind(null, program.id)}
        />
      </Card>
    </>
  );
}
