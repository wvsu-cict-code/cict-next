import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsBell } from "@/components/account/NotificationsBell";

const fetchNotifications = vi.fn();
const markAllNotificationsRead = vi.fn();
vi.mock("@/lib/museum/notifications", () => ({
  fetchNotifications: (...a: unknown[]) => fetchNotifications(...a),
  markAllNotificationsRead: (...a: unknown[]) => markAllNotificationsRead(...a),
}));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));

const base = {
  user_id: "u",
  reason: null,
  read_at: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("NotificationsBell", () => {
  beforeEach(() => {
    fetchNotifications.mockReset();
    markAllNotificationsRead.mockReset().mockResolvedValue(undefined);
  });
  afterEach(cleanup);

  it("bell shows an unread dot and marks all read when opened", async () => {
    fetchNotifications.mockResolvedValue([
      { ...base, id: "1", work_id: "w1", kind: "approved", work_title: "Zine" },
    ]);
    render(<NotificationsBell />);
    await waitFor(() => expect(screen.getByTestId("unread-dot")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => expect(markAllNotificationsRead).toHaveBeenCalled());
    expect(screen.queryByTestId("unread-dot")).toBeNull();
  });

  it("approved notification links to the exhibit and rejected links to /account/", async () => {
    fetchNotifications.mockResolvedValue([
      { ...base, id: "1", work_id: "w1", kind: "approved", work_title: "Zine" },
      {
        ...base,
        id: "2",
        work_id: "w2",
        kind: "rejected",
        work_title: "Reel",
        reason: "Too blurry",
      },
      { ...base, id: "3", work_id: null, kind: "approved", work_title: "Gone" },
    ]);
    render(<NotificationsBell />);
    await waitFor(() => expect(screen.getByTestId("unread-dot")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    const zine = await screen.findByRole("link", { name: /Zine/ });
    expect(zine.getAttribute("href")).toMatch(
      /^\/programs\/bsemc\/museum\/?\?exhibit=w1$/,
    );
    expect(
      screen.getByRole("link", { name: /Reel/ }).getAttribute("href"),
    ).toMatch(/^\/account\/?$/);
    expect(screen.getByText(/Too blurry/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Gone/ })).toBeNull();
    expect(screen.getByText(/Gone/)).toBeTruthy();
  });
});
