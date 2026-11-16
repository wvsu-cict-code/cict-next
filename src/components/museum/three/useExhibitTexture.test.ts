import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeWork } from "@/components/studentWorks/fixtures";
import { youtubeThumbnail } from "@/lib/studentWorks/youtube";
import { exhibitImageUrl, useExhibitTexture } from "./useExhibitTexture";

const load = vi.hoisted(() => vi.fn());

vi.mock("three", () => {
  class TextureLoader {
    crossOrigin: string | null = null;
    setCrossOrigin(value: string) {
      this.crossOrigin = value;
    }
    load(
      url: string,
      onLoad: (texture: { dispose: () => void }) => void,
      _onProgress?: unknown,
      onError?: (error: unknown) => void,
    ) {
      load(url, this.crossOrigin, onLoad, onError);
    }
  }

  return { TextureLoader, SRGBColorSpace: "srgb" };
});

beforeEach(() => {
  load.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("useExhibitTexture", () => {
  it("a failed texture load returns failed", () => {
    const { result } = renderHook(() =>
      useExhibitTexture("https://cdn.test/missing.webp"),
    );

    expect(load).toHaveBeenCalledOnce();
    const [url, crossOrigin, , onError] = load.mock.calls[0];
    expect(url).toBe("https://cdn.test/missing.webp");
    expect(crossOrigin).toBe("anonymous");

    act(() => onError(new Error("cors")));
    expect(result.current).toBe("failed");
  });

  it("the texture is disposed on unmount", () => {
    const texture = { dispose: vi.fn(), colorSpace: "" };
    load.mockImplementation(
      (
        _url: string,
        _crossOrigin: string,
        onLoad: (next: typeof texture) => void,
      ) => {
        onLoad(texture);
      },
    );

    const { result, unmount } = renderHook(() =>
      useExhibitTexture("https://cdn.test/sunrise.webp"),
    );

    expect(result.current).toBe(texture);
    unmount();
    expect(texture.dispose).toHaveBeenCalledOnce();
  });
});

describe("exhibitImageUrl", () => {
  it("uses the webp image and the YouTube thumbnail for a legacy video", () => {
    expect(
      exhibitImageUrl(makeWork({ image_url: "https://cdn.test/sunrise.webp" })),
    ).toBe("https://cdn.test/sunrise.webp");

    expect(
      exhibitImageUrl(
        makeWork({
          category: "short_film",
          image_url: null,
          youtube_id: "abcdefghijk",
          video_url: null,
        }),
      ),
    ).toBe(youtubeThumbnail("abcdefghijk", "hqdefault"));

    expect(
      exhibitImageUrl(
        makeWork({
          category: "sound_design",
          image_url: null,
          youtube_id: null,
        }),
      ),
    ).toBeNull();
  });
});
