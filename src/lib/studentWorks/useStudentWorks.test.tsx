import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWork } from "@/lib/cms/content";
import { fetchStudentWorks } from "@/lib/cms/content";
import { CONTENT_TIMEOUT_MS } from "@/lib/cms/useContent";
import { useStudentWorks } from "@/lib/studentWorks/useStudentWorks";

const fakeClient = { fake: true };
vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => fakeClient,
}));
vi.mock("@/lib/cms/content", () => ({ fetchStudentWorks: vi.fn() }));

const fetchMock = vi.mocked(fetchStudentWorks);

const work = (n: number) => ({ id: `w${n}` }) as unknown as StudentWork;
const batch = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) => work(from + i));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useStudentWorks", () => {
  beforeEach(() => fetchMock.mockReset());

  it("loads the first batch, then appends the next on loadMore", async () => {
    fetchMock
      .mockResolvedValueOnce({ works: batch(0, 12), total: 20 })
      .mockResolvedValueOnce({ works: batch(12, 8), total: 20 });
    const { result } = renderHook(() => useStudentWorks());

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledWith(fakeClient, {
      offset: 0,
      limit: 12,
    });
    expect(result.current.works).toHaveLength(12);
    expect(result.current.hasMore).toBe(true);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.loadMore();
    });
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenLastCalledWith(fakeClient, {
      offset: 12,
      limit: 12,
    });
    expect(result.current.works).toHaveLength(20);
    expect(result.current.total).toBe(20);
    expect(result.current.hasMore).toBe(false);
  });

  it("fetches the next page once when loadMore is called twice at once", async () => {
    const second = deferred<{ works: StudentWork[]; total: number }>();
    fetchMock
      .mockResolvedValueOnce({ works: batch(0, 12), total: 30 })
      .mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useStudentWorks());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    let a!: Promise<boolean>;
    let b!: Promise<boolean>;
    act(() => {
      a = result.current.loadMore();
      b = result.current.loadMore();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    let results: boolean[] = [];
    await act(async () => {
      second.resolve({ works: batch(12, 12), total: 30 });
      results = await Promise.all([a, b]);
    });
    expect(results).toEqual([true, true]);

    const ids = result.current.works.map((w) => w.id);
    expect(ids).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
  });

  it("makes no request when nothing is left to load", async () => {
    fetchMock.mockResolvedValueOnce({ works: batch(0, 5), total: 5 });
    const { result } = renderHook(() => useStudentWorks());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.hasMore).toBe(false);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.loadMore();
    });
    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a failed first load and reloads on retry", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ works: batch(0, 3), total: 3 });
    const { result } = renderHook(() => useStudentWorks());
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.works).toHaveLength(3);
  });

  it("resolves false and keeps the works when loading more fails", async () => {
    fetchMock
      .mockResolvedValueOnce({ works: batch(0, 12), total: 30 })
      .mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useStudentWorks());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.loadMore();
    });
    expect(ok).toBe(false);
    expect(result.current.works).toHaveLength(12);
    expect(result.current.status).toBe("ready");
  });

  describe("when a request hangs", () => {
    afterEach(() => vi.useRealTimers());

    it("resolves false after the timeout, ignores the late page, and the next call fetches again", async () => {
      fetchMock
        .mockResolvedValueOnce({ works: batch(0, 12), total: 30 })
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce({ works: batch(12, 12), total: 30 });
      const { result } = renderHook(() => useStudentWorks());
      await waitFor(() => expect(result.current.status).toBe("ready"));

      vi.useFakeTimers();
      let hung!: Promise<boolean>;
      act(() => {
        hung = result.current.loadMore();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(CONTENT_TIMEOUT_MS);
      });
      await expect(hung).resolves.toBe(false);

      let ok: boolean | undefined;
      await act(async () => {
        ok = await result.current.loadMore();
      });
      expect(ok).toBe(true);
      expect(fetchMock).toHaveBeenLastCalledWith(fakeClient, {
        offset: 12,
        limit: 12,
      });
      expect(result.current.works).toHaveLength(24);
    });
  });
});
