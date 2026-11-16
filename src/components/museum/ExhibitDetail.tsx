"use client";

import { WorkSpotlight } from "@/components/studentWorks/WorkSpotlight";
import { useContent } from "@/lib/cms/useContent";
import { fetchExhibit } from "@/lib/museum/queries";

function stayOnExhibit() {}

async function noMoreWorks() {
  return false;
}

/** One exhibit from a share link, in the same spotlight as the works wall. */
export function ExhibitDetail({
  workId,
  onClose,
}: {
  workId: string;
  onClose(): void;
}) {
  const result = useContent(`exhibit:${workId}`, (client) =>
    fetchExhibit(client, workId),
  );
  const work = result.status === "ready" ? result.data : null;
  if (!work) return null;

  return (
    <WorkSpotlight
      works={[work]}
      total={1}
      index={0}
      onIndexChange={stayOnExhibit}
      onClose={onClose}
      loadMore={noMoreWorks}
    />
  );
}
