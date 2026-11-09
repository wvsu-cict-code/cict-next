# Social Post Composer and Photo Galleries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Posts and events hold photo galleries shown on the public site, and the CMS exports any post or event as a zipped, ready-to-upload Facebook post (split 940×1880 cover + 940×940 photos + caption).

**Architecture:** Galleries are a `photos jsonb` array on `posts` and `events` (RLS follows the row), uploaded from the browser straight to the `media` bucket like student works. The composer is a CMS-only client page that draws on `<canvas>` and zips with `fflate` in the browser. Pure logic (geometry, text fitting, caption, pack contents) lives in `src/lib/socialPack/` with unit tests; drawing and UI sit on top.

**Tech Stack:** Next.js 16 (app router, two builds), Supabase (Postgres + Storage), React 19, Tailwind 4, Vitest + Testing Library (jsdom), `fflate`.

**Spec:** `docs/superpowers/specs/2026-11-03-social-post-composer-design.md`

## Global Constraints

- Public pages are `*.site.tsx` and must work in the static export (`npm run build:site`); composer and CMS code never live in `*.site.tsx` files.
- Output sizes: cover 940×1880 cut at y = 940 into `01.jpg` and `02.jpg`; every photo `NN.jpg` at 940×940; JPEG.
- Pack order: post/event `cover_image_url` first (if any), then `photos` in order, duplicates by URL dropped.
- Footer on cover and every photo: Facebook `/cictwvsu`, X `/cictwvsu`, `cict@wvsu.edu.ph`.
- Navy `#102033`. Orange, wave and wash shapes live only in `src/lib/socialPack/brand.ts`.
- Fonts: Oswald for the title, Source Sans 3 for everything else (the site's `next/font` families, via `--font-oswald` / `--font-source-sans`).
- WVSU seal: draw `/wvsu-seal.png` beside the CICT logo when it loads; otherwise the CICT logo (`/icons/cictlogo.png`) alone, centred.
- Caption link uses `SITE_URL` from `src/lib/seo.ts`.
- Warn (don't block) when the pack has fewer than 5 images.
- Composer settings are not saved; it starts fresh each time.
- Uploads go browser → Supabase Storage (`media` bucket), never through a server action body (10 MB limit).
- Existing rows keep working: `photos` defaults to `[]`.

## Review Focus

1. **A photo hosted on another site** (cover URL pasted from elsewhere, no CORS) taints the canvas: it must be left out of the pack with a visible note, and the export still succeeds. Test in Task 6.
2. **A very long title** must shrink, then truncate with "…", and never run outside the wave. Test in Task 5.
3. **A post with no summary** gets a summary from the body's plain text (first 200 characters, cut at a word, with "…"). Test in Task 5.
4. **Saving the post form while photos are still uploading** must not drop them: the submit button is disabled until uploads finish. Test in Task 3.
5. **Posts and events with no gallery** (every existing row) show no gallery section on the site and still export a full pack from their cover image. Tests in Tasks 4 and 5.

---

### Task 1: `photos` column and the `Photo` type

**Files:**
- Create: `supabase/migrations/20261103000000_photo_galleries.sql`
- Modify: `src/lib/supabase/database.types.ts` (regenerated)
- Create: `src/lib/photos.ts`
- Test: `src/lib/photos.test.ts`

**Interfaces:**
- Produces:
  - `type Photo = { url: string; width: number; height: number; alt: string }`
  - `parsePhotos(raw: unknown): Photo[]`: accepts a JSON string or an array; drops entries without an `http(s)://` or `/`-rooted `url` or with non-positive integer width/height; `alt` defaults to `""` and is trimmed; caps at 60 photos.
  - DB: `posts.photos` and `events.photos`, `jsonb not null default '[]'`, check `jsonb_typeof(photos) = 'array'`.

- [ ] **Step 1: Write the failing tests** in `src/lib/photos.test.ts`:
  - `parsePhotos('[{"url":"https://x/a.webp","width":800,"height":600,"alt":" Team "}]')` → `[{ url: "https://x/a.webp", width: 800, height: 600, alt: "Team" }]`
  - `parsePhotos([{ url: "javascript:alert(1)", width: 1, height: 1 }])` → `[]`
  - `parsePhotos([{ url: "/a.jpg", width: 0, height: 5 }])` → `[]`
  - `parsePhotos("not json")` → `[]`; `parsePhotos(null)` → `[]`
  - 61 valid entries → length 60
- [ ] **Step 2: Run** `npx vitest run src/lib/photos.test.ts`, expect FAIL (module not found).
- [ ] **Step 3: Implement** `src/lib/photos.ts`.
- [ ] **Step 4: Run** the test again, expect PASS.
- [ ] **Step 5: Write the migration** adding the column to both tables with the check constraint and a comment (`'Gallery photos shown below the article and used by the social post composer: [{url,width,height,alt}]'`). Apply with `npx supabase db reset` (local) and regenerate types with `npm run db:types`; confirm `photos: Json` appears on `posts` and `events` Row types.
- [ ] **Step 6: Run** `npx tsc --noEmit -p . 2>&1 | grep -v '^\.next/'` → no errors.
- [ ] **Step 7: Commit** `feat(db): photo galleries on posts and events`.

### Task 2: Browser photo upload

**Files:**
- Modify: `src/lib/studentWorks/images.ts` (export `renderEncoded` and `uploadBlob`, no behaviour change)
- Create: `src/lib/photoUpload.ts`
- Test: `src/lib/photoUpload.test.ts`

**Interfaces:**
- Consumes: `checkImageFile`, `DISPLAY_MAX` (1600), `renderEncoded`, `uploadBlob` from `src/lib/studentWorks/images.ts`; `Photo` from Task 1.
- Produces: `uploadPhoto(client: ContentClient, file: File, folder: "posts" | "events"): Promise<Photo>`: validates, encodes at most 1600px on the long edge (WebP, JPEG fallback), uploads to `${folder}/photos/${uuid}.${webp|jpg}`, returns `{ url, width, height, alt: "" }`. Throws `Error` with the user-facing message from `checkImageFile` or the upload.

- [ ] **Step 1: Write failing tests** with `createImageBitmap`, `document.createElement('canvas')` and the Supabase client mocked (see `src/lib/studentWorks/images.test.ts` for the existing mocking style): a 3200×2400 JPEG → upload path matches `/^posts\/photos\/[0-9a-f-]{36}\.webp$/`, result `{ width: 1600, height: 1200, alt: "" }`; a `text/plain` file rejects with "Use a PNG, JPEG or WebP image."
- [ ] **Step 2: Run** `npx vitest run src/lib/photoUpload.test.ts` → FAIL.
- [ ] **Step 3: Implement**; export the two helpers from `images.ts`.
- [ ] **Step 4: Run** `npx vitest run src/lib/photoUpload.test.ts src/lib/studentWorks` → PASS.
- [ ] **Step 5: Commit** `feat(cms): upload gallery photos from the browser`.

### Task 3: Photos field on the post and event forms

**Files:**
- Create: `src/components/admin/PhotosField.tsx`
- Test: `src/components/admin/PhotosField.test.tsx`
- Modify: `src/components/admin/AdminForm.tsx` (submit can be disabled by a child; see step 3)
- Modify: `src/app/admin/(cms)/posts/PostForm.tsx`, `src/app/admin/(cms)/posts/actions.ts`
- Modify: `src/app/admin/(cms)/events/EventForm.tsx`, `src/app/admin/(cms)/events/actions.ts`

**Interfaces:**
- Consumes: `uploadPhoto` (Task 2), `parsePhotos`/`Photo` (Task 1), `moveItem(list, from, to)` from `src/lib/studentWorks/order.ts`, `getBrowserClient()`.
- Produces: `<PhotosField name="photos" folder="posts"|"events" defaultValue={Photo[]} />`, which submits a hidden input `photos` holding `JSON.stringify(Photo[])`. Server actions add `photos: parsePhotos(getString(formData, "photos"))` to `values`.

- [ ] **Step 1: Write failing tests** (`uploadPhoto` mocked):
  - choosing 3 files (one `<input type="file" multiple>`) uploads them one at a time in order and the hidden input's value parses to 3 photos in that order
  - "Move left" on the 2nd thumbnail swaps the first two in the hidden value
  - "Remove" drops one; editing the alt text input updates `alt` in the hidden value
  - while an upload is pending, the form's submit button is disabled and a "Uploading 1 of 3…" status shows; after it resolves the button is enabled
  - an upload that rejects shows its message and the other files still upload
- [ ] **Step 2: Run** `npx vitest run src/components/admin/PhotosField.test.tsx` → FAIL.
- [ ] **Step 3: Implement.** Thumbnails in a responsive grid with keyboard-accessible "Move left / Move right / Remove" buttons and an alt-text input under each. (Plan decision: buttons instead of the spec's drag-to-reorder, so it works by keyboard and needs no drag library; drag can be added on top later.) To disable submit, add a `busy` context to `AdminForm` (`AdminFormBusyContext`, setter `setBusy(key: string, busy: boolean)`), and have its submit button use `disabled={pending || anyBusy}`.
- [ ] **Step 4: Wire it in.** In both forms add `<FormSection title="Photos" description="Shown below the article. Also used when exporting for social media.">` under the cover image section; pass `defaultValue={parsePhotos(post?.photos)}`. Add `photos` to both actions' `values`.
- [ ] **Step 5: Run** `npx vitest run` → all PASS; `npx eslint src/components/admin src/app/admin` clean.
- [ ] **Step 6: Commit** `feat(cms): photo galleries in the post and event editors`.

### Task 4: Gallery on the public article and event pages

**Files:**
- Create: `src/components/PhotoGallery.tsx`
- Test: `src/components/PhotoGallery.test.tsx`
- Modify: `src/components/NewsArticle.tsx` (after `<MarkdownRenderer>`, before `<SdgList>`), `src/components/EventDetail.tsx` (after the body)

**Interfaces:**
- Consumes: `parsePhotos`, `Photo` (Task 1).
- Produces: `<PhotoGallery photos={Photo[]} />`: renders nothing for `[]`; otherwise a `<section aria-label="Photos">` grid of `<img loading="lazy" width height alt>` buttons; clicking opens a `<dialog>` with the photo large, "Previous"/"Next" buttons, ←/→ keys, Esc to close, and "3 of 14" text.

- [ ] **Step 1: Write failing tests:** `[]` renders nothing; 3 photos → 3 buttons with the photos' alt (or "Photo 2 of 3" when alt is empty); clicking photo 2 opens the dialog showing "2 of 3"; ArrowRight → "3 of 3"; ArrowRight again wraps to "1 of 3"; Escape closes.
- [ ] **Step 2: Run** `npx vitest run src/components/PhotoGallery.test.tsx` → FAIL.
- [ ] **Step 3: Implement** and add it to both detail components with `photos={parsePhotos(post.photos)}` / `parsePhotos(event.photos)`.
- [ ] **Step 4: Run** `npx vitest run` → PASS.
- [ ] **Step 5: Commit** `feat(site): photo galleries on articles and events`.

### Task 5: Social pack logic (pure)

**Files:**
- Create: `src/lib/socialPack/brand.ts`, `layouts.ts`, `crop.ts`, `text.ts`, `pack.ts`
- Test: `src/lib/socialPack/layouts.test.ts`, `crop.test.ts`, `text.test.ts`, `pack.test.ts`

**Interfaces:**
- Consumes: `Photo` (Task 1), `SITE_URL` (`src/lib/seo.ts`), `newsHref` (`src/lib/news.ts`), `eventHref` (`src/lib/events.ts`).
- Produces:
  - `brand.ts`: `COVER = { width: 940, height: 1880, cutY: 940 }`, `SQUARE = 940`, `FOOTER_HEIGHT = 56`, `NAVY = "#102033"`, `ORANGE = "#F7941D"`, `FOOTER_ITEMS = [{ icon: "facebook", text: "/cictwvsu" }, { icon: "x", text: "/cictwvsu" }, { icon: "mail", text: "cict@wvsu.edu.ph" }]`, `DEFAULT_LABEL = "UPFLASH"`, `TITLE_BOX = { x: 70, y: 330, width: 800, height: 420 }`, `SUMMARY_BOX = { x: 60, y: 1560, width: 820, height: 240 }`, `SEAL_SIZE = 190`.
  - `layouts.ts`: `type Rect = { x: number; y: number; width: number; height: number }`; `type LayoutId = "two" | "three" | "one-two" | "four"`; `LAYOUTS: Record<LayoutId, { label: string; slots: Rect[] }>` with slots exactly:
    - `two`: `[0,0,940,940]`, `[0,940,940,940]`
    - `three`: `[0,0,940,800]`, `[0,800,940,540]`, `[0,1340,940,540]`
    - `one-two`: `[0,0,940,1080]`, `[0,1080,470,800]`, `[470,1080,470,800]`
    - `four`: `[0,0,940,470]`, `[0,470,940,470]`, `[0,940,940,470]`, `[0,1410,940,470]`
    - `DEFAULT_LAYOUT: LayoutId = "three"`
  - `crop.ts`: `type Crop = { focusX: number; focusY: number; zoom: number }` (focus 0–1, zoom ≥ 1); `CENTERED: Crop = { focusX: 0.5, focusY: 0.5, zoom: 1 }`; `sourceRect(image: {width,height}, slot: Rect, crop: Crop): Rect` (the image region that cover-fits the slot); `panCrop(crop, image, slot, dx: number, dy: number): Crop` (dx/dy in slot pixels; dragging right moves the photo right); `zoomCrop(crop, factor: number): Crop` (clamped to 1–4).
  - `text.ts`: `type Measure = (text: string, fontSize: number) => number`; `wrapLines(text, maxWidth, fontSize, measure): string[]`; `fitText(text, box: Rect, sizes: number[], lineHeight: number, measure): { fontSize: number; lines: string[] }` (largest size whose lines fit the box height; at the smallest size, extra lines are cut and the last ends in "…"); `markdownToPlain(md: string): string`; `summaryFor(excerpt: string | null, body: string): string`.
  - `pack.ts`: `type PackSource = { kind: "post" | "event"; slug: string; title: string; summary: string; date: string /* ISO */; body: string; coverImageUrl: string | null; photos: Photo[] }`; `packPhotoUrls(source): { url: string; alt: string }[]`; `fileNames(photoCount: number): string[]`; `zipName(slug: string): string`; `captionText(source): string`; `fewImagesWarning(photoCount: number): string | null`; `formatCoverDate(iso: string): string` (Manila time, "October 29, 2026").

- [ ] **Step 1: Write failing tests**, including:
  - every layout's slots tile 940×1880 exactly (sum of areas = 940×1880, none outside the frame)
  - `sourceRect({width:2000,height:1000}, {x:0,y:0,width:940,height:940}, CENTERED)` → `{x:500,y:0,width:1000,height:1000}`; with `focusX: 0` → `x: 0`; `focusX: 1` → `x: 1000`; `zoom: 2` centred → `{x:750,y:250,width:500,height:500}`
  - a portrait 600×1200 image in a 940×540 slot → width 600, never stretched (source aspect = slot aspect)
  - `panCrop` with dx = +100 decreases `focusX`; focus stays within 0–1
  - with `measure = (t, s) => t.length * s * 0.5`: `wrapLines("aa bb cc", 30, 10, measure)` → `["aa bb", "cc"]`; `fitText` with a 300-character title in `TITLE_BOX` and sizes `[84,76,68,60,52]` returns size 52 and its last line ends with "…" and `lines.length * 52 * 1.1 <= 420`
  - `markdownToPlain("# Hi\n\n**Bold** and [link](https://x.y) ![img](/a.png)")` → `"Hi\n\nBold and link"`
  - `summaryFor(null, "word ".repeat(100))` is ≤ 201 characters and ends with "…"; `summaryFor("  Given  ", "…")` → `"Given"`
  - `packPhotoUrls` with cover `/c.jpg` and photos `[/a.jpg, /c.jpg]` → `["/c.jpg", "/a.jpg"]`; with no cover and `[]` → `[]`
  - `fileNames(3)` → `["01.jpg","02.jpg","03.jpg","04.jpg","05.jpg"]`
  - `zipName("open-house")` → `"open-house.zip"`
  - `captionText` for a post → `"<title>\n\n<plain body>\n\n" + SITE_URL + "/news-announcements/news/<slug>/"` (match `newsHref`; events use `eventHref`)
  - `fewImagesWarning(2)` (total 4) → a string containing "fewer than 5"; `fewImagesWarning(3)` → `null`
  - `formatCoverDate("2026-10-29T01:00:00Z")` → `"October 29, 2026"`
- [ ] **Step 2: Run** `npx vitest run src/lib/socialPack` → FAIL.
- [ ] **Step 3: Implement** the five modules.
- [ ] **Step 4: Run** `npx vitest run src/lib/socialPack` → PASS.
- [ ] **Step 5: Commit** `feat(cms): social pack layout, crop, text and caption logic`.

### Task 6: Drawing and zipping

**Files:**
- Create: `src/lib/socialPack/draw.ts`, `src/lib/socialPack/build.ts`
- Test: `src/lib/socialPack/build.test.ts`
- Modify: `package.json`, `package-lock.json` (add `fflate`)

**Interfaces:**
- Consumes: everything in Task 5.
- Produces:
  - `type LoadedImage = { url: string; image: CanvasImageSource; width: number; height: number }`
  - `loadImage(url: string): Promise<LoadedImage>`: `crossOrigin = "anonymous"`, rejects on error.
  - `type CoverInput = { layout: LayoutId; slots: { image: LoadedImage | null; crop: Crop }[]; title: string; label: string; date: string; summary: string; logos: LoadedImage[] }`
  - `drawCover(ctx: CanvasRenderingContext2D, input: CoverInput, fonts: { display: string; body: string }): void` draws at 940×1880 (empty slots / no photos: navy fill).
  - `drawSquare(ctx, image: LoadedImage, fonts): void` draws a centred cover-fit photo at 940×940 plus the footer.
  - `drawFooter(ctx, y: number, fonts): void`, shared by both.
  - `siteFonts(): { display: string; body: string }` reads `--font-oswald` / `--font-source-sans` from `getComputedStyle(document.documentElement)` and awaits `document.fonts.load` for bold 80px of each (exported as `async loadSiteFonts()`).
  - `buildPack(input: { source: PackSource; cover: CoverInput; photos: LoadedImage[] }, render: Renderer): Promise<{ zip: Uint8Array; skipped: string[] }>`, where `type Renderer = { cover(input: CoverInput): Promise<[Blob, Blob]>; square(image: LoadedImage): Promise<Blob> }`. The browser renderer (`canvasRenderer(fonts)`) draws the full cover then copies the two halves to 940×940 canvases and calls `toBlob("image/jpeg", 0.9)`. A photo whose `toBlob` throws a `SecurityError` goes into `skipped` (its URL) and is left out; numbering stays continuous.

- [ ] **Step 1: Write failing tests** for `buildPack` with a fake `Renderer` returning tiny blobs, unzipping the result with `fflate.unzipSync`:
  - 3 photos → entries `01.jpg … 05.jpg` and `caption.txt` whose text equals `captionText(source)`
  - the 2nd photo's `square()` rejects with `new DOMException("x", "SecurityError")` → entries `01.jpg … 04.jpg`, `skipped` = `[that url]`
  - 0 photos → `01.jpg`, `02.jpg`, `caption.txt`
- [ ] **Step 2: Run** `npx vitest run src/lib/socialPack/build.test.ts` → FAIL.
- [ ] **Step 3: `npm install fflate`**, then implement `build.ts` and `draw.ts`. Drawing: collage slots via `sourceRect`; top wave = orange closed path behind `TITLE_BOX` (a filled bezier blob from y≈250 to y≈820 bleeding off the left edge, 92% opacity); logos centred above the title at y≈120, `SEAL_SIZE` each, 30px apart; title white, bold, centred, `fitText` sizes `[84,76,68,60,52]`, line height 1.1, soft shadow; bottom wash = linear gradient from transparent at y=1080 to orange 85% at y=1380 to white at y=1500, white below; label = black italic bold Source Sans on a black box with white text at y=1510 followed by the date; summary navy bold Source Sans via `fitText` in `SUMMARY_BOX` sizes `[40,36,32,28]`; footer white band of `FOOTER_HEIGHT` with simple vector icons (f, X, envelope) drawn with paths.
- [ ] **Step 4: Run** `npx vitest run src/lib/socialPack` → PASS.
- [ ] **Step 5: Commit** `feat(cms): draw and zip social media packs`.

### Task 7: Composer page

**Files:**
- Create: `src/app/admin/(cms)/social/[kind]/[id]/page.tsx` (server: `requireAdmin`, load the row, map to `PackSource`, 404 for unknown kind/id)
- Create: `src/components/admin/social/Composer.tsx` (client)
- Create: `src/components/admin/social/useComposer.ts` (state reducer)
- Test: `src/components/admin/social/useComposer.test.ts`
- Modify: `src/app/admin/(cms)/posts/[id]/page.tsx`, `src/app/admin/(cms)/events/[id]/page.tsx` (add `<SecondaryLink href={`/admin/social/posts/${id}`} icon="download">Export for social media</SecondaryLink>`; add a `download` icon to `src/components/admin/icons.tsx` if missing)

**Interfaces:**
- Consumes: Tasks 5 and 6.
- Produces: route `/admin/social/posts/<id>` and `/admin/social/events/<id>`. Reducer `composerReducer(state: ComposerState, action: ComposerAction): ComposerState` with `ComposerState = { layout: LayoutId; slots: { url: string | null; crop: Crop }[]; selectedSlot: number; title: string; summary: string; label: string; date: string }`, `initialComposerState(source: PackSource): ComposerState`, and actions `setLayout`, `togglePhoto(url)`, `selectSlot(i)`, `pan(dx, dy, image)`, `zoom(factor)`, `setText(field, value)`.

- [ ] **Step 1: Write failing reducer tests:**
  - initial state: layout `"three"`; slots filled with the first three of `packPhotoUrls(source)`; title, summary (`summaryFor`), label `"UPFLASH"`, date `formatCoverDate`
  - `togglePhoto` on a used URL empties its slot; on an unused URL fills the first empty slot; with no empty slot does nothing
  - `setLayout("two")` from three filled slots keeps the first two and drops the third; `setLayout("four")` keeps all three and adds one empty slot
  - `pan` only changes `selectedSlot`'s crop
- [ ] **Step 2: Run** `npx vitest run src/components/admin/social` → FAIL.
- [ ] **Step 3: Implement** the reducer, then `Composer.tsx` per the spec's composer layout: a preview canvas redrawn with `drawCover` on every state change and shown at 240px wide (CSS scale) with the red cut line; pointer drag on the preview → `pan` on the slot under the pointer (select it on pointer-down), wheel and a range input → `zoom`; layout buttons; photo thumbnails with slot numbers; text inputs; the `fewImagesWarning` notice; "Download zip" runs `buildPack` with `canvasRenderer`, downloads via an object URL named `zipName(slug)`, and lists any `skipped` photos ("Left out because it's hosted on another site: …"). Images that fail `loadImage` show as unavailable thumbnails and can't be chosen.
- [ ] **Step 4: Run** `npx vitest run` → PASS; `npx eslint src` clean; `npx tsc --noEmit -p . 2>&1 | grep -v '^\.next/'` clean.
- [ ] **Step 5: Commit** `feat(cms): social media post composer`.

### Task 8: End-to-end check

- [ ] **Step 1:** `npm run build` (CMS) and `npm run build:site` both succeed; `out/` contains no `admin` or `social` routes (`ls out | grep -c admin` → 0).
- [ ] **Step 2:** Run the CMS locally (`npm run dev` with local Supabase), add 6 photos to a post, check the public article shows the gallery and lightbox, export the pack, unzip it, and confirm: 8 JPEGs + `caption.txt`, `01.jpg`/`02.jpg`/`03.jpg…` are 940×940 (`python3 -c` with PIL), and stacking `01.jpg` above `02.jpg` gives one continuous picture. Show the user `01.jpg`, `02.jpg` and one photo for a look-and-feel pass.
- [ ] **Step 3:** Fix anything found; commit.
