import AdminForm from "@/components/admin/AdminForm";
import MediaField from "@/components/admin/MediaField";
import { FormSection } from "@/components/admin/PageHeader";
import { FieldGrid, SelectField, TextField } from "@/components/admin/fields";
import type { FormState } from "@/lib/cms/forms";
import type { Tables } from "@/lib/supabase/database.types";

interface MemberFormProps {
  member?: Tables<"faculty_members">;
  departments: { slug: string; name: string }[];
  defaultDepartment?: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

export default function MemberForm({
  member,
  departments,
  defaultDepartment,
  action,
}: MemberFormProps) {
  return (
    // Keyed on updated_at so a save remounts the form with fresh values
    <AdminForm
      key={member?.updated_at}
      action={action}
      submitLabel={member ? "Save changes" : "Add member"}
    >
      <FormSection title="Profile">
        <TextField
          label="Name"
          name="name"
          required
          defaultValue={member?.name}
          placeholder="DR. JUAN DELA CRUZ"
        />
        <FieldGrid>
          <SelectField
            label="Department"
            name="department_slug"
            required
            defaultValue={member?.department_slug ?? defaultDepartment}
            options={departments.map((d) => ({ value: d.slug, label: d.name }))}
          />
          <TextField
            label="Sort order"
            name="sort_order"
            type="number"
            defaultValue={member?.sort_order ?? 0}
            hint="Lower numbers are listed first. Put the division chair first."
          />
        </FieldGrid>
        <TextField
          label="Position / title"
          name="title"
          defaultValue={member?.title}
          placeholder="Division Chair / Research Coordinator"
          hint='Separate multiple roles with "/" to show them on separate lines.'
        />
        <TextField
          label="Description"
          name="description"
          defaultValue={member?.description}
          placeholder="Faculty in BSIT and MIT"
        />
      </FormSection>
      <FormSection title="Photo">
        <MediaField
          label="Photo"
          name="image_url"
          defaultValue={member?.image_url}
          hint="Square photos look best. A placeholder is shown when empty."
        />
      </FormSection>
    </AdminForm>
  );
}
