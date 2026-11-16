import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Progress } from "@/components/ui/progress";

afterEach(cleanup);

describe("Progress", () => {
  it("exposes its value to assistive tech", () => {
    render(<Progress value={40} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("data-state")).toBe("loading");
  });
});
