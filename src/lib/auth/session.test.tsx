import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "./session";

type Listener = (event: string, session: unknown) => void;
let listener: Listener | undefined;
const unsubscribe = vi.fn();
const maybeSingle = vi.fn();
const from = vi.fn();

const fakeClient = {
  auth: {
    onAuthStateChange: (cb: Listener) => {
      listener = cb;
      return { data: { subscription: { unsubscribe } } };
    },
  },
  from,
};
vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => fakeClient,
}));

const user = { id: "u1", email: "ana@wvsu.edu.ph" };

describe("useSession", () => {
  beforeEach(() => {
    listener = undefined;
    unsubscribe.mockClear();
    maybeSingle.mockReset().mockResolvedValue({
      data: { display_name: "Ana" },
      error: null,
    });
    from.mockReset().mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle }) }),
    });
  });

  it("goes from loading to signed-in and loads the display name", async () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.status).toBe("loading");

    act(() => listener?.("INITIAL_SESSION", { user }));
    await waitFor(() =>
      expect(result.current).toEqual({
        status: "signed-in",
        user,
        displayName: "Ana",
      }),
    );
    expect(from).toHaveBeenCalledWith("profiles");
  });

  it("is signed-out when there is no session", async () => {
    const { result } = renderHook(() => useSession());
    act(() => listener?.("INITIAL_SESSION", null));
    expect(result.current).toEqual({
      status: "signed-out",
      user: null,
      displayName: null,
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("loads the profile once per user", async () => {
    const { result } = renderHook(() => useSession());
    act(() => listener?.("INITIAL_SESSION", { user }));
    await waitFor(() => expect(result.current.displayName).toBe("Ana"));
    act(() => listener?.("TOKEN_REFRESHED", { user }));
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useSession());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
