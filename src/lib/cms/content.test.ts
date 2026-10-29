import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ContentClient,
  type Post,
  fetchDepartmentWithFaculty,
  fetchDepartments,
  fetchFeaturedPost,
  fetchPostBySlug,
  fetchProgram,
  fetchPrograms,
  fetchPublishedPosts,
  previewLabel,
} from "@/lib/cms/content";

type Call = [method: string, ...args: unknown[]];

/** Supabase-like client that records the query chain and resolves to `result`. */
function recordingClient(result: { data: unknown; error: unknown }) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = new Proxy(
    {},
    {
      get(_, method: string) {
        if (method === "then") {
          return (resolve: (value: unknown) => void) => resolve(result);
        }
        return (...args: unknown[]) => {
          calls.push([method, ...args]);
          return builder;
        };
      },
    },
  );
  const client = {
    from: (table: string) => {
      calls.push(["from", table]);
      return builder;
    },
  } as unknown as ContentClient;
  return { client, calls };
}

const NOW = new Date("2026-10-29T08:00:00.000Z");
const ok = (data: unknown) => ({ data, error: null });
const failed = { data: null, error: { message: "network down" } };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe("fetchPublishedPosts", () => {
  it("only returns published posts whose publish time has passed, newest first", async () => {
    const { client, calls } = recordingClient(ok([]));
    await fetchPublishedPosts(client);
    expect(calls).toContainEqual(["from", "posts"]);
    expect(calls).toContainEqual(["eq", "status", "published"]);
    expect(calls).toContainEqual(["lte", "published_at", NOW.toISOString()]);
    expect(calls).toContainEqual([
      "order",
      "published_at",
      { ascending: false },
    ]);
  });

  it("filters by category and limits the count when asked", async () => {
    const { client, calls } = recordingClient(ok([]));
    await fetchPublishedPosts(client, { category: "news", limit: 5 });
    expect(calls).toContainEqual(["eq", "category", "news"]);
    expect(calls).toContainEqual(["limit", 5]);
  });
});

describe("fetchFeaturedPost", () => {
  it("only considers published, featured posts", async () => {
    const { client, calls } = recordingClient(ok(null));
    await fetchFeaturedPost(client);
    expect(calls).toContainEqual(["eq", "status", "published"]);
    expect(calls).toContainEqual(["lte", "published_at", NOW.toISOString()]);
    expect(calls).toContainEqual(["eq", "is_featured", true]);
  });
});

describe("fetchPostBySlug", () => {
  it("leaves the draft check to RLS so admins can preview", async () => {
    const { client, calls } = recordingClient(ok(null));
    await fetchPostBySlug(client, "x");
    expect(calls).toContainEqual(["eq", "slug", "x"]);
    expect(calls.some(([, column]) => column === "status")).toBe(false);
  });
});

describe("errors", () => {
  it.each([
    ["fetchPublishedPosts", (c: ContentClient) => fetchPublishedPosts(c)],
    ["fetchFeaturedPost", (c: ContentClient) => fetchFeaturedPost(c)],
    ["fetchPostBySlug", (c: ContentClient) => fetchPostBySlug(c, "x")],
    ["fetchPrograms", (c: ContentClient) => fetchPrograms(c)],
    ["fetchProgram", (c: ContentClient) => fetchProgram(c, "bscs")],
    ["fetchDepartments", (c: ContentClient) => fetchDepartments(c)],
    [
      "fetchDepartmentWithFaculty",
      (c: ContentClient) => fetchDepartmentWithFaculty(c, "cs"),
    ],
  ])("%s rejects when Supabase returns an error", async (_, load) => {
    const { client } = recordingClient(failed);
    await expect(load(client)).rejects.toThrow(
      /^Failed to load .*network down/,
    );
  });
});

describe("previewLabel", () => {
  const post = (overrides: Partial<Post>) =>
    ({
      status: "published",
      published_at: "2026-10-01T00:00:00.000Z",
      ...overrides,
    }) as Post;

  it("is null for a post visitors can see", () => {
    expect(previewLabel(post({}), NOW)).toBeNull();
  });

  it("marks drafts", () => {
    expect(previewLabel(post({ status: "draft" }), NOW)).toBe(
      "Preview — this post is a draft",
    );
  });

  it("marks posts scheduled for later", () => {
    expect(
      previewLabel(post({ published_at: "2026-11-15T02:00:00.000Z" }), NOW),
    ).toBe("Preview — scheduled for November 15, 2026");
  });
});
