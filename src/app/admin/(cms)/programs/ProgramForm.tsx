import AdminForm from "@/components/admin/AdminForm";
import MediaField from "@/components/admin/MediaField";
import { FieldGrid, TextAreaField, TextField } from "@/components/admin/fields";
import type { FormState } from "@/lib/cms/forms";
import type { Program } from "@/lib/cms/content";

interface ProgramFormProps {
  program?: Program;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

export default function ProgramForm({ program, action }: ProgramFormProps) {
  return (
    // Keyed on updated_at so a save remounts the form with fresh values
    <AdminForm
      key={program?.updated_at}
      action={action}
      submitLabel={program ? "Save changes" : "Create program"}
    >
      <FieldGrid>
        <TextField
          label="Code"
          name="code"
          required
          defaultValue={program?.code}
          placeholder="BSIT"
        />
        <TextField
          label="ID"
          name="id"
          defaultValue={program?.id}
          readOnly={Boolean(program)}
          placeholder="Generated from the code"
          hint={
            program
              ? "The ID is part of the page URL and can't be changed."
              : "Used in the URL: /programs/<id>"
          }
        />
      </FieldGrid>

      <TextField
        label="Full name"
        name="name"
        required
        defaultValue={program?.name}
        placeholder="Bachelor of Science in Information Technology"
      />

      <TextAreaField
        label="Program description"
        name="description"
        rows={8}
        defaultValue={program?.description}
        hint="Blank lines start a new paragraph."
      />
      <TextAreaField
        label="Program objectives"
        name="objectives"
        rows={8}
        defaultValue={program?.objectives}
        hint="Blank lines start a new paragraph."
      />

      <FieldGrid>
        <TextField
          label="Duration"
          name="duration"
          defaultValue={program?.duration}
          placeholder="4 years"
        />
        <TextField
          label="Semesters"
          name="semesters"
          defaultValue={program?.semesters}
          placeholder="2 semesters per year"
        />
        <TextField
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={program?.sort_order ?? 0}
          hint="Lower numbers are listed first."
        />
      </FieldGrid>

      <MediaField
        label="Logo"
        name="logo_url"
        defaultValue={program?.logo_url}
      />
      <MediaField
        label="Curriculum PDF"
        name="curriculum_pdf_url"
        kind="file"
        accept="application/pdf"
        defaultValue={program?.curriculum_pdf_url}
      />
    </AdminForm>
  );
}
