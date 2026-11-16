import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentError } from "@/components/ContentState";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

describe("ContentError", () => {
  it("explains the problem and retries on click", () => {
    const onRetry = vi.fn();
    render(<ContentError onRetry={onRetry} />);

    expect(screen.getByText("We couldn't load this content.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("useDocumentTitle", () => {
  it("uses the site's title template", () => {
    renderHook(() => useDocumentTitle("Computer Science Faculty"));
    expect(document.title).toBe("Computer Science Faculty | CICT");
  });

  it("leaves the title alone until there is one", () => {
    document.title = "WVSU CICT";
    renderHook(() => useDocumentTitle(undefined));
    expect(document.title).toBe("WVSU CICT");
  });
});
