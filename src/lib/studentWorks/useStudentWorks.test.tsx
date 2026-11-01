import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWork } from "@/lib/cms/content";
import { fetchStudentWorks } from "@/lib/cms/content";
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

    await act(() => result.current.loadMore());
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

    let a!: Promise<void>;
    let b!: Promise<void>;
    act(() => {
      a = result.current.loadMore();
      b = result.current.loadMore();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      second.resolve({ works: batch(12, 12), total: 30 });
      await Promise.all([a, b]);
    });

    const ids = result.current.works.map((w) => w.id);
    expect(ids).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
  });

  it("makes no request when nothing is left to load", async () => {
    fetchMock.mockResolvedValueOnce({ works: batch(0, 5), total: 5 });
    const { result } = renderHook(() => useStudentWorks());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.hasMore).toBe(false);

    await act(() => result.current.loadMore());
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
});
