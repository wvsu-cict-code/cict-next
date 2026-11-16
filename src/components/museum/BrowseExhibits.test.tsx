import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "@/components/studentWorks/fixtures";
import { clearContentCache } from "@/lib/cms/useContent";
import { clearLikeCache } from "@/lib/museum/likes";
import { BrowseExhibits } from "./BrowseExhibits";

const fetchExhibits = vi.hoisted(() => vi.fn());
const actualFetchExhibits = vi.hoisted(() => ({
  current: null as typeof import("@/lib/museum/queries").fetchExhibits | null,
}));
const browser = vi.hoisted(() => ({ client: {} as unknown }));

vi.mock("@/lib/museum/queries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/museum/queries")>(
    "@/lib/museum/queries",
  );
  actualFetchExhibits.current = actual.fetchExhibits;
  return { ...actual, fetchExhibits };
});

vi.mock("@/lib/auth/session", () => ({
  useSession: () => ({ status: "signed-out", user: null, displayName: null }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => browser.client,
}));

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
  };
  return { client, calls };
}

function lastPage() {
  return fetchExhibits.mock.calls.at(-1)?.[1] as {
    offset?: number;
    limit?: number;
    categories?: string[];
    ids?: string[];
    search?: string;
  };
}

beforeEach(() => {
  fetchExhibits.mockReset();
  fetchExhibits.mockResolvedValue({ works: [], total: 0 });
  browser.client = {};
  localStorage.clear();
  window.location.hash = "";
  clearContentCache();
  clearLikeCache();
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  clearContentCache();
  clearLikeCache();
  vi.useRealTimers();
});

describe("BrowseExhibits", () => {
  it("browse filters by category and by saved ids", async () => {
    localStorage.setItem(
      "cict.museum.saved.v1",
      JSON.stringify(["saved-1", "saved-2"]),
    );
    render(<BrowseExhibits onOpen={() => {}} />);

    await waitFor(() => expect(fetchExhibits).toHaveBeenCalled());
    expect(lastPage()).toMatchObject({ offset: 0, limit: 12 });
    expect(lastPage().categories).toBeUndefined();
    expect(lastPage().ids).toBeUndefined();

    fetchExhibits.mockClear();
    fireEvent.click(screen.getByRole("radio", { name: "Sound Design" }));
    await waitFor(() => expect(fetchExhibits).toHaveBeenCalled());
    expect(lastPage().categories).toEqual(["sound_design"]);
    const sound = screen.getByRole("radio", { name: "Sound Design" });
    expect(sound.getAttribute("data-state")).toBe("on");
    expect(sound.className).toContain("bg-theme-red");
    expect(sound.className).toContain("text-white");
    expect(await screen.findByText("No sound design works yet.")).toBeTruthy();

    fetchExhibits.mockClear();
    fireEvent.click(screen.getByRole("radio", { name: "Saved" }));
    await waitFor(() => expect(fetchExhibits).toHaveBeenCalled());
    expect(lastPage().ids).toEqual(["saved-1", "saved-2"]);
    expect(
      await screen.findByText("You haven't saved any exhibits."),
    ).toBeTruthy();
  });

  it("browse search waits 300ms and escapes input", async () => {
    const recorded = recordingClient({ data: [], error: null, count: 0 });
    browser.client = recorded.client;
    const actual = actualFetchExhibits.current;
    if (!actual) throw new Error("fetchExhibits actual missing");
    fetchExhibits.mockImplementation((client, page) => actual(client, page));

    vi.useFakeTimers();
    render(<BrowseExhibits onOpen={() => {}} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetchExhibits).toHaveBeenCalled();
    expect(lastPage().search).toBeUndefined();
    expect(recorded.calls.some((call) => call[0] === "or")).toBe(false);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search exhibits" }),
      {
        target: { value: "100%" },
      },
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });
    expect(lastPage().search).toBeUndefined();
    expect(recorded.calls.some((call) => call[0] === "or")).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(lastPage().search).toBe("100%");
    const or = recorded.calls.find((call) => call[0] === "or")?.[1];
    expect(String(or)).toContain("100\\%");
    expect(String(or)).not.toMatch(/100%/);
  });

  it("shows the next page without dropping the first", async () => {
    const works = Array.from({ length: 13 }, (_, index) =>
      makeWork({
        id: `w${index}`,
        title: `Work ${index}`,
        like_count: 0,
      }),
    );
    fetchExhibits.mockImplementation(
      async (_client: unknown, page: { offset: number; limit: number }) => ({
        works: works.slice(page.offset, page.offset + page.limit),
        total: works.length,
      }),
    );
    const onOpen = vi.fn();
    render(<BrowseExhibits onOpen={onOpen} />);

    expect(await screen.findByRole("button", { name: "Work 0" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Work 12" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Work 0" }));
    expect(onOpen).toHaveBeenCalledWith("w0");

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(await screen.findByRole("button", { name: "Work 12" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Work 0" })).toBeTruthy();
  });

  it("offers a retry when exhibits fail to load", async () => {
    fetchExhibits.mockRejectedValueOnce(new Error("offline"));
    render(<BrowseExhibits onOpen={() => {}} />);

    expect(await screen.findByText(/couldn't load this content/i)).toBeTruthy();
    fetchExhibits.mockResolvedValue({
      works: [makeWork({ id: "sunrise", title: "Sunrise" })],
      total: 1,
    });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("button", { name: "Sunrise" })).toBeTruthy();
  });
});
