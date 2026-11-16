import type { ContentClient } from "@/lib/cms/content";
import type { Photo } from "@/lib/photos";
import {
  checkImageFile,
  DISPLAY_MAX,
  renderEncoded,
  uploadBlob,
} from "@/lib/studentWorks/images";

/**
 * Resizes a photo in the browser (at most DISPLAY_MAX on the long edge) and
 * uploads it to storage for a post or event gallery.
 */
export async function uploadPhoto(
  client: ContentClient,
  file: File,
  folder: "posts" | "events",
): Promise<Photo> {
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("That image couldn't be read. Try a different file.");
  }

  try {
    const encoded = await renderEncoded(bitmap, DISPLAY_MAX);
    const ext = encoded.blob.type === "image/webp" ? "webp" : "jpg";
    const url = await uploadBlob(
      client,
      `${folder}/photos/${crypto.randomUUID()}.${ext}`,
      encoded.blob,
    );
    return { url, width: encoded.width, height: encoded.height, alt: "" };
  } finally {
    bitmap.close();
  }
}
