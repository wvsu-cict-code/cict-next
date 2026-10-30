import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearContentCache,
  CONTENT_TIMEOUT_MS,
  rememberContent,
  useContent,
} from "@/lib/cms/useContent";

const fakeClient = { fake: true };
vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => fakeClient,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useContent", () => {
  beforeEach(() => {
    clearContentCache();
  });

  it("starts loading, then returns the data", async () => {
    const load = vi.fn().mockResolvedValue(["a post"]);
    const { result } = renderHook(() => useContent("posts", load));

    expect(result.current.status).toBe("loading");
    await waitFor(() =>
      expect(result.current).toEqual({ status: "ready", data: ["a post"] }),
    );
    expect(load).toHaveBeenCalledWith(fakeClient);
  });

  it("reports errors, and retry loads again", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce("back");
    const { result } = renderHook(() => useContent("posts", load));

    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => {
      if (result.current.status === "error") result.current.retry();
    });
    expect(result.current.status).toBe("loading");
    await waitFor(() =>
      expect(result.current).toEqual({ status: "ready", data: "back" }),
    );
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("ignores a slower response for a previous key", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const load = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { result, rerender } = renderHook(
      ({ key }) => useContent(key, load),
      { initialProps: { key: "a" } },
    );

    rerender({ key: "b" });
    await act(async () => second.resolve("b data"));
    await act(async () => first.resolve("a data"));

    expect(result.current).toEqual({ status: "ready", data: "b data" });
  });

  it("goes back to loading when the key changes", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce("a data")
      .mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderHook(
      ({ key }) => useContent(key, load),
      { initialProps: { key: "a" } },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));

    rerender({ key: "b" });
    expect(result.current.status).toBe("loading");
  });

  it("does not load without a key", async () => {
    const load = vi.fn().mockResolvedValue("data");
    const { result } = renderHook(() => useContent(null, load));

    await act(async () => {});
    expect(result.current.status).toBe("loading");
    expect(load).not.toHaveBeenCalled();
  });
  it("gives up with an error when loading never finishes", async () => {
    vi.useFakeTimers();
    try {
      const load = vi.fn().mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useContent("posts", load));

      await act(async () => vi.advanceTimersByTime(CONTENT_TIMEOUT_MS - 1));
      expect(result.current.status).toBe("loading");
      await act(async () => vi.advanceTimersByTime(1));
      expect(result.current.status).toBe("error");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows the error state when starting the load throws", async () => {
    const load = vi.fn(() => {
      throw new Error("Missing Supabase environment variables");
    });
    const { result } = renderHook(() => useContent("posts", load));

    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("shows cached data on the next visit, then refreshes it", async () => {
    const load = vi.fn().mockResolvedValue("first");
    const first = renderHook(() => useContent("item", load));
    await waitFor(() => expect(first.result.current.status).toBe("ready"));
    first.unmount();

    load.mockResolvedValue("second");
    const second = renderHook(() => useContent("item", load));
    expect(second.result.current).toEqual({ status: "ready", data: "first" });
    await waitFor(() =>
      expect(second.result.current).toEqual({
        status: "ready",
        data: "second",
      }),
    );
  });

  it("keeps cached data when a refresh fails", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockRejectedValueOnce(new Error("offline"));
    const first = renderHook(() => useContent("item", load));
    await waitFor(() => expect(first.result.current.status).toBe("ready"));
    first.unmount();

    const second = renderHook(() => useContent("item", load));
    expect(second.result.current).toEqual({ status: "ready", data: "first" });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(second.result.current).toEqual({ status: "ready", data: "first" });
  });

  it("shares one request between callers of the same key", async () => {
    const gate = deferred<string>();
    const load = vi.fn().mockReturnValue(gate.promise);
    const first = renderHook(() => useContent("item", load));
    const second = renderHook(() => useContent("item", load));

    await act(async () => {});
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => gate.resolve("shared"));
    await waitFor(() =>
      expect(first.result.current).toEqual({ status: "ready", data: "shared" }),
    );
    expect(second.result.current).toEqual({ status: "ready", data: "shared" });
  });

  it("returns remembered content without waiting", () => {
    rememberContent("program:1", { id: "1" });
    const load = vi.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useContent("program:1", load));

    expect(result.current).toEqual({ status: "ready", data: { id: "1" } });
  });

  it("retries a stalled request instead of joining it again", async () => {
    vi.useFakeTimers();
    try {
      const load = vi
        .fn()
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce("back");
      const { result } = renderHook(() => useContent("posts", load));

      await act(async () => vi.advanceTimersByTime(CONTENT_TIMEOUT_MS));
      expect(result.current.status).toBe("error");
      await act(async () => {
        if (result.current.status === "error") result.current.retry();
      });
      expect(result.current).toEqual({ status: "ready", data: "back" });
    } finally {
      vi.useRealTimers();
    }
  });
});
