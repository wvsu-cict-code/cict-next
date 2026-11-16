import type { StudentWork } from "@/lib/cms/content";

export function exhibitUrl(id: string, origin: string): string {
  return `${origin}/programs/bsemc/museum/?exhibit=${id}`;
}

export async function shareExhibit(
  work: Pick<StudentWork, "id" | "title">,
  origin: string,
): Promise<"shared" | "copied" | "failed"> {
  const url = exhibitUrl(work.id, origin);
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: work.title, url });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "failed";
    }
  }
  try {
    if (typeof navigator.clipboard?.writeText !== "function") return "failed";
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
