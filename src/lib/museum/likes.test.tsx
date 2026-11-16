import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearLikeCache, useLike } from "./likes";

const session = vi.hoisted(() => ({
  current: {
    status: "signed-in" as "signed-in" | "signed-out" | "loading",
    user: { id: "u1" } as { id: string } | null,
    displayName: "Ana" as string | null,
  },
}));

const api = vi.hoisted(() => ({
  insert: vi.fn(),
  deleteEq: vi.fn(),
  inFilter: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  useSession: () => session.current,
}));

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({
    from: () => ({
      insert: (...args: unknown[]) => api.insert(...args),
      delete: () => ({ eq: (...args: unknown[]) => api.deleteEq(...args) }),
      select: () => ({ in: (...args: unknown[]) => api.inFilter(...args) }),
    }),
  }),
}));

describe("useLike", () => {
  beforeEach(() => {
    clearLikeCache();
    session.current = {
      status: "signed-in",
      user: { id: "u1" },
      displayName: "Ana",
    };
    api.insert.mockReset();
    api.deleteEq.mockReset().mockResolvedValue({ error: null });
    api.inFilter.mockReset().mockResolvedValue({ data: [], error: null });
  });

  it("updates the count optimistically and rolls back on error", async () => {
    let resolveInsert: (value: { error: { message: string } | null }) => void;
    api.insert.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInsert = resolve;
        }),
    );
    const { result } = renderHook(() => useLike({ id: "w-opt", like_count: 3 }));
    expect(result.current.liked).toBe(false);
    expect(result.current.count).toBe(3);

    act(() => result.current.toggle());
    expect(result.current.liked).toBe(true);
    expect(result.current.count).toBe(4);
    expect(result.current.promptSignIn).toBe(false);

    await act(async () => {
      resolveInsert!({ error: { message: "nope" } });
    });
    expect(result.current.liked).toBe(false);
    expect(result.current.count).toBe(3);
  });

  it("asks signed-out visitors to sign in instead of liking", () => {
    session.current = { status: "signed-out", user: null, displayName: null };
    const { result } = renderHook(() => useLike({ id: "w-out", like_count: 1 }));
    act(() => result.current.toggle());
    expect(result.current.promptSignIn).toBe(true);
    expect(result.current.liked).toBe(false);
    expect(result.current.count).toBe(1);
    expect(api.insert).not.toHaveBeenCalled();
    act(() => result.current.dismissPrompt());
    expect(result.current.promptSignIn).toBe(false);
  });

  it("keeps two callers on the same like", async () => {
    api.insert.mockResolvedValue({ error: null });
    const card = renderHook(() => useLike({ id: "w-shared", like_count: 1 }));
    const spotlight = renderHook(() => useLike({ id: "w-shared", like_count: 1 }));
    act(() => card.result.current.toggle());
    expect(card.result.current).toMatchObject({ liked: true, count: 2 });
    expect(spotlight.result.current).toMatchObject({ liked: true, count: 2 });
  });
});
