import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "@/components/studentWorks/fixtures";
import { clearContentCache } from "@/lib/cms/useContent";
import type { GalleryId } from "@/lib/museum/categories";
import { MuseumContext, MuseumSection } from "./MuseumSection";

const loadMuseumCanvas = vi.hoisted(() => vi.fn());
const hasWebGL = vi.hoisted(() => vi.fn(() => true));
const fetchGalleryWorks = vi.hoisted(() => vi.fn());
const fetchGalleryCounts = vi.hoisted(() => vi.fn());
const fetchExhibit = vi.hoisted(() => vi.fn());

vi.mock("./loadMuseumCanvas", () => ({
  loadMuseumCanvas,
}));

vi.mock("@/lib/museum/webgl", () => ({
  hasWebGL,
}));

vi.mock("@/lib/museum/queries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/museum/queries")>(
    "@/lib/museum/queries",
  );
  return {
    ...actual,
    fetchGalleryWorks,
    fetchGalleryCounts,
    fetchExhibit,
  };
});

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({}),
}));

const sunrise = makeWork({
  id: "sunrise",
  title: "Sunrise",
  category: "game",
  image_url: "https://cdn.test/sunrise.webp",
});

function MockCanvas({
  gallery,
  works,
}: {
  gallery: string;
  works: { title: string }[];
}) {
  return (
    <div data-testid="museum-canvas">
      {gallery}:{works.map((work) => work.title).join(",")}
    </div>
  );
}

function VisitSunrise() {
  const museum = useContext(MuseumContext);
  return (
    <button type="button" onClick={() => museum?.visitExhibit("sunrise")}>
      Visit sunrise
    </button>
  );
}

beforeEach(() => {
  loadMuseumCanvas.mockReset();
  loadMuseumCanvas.mockResolvedValue({ default: MockCanvas });
  hasWebGL.mockReset();
  hasWebGL.mockReturnValue(true);
  fetchGalleryWorks.mockReset();
  fetchGalleryCounts.mockReset();
  fetchExhibit.mockReset();
  fetchGalleryCounts.mockResolvedValue({ a: 1, b: 0, c: 0 });
  fetchGalleryWorks.mockImplementation(
    async (_client: unknown, id: GalleryId) => (id === "a" ? [sunrise] : []),
  );
  fetchExhibit.mockResolvedValue(sunrise);
  clearContentCache();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  clearContentCache();
});

describe("MuseumSection", () => {
  it("the three chunk is not loaded until the visitor enters", () => {
    render(<MuseumSection />);

    expect(
      screen.getByRole("button", { name: /click to enter/i }),
    ).toBeTruthy();
    expect(
      document.getElementById("museum-3d")?.getAttribute("data-theme"),
    ).toBe("dark");
    expect(loadMuseumCanvas).not.toHaveBeenCalled();
    expect(screen.queryByTestId("museum-canvas")).toBeNull();
  });

  it("entering loads the canvas and shows the gallery", async () => {
    const { unmount } = render(<MuseumSection />);
    fireEvent.click(screen.getByRole("button", { name: /click to enter/i }));

    expect((await screen.findByTestId("museum-canvas")).textContent).toBe(
      "a:Sunrise",
    );
    expect(loadMuseumCanvas).toHaveBeenCalledOnce();
    expect(fetchGalleryWorks).toHaveBeenCalledWith(expect.anything(), "a");
    unmount();

    loadMuseumCanvas.mockClear();
    fetchGalleryWorks.mockClear();
    clearContentCache();
    render(<MuseumSection />);
    fireEvent(window, new Event("museum:enter"));
    expect((await screen.findByTestId("museum-canvas")).textContent).toBe(
      "a:Sunrise",
    );
    expect(loadMuseumCanvas).toHaveBeenCalledOnce();
  });

  it("visitExhibit loads the hall and stands at that exhibit", async () => {
    const onOpenDetail = vi.fn();
    render(
      <MuseumSection onOpenDetail={onOpenDetail}>
        <VisitSunrise />
      </MuseumSection>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Visit sunrise" }));

    expect((await screen.findByTestId("museum-canvas")).textContent).toBe(
      "a:Sunrise",
    );
    expect(loadMuseumCanvas).toHaveBeenCalledOnce();
    expect(onOpenDetail).not.toHaveBeenCalled();
  });

  it("without WebGL the section shows the fallback with a link to Browse Exhibits", () => {
    hasWebGL.mockReturnValue(false);
    render(<MuseumSection />);

    const link = screen.getByRole("link", { name: "Browse Exhibits" });
    expect(link.getAttribute("href")).toBe("#browse");
    expect(screen.getByText(/can't display the 3D museum/i)).toBeTruthy();
    expect(
      document.getElementById("museum-3d")?.getAttribute("data-theme"),
    ).toBe("dark");
    expect(
      screen.queryByRole("button", { name: /click to enter/i }),
    ).toBeNull();

    fireEvent.click(link);
    fireEvent(window, new Event("museum:enter"));
    expect(loadMuseumCanvas).not.toHaveBeenCalled();
  });
});

describe("MuseumSection visit outside the hall", () => {
  it("opens the detail view when the exhibit is not hanging in the gallery", async () => {
    fetchGalleryCounts.mockResolvedValue({ a: 1, b: 0, c: 0 });
    fetchGalleryWorks.mockResolvedValue([]);
    fetchExhibit.mockResolvedValue(
      makeWork({ id: "sunrise", category: "game", title: "Sunrise" }),
    );
    const onOpenDetail = vi.fn();
    render(
      <MuseumSection onOpenDetail={onOpenDetail}>
        <VisitSunrise />
      </MuseumSection>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Visit sunrise" }));

    await waitFor(() => {
      expect(onOpenDetail).toHaveBeenCalledWith("sunrise");
    });
  });
});
