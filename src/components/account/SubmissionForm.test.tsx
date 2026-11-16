import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QUOTA_MESSAGE } from "@/lib/museum/submissions";
import { SubmissionForm } from "./SubmissionForm";

const replace = vi.fn();
const countActiveWorks = vi.fn();
const listMySubmissions = vi.fn();
const createSubmission = vi.fn();
const updateSubmission = vi.fn();
const checkSubmissionFile = vi.fn();
const readImageSize = vi.fn();
const checkImageEdge = vi.fn();
const capturePoster = vi.fn();
const readVideoOrientation = vi.fn();

let session: {
  status: string;
  user: { id: string; email?: string } | null;
  displayName: string | null;
};
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/auth/session", () => ({ useSession: () => session }));
vi.mock("@/lib/museum/submissions", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/museum/submissions")
  >("@/lib/museum/submissions");
  return {
    ...actual,
    countActiveWorks: (...a: unknown[]) => countActiveWorks(...a),
    listMySubmissions: (...a: unknown[]) => listMySubmissions(...a),
    createSubmission: (...a: unknown[]) => createSubmission(...a),
    updateSubmission: (...a: unknown[]) => updateSubmission(...a),
  };
});
vi.mock("@/lib/museum/files", () => ({
  checkSubmissionFile: (...a: unknown[]) => checkSubmissionFile(...a),
  readImageSize: (...a: unknown[]) => readImageSize(...a),
  checkImageEdge: (...a: unknown[]) => checkImageEdge(...a),
}));
vi.mock("@/lib/museum/poster", () => ({
  capturePoster: (...a: unknown[]) => capturePoster(...a),
  readVideoOrientation: (...a: unknown[]) => readVideoOrientation(...a),
}));

afterEach(cleanup);

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  replace.mockReset();
  countActiveWorks.mockReset().mockResolvedValue(0);
  listMySubmissions.mockReset().mockResolvedValue([]);
  createSubmission.mockReset().mockResolvedValue({ id: "new-id" });
  updateSubmission.mockReset().mockResolvedValue({});
  checkSubmissionFile.mockReset().mockResolvedValue(null);
  readImageSize.mockReset().mockResolvedValue({ width: 800, height: 600 });
  checkImageEdge.mockReset().mockReturnValue(null);
  capturePoster.mockReset();
  readVideoOrientation.mockReset();
  searchParams = new URLSearchParams();
  session = {
    status: "signed-in",
    user: { id: "user-1", email: "ana@wvsu.edu.ph" },
    displayName: "Ana Reyes",
  };
});

async function pickCategory(label: string) {
  fireEvent.click(screen.getByRole("combobox", { name: /category/i }));
  fireEvent.click(await screen.findByRole("option", { name: label }));
}

describe("SubmissionForm", () => {
  it("shows the quota alert and no file fields at 5 active works", async () => {
    countActiveWorks.mockResolvedValue(5);
    render(<SubmissionForm />);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(QUOTA_MESSAGE);
    expect(screen.queryByLabelText(/artwork|cover|video|audio/i)).toBeNull();
    expect(
      (screen.getByRole("button", { name: /submit/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("game category asks for a cover and live link, digital art only for artwork", async () => {
    render(<SubmissionForm />);
    await screen.findByLabelText(/title/i);
    await pickCategory("Games");
    expect(screen.getByLabelText(/cover/i)).toBeTruthy();
    expect(screen.getByLabelText(/live link/i)).toBeTruthy();
    expect(screen.queryByLabelText(/artwork/i)).toBeNull();
    expect(screen.queryByLabelText(/^video$/i)).toBeNull();

    await pickCategory("Digital Art");
    expect(screen.getByLabelText(/artwork/i)).toBeTruthy();
    expect(screen.queryByLabelText(/cover/i)).toBeNull();
    expect(screen.queryByLabelText(/live link/i)).toBeNull();
  });

  it("an invalid file shows its error under the field and blocks submit", async () => {
    checkSubmissionFile.mockResolvedValue("Use a WebP image (.webp).");
    render(<SubmissionForm />);
    await screen.findByLabelText(/title/i);
    await pickCategory("Digital Art");
    const input = screen.getByLabelText(/artwork/i);
    const file = new File([new Uint8Array([1, 2, 3])], "a.png", {
      type: "image/png",
    });
    fireEvent.change(input, { target: { files: [file] } });
    expect(
      await screen.findByText("Use a WebP image (.webp)."),
    ).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Sunset" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "A study." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(createSubmission).not.toHaveBeenCalled());
  });

  it("editing an approved work asks for confirmation first", async () => {
    searchParams = new URLSearchParams({ id: "work-1" });
    listMySubmissions.mockResolvedValue([
      {
        id: "work-1",
        title: "Old Game",
        category: "game",
        description: "Play me",
        student: "Ana Reyes",
        status: "approved",
        image_url: "https://example.com/c.webp",
        store_url: "https://example.com/play",
        portfolio_url: null,
        video_url: null,
        audio_url: null,
        rejection_reason: null,
      },
    ]);
    render(<SubmissionForm />);
    expect(
      await screen.findByText(
        /Editing sends this work back for review\. It leaves the museum until it's approved again\./,
      ),
    ).toBeTruthy();
    expect(screen.queryByLabelText(/title/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /continue editing/i }));
    const title = (await screen.findByLabelText(/title/i)) as HTMLInputElement;
    expect(title.value).toBe("Old Game");
  });

  it("sends signed-out visitors to sign-in with next", async () => {
    session = { status: "signed-out", user: null, displayName: null };
    render(<SubmissionForm />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/account/sign-in/?next=%2Faccount%2Fsubmit%2F",
      ),
    );
  });
});
