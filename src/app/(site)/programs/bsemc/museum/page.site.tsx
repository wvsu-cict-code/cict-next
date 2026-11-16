import type { Metadata } from "next";
import { Suspense } from "react";
import { MuseumPage } from "@/components/museum/MuseumPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Virtual Museum",
  ...pageMetadata({
    title: "Virtual Museum | WVSU CICT",
    description:
      "A digital gallery of creative works by the BSEMC community — games, animations, films, interactive media, and more.",
    path: "/programs/bsemc/museum",
  }),
};

export default function VirtualMuseumPage() {
  return (
    <Suspense fallback={null}>
      <MuseumPage />
    </Suspense>
  );
}
