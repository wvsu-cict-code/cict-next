import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PackSource } from "@/lib/socialPack/pack";
import Composer from "./Composer";

const loadImage = vi.fn();
const buildPack = vi.fn();
vi.mock("@/lib/socialPack/build", () => ({
  loadImage: (url: string) => loadImage(url),
  loadSiteFonts: async () => ({ display: "serif", body: "sans-serif" }),
  canvasRenderer: () => ({}),
  buildPack: (...args: unknown[]) => buildPack(...args),
}));
vi.mock("@/lib/socialPack/draw", () => ({
  drawCover: vi.fn(),
  drawSquare: vi.fn(),
}));

const photo = (name: string) => ({
  url: `https://x/${name}.jpg`,
  width: 100,
  height: 100,
  alt: name,
});
const source: PackSource = {
  kind: "post",
  slug: "open-house",
  title: "Open House",
  summary: "Summary",
  date: "2026-10-29T01:00:00Z",
  body: "Body",
  coverImageUrl: null,
  photos: [photo("a"), photo("b"), photo("c")],
};

const loaded = (url: string) => ({
  url,
  image: {} as HTMLImageElement,
  width: 100,
  height: 100,
});

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("Composer", () => {
  beforeEach(() => {
    loadImage.mockReset();
    buildPack.mockReset();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("marks a photo hosted elsewhere as unavailable and names it as left out", async () => {
    loadImage.mockImplementation(async (url: string) => {
      if (url.endsWith("/b.jpg")) throw new Error("blocked");
      return loaded(url);
    });
    render(<Composer source={source} />);
    await screen.findByText("Collage layout");

    expect(
      screen.getByRole("button", { name: "b, unavailable" }),
    ).toHaveProperty("disabled", true);
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^a, in slot 1/ }),
    ).toHaveProperty("disabled", false);
    expect(
      screen.getByRole("button", { name: /^c, in slot 2/ }),
    ).toHaveProperty("disabled", false);
    const note = screen.getByText(/Left out because it couldn't be loaded/);
    expect(note.textContent).toContain("b.jpg");
    expect(note.textContent).not.toContain("a.jpg");
  });

  it("treats an image that never finishes loading as unavailable", async () => {
    vi.useFakeTimers();
    loadImage.mockImplementation((url: string) =>
      url.endsWith("/c.jpg")
        ? new Promise(() => {})
        : Promise.resolve(loaded(url)),
    );
    render(<Composer source={source} />);
    await settle();
    expect(screen.getByRole("status").textContent).toContain("Loading photos");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(screen.queryByText("Loading photos…")).toBeNull();
    expect(screen.getByRole("button", { name: "c, unavailable" })).toBeTruthy();
    expect(
      screen.getByText(/Left out because it couldn't be loaded/).textContent,
    ).toContain("c.jpg");
  });

  it("shows the not-live notice only when given one", async () => {
    loadImage.mockImplementation(async (url: string) => loaded(url));
    const { unmount } = render(
      <Composer source={source} notice="Still a draft." />,
    );
    expect(await screen.findByText("Still a draft.")).toBeTruthy();
    unmount();
    render(<Composer source={source} />);
    await screen.findByText("Collage layout");
    expect(screen.queryByText("Still a draft.")).toBeNull();
  });

  it("logs the real error when the zip can't be made", async () => {
    loadImage.mockImplementation(async (url: string) => loaded(url));
    const boom = new Error("zip exploded");
    buildPack.mockRejectedValue(boom);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Composer source={source} />);
    fireEvent.click(
      await screen.findByRole("button", { name: /download zip/i }),
    );
    expect(await screen.findByText(/zip couldn't be made/)).toBeTruthy();
    expect(log).toHaveBeenCalledWith(boom);
  });
});
