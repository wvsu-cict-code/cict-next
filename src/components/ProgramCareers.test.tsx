import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProgramCareers } from "@/components/ProgramCareers";

afterEach(cleanup);

describe("ProgramCareers", () => {
  it("lists each career under a Possible careers heading", () => {
    render(<ProgramCareers careers={["Game developer", "Animator"]} />);
    expect(
      screen.getByRole("heading", { name: "Possible careers" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["Game developer", "Animator"]);
  });

  it("renders nothing when the program has no careers", () => {
    const { container } = render(<ProgramCareers careers={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for program data saved before careers existed", () => {
    const { container } = render(<ProgramCareers careers={undefined} />);
    expect(container.innerHTML).toBe("");
  });
});
