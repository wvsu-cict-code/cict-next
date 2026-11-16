import { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminForm from "@/components/admin/AdminForm";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import PageHeader, {
  FormSection,
  SecondaryLink,
} from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { requireAdmin } from "@/lib/cms/auth";
import { siteUrl } from "@/lib/site";
import { uploadPostImage } from "../../posts/actions";
import { updatePage } from "../actions";

export const metadata: Metadata = {
  title: "Edit page",
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditPagePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!page) notFound();

  // Drafts are previewed on this (CMS) deployment, where the admin's session
  // can read them
  const isDraft = page.status === "draft";
  const viewHref = isDraft ? `/${page.slug}` : siteUrl(`/${page.slug}`);

  return (
    <>
      <PageHeader
        title={`Edit ${page.title}`}
        backHref="/admin/pages"
        backLabel="All pages"
        actions={
          <SecondaryLink href={viewHref} icon="eye" external>
            {isDraft ? "Preview" : "View on site"}
          </SecondaryLink>
        }
      />
      {saved && <SavedNotice />}
      {/* Keyed on updated_at so a save remounts the form with fresh values */}
      <AdminForm
        key={page.updated_at}
        action={updatePage.bind(null, page.slug)}
        submitLabel="Save changes"
      >
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
            <FormSection title="Content">
              <TextField
                label="Title"
                name="title"
                required
                defaultValue={page.title}
              />
              <TextAreaField
                label="Summary"
                name="summary"
                rows={3}
                defaultValue={page.summary}
                hint="Shown under the title at the top of the page."
              />
              <MarkdownEditor
                label="Body"
                name="body"
                defaultValue={page.body}
                uploadImage={uploadPostImage}
              />
            </FormSection>
          </div>

          <div className="min-w-0 space-y-6 lg:sticky lg:top-6">
            <FormSection title="Publishing">
              <SelectField
                label="Status"
                name="status"
                defaultValue={page.status}
                options={[
                  { value: "draft", label: "Draft (hidden)" },
                  { value: "published", label: "Published" },
                ]}
                hint="While this is a draft, visitors see a short holding note instead of this text."
              />
            </FormSection>
          </div>
        </div>
      </AdminForm>
    </>
  );
}
