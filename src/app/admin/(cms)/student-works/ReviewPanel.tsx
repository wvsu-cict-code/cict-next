"use client";

import { useState } from "react";
import { buttonClass } from "@/components/admin/PageHeader";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StudentWork } from "@/lib/cms/content";
import { isWebUrl } from "@/lib/studentWorks/links";

type Result = Promise<{ error?: string }>;

const REASON_REQUIRED = "Give the student a reason.";

export default function ReviewPanel({
  work,
  onApprove,
  onReject,
}: {
  work: StudentWork;
  onApprove(id: string): Result;
  onReject(id: string, reason: string): Result;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const links = [work.store_url, work.portfolio_url].filter(
    (url): url is string => !!url && isWebUrl(url),
  );

  async function approve() {
    setError(null);
    setPending(true);
    const result = await onApprove(work.id);
    setPending(false);
    if (result.error) setError(result.error);
  }

  async function reject() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError(REASON_REQUIRED);
      return;
    }
    setError(null);
    setPending(true);
    const result = await onReject(work.id, trimmed);
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <section className="border-rule mb-8 rounded-2xl border bg-white p-4 sm:p-6">
      <h2 className="text-ink text-lg font-medium">Review submission</h2>
      <div className="mt-4 space-y-4">
        {work.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.image_url}
            alt=""
            className="bg-paper max-h-80 w-full rounded-lg object-contain"
          />
        )}
        {work.video_url && (
          <video
            controls
            src={work.video_url}
            poster={work.image_url ?? undefined}
            className="bg-paper max-h-80 w-full rounded-lg"
          />
        )}
        {work.audio_url && <audio controls src={work.audio_url} className="w-full" />}
        {links.length > 0 && (
          <ul className="space-y-1 text-sm">
            {links.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  className="text-theme-red break-all underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={buttonClass.primary}
          disabled={pending}
          onClick={() => void approve()}
        >
          Approve
        </button>
        <button
          type="button"
          className={buttonClass.danger}
          disabled={pending}
          onClick={() => {
            if (!rejecting) {
              setError(null);
              setRejecting(true);
              return;
            }
            void reject();
          }}
        >
          {rejecting ? "Reject submission" : "Reject"}
        </button>
      </div>

      {rejecting && (
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="rejection-reason">Reason</Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
          />
        </div>
      )}
    </section>
  );
}
