import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PhotoGallery from "@/components/PhotoGallery";
import type { Photo } from "@/lib/photos";

const photos: Photo[] = [
  { url: "/a.jpg", width: 400, height: 300, alt: "First" },
  { url: "/b.jpg", width: 400, height: 300, alt: "" },
  { url: "/c.jpg", width: 300, height: 400, alt: "Third" },
];

describe("PhotoGallery", () => {
  afterEach(cleanup);

  it("renders nothing without photos", () => {
    const { container } = render(<PhotoGallery photos={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders one button per photo, falling back to a positional alt", () => {
    render(<PhotoGallery photos={photos} />);
    const section = screen.getByRole("region", { name: "Photos" });
    expect(section.querySelectorAll("button")).toHaveLength(3);
    expect(screen.getByAltText("First").getAttribute("loading")).toBe("lazy");
    expect(screen.getByAltText("Photo 2 of 3")).toBeTruthy();
  });

  it("opens, navigates with wrap-around, and closes with Escape", () => {
    render(<PhotoGallery photos={photos} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    const opener = screen
      .getByAltText("Photo 2 of 3")
      .closest("button") as HTMLElement;
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("2 of 3");

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(dialog.textContent).toContain("3 of 3");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(dialog.textContent).toContain("1 of 3");
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(dialog.textContent).toContain("3 of 3");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(dialog.textContent).toContain("1 of 3");
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(dialog.textContent).toContain("3 of 3");

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
