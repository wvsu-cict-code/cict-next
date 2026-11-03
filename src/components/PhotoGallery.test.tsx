import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("closes when the click lands beside the photo, not on it or the buttons", () => {
    render(<PhotoGallery photos={photos} />);
    const open = () => {
      fireEvent.click(screen.getByAltText("First").closest("button")!);
      return screen.getByRole("dialog");
    };
    let dialog = open();
    fireEvent.click(screen.getAllByAltText("First")[1]);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByRole("dialog")).toBeTruthy();
    // The full-size wrapper around the photo is the visible "backdrop"
    fireEvent.click(dialog.firstElementChild!);
    expect(screen.queryByRole("dialog")).toBeNull();

    dialog = open();
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the modal before returning focus to the photo", () => {
    const proto = HTMLDialogElement.prototype;
    const original = { show: proto.showModal, close: proto.close };
    let modal = false;
    proto.showModal = function () {
      modal = true;
      this.setAttribute("open", "");
    };
    proto.close = function () {
      modal = false;
      this.removeAttribute("open");
    };
    try {
      render(<PhotoGallery photos={photos} />);
      const opener = screen.getAllByRole("button")[0];
      // Outside a modal dialog nothing can take focus, like a real browser.
      const focus = vi.spyOn(opener, "focus").mockImplementation(() => {
        if (!modal) opener.dispatchEvent(new FocusEvent("focus"));
        if (!modal)
          Object.defineProperty(document, "activeElement", {
            configurable: true,
            value: opener,
          });
      });
      fireEvent.click(opener);
      expect(modal).toBe(true);
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(modal).toBe(false);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(opener);
    } finally {
      delete (document as unknown as Record<string, unknown>).activeElement;
      proto.showModal = original.show;
      proto.close = original.close;
    }
  });
});
