import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContentClient } from "@/lib/cms/content";
import { uploadPhoto } from "@/lib/photoUpload";

function fakeClient() {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.test/${path}` },
  }));
  const client = {
    storage: { from: () => ({ upload, getPublicUrl }) },
  } as unknown as ContentClient;
  return { client, upload };
}

function mockBrowser(width: number, height: number) {
  const close = vi.fn();
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width, height, close }),
  );
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toBlob: (cb: (b: Blob | null) => void, type: string) =>
      cb(new Blob(["x"], { type })),
  };
  vi.spyOn(document, "createElement").mockReturnValue(
    canvas as unknown as HTMLElement,
  );
  return { close };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("uploadPhoto", () => {
  it("resizes to 1600px, uploads as WebP and returns the photo", async () => {
    const { close } = mockBrowser(3200, 2400);
    const { client, upload } = fakeClient();
    const file = new File(["a"], "a.jpg", { type: "image/jpeg" });

    const photo = await uploadPhoto(client, file, "posts");

    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload.mock.calls[0][0]).toMatch(
      /^posts\/photos\/[0-9a-f-]{36}\.webp$/,
    );
    expect(photo).toMatchObject({ width: 1600, height: 1200, alt: "" });
    expect(photo.url).toBe(`https://cdn.test/${upload.mock.calls[0][0]}`);
    expect(close).toHaveBeenCalled();
  });

  it("rejects a non-image file", async () => {
    const { client, upload } = fakeClient();
    const file = new File(["a"], "a.txt", { type: "text/plain" });
    await expect(uploadPhoto(client, file, "events")).rejects.toThrow(
      "Use a PNG, JPEG or WebP image.",
    );
    expect(upload).not.toHaveBeenCalled();
  });
});
