import { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { createPost } from "../actions";
import PostForm from "../PostForm";

export const metadata: Metadata = {
  title: "New post",
};

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="New post"
        backHref="/admin/posts"
        backLabel="All posts"
      />
      <PostForm action={createPost} />
    </>
  );
}
