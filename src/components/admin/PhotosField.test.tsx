import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Photo } from "@/lib/photos";
import AdminForm from "./AdminForm";
import PhotosField from "./PhotosField";

const uploadPhoto = vi.fn();
vi.mock("@/lib/photoUpload", () => ({
  uploadPhoto: (...args: unknown[]) => uploadPhoto(...args),
}));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));

const photo = (n: string): Photo => ({
  url: `https://x/${n}.jpg`,
  width: 10,
  height: 10,
  alt: "",
});

function renderField(defaultValue: Photo[] = []) {
  return render(
    <AdminForm action={async () => undefined}>
      <PhotosField name="photos" folder="posts" defaultValue={defaultValue} />
    </AdminForm>,
  );
}

function hidden(): Photo[] {
  const input = document.querySelector<HTMLInputElement>(
    'input[type="hidden"][name="photos"]',
  )!;
  return JSON.parse(input.value);
}

const user = {
  click: async (el: Element) => {
    await act(async () => {
      fireEvent.click(el);
    });
  },
  upload: async (el: Element, list: File[]) => {
    await act(async () => {
      fireEvent.change(el, { target: { files: list } });
    });
  },
};

function files(...names: string[]) {
  return names.map((n) => new File(["x"], `${n}.jpg`, { type: "image/jpeg" }));
}

describe("PhotosField", () => {
  afterEach(cleanup);
  beforeEach(() => {
    uploadPhoto.mockReset();
    uploadPhoto.mockImplementation(async (_c, file: File) =>
      photo(file.name.replace(".jpg", "")),
    );
  });

  it("uploads chosen files one at a time, in order", async () => {
    renderField();
    const input = screen.getByLabelText(/add photos/i);
    await user.upload(input, files("a", "b", "c"));
    await waitFor(() => expect(hidden()).toHaveLength(3));
    expect(hidden().map((p) => p.url)).toEqual([
      "https://x/a.jpg",
      "https://x/b.jpg",
      "https://x/c.jpg",
    ]);
    expect(uploadPhoto).toHaveBeenCalledTimes(3);
    expect(uploadPhoto.mock.calls[0][2]).toBe("posts");
  });

  it("moves a photo left", async () => {
    renderField([photo("a"), photo("b")]);
    await user.click(screen.getAllByRole("button", { name: /move left/i })[1]);
    expect(hidden().map((p) => p.url)).toEqual([
      "https://x/b.jpg",
      "https://x/a.jpg",
    ]);
  });

  it("keeps focus on the moved photo's move button", async () => {
    renderField([photo("a"), photo("b"), photo("c")]);
    const button = screen.getAllByRole("button", { name: /move left/i })[2];
    button.focus();
    await user.click(button);
    const active = document.activeElement as HTMLElement;
    expect(active).not.toBe(document.body);
    expect(active.dataset.move).toBe("left");
    expect(
      active.closest("li")?.querySelector("img")?.getAttribute("src"),
    ).toBe("https://x/c.jpg");
  });

  it("falls back to Move right when the moved photo reaches the start", async () => {
    renderField([photo("a"), photo("b")]);
    const button = screen.getAllByRole("button", { name: /move left/i })[1];
    button.focus();
    await user.click(button);
    const active = document.activeElement as HTMLElement;
    expect(active.dataset.move).toBe("right");
    expect(
      active.closest("li")?.querySelector("img")?.getAttribute("src"),
    ).toBe("https://x/b.jpg");
  });

  it("renders the same photo ids on every server render and on the client", () => {
    const element = (
      <PhotosField
        name="photos"
        folder="posts"
        defaultValue={[photo("a"), photo("b")]}
      />
    );
    const ids = (html: string) =>
      Array.from(html.matchAll(/data-photo-id="(\d+)"/g), (m) => m[1]);
    const first = ids(renderToString(element));
    const second = ids(renderToString(element));
    const client = ids(render(element).container.innerHTML);
    expect(first).toEqual(["0", "1"]);
    expect(second).toEqual(first);
    expect(client).toEqual(first);
  });

  it("removes a photo and edits alt text", async () => {
    renderField([photo("a"), photo("b")]);
    fireEvent.change(screen.getAllByLabelText(/alt text/i)[1], {
      target: { value: "Students" },
    });
    expect(hidden()[1].alt).toBe("Students");
    await user.click(screen.getAllByRole("button", { name: /remove/i })[0]);
    expect(hidden()).toEqual([{ ...photo("b"), alt: "Students" }]);
  });

  it("disables submit while uploading", async () => {
    let resolve!: (p: Photo) => void;
    uploadPhoto.mockImplementation(
      () => new Promise<Photo>((r) => (resolve = r)),
    );
    renderField();
    const submit = screen.getByRole("button", { name: /save/i });
    await user.upload(
      screen.getByLabelText(/add photos/i),
      files("a", "b", "c"),
    );
    expect(await screen.findByText(/uploading 1 of 3/i)).toBeTruthy();
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    uploadPhoto.mockImplementation(async () => photo("z"));
    await act(async () => resolve(photo("a")));
    await waitFor(() =>
      expect((submit as HTMLButtonElement).disabled).toBe(false),
    );
    expect(hidden()).toHaveLength(3);
  });

  it("shows a failure and still uploads the other files", async () => {
    uploadPhoto.mockImplementation(async (_c, file: File) => {
      if (file.name === "b.jpg") throw new Error("b is too big");
      return photo(file.name.replace(".jpg", ""));
    });
    renderField();
    await user.upload(
      screen.getByLabelText(/add photos/i),
      files("a", "b", "c"),
    );
    expect(await screen.findByText(/b is too big/)).toBeTruthy();
    await waitFor(() => expect(hidden()).toHaveLength(2));
    expect(hidden().map((p) => p.url)).toEqual([
      "https://x/a.jpg",
      "https://x/c.jpg",
    ]);
  });
});
