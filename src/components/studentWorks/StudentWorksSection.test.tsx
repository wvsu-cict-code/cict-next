import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "./fixtures";
import { StudentWorksSection } from "./StudentWorksSection";

const hook = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("@/lib/studentWorks/useStudentWorks", () => ({
  useStudentWorks: () => hook.value,
}));

let resizeCallbacks: ResizeObserverCallback[] = [];
let intersectCallbacks: IntersectionObserverCallback[] = [];

beforeEach(() => {
  resizeCallbacks = [];
  intersectCallbacks = [];
  class FakeResize {
    constructor(cb: ResizeObserverCallback) {
      resizeCallbacks.push(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  class FakeIntersection {
    constructor(cb: IntersectionObserverCallback) {
      intersectCallbacks.push(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", FakeResize);
  vi.stubGlobal("IntersectionObserver", FakeIntersection);
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 900,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth;
});

function state(overrides: Record<string, unknown>) {
  hook.value = {
    status: "ready",
    works: [],
    total: 0,
    hasMore: false,
    loadMore: vi.fn().mockResolvedValue(true),
    retry: vi.fn(),
    ...overrides,
  };
}

function measure() {
  act(() => resizeCallbacks.forEach((cb) => cb([], {} as ResizeObserver)));
}

describe("StudentWorksSection", () => {
  it.each([
    ["loading", { status: "loading" }],
    ["error", { status: "error" }],
    ["empty", { status: "ready", total: 0 }],
  ])("renders nothing while %s", (_, overrides) => {
    state(overrides);
    const { container } = render(<StudentWorksSection />);
    expect(container.innerHTML).toBe("");
  });

  it("shows the heading and one button per work in order", () => {
    const works = [
      makeWork({ id: "a", title: "First", student: "Ana" }),
      makeWork({ id: "b", title: "Second", student: "Ben", kind: "game" }),
      makeWork({ id: "c", title: "Third", student: "Cy" }),
    ];
    state({ works, total: 3 });
    render(<StudentWorksSection />);
    measure();
    expect(screen.getByText("Student showcase")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Featured student works" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button").map((b) => b.getAttribute("aria-label")),
    ).toEqual(["First by Ana", "Second by Ben", "Third by Cy"]);
  });

  it("loads more when the sentinel intersects and more remain", () => {
    const loadMore = vi.fn().mockResolvedValue(true);
    state({ works: [makeWork()], total: 20, hasMore: true, loadMore });
    render(<StudentWorksSection />);
    measure();
    act(() =>
      intersectCallbacks.forEach((cb) =>
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
      ),
    );
    expect(loadMore).toHaveBeenCalled();
  });

  it("does not load more when nothing remains", () => {
    const loadMore = vi.fn().mockResolvedValue(true);
    state({ works: [makeWork()], total: 1, hasMore: false, loadMore });
    render(<StudentWorksSection />);
    measure();
    act(() =>
      intersectCallbacks.forEach((cb) =>
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
      ),
    );
    expect(loadMore).not.toHaveBeenCalled();
  });
});
