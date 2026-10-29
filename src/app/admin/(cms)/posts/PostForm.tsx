import AdminForm from "@/components/admin/AdminForm";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import MediaField from "@/components/admin/MediaField";
import {
  CheckboxField,
  FieldGrid,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { toManilaDateTimeInput } from "@/lib/cms/dates";
import type { FormState } from "@/lib/cms/forms";
import type { Post } from "@/lib/cms/queries";
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
      <TextField
        label="Title"
        name="title"
        required
        defaultValue={post?.title}
      />

      <FieldGrid>
        <TextField
          label="Slug"
          name="slug"
          defaultValue={post?.slug}
          placeholder="Generated from the title"
          hint="Used in the URL: /news-announcements/news/<slug>. Changing it breaks old links."
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
      </FieldGrid>

      <CheckboxField
        label="Feature on the home page"
        name="is_featured"
        defaultChecked={post?.is_featured}
        hint="The newest featured post fills the large card on the home page."
      />

      <TextAreaField
        label="Summary"
        name="excerpt"
        rows={3}
        defaultValue={post?.excerpt}
        hint="Shown on news cards and used as the search-engine description."
      />

      <MediaField
        label="Cover image"
        name="cover_image_url"
        defaultValue={post?.cover_image_url}
      />

      <MarkdownEditor
        label="Body"
        name="body"
        defaultValue={post?.body}
        uploadImage={uploadPostImage}
      />
    </AdminForm>
  );
}
