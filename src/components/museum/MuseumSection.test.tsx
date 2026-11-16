import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useContext, useEffect } from "react";
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
  getBrowserClient: () => ({
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  }),
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

function VisitDusk() {
  const museum = useContext(MuseumContext);
  return (
    <button type="button" onClick={() => museum?.visitExhibit("dusk")}>
      Visit dusk
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

  it("a second visit in the same gallery keeps the canvas mounted", async () => {
    const dusk = makeWork({
      id: "dusk",
      title: "Dusk",
      category: "game",
      image_url: "https://cdn.test/dusk.webp",
    });
    fetchGalleryCounts.mockResolvedValue({ a: 2, b: 0, c: 0 });
    fetchGalleryWorks.mockImplementation(
      async (_client: unknown, id: GalleryId) =>
        id === "a" ? [sunrise, dusk] : [],
    );
    fetchExhibit.mockImplementation(async (_client: unknown, id: string) =>
      id === "dusk" ? dusk : sunrise,
    );

    render(
      <MuseumSection>
        <VisitSunrise />
        <VisitDusk />
      </MuseumSection>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Visit sunrise" }));
    const canvas = await screen.findByTestId("museum-canvas");
    expect(canvas.textContent).toBe("a:Sunrise,Dusk");

    let release: (work: typeof dusk) => void = () => {};
    fetchExhibit.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Visit dusk" }));

    expect(screen.getByTestId("museum-canvas")).toBe(canvas);
    expect(
      screen.queryByRole("status", { name: /loading the gallery/i }),
    ).toBeNull();

    await act(async () => {
      release(dusk);
      await Promise.resolve();
    });

    expect(screen.getByTestId("museum-canvas")).toBe(canvas);
    expect(canvas.textContent).toBe("a:Sunrise,Dusk");
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

describe("MuseumSection controls", () => {
  it("E opens the exhibit in view", async () => {
    function FacingCanvas({
      onPlayerMove,
    }: {
      onPlayerMove: (player: {
        x: number;
        z: number;
        yaw: number;
        pitch: number;
      }) => void;
    }) {
      useEffect(() => {
        onPlayerMove({ x: -3.4, z: -6, yaw: Math.PI / 2, pitch: 0 });
      }, [onPlayerMove]);
      return <div data-testid="museum-canvas">hall</div>;
    }
    loadMuseumCanvas.mockResolvedValue({ default: FacingCanvas });

    render(<MuseumSection />);
    fireEvent.click(screen.getByRole("button", { name: /click to enter/i }));
    await screen.findByTestId("museum-canvas");

    const stage = screen.getByTestId("museum-stage");
    stage.focus();
    fireEvent.keyDown(stage, { key: "e" });

    expect(
      await screen.findByRole("heading", { name: "Sunrise" }),
    ).toBeTruthy();
    expect(screen.getByText("Ana Cruz")).toBeTruthy();
  });

  it("M toggles the minimap", async () => {
    render(<MuseumSection />);
    fireEvent.click(screen.getByRole("button", { name: /click to enter/i }));
    await screen.findByTestId("museum-canvas");

    const stage = screen.getByTestId("museum-stage");
    expect(screen.getByRole("img", { name: "Museum minimap" })).toBeTruthy();
    stage.focus();
    fireEvent.keyDown(stage, { key: "m" });
    expect(screen.queryByRole("img", { name: "Museum minimap" })).toBeNull();
    fireEvent.keyDown(stage, { key: "m" });
    expect(screen.getByRole("img", { name: "Museum minimap" })).toBeTruthy();
  });

  it("the minimap starts hidden on a phone", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 767px)" || query === "(pointer: coarse)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    render(<MuseumSection />);
    fireEvent.click(screen.getByRole("button", { name: /click to enter/i }));
    await screen.findByTestId("museum-canvas");

    expect(screen.queryByRole("img", { name: "Museum minimap" })).toBeNull();
    const stage = screen.getByTestId("museum-stage");
    stage.focus();
    fireEvent.keyDown(stage, { key: "m" });
    expect(screen.getByRole("img", { name: "Museum minimap" })).toBeTruthy();
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
