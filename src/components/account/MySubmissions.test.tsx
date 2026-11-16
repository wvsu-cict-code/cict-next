import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MySubmissions } from "./MySubmissions";

const listMySubmissions = vi.fn();
const deleteSubmission = vi.fn();

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
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));
vi.mock("@/lib/museum/submissions", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/museum/submissions")
  >("@/lib/museum/submissions");
  return {
    ...actual,
    listMySubmissions: (...a: unknown[]) => listMySubmissions(...a),
    deleteSubmission: (...a: unknown[]) => deleteSubmission(...a),
  };
});

const works = [
  {
    id: "pending-1",
    title: "Pending Piece",
    category: "digital_art" as const,
    description: "d",
    student: "Ana",
    status: "pending" as const,
    image_url: "https://example.com/p.webp",
    store_url: null,
    portfolio_url: null,
    video_url: null,
    audio_url: null,
    rejection_reason: null,
  },
  {
    id: "approved-1",
    title: "Approved Piece",
    category: "game" as const,
    description: "d",
    student: "Ana",
    status: "approved" as const,
    image_url: "https://example.com/a.webp",
    store_url: "https://example.com/play",
    portfolio_url: null,
    video_url: null,
    audio_url: null,
    rejection_reason: null,
  },
  {
    id: "rejected-1",
    title: "Rejected Piece",
    category: "short_film" as const,
    description: "d",
    student: "Ana",
    status: "rejected" as const,
    image_url: "https://example.com/r.webp",
    store_url: null,
    portfolio_url: null,
    video_url: "https://example.com/r.webm",
    audio_url: null,
    rejection_reason: "Needs a clearer title card.",
  },
];

afterEach(cleanup);

beforeEach(() => {
  listMySubmissions.mockReset().mockResolvedValue(works);
  deleteSubmission.mockReset().mockResolvedValue({});
});

describe("MySubmissions", () => {
  it("my submissions shows the rejection reason and the right actions per status", async () => {
    render(<MySubmissions userId="user-1" />);

    const pending = await screen.findByText("Pending Piece");
    const pendingRow = pending.closest("li")!;
    expect(within(pendingRow).getByText("Pending")).toBeTruthy();
    expect(within(pendingRow).getByRole("link", { name: "Edit" })).toBeTruthy();
    expect(
      within(pendingRow).getByRole("button", { name: "Withdraw" }),
    ).toBeTruthy();
    expect(within(pendingRow).queryByRole("button", { name: "Delete" })).toBeNull();

    const approved = screen.getByText("Approved Piece");
    const approvedRow = approved.closest("li")!;
    const approvedBadge = within(approvedRow).getByText("Approved");
    expect(approvedBadge.closest("a")?.getAttribute("href")).toBe(
      "/programs/bsemc/museum/?exhibit=approved-1",
    );
    expect(
      within(approvedRow).getByRole("button", { name: "Edit" }),
    ).toBeTruthy();
    expect(
      within(approvedRow).getByRole("button", { name: "Delete" }),
    ).toBeTruthy();
    expect(
      within(approvedRow).queryByRole("button", { name: "Withdraw" }),
    ).toBeNull();

    const rejected = screen.getByText("Rejected Piece");
    const rejectedRow = rejected.closest("li")!;
    expect(within(rejectedRow).getByText("Rejected")).toBeTruthy();
    expect(
      within(rejectedRow).getByText("Needs a clearer title card."),
    ).toBeTruthy();
    expect(within(rejectedRow).getByRole("link", { name: "Edit" })).toBeTruthy();
    expect(
      within(rejectedRow).getByRole("button", { name: "Delete" }),
    ).toBeTruthy();
    expect(
      within(rejectedRow).queryByRole("button", { name: "Withdraw" }),
    ).toBeNull();

    expect(
      screen.getByText(
        "You can have up to 5 works in the museum or waiting for review.",
      ),
    ).toBeTruthy();
  });

  it("editing an approved work asks for confirmation first", async () => {
    render(<MySubmissions userId="user-1" />);
    await screen.findByText("Approved Piece");
    const approvedRow = screen.getByText("Approved Piece").closest("li")!;
    fireEvent.click(within(approvedRow).getByRole("button", { name: "Edit" }));
    expect(
      await screen.findByText(
        /Editing sends this work back for review\. It leaves the museum until it's approved again\./,
      ),
    ).toBeTruthy();
  });

  it("withdraw confirms then deletes", async () => {
    render(<MySubmissions userId="user-1" />);
    await screen.findByText("Pending Piece");
    const pendingRow = screen.getByText("Pending Piece").closest("li")!;
    fireEvent.click(within(pendingRow).getByRole("button", { name: "Withdraw" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm withdraw" }));
    await waitFor(() => expect(deleteSubmission).toHaveBeenCalled());
  });
});
