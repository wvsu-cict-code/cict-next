import AdminForm from "@/components/admin/AdminForm";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import MediaField from "@/components/admin/MediaField";
import { FormSection } from "@/components/admin/PageHeader";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { toManilaDateTimeInput } from "@/lib/cms/dates";
import type { FormState } from "@/lib/cms/forms";
import type { CalendarEvent } from "@/lib/events";
import { uploadPostImage } from "../posts/actions";

interface EventFormProps {
  event?: CalendarEvent;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

export default function EventForm({ event, action }: EventFormProps) {
  return (
    // Keyed on updated_at so a save remounts the form with fresh values
    <AdminForm
      key={event?.updated_at}
      action={action}
      submitLabel={event ? "Save changes" : "Create event"}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <FormSection title="Content">
            <TextField
              label="Title"
              name="title"
              required
              defaultValue={event?.title}
            />
            <TextAreaField
              label="Summary"
              name="summary"
              rows={3}
              defaultValue={event?.summary}
              hint="One or two sentences, shown in event lists and under the title."
            />
            <MarkdownEditor
              label="Details"
              name="body"
              defaultValue={event?.body}
              uploadImage={uploadPostImage}
            />
          </FormSection>
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-6">
          <FormSection title="When and where">
            <TextField
              label="Starts (Philippine time)"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={toManilaDateTimeInput(event?.starts_at)}
            />
            <TextField
              label="Ends (Philippine time)"
              name="ends_at"
              type="datetime-local"
              defaultValue={toManilaDateTimeInput(event?.ends_at)}
              hint="Optional."
            />
            <CheckboxField
              label="All-day event"
              name="all_day"
              defaultChecked={event?.all_day}
              hint="Shows dates only, for things like enrollment periods and holidays. The times above are ignored."
            />
            <TextField
              label="Location"
              name="location"
              defaultValue={event?.location}
              placeholder="e.g. CICT Building, Room 301"
            />
          </FormSection>

          <FormSection title="Publishing">
            <SelectField
              label="Status"
              name="status"
              defaultValue={event?.status ?? "draft"}
              options={[
                { value: "draft", label: "Draft (hidden)" },
                { value: "published", label: "Published" },
              ]}
            />
          </FormSection>

          <FormSection title="Cover image">
            <MediaField
              label="Image"
              name="cover_image_url"
              defaultValue={event?.cover_image_url}
            />
          </FormSection>

          <FormSection title="Link">
            <TextField
              label="Slug"
              name="slug"
              defaultValue={event?.slug}
              placeholder="Generated from the title"
              hint="Used in the URL: /events/<slug>. Changing it breaks old links."
            />
          </FormSection>
        </div>
      </div>
    </AdminForm>
  );
}
