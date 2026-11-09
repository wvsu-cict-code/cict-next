import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type FormState = { error?: string } | undefined;

/** Thrown for problems the editor can fix; shown above the form. */
export class FormError extends Error {}

/**
 * Runs a form action, turning FormErrors into `{ error }` state. Anything
 * else (including Next's redirect() signal) is re-thrown.
 */
export async function handleForm(run: () => Promise<void>): Promise<FormState> {
  try {
    await run();
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}

export function requireValue(value: string, message: string) {
  if (!value) throw new FormError(message);
  return value;
}

/** Throws a FormError for a failed Supabase write. */
export function assertDbOk(error: { code?: string; message: string } | null) {
  if (error) throw new FormError(describeDbError(error));
}

const MEDIA_BUCKET = "media";
const MANILA_OFFSET = "+08:00";

export function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function getOptionalString(formData: FormData, name: string) {
  return getString(formData, name) || null;
}

export function getNumber(formData: FormData, name: string, fallback = 0) {
  const value = Number(getString(formData, name));
  return Number.isFinite(value) ? value : fallback;
}

export function getBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

/** `<input type="datetime-local">` values are entered in Philippine time. */
export function parseManilaDateTime(value: string) {
  if (!value) return null;
  const date = new Date(`${value}:00${MANILA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Resolves a media field rendered by <MediaField>: an uploaded file wins,
 * then the URL text box, and the "remove" checkbox clears it.
 */
export async function resolveMediaField(
  supabase: SupabaseClient<Database>,
  formData: FormData,
  name: string,
  folder: string,
) {
  if (getBoolean(formData, `${name}_remove`)) return null;

  const file = formData.get(`${name}_file`);
  if (file instanceof File && file.size > 0) {
    return uploadMedia(supabase, file, folder);
  }

  return getOptionalString(formData, name);
}

export async function uploadMedia(
  supabase: SupabaseClient<Database>,
  file: File,
  folder: string,
) {
  const extension = file.name.includes(".")
    ? file.name
        .split(".")
        .pop()!
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    : "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new FormError(`Upload failed: ${error.message}`);

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function describeDbError(error: { code?: string; message: string }) {
  if (error.code === "23505")
    return "That slug/ID is already in use. Pick another one.";
  if (error.code === "23514") {
    return "Slugs/IDs may only contain lowercase letters, numbers and single dashes.";
  }
  if (error.code === "42501") return "You don't have permission to do that.";
  // A column the form saves isn't in the database yet
  if (error.code === "PGRST204") {
    return "The database is missing a field this form saves. Apply the latest database migrations, then try again.";
  }
  return error.message;
}
