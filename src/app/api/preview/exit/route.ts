import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  (await draftMode()).disable();

  const safeUrl =
    url && url.startsWith("/") && !url.startsWith("//") ? url : "/";
  redirect(safeUrl);
}
