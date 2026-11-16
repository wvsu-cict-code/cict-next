import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { GallerySelect } from "./GallerySelect";

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture ||= () => false;
  HTMLElement.prototype.setPointerCapture ||= () => {};
  HTMLElement.prototype.releasePointerCapture ||= () => {};
  HTMLElement.prototype.scrollIntoView ||= () => {};
});

describe("GallerySelect", () => {
  it("gallery select lists only non-empty galleries", async () => {
    const onChange = vi.fn();
    render(
      <GallerySelect
        counts={{ a: 2, b: 0, c: 1 }}
        value="a"
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Gallery" });
    expect(trigger.textContent).toContain("Gallery A");
    expect(trigger.textContent).toContain("Games & Interactive Media");
    expect(trigger.textContent).not.toContain("Gallery B");

    fireEvent.click(trigger);

    expect(
      await screen.findByRole("option", { name: /Gallery A/ }),
    ).toBeTruthy();
    expect(screen.getByRole("option", { name: /Gallery C/ })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /Gallery B/ })).toBeNull();
    expect(screen.queryByText("Animation, Film & Sound")).toBeNull();

    fireEvent.click(screen.getByRole("option", { name: /Digital Art & 3D/ }));
    expect(onChange).toHaveBeenCalledWith("c");
  });
});
