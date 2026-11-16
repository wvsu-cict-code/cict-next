import { describe, expect, it } from "vitest";
import type { ContentClient } from "@/lib/cms/content";
import {
  fetchExhibit,
  fetchExhibits,
  fetchFeaturedWorks,
  fetchGalleryCounts,
  fetchGalleryWorks,
} from "./queries";

type Call = [method: string, ...args: unknown[]];

function recordingClient(result: {
  data: unknown;
  error: unknown;
  count?: number | null;
}) {
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

const failed = { data: null, error: { message: "network down" } };
const UUID = "11111111-1111-4111-8111-111111111111";

describe("fetchExhibit", () => {
  it("returns null for a non-uuid without querying", async () => {
    const { client, calls } = recordingClient({ data: null, error: null });
    await expect(fetchExhibit(client, "not-a-uuid")).resolves.toBeNull();
    expect(calls).toEqual([]);
  });

  it("loads one visible approved exhibit", async () => {
    const row = { id: UUID };
    const { client, calls } = recordingClient({ data: row, error: null });
    await expect(fetchExhibit(client, UUID)).resolves.toEqual(row);
    expect(calls).toContainEqual(["from", "student_works"]);
    expect(calls).toContainEqual(["eq", "id", UUID]);
    expect(calls).toContainEqual(["eq", "visible", true]);
    expect(calls).toContainEqual(["eq", "status", "approved"]);
    expect(calls).toContainEqual(["maybeSingle"]);
  });

  it("throws when the query fails", async () => {
    const { client } = recordingClient(failed);
    await expect(fetchExhibit(client, UUID)).rejects.toThrow("network down");
  });
});

describe("fetchExhibits", () => {
  it("escapes % in search", async () => {
    const rows = [{ id: "w1" }];
    const { client, calls } = recordingClient({
      data: rows,
      error: null,
      count: 1,
    });
    await expect(
      fetchExhibits(client, { offset: 12, limit: 12, search: "100%" }),
    ).resolves.toEqual({ works: rows, total: 1 });
    const or = calls.find((call) => call[0] === "or")?.[1];
    expect(or).toEqual(expect.stringContaining("title.ilike."));
    expect(or).toEqual(expect.stringContaining("student.ilike."));
    expect(String(or)).toContain("100\\%");
    expect(String(or)).not.toMatch(/100%/);
    expect(calls).toContainEqual(["eq", "visible", true]);
    expect(calls).toContainEqual(["eq", "status", "approved"]);
    expect(calls).toContainEqual(["range", 12, 23]);
  });

  it("returns nothing for an empty id list without querying", async () => {
    const { client, calls } = recordingClient({
      data: [],
      error: null,
      count: 0,
    });
    await expect(
      fetchExhibits(client, { offset: 0, limit: 12, ids: [] }),
    ).resolves.toEqual({ works: [], total: 0 });
    expect(calls).toEqual([]);
  });
});

describe("fetchGalleryWorks", () => {
  it("orders featured first then newest and limits to 30", async () => {
    const { client, calls } = recordingClient({ data: [], error: null });
    await fetchGalleryWorks(client, "b");
    expect(calls).toContainEqual(["from", "student_works"]);
    expect(calls).toContainEqual(["eq", "visible", true]);
    expect(calls).toContainEqual(["eq", "status", "approved"]);
    expect(calls).toContainEqual([
      "in",
      "category",
      ["animation", "short_film", "sound_design"],
    ]);
    const featured = calls.findIndex(
      (call) => call[0] === "order" && call[1] === "featured",
    );
    const created = calls.findIndex(
      (call) => call[0] === "order" && call[1] === "created_at",
    );
    expect(calls[featured]).toEqual(["order", "featured", { ascending: false }]);
    expect(calls[created]).toEqual([
      "order",
      "created_at",
      { ascending: false },
    ]);
    expect(created).toBeGreaterThan(featured);
    expect(calls).toContainEqual(["limit", 30]);
  });
});

describe("fetchFeaturedWorks", () => {
  it("loads visible approved featured works, newest first", async () => {
    const rows = [{ id: "a" }];
    const { client, calls } = recordingClient({ data: rows, error: null });
    await expect(fetchFeaturedWorks(client)).resolves.toEqual(rows);
    expect(calls).toContainEqual(["eq", "featured", true]);
    expect(calls).toContainEqual(["eq", "visible", true]);
    expect(calls).toContainEqual(["eq", "status", "approved"]);
    expect(calls).toContainEqual(["order", "created_at", { ascending: false }]);
    expect(calls).toContainEqual(["limit", 12]);
  });
});

describe("fetchGalleryCounts", () => {
  it("counts visible approved works per gallery", async () => {
    const { client, calls } = recordingClient({
      data: null,
      error: null,
      count: 2,
    });
    await expect(fetchGalleryCounts(client)).resolves.toEqual({
      a: 2,
      b: 2,
      c: 2,
    });
    expect(
      calls.filter((call) => call[0] === "in"),
    ).toEqual([
      ["in", "category", ["game", "interactive_media"]],
      ["in", "category", ["animation", "short_film", "sound_design"]],
      ["in", "category", ["digital_art", "xr_3d"]],
    ]);
    expect(calls).toContainEqual(["eq", "status", "approved"]);
    expect(calls).toContainEqual(["eq", "visible", true]);
  });
});
