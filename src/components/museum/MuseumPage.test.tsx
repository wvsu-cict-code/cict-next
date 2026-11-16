import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProgramDetails from "@/components/ProgramDetails";
import type { Program } from "@/lib/cms/content";
import { clearContentCache } from "@/lib/cms/useContent";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/museum/categories";
import { makeWork } from "@/components/studentWorks/fixtures";
import { MuseumPage } from "./MuseumPage";

const fetchProgram = vi.hoisted(() => vi.fn());
const fetchExhibit = vi.hoisted(() => vi.fn());
const fetchFeaturedWorks = vi.hoisted(() => vi.fn());
const fetchExhibits = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
const session = vi.hoisted(() => ({
  status: "signed-out" as "loading" | "signed-out" | "signed-in",
  user: null as { id: string } | null,
  displayName: null as string | null,
}));

let search = "";
let pathname = "/programs/bsemc/";

vi.mock("@/lib/cms/content", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/cms/content")>(
      "@/lib/cms/content",
    );
  return { ...actual, fetchProgram };
});

vi.mock("@/lib/museum/queries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/museum/queries")>(
    "@/lib/museum/queries",
  );
  return { ...actual, fetchExhibit, fetchFeaturedWorks, fetchExhibits };
});

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserClient: () => ({}),
}));

vi.mock("@/lib/auth/session", () => ({
  useSession: () => session,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/museum/webgl", () => ({
  hasWebGL: () => false,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/studentWorks/StudentWorksSection", () => ({
  StudentWorksSection: () => null,
}));

const STATIC_NAME =
  "Bachelor of Science in Entertainment and Multimedia Computing";

function makeProgram(id: string, name: string): Program {
  return {
    id,
    code: id.toUpperCase(),
    name,
    logo_url: null,
    description: "A program description.",
    objectives: "Program objectives.",
    duration: "4 years",
    semesters: "2 semesters per year",
    careers: [],
    curriculum_pdf_url: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    sort_order: 1,
  };
}

class TestObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

async function settleLoads() {
  await waitFor(() => expect(fetchProgram).toHaveBeenCalled());
  await act(async () => {
    await Promise.all(
      fetchProgram.mock.results.map((result) =>
        Promise.resolve(result.value).catch(() => undefined),
      ),
    );
    await Promise.all(
      [
        ...fetchExhibit.mock.results,
        ...fetchFeaturedWorks.mock.results,
        ...fetchExhibits.mock.results,
      ].map((result) => Promise.resolve(result.value).catch(() => undefined)),
    );
  });
}

beforeEach(() => {
  search = "";
  pathname = "/programs/bsemc/";
  session.status = "signed-out";
  session.user = null;
  session.displayName = null;
  fetchProgram.mockReset();
  fetchExhibit.mockReset();
  fetchFeaturedWorks.mockReset();
  fetchExhibits.mockReset();
  replace.mockReset();
  fetchProgram.mockResolvedValue(null);
  fetchExhibit.mockResolvedValue(null);
  fetchFeaturedWorks.mockResolvedValue([]);
  fetchExhibits.mockResolvedValue({ works: [], total: 0 });
  window.location.hash = "";
  localStorage.clear();
  clearContentCache();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  vi.stubGlobal("ResizeObserver", TestObserver);
  vi.stubGlobal("IntersectionObserver", TestObserver);
});

afterEach(() => {
  cleanup();
  clearContentCache();
});

describe("MuseumPage", () => {
  it("hero links each category to the browse section", async () => {
    render(<MuseumPage />);
    await settleLoads();

    for (const category of CATEGORIES) {
      const link = screen.getByRole("link", {
        name: CATEGORY_LABELS[category],
      });
      expect(link.getAttribute("href")).toBe(`#browse?category=${category}`);
    }

    const hero = screen
      .getByRole("heading", { name: "Virtual Museum" })
      .closest("section");
    expect(hero?.getAttribute("data-theme")).toBe("dark");
    const stroke = hero?.querySelector("svg [stroke]");
    const opacity = Number(stroke?.getAttribute("stroke-opacity"));
    expect(opacity).toBeGreaterThanOrEqual(0.1);
    expect(opacity).toBeLessThanOrEqual(0.2);
    expect(hero?.querySelector("[style*='clip-path']")).toBeTruthy();
    expect(
      within(hero as HTMLElement)
        .getByRole("link", { name: "Browse Exhibits" })
        .getAttribute("href"),
    ).toBe("#browse");
  });

  it("enter museum scrolls to the hall and starts it", async () => {
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    const entered = vi.fn();
    window.addEventListener("museum:enter", entered);
    render(<MuseumPage />);
    await settleLoads();

    fireEvent.click(screen.getByRole("link", { name: "Enter Museum" }));

    expect(entered).toHaveBeenCalledOnce();
    expect(scroll).toHaveBeenCalled();
    expect(document.getElementById("museum-3d")).toBeTruthy();
    window.removeEventListener("museum:enter", entered);
  });

  it("program strip shows duration from the program row", async () => {
    fetchProgram.mockResolvedValue({
      ...makeProgram("bsemc", STATIC_NAME),
      code: "BSEMC",
      duration: "11 years",
      semesters: "3 terms a year",
    });
    render(<MuseumPage />);

    expect(await screen.findByText("11 years")).toBeTruthy();
    expect(screen.getByText("3 terms a year")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "BSEMC" }).getAttribute("href"),
    ).toBe("/programs/bsemc/");
    expect(
      screen.getByText(/Division of Entertainment and Multimedia Computing/),
    ).toBeTruthy();
  });

  it("program strip shows only the static name when the program fails to load", async () => {
    fetchProgram.mockRejectedValue(new Error("offline"));
    render(<MuseumPage />);
    await settleLoads();

    expect(screen.getByText(STATIC_NAME)).toBeTruthy();
    expect(screen.queryByText("11 years")).toBeNull();
    expect(screen.queryByText("4 years")).toBeNull();
    expect(screen.queryByRole("link", { name: "BSEMC" })).toBeNull();
    expect(
      screen.queryByText(/Division of Entertainment and Multimedia Computing/),
    ).toBeNull();
  });

  it("an unavailable ?exhibit= shows the notice and the page still renders", async () => {
    search = "exhibit=not-a-uuid";
    fetchExhibit.mockResolvedValue(null);
    render(<MuseumPage />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "This exhibit isn't available any more.",
    );
    expect(
      screen.getByRole("heading", { name: "Virtual Museum" }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("an available exhibit opens in the spotlight", async () => {
    search = "exhibit=11111111-1111-4111-8111-111111111111";
    fetchExhibit.mockResolvedValue(
      makeWork({
        id: "11111111-1111-4111-8111-111111111111",
        title: "Sunrise",
      }),
    );
    render(<MuseumPage />);

    expect(await screen.findByRole("dialog", { name: "Sunrise" })).toBeTruthy();
    expect(
      screen.queryByText("This exhibit isn't available any more."),
    ).toBeNull();
  });

  it("how it works lists Sign in, Upload, Review, Exhibit", async () => {
    render(<MuseumPage />);
    await settleLoads();

    const list = screen.getByRole("list", { name: "How it works" });
    const steps = within(list).getAllByRole("listitem");
    expect(
      steps.map((step) => within(step).getByRole("heading").textContent),
    ).toEqual(["Sign in", "Upload", "Review", "Exhibit"]);
    expect(within(steps[0]).getByText(/WVSU account/i)).toBeTruthy();
    expect(
      within(steps[1]).getByText(/project files, details and media/i),
    ).toBeTruthy();
    expect(
      within(steps[2]).getByText(/CICT admin checks your submission/i),
    ).toBeTruthy();
    expect(
      within(steps[3]).getByText(/goes live in the Virtual Museum/i),
    ).toBeTruthy();
  });

  it("upload exhibit goes to sign-in until the visitor is signed in", async () => {
    const { rerender } = render(<MuseumPage />);
    await settleLoads();
    expect(
      screen.getByRole("link", { name: /Upload Exhibit/ }).getAttribute("href"),
    ).toBe(`/account/sign-in/?next=${encodeURIComponent("/account/submit/")}`);

    session.status = "signed-in";
    session.user = { id: "student-1" };
    rerender(<MuseumPage />);
    expect(
      screen.getByRole("link", { name: /Upload Exhibit/ }).getAttribute("href"),
    ).toBe("/account/submit/");
  });

  it("hero category link preselects the browse filter", async () => {
    window.location.hash = "#browse?category=sound_design";
    render(<MuseumPage />);
    await settleLoads();

    const chip = screen.getByRole("radio", { name: "Sound Design" });
    expect(chip.getAttribute("data-state")).toBe("on");
    expect(chip.className).toContain("bg-theme-red");
    expect(chip.className).toContain("text-white");
    expect(
      screen.getByRole("radio", { name: "All" }).getAttribute("data-state"),
    ).toBe("off");
  });

  it("opens exhibit detail from a highlight or a browse card", async () => {
    const highlightId = "11111111-1111-4111-8111-111111111111";
    const browseId = "22222222-2222-4222-8222-222222222222";
    fetchFeaturedWorks.mockResolvedValue([
      makeWork({ id: highlightId, title: "Sunrise", like_count: 3 }),
    ]);
    fetchExhibits.mockResolvedValue({
      works: [makeWork({ id: browseId, title: "Lantern", like_count: 1 })],
      total: 1,
    });
    render(<MuseumPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Sunrise" }));
    expect(replace).toHaveBeenCalledWith(
      `/programs/bsemc/museum/?exhibit=${highlightId}`,
    );
    fireEvent.click(screen.getByRole("button", { name: "Lantern" }));
    expect(replace).toHaveBeenCalledWith(
      `/programs/bsemc/museum/?exhibit=${browseId}`,
    );
  });

  it("places the 3D section between highlights and browse", async () => {
    render(<MuseumPage />);
    await settleLoads();

    const hall = document.getElementById("museum-3d");
    expect(hall?.getAttribute("data-theme")).toBe("dark");
    expect(hall?.textContent).toMatch(/can't display the 3D museum/i);
    expect(hall?.querySelector("a[href='#browse']")?.textContent).toMatch(
      /Browse Exhibits/,
    );

    const ids = ["highlights", "museum-3d", "browse", "share"];
    const nodes = ids.map((id) => document.getElementById(id));
    expect(nodes.every((node) => node instanceof HTMLElement)).toBe(true);
    expect(document.getElementById("highlights")?.childElementCount).toBe(0);
    expect(screen.getByRole("radio", { name: "All" })).toBeTruthy();
    const hero = screen.getByRole("heading", { name: "Virtual Museum" });
    expect(
      hero.compareDocumentPosition(nodes[0]!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (let index = 1; index < nodes.length; index += 1) {
      expect(
        nodes[index - 1]!.compareDocumentPosition(nodes[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });
});

describe("ProgramDetails museum banner", () => {
  it("BSEMC program page shows the museum banner, other programs do not", async () => {
    fetchProgram.mockImplementation(async (_client: unknown, id: string) => {
      if (id === "bsemc") {
        return makeProgram(
          "bsemc",
          "Bachelor of Science in Entertainment and Multimedia Computing",
        );
      }
      if (id === "bscs") {
        return makeProgram("bscs", "Bachelor of Science in Computer Science");
      }
      return null;
    });

    pathname = "/programs/bsemc/";
    const { unmount } = render(<ProgramDetails />);
    expect(
      await screen.findByRole("heading", { name: "Visit the Virtual Museum" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /Enter the museum/ })
        .getAttribute("href"),
    ).toBe("/programs/bsemc/museum/");
    unmount();

    pathname = "/programs/bscs/";
    render(<ProgramDetails />);
    expect(
      await screen.findByRole("heading", {
        name: "Bachelor of Science in Computer Science",
      }),
    ).toBeTruthy();
    expect(screen.queryByText("Visit the Virtual Museum")).toBeNull();
  });
});
