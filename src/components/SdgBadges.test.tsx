import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SdgBadges, SdgList } from "@/components/SdgBadges";

afterEach(cleanup);

describe("SdgBadges", () => {
  it("renders nothing for a post without goals", () => {
    const { container } = render(<SdgBadges sdgs={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows each goal as a numbered tile named for screen readers", () => {
    render(<SdgBadges sdgs={[9, 4]} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "4SDG 4: Quality Education",
      "9SDG 9: Industry, Innovation and Infrastructure",
    ]);
  });

  it("folds goals past the limit into a +N tile", () => {
    render(<SdgBadges sdgs={[1, 2, 3, 4, 5, 6]} max={4} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[3].textContent).toContain("+3");
    expect(items[3].getAttribute("title")).toContain("SDG 6: Clean Water");
  });
});

describe("SdgList", () => {
  it("lists every goal with its name", () => {
    render(<SdgList sdgs={[13]} />);
    expect(screen.getByText("Climate Action")).toBeTruthy();
  });

  it("renders nothing without goals", () => {
    const { container } = render(<SdgList sdgs={undefined} />);
    expect(container.innerHTML).toBe("");
  });
});
