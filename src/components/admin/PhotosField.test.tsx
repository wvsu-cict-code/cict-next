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
import { MAX_PHOTOS, type Photo } from "@/lib/photos";
import AdminForm from "./AdminForm";
import PhotosField from "./PhotosField";

const uploadPhoto = vi.fn();
vi.mock("@/lib/photoUpload", () => ({
  uploadPhoto: (...args: unknown[]) => uploadPhoto(...args),
}));
vi.mock("@/lib/supabase/browser", () => ({ getBrowserClient: () => ({}) }));

const autoEdit = vi.fn(async (file: File) => file);
vi.mock("@/lib/imageEdit/render", () => ({
  autoEdit: (file: File) => autoEdit(file),
}));

// The real editor needs canvas; this stand-in hands back the picked file
// (or, for an uploaded photo, a new "edited" file) when Apply is clicked.
vi.mock("./ImageEditor", () => ({
  default: (props: {
    source: File | string;
    applyLabel?: string;
    onApply: (file: File) => void;
    onSkip?: () => void;
    onCancel: () => void;
    onApplyRest?: (aspect: string) => void;
  }) => (
    <div role="dialog" aria-label="Editor">
      <p>
        Editing{" "}
        {typeof props.source === "string" ? props.source : props.source.name}
      </p>
      <button
        type="button"
        onClick={() =>
          props.onApply(
            typeof props.source === "string"
              ? new File(["y"], "edited.jpg", { type: "image/jpeg" })
              : props.source,
          )
        }
      >
        Apply edit
      </button>
      {props.onSkip && (
        <button type="button" onClick={props.onSkip}>
          Skip edit
        </button>
      )}
      {props.onApplyRest && (
        <button type="button" onClick={() => props.onApplyRest!("free")}>
          Smart-crop rest
        </button>
      )}
      <button type="button" onClick={props.onCancel}>
        Close edit
      </button>
    </div>
  ),
}));

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

/** Clicks Apply in the editor `times` times, one photo after another. */
async function applyEdits(times: number) {
  for (let i = 0; i < times; i++) {
    await user.click(screen.getByRole("button", { name: "Apply edit" }));
  }
}

describe("PhotosField", () => {
  afterEach(cleanup);
  beforeEach(() => {
    autoEdit.mockClear();
    uploadPhoto.mockReset();
    uploadPhoto.mockImplementation(async (_c, file: File) =>
      photo(file.name.replace(".jpg", "")),
    );
  });

  it("skips files beyond the photo cap instead of uploading them", async () => {
    renderField(
      Array.from({ length: MAX_PHOTOS - 2 }, (_, i) => photo(`old${i}`)),
    );
    await user.upload(
      screen.getByLabelText(/add photos/i),
      files("a", "b", "c", "d", "e"),
    );
    await applyEdits(2);
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(hidden()).toHaveLength(MAX_PHOTOS));
    expect(uploadPhoto).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(
        `Only ${MAX_PHOTOS} photos can be added; 3 files were skipped.`,
      ),
    ).toBeTruthy();
  });

  it("opens each chosen file in the editor, then uploads them in order", async () => {
    renderField();
    const input = screen.getByLabelText(/add photos/i);
    await user.upload(input, files("a", "b", "c"));
    expect(screen.getByText("Editing a.jpg")).toBeTruthy();
    await applyEdits(1);
    expect(screen.getByText("Editing b.jpg")).toBeTruthy();
    await applyEdits(2);
    await waitFor(() => expect(hidden()).toHaveLength(3));
    expect(hidden().map((p) => p.url)).toEqual([
      "https://x/a.jpg",
      "https://x/b.jpg",
      "https://x/c.jpg",
    ]);
    expect(uploadPhoto).toHaveBeenCalledTimes(3);
    expect(uploadPhoto.mock.calls[0][2]).toBe("posts");
  });

  it("moves a photo up", async () => {
    renderField([photo("a"), photo("b")]);
    await user.click(screen.getAllByRole("button", { name: /up$/i })[1]);
    expect(hidden().map((p) => p.url)).toEqual([
      "https://x/b.jpg",
      "https://x/a.jpg",
    ]);
  });

  it("keeps focus on the moved photo's move button", async () => {
    renderField([photo("a"), photo("b"), photo("c")]);
    const button = screen.getAllByRole("button", { name: /up$/i })[2];
    button.focus();
    await user.click(button);
    const active = document.activeElement as HTMLElement;
    expect(active).not.toBe(document.body);
    expect(active.dataset.move).toBe("up");
    expect(
      active.closest("li")?.querySelector("img")?.getAttribute("src"),
    ).toBe("https://x/c.jpg");
  });

  it("falls back to Move down when the moved photo reaches the start", async () => {
    renderField([photo("a"), photo("b")]);
    const button = screen.getAllByRole("button", { name: /up$/i })[1];
    button.focus();
    await user.click(button);
    const active = document.activeElement as HTMLElement;
    expect(active.dataset.move).toBe("down");
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
    await applyEdits(3);
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
    await applyEdits(3);
    expect(await screen.findByText(/b is too big/)).toBeTruthy();
    await waitFor(() => expect(hidden()).toHaveLength(2));
    expect(hidden().map((p) => p.url)).toEqual([
      "https://x/a.jpg",
      "https://x/c.jpg",
    ]);
  });

  it("leaves out a skipped photo", async () => {
    renderField();
    await user.upload(screen.getByLabelText(/add photos/i), files("a", "b"));
    await user.click(screen.getByRole("button", { name: "Skip edit" }));
    await applyEdits(1);
    await waitFor(() => expect(hidden()).toHaveLength(1));
    expect(hidden()[0].url).toBe("https://x/b.jpg");
  });

  it("smart-crops the current photo and the rest without opening them", async () => {
    renderField();
    await user.upload(
      screen.getByLabelText(/add photos/i),
      files("a", "b", "c"),
    );
    await applyEdits(1);
    await user.click(screen.getByRole("button", { name: "Smart-crop rest" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(hidden()).toHaveLength(3));
    expect(autoEdit.mock.calls.map(([file]) => file.name)).toEqual([
      "b.jpg",
      "c.jpg",
    ]);
  });

  it("says how many photos were left out when the editor is closed", async () => {
    renderField();
    await user.upload(
      screen.getByLabelText(/add photos/i),
      files("a", "b", "c"),
    );
    await applyEdits(1);
    await user.click(screen.getByRole("button", { name: "Close edit" }));
    expect(
      screen.getByText("Stopped editing; 2 photos weren't added."),
    ).toBeTruthy();
    await waitFor(() => expect(hidden()).toHaveLength(1));
  });

  it("turns away unusable files before the editor opens", async () => {
    renderField();
    await user.upload(screen.getByLabelText(/add photos/i), [
      new File(["x"], "notes.txt", { type: "text/plain" }),
    ]);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByText(/notes\.txt: Use a PNG, JPEG or WebP/),
    ).toBeTruthy();
  });

  it("re-edits an added photo, keeping its place and alt text", async () => {
    uploadPhoto.mockImplementation(async () => photo("edited"));
    renderField([photo("a"), { ...photo("b"), alt: "Lab" }]);
    await user.click(screen.getByRole("button", { name: "Edit photo 2" }));
    expect(screen.getByText("Editing https://x/b.jpg")).toBeTruthy();
    await applyEdits(1);
    await waitFor(() =>
      expect(hidden()[1]).toEqual({ ...photo("edited"), alt: "Lab" }),
    );
    expect(hidden()[0].url).toBe("https://x/a.jpg");
  });
});
