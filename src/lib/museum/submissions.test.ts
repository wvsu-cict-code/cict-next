import { describe, expect, it } from "vitest";
import type { StudentWork } from "@/lib/cms/content";
import {
  createSubmission,
  deleteSubmission,
  submissionPaths,
  updateSubmission,
  validateDraft,
  type SubmissionDraft,
} from "./submissions";

const ORIGIN = "http://localhost:54321";
const PUB = `${ORIGIN}/storage/v1/object/public/submissions/`;
const USER = "user-1";

function mockClient(opts: {
  dbError?: { code: string; message: string } | null;
  uploadError?: boolean;
} = {}) {
  const calls: string[] = [];
  const uploads: { path: string; contentType?: string }[] = [];
  const removed: string[][] = [];
  let row: Record<string, unknown> | null = null;
  const result = () => ({ error: opts.dbError ?? null });
  const client = {
    storage: {
      from: () => ({
        upload: async (
          path: string,
          _f: File,
          o: { contentType?: string },
        ) => {
          calls.push("upload");
          uploads.push({ path, contentType: o.contentType });
          return { error: opts.uploadError ? new Error("x") : null };
        },
        remove: async (paths: string[]) => {
          calls.push("remove");
          removed.push(paths);
          return { error: null };
        },
        getPublicUrl: (path: string) => ({ data: { publicUrl: PUB + path } }),
      }),
    },
    from: () => ({
      insert: async (r: Record<string, unknown>) => {
        calls.push("insert");
        row = r;
        return result();
      },
      update: (r: Record<string, unknown>) => {
        row = r;
        return {
          eq: () => ({
            eq: async () => {
              calls.push("update");
              return result();
            },
          }),
        };
      },
      delete: () => ({
        eq: async () => {
          calls.push("delete");
          return result();
        },
      }),
    }),
  };
  return {
    client: client as never,
    calls,
    uploads,
    removed,
    row: () => row,
  };
}

const file = (name: string, type: string) => new File(["x"], name, { type });

const artDraft: SubmissionDraft = {
  title: "T",
  category: "digital_art",
  description: "D",
  student: "S",
  image: file("a.webp", "image/webp"),
  imageWidth: 800,
  imageHeight: 600,
};

const baseWork = {
  id: "w1",
  category: "digital_art",
  image_url: `${PUB}${USER}/w1/old.webp`,
  image_width: 1,
  image_height: 1,
  video_url: null,
  audio_url: null,
  orientation: null,
} as unknown as StudentWork;

describe("validateDraft", () => {
  it("requires a live link for games and a cover for sound design", () => {
    const game: SubmissionDraft = {
      ...artDraft,
      category: "game",
      liveUrl: "ftp://x",
    };
    expect(validateDraft(game)).toMatch(/http/);
    expect(validateDraft({ ...game, liveUrl: "https://x.io" })).toBeNull();
    const sound: SubmissionDraft = {
      ...artDraft,
      category: "sound_design",
      image: undefined,
      media: file("a.webm", "audio/webm"),
    };
    expect(validateDraft(sound)).toMatch(/cover/);
    expect(validateDraft({ ...sound, image: artDraft.image })).toBeNull();
    expect(
      validateDraft({ ...artDraft, category: "animation", image: undefined }),
    ).toMatch(/video/);
  });
});

describe("createSubmission", () => {
  it("uploads under the user's folder and inserts a row with the same id", async () => {
    const m = mockClient();
    const res = await createSubmission(m.client, USER, artDraft);
    expect("id" in res).toBe(true);
    const id = (res as { id: string }).id;
    expect(m.uploads[0].path).toMatch(
      new RegExp(`^${USER}/${id}/[0-9a-f-]+\\.webp$`),
    );
    expect(m.uploads[0].contentType).toBe("image/webp");
    expect(m.calls).toEqual(["upload", "insert"]);
    expect(m.row()).toMatchObject({
      id,
      submitted_by: USER,
      visible: true,
      image_width: 800,
      image_url: PUB + m.uploads[0].path,
    });
  });

  it("removes uploaded files when the insert fails", async () => {
    const m = mockClient({ dbError: { code: "42501", message: "not_owner" } });
    const res = await createSubmission(m.client, USER, artDraft);
    expect(res).toEqual({
      error: "Something went wrong saving your work. Try again.",
    });
    expect(m.removed).toEqual([[m.uploads[0].path]]);
  });

  it("maps quota_reached to the quota message", async () => {
    const m = mockClient({ dbError: { code: "P0001", message: "quota_reached" } });
    const res = await createSubmission(m.client, USER, artDraft);
    expect(res).toEqual({
      error:
        "You already have 5 works in the museum or waiting for review. Withdraw or delete one to submit another.",
    });
    expect(m.removed).toHaveLength(1);
  });

  it("stores video with poster and orientation", async () => {
    const m = mockClient();
    await createSubmission(m.client, USER, {
      ...artDraft,
      category: "short_film",
      media: file("v.webm", "video/webm"),
      orientation: "vertical",
    });
    expect(m.uploads.map((u) => u.contentType)).toEqual([
      "image/webp",
      "video/webm",
    ]);
    expect(m.row()).toMatchObject({ orientation: "vertical" });
  });
});

describe("updateSubmission", () => {
  it("removes the old file only after a successful update", async () => {
    const m = mockClient();
    const res = await updateSubmission(m.client, USER, baseWork, artDraft);
    expect(res).toEqual({});
    expect(m.calls).toEqual(["upload", "update", "remove"]);
    expect(m.uploads[0].path.startsWith(`${USER}/w1/`)).toBe(true);
    expect(m.removed).toEqual([[`${USER}/w1/old.webp`]]);
    expect(m.row()).not.toHaveProperty("status");
    expect(m.row()).not.toHaveProperty("featured");
  });

  it("removes the new upload when the update fails", async () => {
    const m = mockClient({ dbError: { code: "x", message: "boom" } });
    const res = await updateSubmission(m.client, USER, baseWork, artDraft);
    expect(res.error).toBeDefined();
    expect(m.removed).toEqual([[m.uploads[0].path]]);
  });

  it("keeps existing files when none are replaced", async () => {
    const m = mockClient();
    await updateSubmission(m.client, USER, baseWork, {
      ...artDraft,
      image: undefined,
    });
    expect(m.uploads).toHaveLength(0);
    expect(m.removed).toHaveLength(0);
  });
});

describe("submissionPaths", () => {
  it("ignores media-bucket and YouTube works", () => {
    expect(
      submissionPaths({
        image_url: `${ORIGIN}/storage/v1/object/public/media/x.webp`,
        video_url: null,
        audio_url: null,
      }),
    ).toEqual([]);
    expect(
      submissionPaths({
        image_url: `${PUB}u/w/a.webp`,
        video_url: `${PUB}u/w/b.webm`,
        audio_url: null,
      }),
    ).toEqual(["u/w/a.webp", "u/w/b.webm"]);
  });
});

describe("deleteSubmission", () => {
  it("removes the row then its files", async () => {
    const m = mockClient();
    const res = await deleteSubmission(m.client, baseWork);
    expect(res).toEqual({});
    expect(m.calls).toEqual(["delete", "remove"]);
    expect(m.removed).toEqual([[`${USER}/w1/old.webp`]]);
  });
});

