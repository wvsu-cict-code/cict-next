"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StudentWork } from "@/lib/cms/content";
import { CATEGORY_SINGULAR } from "@/lib/museum/categories";
import {
  deleteSubmission,
  listMySubmissions,
} from "@/lib/museum/submissions";
import { getBrowserClient } from "@/lib/supabase/browser";

const APPROVED_EDIT_WARNING =
  "Editing sends this work back for review. It leaves the museum until it's approved again.";

type ConfirmKind = "withdraw" | "delete" | "edit-approved";

export function MySubmissions({ userId }: { userId: string }) {
  const [works, setWorks] = useState<StudentWork[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind;
    work: StudentWork;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const rows = await listMySubmissions(getBrowserClient(), userId);
      setWorks(rows);
      setError(null);
    } catch {
      setError("Couldn't load your works.");
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function confirmAction() {
    if (!confirm) return;
    if (confirm.kind === "edit-approved") return;
    setBusy(true);
    const result = await deleteSubmission(getBrowserClient(), confirm.work);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      setConfirm(null);
      return;
    }
    setConfirm(null);
    await reload();
  }

  if (works === null && !error) {
    return (
      <p className="text-sm" role="status">
        Loading your submissions…
      </p>
    );
  }

  if (error && works === null) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">My submissions</h2>
        <Button asChild size="sm">
          <Link href="/account/submit/">Submit work</Link>
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      {works && works.length === 0 ? (
        <p className="text-sm">You haven&apos;t submitted any work yet.</p>
      ) : (
        <ul className="space-y-3">
          {works?.map((work) => (
            <li
              key={work.id}
              className="border-rule flex gap-3 rounded-lg border p-3"
            >
              <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded">
                {work.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={work.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{work.title}</p>
                  <StatusBadge work={work} />
                </div>
                <p className="text-muted-foreground text-xs">
                  {CATEGORY_SINGULAR[work.category]}
                </p>
                {work.status === "rejected" && work.rejection_reason ? (
                  <p className="text-destructive text-sm">
                    {work.rejection_reason}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  {work.status === "approved" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setConfirm({ kind: "edit-approved", work })
                      }
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/account/submit/?id=${work.id}`}>Edit</Link>
                    </Button>
                  )}
                  {work.status === "pending" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirm({ kind: "withdraw", work })}
                    >
                      Withdraw
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirm({ kind: "delete", work })}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-muted-foreground text-sm">
        You can have up to 5 works in the museum or waiting for review.
      </p>

      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.kind === "withdraw"
                ? "Withdraw this submission?"
                : confirm?.kind === "delete"
                  ? "Delete this work?"
                  : "Edit an approved work?"}
            </DialogTitle>
            <DialogDescription>
              {confirm?.kind === "edit-approved"
                ? APPROVED_EDIT_WARNING
                : confirm?.kind === "withdraw"
                  ? "This removes the submission and its files. You can't undo this."
                  : "This permanently removes the work and its files."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirm(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            {confirm?.kind === "edit-approved" ? (
              <Button asChild>
                <Link href={`/account/submit/?id=${confirm.work.id}`}>
                  Continue editing
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => void confirmAction()}
              >
                {confirm?.kind === "withdraw"
                  ? "Confirm withdraw"
                  : "Confirm delete"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ work }: { work: StudentWork }) {
  if (work.status === "pending") {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (work.status === "approved") {
    return (
      <Badge
        asChild
        className="bg-emerald-700 text-white hover:bg-emerald-700/90"
      >
        <Link href={`/programs/bsemc/museum/?exhibit=${work.id}`}>
          Approved
        </Link>
      </Badge>
    );
  }
  return <Badge variant="destructive">Rejected</Badge>;
}
