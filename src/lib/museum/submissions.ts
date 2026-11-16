import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { StudentWork } from "@/lib/cms/content";
import { isWebUrl } from "@/lib/studentWorks/links";
import { CATEGORY_MEDIA, type Category } from "./categories";
import { SUBMISSIONS_BUCKET } from "./limits";

type Client = SupabaseClient<Database>;

/**
 * What the submit form collects. `image` is the cover, artwork or poster;
 * `media` is the webm video or audio. For video categories the caller
 * captures the poster into `image` before calling createSubmission and passes
 * the video's `orientation`. `imageWidth`/`imageHeight` describe `image`.
 */
export type SubmissionDraft = {
  title: string;
  category: Category;
  description: string;
  student: string;
  liveUrl?: string;
  portfolioUrl?: string;
  image?: File;
  media?: File;
  imageWidth?: number;
  imageHeight?: number;
  orientation?: "landscape" | "vertical";
};

export const QUOTA_MESSAGE =
  "You already have 5 works in the museum or waiting for review. Withdraw or delete one to submit another.";
const GENERIC_ERROR = "Something went wrong saving your work. Try again.";

/**
 * Checks the draft against the category's requirements. When editing, pass
 * the existing work: files it already has count as present.
 */
export function validateDraft(
  draft: SubmissionDraft,
  existing?: StudentWork,
): string | null {
  if (!draft.title.trim()) return "Add a title.";
  if (!draft.description.trim()) return "Add a description.";
  if (!draft.student.trim()) return "Add your name.";
  const kind = CATEGORY_MEDIA[draft.category];
  const hasImage = !!draft.image || !!existing?.image_url;
  const hasMedia =
    !!draft.media ||
    (kind === "video" ? !!existing?.video_url : !!existing?.audio_url);
  const live = draft.liveUrl?.trim();
  if (kind === "cover_link") {
    if (!hasImage) return "Add a cover image.";
    if (!live || !isWebUrl(live)) return "Add a link starting with http:// or https://.";
  } else if (live && !isWebUrl(live)) {
    return "Add a link starting with http:// or https://.";
  }
  if (kind === "image" && !hasImage) return "Add your artwork.";
  if (kind === "video" && !hasMedia) return "Add your video.";
  if (kind === "audio") {
    if (!hasMedia) return "Add your audio.";
    if (!hasImage) return "Add a cover image.";
  }
  const portfolio = draft.portfolioUrl?.trim();
  if (portfolio && !isWebUrl(portfolio))
    return "Add a portfolio link starting with http:// or https://.";
  return null;
}

const PUBLIC_MARKER = `/storage/v1/object/public/${SUBMISSIONS_BUCKET}/`;

function pathOf(url: string | null): string | null {
  if (!url) return null;
  const at = url.indexOf(PUBLIC_MARKER);
  return at === -1 ? null : url.slice(at + PUBLIC_MARKER.length);
}

/** Object paths of the work's files held in the submissions bucket. */
export function submissionPaths(
  work: Pick<StudentWork, "image_url" | "video_url" | "audio_url">,
): string[] {
  return [work.image_url, work.video_url, work.audio_url]
    .map(pathOf)
    .filter((path): path is string => path !== null);
}

export async function countActiveWorks(
  client: Client,
  userId: string,
): Promise<number> {
  const { count, error } = await client
    .from("student_works")
    .select("id", { count: "exact", head: true })
    .eq("submitted_by", userId)
    .in("status", ["pending", "approved"]);
  if (error) throw new Error("Couldn't count your works.");
  return count ?? 0;
}

export async function listMySubmissions(
  client: Client,
  userId: string,
): Promise<StudentWork[]> {
  const { data, error } = await client
    .from("student_works")
    .select("*")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Couldn't load your works.");
  return data ?? [];
}

function messageFor(error: { code?: string; message?: string }): string {
  return error.code === "P0001" && error.message?.includes("quota_reached")
    ? QUOTA_MESSAGE
    : GENERIC_ERROR;
}

function extensionOf(file: File, fallback: string): string {
  return file.type === "image/webp" ? "webp" : fallback;
}

async function upload(
  client: Client,
  folder: string,
  file: File,
  ext: string,
  contentType: string,
  uploaded: string[],
): Promise<string | null> {
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from(SUBMISSIONS_BUCKET)
    .upload(path, file, { contentType });
  if (error) return null;
  uploaded.push(path);
  return client.storage.from(SUBMISSIONS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

async function cleanup(client: Client, paths: string[]) {
  if (paths.length === 0) return;
  try {
    await client.storage.from(SUBMISSIONS_BUCKET).remove(paths);
  } catch {
    // Orphaned files are harmless; the original error is what matters.
  }
}

type MediaColumns = {
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  video_url: string | null;
  audio_url: string | null;
  orientation: "landscape" | "vertical" | null;
};

/**
 * Uploads the draft's new files and works out the media columns. `current`
 * holds the existing work's values when editing (kept unless replaced).
 */
async function prepareMedia(
  client: Client,
  folder: string,
  draft: SubmissionDraft,
  current: StudentWork | null,
  uploaded: string[],
): Promise<MediaColumns | null> {
  const kind = CATEGORY_MEDIA[draft.category];
  const cols: MediaColumns = {
    image_url: current?.image_url ?? null,
    image_width: current?.image_width ?? null,
    image_height: current?.image_height ?? null,
    video_url: kind === "video" ? (current?.video_url ?? null) : null,
    audio_url: kind === "audio" ? (current?.audio_url ?? null) : null,
    orientation:
      kind === "video"
        ? (draft.orientation ?? current?.orientation ?? null)
        : null,
  };
  if (draft.image) {
    const url = await upload(
      client,
      folder,
      draft.image,
      extensionOf(draft.image, "webp"),
      "image/webp",
      uploaded,
    );
    if (!url) return null;
    cols.image_url = url;
    cols.image_width = draft.imageWidth ?? null;
    cols.image_height = draft.imageHeight ?? null;
  }
  if (draft.media && (kind === "video" || kind === "audio")) {
    const url = await upload(
      client,
      folder,
      draft.media,
      "webm",
      kind === "video" ? "video/webm" : "audio/webm",
      uploaded,
    );
    if (!url) return null;
    if (kind === "video") cols.video_url = url;
    else cols.audio_url = url;
  }
  return cols;
}

function fieldsOf(draft: SubmissionDraft) {
  const isLink = CATEGORY_MEDIA[draft.category] === "cover_link";
  return {
    title: draft.title.trim(),
    category: draft.category,
    description: draft.description.trim(),
    student: draft.student.trim(),
    store_url: isLink ? draft.liveUrl?.trim() || null : null,
    portfolio_url: draft.portfolioUrl?.trim() || null,
  };
}

export async function createSubmission(
  client: Client,
  userId: string,
  draft: SubmissionDraft,
): Promise<{ id: string } | { error: string }> {
  const invalid = validateDraft(draft);
  if (invalid) return { error: invalid };
  const id = crypto.randomUUID();
  const uploaded: string[] = [];
  try {
    const media = await prepareMedia(
      client,
      `${userId}/${id}`,
      draft,
      null,
      uploaded,
    );
    if (!media) {
      await cleanup(client, uploaded);
      return { error: GENERIC_ERROR };
    }
    if (CATEGORY_MEDIA[draft.category] === "video" && !media.image_url) {
      await cleanup(client, uploaded);
      return { error: "Add a poster image for your video." };
    }
    const { error } = await client.from("student_works").insert({
      id,
      submitted_by: userId,
      visible: true,
      ...fieldsOf(draft),
      ...media,
    });
    if (error) {
      await cleanup(client, uploaded);
      return { error: messageFor(error) };
    }
    return { id };
  } catch {
    await cleanup(client, uploaded);
    return { error: GENERIC_ERROR };
  }
}

export async function updateSubmission(
  client: Client,
  userId: string,
  work: StudentWork,
  draft: SubmissionDraft,
): Promise<{ error?: string }> {
  const invalid = validateDraft(draft, work);
  if (invalid) return { error: invalid };
  const uploaded: string[] = [];
  try {
    const media = await prepareMedia(
      client,
      `${userId}/${work.id}`,
      draft,
      work,
      uploaded,
    );
    if (!media) {
      await cleanup(client, uploaded);
      return { error: GENERIC_ERROR };
    }
    const { error } = await client
      .from("student_works")
      .update({ ...fieldsOf(draft), ...media })
      .eq("id", work.id)
      .eq("submitted_by", userId);
    if (error) {
      await cleanup(client, uploaded);
      return { error: messageFor(error) };
    }
    const kept = new Set(submissionPaths(media));
    await cleanup(
      client,
      submissionPaths(work).filter((path) => !kept.has(path)),
    );
    return {};
  } catch {
    await cleanup(client, uploaded);
    return { error: GENERIC_ERROR };
  }
}

export async function deleteSubmission(
  client: Client,
  work: StudentWork,
): Promise<{ error?: string }> {
  const { error } = await client
    .from("student_works")
    .delete()
    .eq("id", work.id);
  if (error) return { error: GENERIC_ERROR };
  await cleanup(client, submissionPaths(work));
  return {};
}

