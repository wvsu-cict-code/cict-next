import AdminForm from "@/components/admin/AdminForm";
import { FormSection } from "@/components/admin/PageHeader";
import { FieldGrid, SelectField, TextField } from "@/components/admin/fields";
import type { FormState } from "@/lib/cms/forms";
import type { Tables } from "@/lib/supabase/database.types";

interface DepartmentFormProps {
  department?: Tables<"departments">;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

export default function DepartmentForm({
  department,
  action,
}: DepartmentFormProps) {
  return (
    // Keyed on updated_at so a save remounts the form with fresh values
    <AdminForm
      key={department?.updated_at}
      action={action}
      submitLabel={department ? "Save changes" : "Create department"}
    >
      <FormSection title="Department">
        <FieldGrid>
          <TextField
            label="Name"
            name="name"
            required
            defaultValue={department?.name}
          />
          <TextField
            label="Slug"
            name="slug"
            defaultValue={department?.slug}
            readOnly={Boolean(department)}
            placeholder="Generated from the name"
            hint={
              department
                ? "The slug is part of the page URL and can't be changed."
                : "Used in the URL: /faculty-profiles/<slug>"
            }
          />
          <TextField
            label="Sort order"
            name="sort_order"
            type="number"
            defaultValue={department?.sort_order ?? 0}
            hint="Order in the mobile directory list."
          />
        </FieldGrid>
      </FormSection>

      <FormSection
        title="Directory diagram placement (desktop)"
        description={
          <>
            Coordinates use the diagram&apos;s 1600 × 1000 canvas (x from −300
            to 1300). The label sits at (x, y) and a line connects it to the
            logo anchor, which is also where the page zooms in.
          </>
        }
      >
        <FieldGrid>
          <SelectField
            label="Label side"
            name="side"
            defaultValue={department?.side ?? "left"}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
          <TextField
            label="Zoom scale"
            name="zoom_scale"
            type="number"
            defaultValue={department?.zoom_scale ?? 6}
          />
          <TextField
            label="Label x"
            name="x"
            type="number"
            defaultValue={department?.x ?? 0}
          />
          <TextField
            label="Label y"
            name="y"
            type="number"
            defaultValue={department?.y ?? 500}
          />
          <TextField
            label="Logo anchor x"
            name="logo_anchor_x"
            type="number"
            defaultValue={department?.logo_anchor_x ?? 500}
          />
          <TextField
            label="Logo anchor y"
            name="logo_anchor_y"
            type="number"
            defaultValue={department?.logo_anchor_y ?? 500}
          />
        </FieldGrid>
      </FormSection>
    </AdminForm>
  );
}
