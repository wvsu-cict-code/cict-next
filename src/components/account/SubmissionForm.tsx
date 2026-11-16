"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useId, useState } from "react";
import { AuthCard, FormError } from "./AuthCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/session";
import type { StudentWork } from "@/lib/cms/content";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_MEDIA,
  type Category,
} from "@/lib/museum/categories";
import {
  checkImageEdge,
  checkSubmissionFile,
  readImageSize,
  type MediaKind,
} from "@/lib/museum/files";
import { MAX_ACTIVE_WORKS } from "@/lib/museum/limits";
import { capturePoster, readVideoOrientation } from "@/lib/museum/poster";
import {
  QUOTA_MESSAGE,
  countActiveWorks,
  createSubmission,
  listMySubmissions,
  updateSubmission,
  type SubmissionDraft,
} from "@/lib/museum/submissions";
import { getBrowserClient } from "@/lib/supabase/browser";

const IMAGE_HINT = "WebP, up to 5 MB, max 2560 px";
const MEDIA_HINT = "WebM, up to 20 MB";
const APPROVED_EDIT_WARNING =
  "Editing sends this work back for review. It leaves the museum until it's approved again.";

type FieldErrors = {
  image?: string | null;
  media?: string | null;
};

export function SubmissionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const session = useSession();
  const categoryId = useId();

  const [existing, setExisting] = useState<StudentWork | null>(null);
  const [quotaBlocked, setQuotaBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [approvedGate, setApprovedGate] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [description, setDescription] = useState("");
  const [student, setStudent] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [media, setMedia] = useState<File | undefined>();
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (session.status === "signed-out") {
      const next = editId
        ? `/account/submit/?id=${encodeURIComponent(editId)}`
        : "/account/submit/";
      router.replace(
        `/account/sign-in/?next=${encodeURIComponent(next)}`,
      );
    }
  }, [session.status, router, editId]);

  useEffect(() => {
    if (session.status !== "signed-in" || !session.user) return;
    let cancelled = false;
    const client = getBrowserClient();
    const userId = session.user.id;

    (async () => {
      try {
        if (editId) {
          const rows = await listMySubmissions(client, userId);
          if (cancelled) return;
          const work = rows.find((row) => row.id === editId) ?? null;
          if (!work) {
            setError("That submission wasn't found.");
            setReady(true);
            return;
          }
          setExisting(work);
          setTitle(work.title);
          setCategory(work.category);
          setDescription(work.description);
          setStudent(work.student);
          setLiveUrl(work.store_url ?? "");
          setPortfolioUrl(work.portfolio_url ?? "");
          if (work.status === "approved") setApprovedGate(true);
          setReady(true);
          return;
        }
        const count = await countActiveWorks(client, userId);
        if (cancelled) return;
        setQuotaBlocked(count >= MAX_ACTIVE_WORKS);
        setStudent(session.displayName ?? "");
        setReady(true);
      } catch {
        if (!cancelled) {
          setError("Couldn't load the form.");
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session.status, session.user, session.displayName, editId]);

  // Prefill display name once the profile arrives on a new submission.
  useEffect(() => {
    if (editId || !ready || quotaBlocked) return;
    if (session.displayName && !student) setStudent(session.displayName);
  }, [session.displayName, editId, ready, quotaBlocked, student]);

  async function onPickFile(
    file: File | undefined,
    kind: MediaKind,
    field: "image" | "media",
  ) {
    if (!file) {
      if (field === "image") {
        setImage(undefined);
        setImageSize(null);
      } else setMedia(undefined);
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
      return;
    }
    const message = await checkSubmissionFile(file, kind);
    if (message) {
      if (field === "image") {
        setImage(undefined);
        setImageSize(null);
      } else setMedia(undefined);
      setFieldErrors((prev) => ({ ...prev, [field]: message }));
      return;
    }
    if (kind === "image") {
      try {
        const size = await readImageSize(file);
        const edge = checkImageEdge(size);
        if (edge) {
          setImage(undefined);
          setImageSize(null);
          setFieldErrors((prev) => ({ ...prev, image: edge }));
          return;
        }
        setImage(file);
        setImageSize(size);
        setFieldErrors((prev) => ({ ...prev, image: null }));
      } catch {
        setImage(undefined);
        setImageSize(null);
        setFieldErrors((prev) => ({
          ...prev,
          image: "Your browser couldn't read that image.",
        }));
      }
      return;
    }
    setMedia(file);
    setFieldErrors((prev) => ({ ...prev, media: null }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session.user || !category || quotaBlocked || busy) return;
    if (fieldErrors.image || fieldErrors.media) return;

    const kind = CATEGORY_MEDIA[category];
    const draft: SubmissionDraft = {
      title,
      category,
      description,
      student,
      liveUrl: liveUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      image,
      media,
      imageWidth: imageSize?.width,
      imageHeight: imageSize?.height,
    };

    setBusy(true);
    setError(null);
    setProgress(15);

    try {
      if (kind === "video" && media) {
        setProgress(30);
        const [poster, orientation] = await Promise.all([
          capturePoster(media),
          readVideoOrientation(media),
        ]);
        draft.image = new File([poster.blob], "poster.webp", {
          type: "image/webp",
        });
        draft.imageWidth = poster.width;
        draft.imageHeight = poster.height;
        draft.orientation = orientation;
      }

      setProgress(60);
      const client = getBrowserClient();
      if (existing) {
        const result = await updateSubmission(
          client,
          session.user.id,
          existing,
          draft,
        );
        if (result.error) {
          setError(result.error);
          setBusy(false);
          setProgress(0);
          return;
        }
      } else {
        const result = await createSubmission(
          client,
          session.user.id,
          draft,
        );
        if ("error" in result) {
          setError(result.error);
          setBusy(false);
          setProgress(0);
          return;
        }
      }
      setProgress(100);
      router.replace("/account/?submitted=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong saving your work. Try again.",
      );
      setBusy(false);
      setProgress(0);
    }
  }

  if (session.status !== "signed-in") {
    return (
      <AuthCard title={editId ? "Edit submission" : "Submit work"}>
        <p className="text-sm" role="status">
          Loading…
        </p>
      </AuthCard>
    );
  }

  if (!ready) {
    return (
      <AuthCard title={editId ? "Edit submission" : "Submit work"}>
        <p className="text-sm" role="status">
          Loading…
        </p>
      </AuthCard>
    );
  }

  if (approvedGate && existing) {
    return (
      <AuthCard title="Edit submission">
        <Alert>
          <AlertDescription>{APPROVED_EDIT_WARNING}</AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace("/account/")}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => setApprovedGate(false)}>
            Continue editing
          </Button>
        </div>
      </AuthCard>
    );
  }

  const kind = category ? CATEGORY_MEDIA[category] : null;
  const showFiles = !!category && !quotaBlocked;
  const formDisabled = quotaBlocked || busy;

  return (
    <AuthCard title={existing ? "Edit submission" : "Submit work"}>
      {quotaBlocked ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{QUOTA_MESSAGE}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <fieldset disabled={formDisabled} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={categoryId}>Category</Label>
            <Select
              value={category || undefined}
              onValueChange={(value) => {
                setCategory(value as Category);
                setImage(undefined);
                setMedia(undefined);
                setImageSize(null);
                setFieldErrors({});
              }}
              disabled={!!existing}
            >
              <SelectTrigger
                id={categoryId}
                className="w-full"
                aria-label="Category"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Display name</Label>
            <Input
              id="student"
              name="student"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              required
            />
          </div>

          {showFiles && kind === "cover_link" ? (
            <>
              <FileField
                id="cover"
                label="Cover"
                hint={IMAGE_HINT}
                accept=".webp,image/webp"
                error={fieldErrors.image}
                onChange={(file) => void onPickFile(file, "image", "image")}
              />
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live link</Label>
                <Input
                  id="liveUrl"
                  name="liveUrl"
                  type="url"
                  placeholder="https://"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                />
              </div>
            </>
          ) : null}

          {showFiles && kind === "image" ? (
            <FileField
              id="artwork"
              label="Artwork"
              hint={IMAGE_HINT}
              accept=".webp,image/webp"
              error={fieldErrors.image}
              onChange={(file) => void onPickFile(file, "image", "image")}
            />
          ) : null}

          {showFiles && kind === "video" ? (
            <FileField
              id="video"
              label="Video"
              hint={MEDIA_HINT}
              accept=".webm,video/webm"
              error={fieldErrors.media}
              onChange={(file) => void onPickFile(file, "video", "media")}
            />
          ) : null}

          {showFiles && kind === "audio" ? (
            <>
              <FileField
                id="audio"
                label="Audio"
                hint={MEDIA_HINT}
                accept=".webm,audio/webm,video/webm"
                error={fieldErrors.media}
                onChange={(file) => void onPickFile(file, "audio", "media")}
              />
              <FileField
                id="cover"
                label="Cover"
                hint={IMAGE_HINT}
                accept=".webp,image/webp"
                error={fieldErrors.image}
                onChange={(file) => void onPickFile(file, "image", "image")}
              />
            </>
          ) : null}

          {showFiles ? (
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio link (optional)</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                type="url"
                placeholder="https://"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
          ) : null}
        </fieldset>

        {busy ? (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-muted-foreground text-xs" role="status">
              Submitting…
            </p>
          </div>
        ) : null}

        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={formDisabled}>
          {existing ? "Save changes" : "Submit for review"}
        </Button>
      </form>
    </AuthCard>
  );
}

function FileField({
  id,
  label,
  hint,
  accept,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  error?: string | null;
  onChange: (file: File | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0])}
      />
      <p className="text-muted-foreground text-xs">{hint}</p>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
