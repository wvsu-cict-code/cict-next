import AdminForm from "@/components/admin/AdminForm";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import MediaField from "@/components/admin/MediaField";
import SdgPicker from "@/components/admin/SdgPicker";
import { FormSection } from "@/components/admin/PageHeader";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { toManilaDateTimeInput } from "@/lib/cms/dates";
import type { FormState } from "@/lib/cms/forms";
import type { Post } from "@/lib/cms/content";
import { uploadPostImage } from "./actions";

interface PostFormProps {
  post?: Post;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

export default function PostForm({ post, action }: PostFormProps) {
  return (
    // Keyed on updated_at so a save remounts the form with fresh values
    <AdminForm
      key={post?.updated_at}
      action={action}
      submitLabel={post ? "Save changes" : "Create post"}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <FormSection title="Content">
            <TextField
              label="Title"
              name="title"
              required
              defaultValue={post?.title}
            />
            <TextAreaField
              label="Summary"
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt}
              hint="Shown on news cards and used as the search-engine description."
            />
            <MarkdownEditor
              label="Body"
              name="body"
              defaultValue={post?.body}
              uploadImage={uploadPostImage}
            />
          </FormSection>

          <FormSection
            title="Sustainable Development Goals"
            description="Pick the goals this post supports. They show as icons on the post's cards and at the end of the article."
          >
            <SdgPicker defaultValue={post?.sdgs} />
          </FormSection>
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-6">
          <FormSection title="Publishing">
            <SelectField
              label="Status"
              name="status"
              defaultValue={post?.status ?? "draft"}
              options={[
                { value: "draft", label: "Draft (hidden)" },
                { value: "published", label: "Published" },
              ]}
            />
            <TextField
              label="Publish date (Philippine time)"
              name="published_at"
              type="datetime-local"
              defaultValue={toManilaDateTimeInput(post?.published_at)}
              hint="Leave empty to publish now. A future date schedules the post."
            />
            <SelectField
              label="Type"
              name="category"
              defaultValue={post?.category ?? "news"}
              options={[
                { value: "news", label: "News article" },
                { value: "announcement", label: "Announcement" },
              ]}
              hint="Announcements appear in the carousel on the News page."
            />
            <CheckboxField
              label="Feature on the home page"
              name="is_featured"
              defaultChecked={post?.is_featured}
              hint="The newest featured post fills the large card on the home page."
            />
          </FormSection>

          <FormSection title="Cover image">
            <MediaField
              label="Image"
              name="cover_image_url"
              defaultValue={post?.cover_image_url}
            />
          </FormSection>

          <FormSection title="Link">
            <TextField
              label="Slug"
              name="slug"
              defaultValue={post?.slug}
              placeholder="Generated from the title"
              hint="Used in the URL: /news-announcements/news/<slug>. Changing it breaks old links."
            />
          </FormSection>
        </div>
      </div>
    </AdminForm>
  );
}
