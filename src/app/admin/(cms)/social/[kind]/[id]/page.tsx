import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import Composer from "@/components/admin/social/Composer";
import { requireAdmin } from "@/lib/cms/auth";
import { parsePhotos } from "@/lib/photos";
import type { PackSource } from "@/lib/socialPack/pack";

export const metadata: Metadata = {
  title: "Export for social media",
};

interface PageProps {
  params: Promise<{ kind: string; id: string }>;
}

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function loadPost(
  supabase: Supabase,
  id: string,
): Promise<PackSource | null> {
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!post) return null;
  return {
    kind: "post",
    slug: post.slug,
    title: post.title,
    summary: post.excerpt ?? "",
    date: post.published_at ?? post.created_at,
    body: post.body,
    coverImageUrl: post.cover_image_url,
    photos: parsePhotos(post.photos),
  };
}

async function loadEvent(
  supabase: Supabase,
  id: string,
): Promise<PackSource | null> {
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!event) return null;
  return {
    kind: "event",
    slug: event.slug,
    title: event.title,
    summary: event.summary ?? "",
    date: event.starts_at,
    body: event.body,
    coverImageUrl: event.cover_image_url,
    photos: parsePhotos(event.photos),
  };
}

const loaders = { posts: loadPost, events: loadEvent };

export default async function SocialExportPage({ params }: PageProps) {
  const { kind, id } = await params;
  if (kind !== "posts" && kind !== "events") notFound();
  const { supabase } = await requireAdmin();

  const source = await loaders[kind](supabase, id);
  if (!source) notFound();

  return (
    <>
      <PageHeader
        title="Export for social media"
        description={`Build a Facebook-ready pack for "${source.title}": a two-part cover, one image per photo and the caption, downloaded as a zip.`}
        backHref={`/admin/${kind}/${id}`}
        backLabel={kind === "posts" ? "Back to post" : "Back to event"}
      />
      <Composer source={source} />
    </>
  );
}
