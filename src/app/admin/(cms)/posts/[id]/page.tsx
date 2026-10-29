import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import PageHeader, { Card } from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { previewLabel } from "@/lib/cms/content";
import { newsHref } from "@/lib/news";
import { siteUrl } from "@/lib/site";
import { deletePost, updatePost } from "../actions";
import PostForm from "../PostForm";

export const metadata: Metadata = {
  title: "Edit post",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditPostPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();

  // Posts visitors can't see yet are previewed on this (CMS) deployment,
  // where the admin's session can read them
  const isPreview = previewLabel(post) !== null;
  const viewHref = isPreview
    ? newsHref(post.slug)
    : siteUrl(newsHref(post.slug));

  return (
    <>
      <PageHeader
        title="Edit post"
        backHref="/admin/posts"
        backLabel="All posts"
        actions={
          <>
            <a
              href={viewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
            >
              {isPreview ? "Preview ↗" : "View on site ↗"}
            </a>
            <DeleteButton
              action={deletePost.bind(null, post.id)}
              confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
            />
          </>
        }
      />
      {saved && <SavedNotice />}
      <Card>
        <PostForm post={post} action={updatePost.bind(null, post.id)} />
      </Card>
    </>
  );
}
