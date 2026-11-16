"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ContentError } from "@/components/ContentState";
import { container } from "@/components/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useContent } from "@/lib/cms/useContent";
import { fetchExhibit } from "@/lib/museum/queries";
import { ExhibitDetail } from "./ExhibitDetail";
import { HowItWorks } from "./HowItWorks";
import { MuseumHero } from "./MuseumHero";
import { ProgramStrip } from "./ProgramStrip";
import { ShareYourWork } from "./ShareYourWork";

const UNAVAILABLE = "This exhibit isn't available any more.";

export function MuseumPage() {
  const router = useRouter();
  const params = useSearchParams();
  const exhibitId = params.get("exhibit");
  const exhibit = useContent(
    exhibitId === null ? null : `exhibit:${exhibitId}`,
    (client) => fetchExhibit(client, exhibitId ?? ""),
  );
  const unavailable =
    exhibitId !== null && exhibit.status === "ready" && exhibit.data === null;
  const work = exhibit.status === "ready" ? exhibit.data : null;

  function closeExhibit() {
    const next = new URLSearchParams(params.toString());
    next.delete("exhibit");
    const query = next.toString();
    router.replace(
      query ? `/programs/bsemc/museum/?${query}` : "/programs/bsemc/museum/",
    );
  }

  return (
    <div className="bg-surface">
      {unavailable ? (
        <div className={`${container} pt-6`}>
          <Alert>
            <AlertDescription>{UNAVAILABLE}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      {exhibitId !== null && exhibit.status === "error" ? (
        <div className={`${container} pt-6`}>
          <ContentError onRetry={exhibit.retry} />
        </div>
      ) : null}

      <MuseumHero />
      <ProgramStrip />
      {/* Anchors for highlights, the 3D hall and browse until those sections land. */}
      <section id="highlights" className="scroll-mt-24" />
      <section id="museum-3d" className="scroll-mt-24" />
      <section id="browse" className="scroll-mt-24" />
      <section id="share" className="bg-surface scroll-mt-24">
        <div
          className={`${container} grid gap-6 py-16 md:py-20 lg:grid-cols-2 lg:gap-8`}
        >
          <ShareYourWork />
          <HowItWorks />
        </div>
      </section>

      {work ? <ExhibitDetail workId={work.id} onClose={closeExhibit} /> : null}
    </div>
  );
}
