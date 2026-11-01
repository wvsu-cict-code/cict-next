import type { TablesInsert } from "@/lib/supabase/database.types";
import { isWebUrl } from "@/lib/studentWorks/links";
import { parseYouTubeUrl } from "@/lib/studentWorks/youtube";

export type UploadedWorkImage = {
  image_url: string;
  image_width: number;
  image_height: number;
  zoom_url: string | null;
  zoom_width: number | null;
  zoom_height: number | null;
  original_url: string;
};

export type StudentWorkValues = Omit<
  TablesInsert<"student_works">,
  "id" | "sort_order" | "created_at" | "updated_at"
>;

const KINDS = ["art", "game", "video"] as const;
const IMAGE_ERROR = "The image upload didn't finish. Upload it again.";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function positive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function parseImage(raw: string): UploadedWorkImage | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!json || typeof json !== "object") return null;
  const v = json as Record<string, unknown>;
  if (
    typeof v.image_url !== "string" ||
    !v.image_url ||
    typeof v.original_url !== "string" ||
    !positive(v.image_width) ||
    !positive(v.image_height)
  ) {
    return null;
  }
  const hasZoom = v.zoom_url != null;
  if (hasZoom) {
    if (
      typeof v.zoom_url !== "string" ||
      !positive(v.zoom_width) ||
      !positive(v.zoom_height)
    ) {
      return null;
    }
  } else if (v.zoom_width != null || v.zoom_height != null) {
    return null;
  }
  return {
    image_url: v.image_url,
    image_width: v.image_width,
    image_height: v.image_height,
    zoom_url: hasZoom ? (v.zoom_url as string) : null,
    zoom_width: hasZoom ? (v.zoom_width as number) : null,
    zoom_height: hasZoom ? (v.zoom_height as number) : null,
    original_url: v.original_url,
  };
}

export function parseStudentWork(
  formData: FormData,
): { values: StudentWorkValues } | { error: string } {
  const title = text(formData, "title");
  if (!title) return { error: "Enter a title." };
  const student = text(formData, "student");
  if (!student) return { error: "Enter the student's or team's name." };
  const description = text(formData, "description");
  if (!description) return { error: "Enter a short description." };

  const kind = KINDS.find((k) => k === text(formData, "kind"));
  if (!kind) return { error: "Choose a type." };

  const rawImage = text(formData, "image");
  let image: UploadedWorkImage | null = null;
  if (rawImage) {
    image = parseImage(rawImage);
    if (!image) return { error: IMAGE_ERROR };
  }

  let youtubeId: string | null = null;
  let orientation: "vertical" | "landscape" | null = null;
  let storeUrl: string | null = null;

  if (kind === "art" && !image) return { error: "Upload the artwork." };
  if (kind === "game") {
    if (!image) return { error: "Upload a screenshot of the game." };
    const store = text(formData, "store_url");
    if (!isWebUrl(store)) {
      return {
        error:
          "Enter the link where the game is published (itch.io, Google Play, App Store…).",
      };
    }
    storeUrl = store;
  }
  if (kind === "video") {
    const parsed = parseYouTubeUrl(text(formData, "youtube_url"));
    if (!parsed) return { error: "Enter a YouTube link to the video." };
    youtubeId = parsed.id;
    const chosen = text(formData, "orientation");
    orientation =
      chosen === "vertical" || chosen === "landscape"
        ? chosen
        : parsed.isShort
          ? "vertical"
          : "landscape";
  }

  const portfolio = text(formData, "portfolio_url");
  if (portfolio && !isWebUrl(portfolio)) {
    return { error: "The portfolio link must start with http:// or https://." };
  }

  const keepZoom = kind !== "video";
  return {
    values: {
      kind,
      title,
      student,
      description,
      image_url: image?.image_url ?? null,
      image_width: image?.image_width ?? null,
      image_height: image?.image_height ?? null,
      zoom_url: keepZoom ? (image?.zoom_url ?? null) : null,
      zoom_width: keepZoom ? (image?.zoom_width ?? null) : null,
      zoom_height: keepZoom ? (image?.zoom_height ?? null) : null,
      original_url: image?.original_url ?? null,
      youtube_id: youtubeId,
      orientation,
      store_url: storeUrl,
      portfolio_url: portfolio || null,
      visible: formData.get("visible") === "on",
    },
  };
}
