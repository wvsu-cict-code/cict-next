import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNav from "./AdminNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
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

afterEach(cleanup);

describe("AdminNav", () => {
  it("AdminNav shows a badge next to Student works when pending > 0", () => {
    render(<AdminNav badges={{ "/admin/student-works": 3 }} />);
    const link = screen.getByRole("link", { name: /Student works/ });
    expect(link.textContent).toContain("3");
  });

  it("hides the badge when the count is 0 or missing", () => {
    const { rerender } = render(
      <AdminNav badges={{ "/admin/student-works": 0 }} />,
    );
    expect(
      screen.getByRole("link", { name: "Student works" }).textContent,
    ).not.toMatch(/\d/);
    rerender(<AdminNav />);
    expect(
      screen.getByRole("link", { name: "Student works" }).textContent,
    ).not.toMatch(/\d/);
  });
});
