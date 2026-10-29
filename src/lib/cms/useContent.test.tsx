import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useContent } from "@/lib/cms/useContent";

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
});
