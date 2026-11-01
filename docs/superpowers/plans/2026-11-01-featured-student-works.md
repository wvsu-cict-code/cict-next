# Featured Student Works Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A CMS-managed "Featured student works" gallery wall on the BSEMC program page, with a touch-friendly spotlight (zoomable art, YouTube videos, games with store links).

**Architecture:** A new `student_works` table (RLS: visitors see visible rows, admins manage all). Admins upload images straight from the browser to the `media` bucket, where the browser also makes the display and zoom versions. The public page loads works 12 at a time in the browser (like all school-site content) and lays them out with a JS masonry layout, so DOM order stays the admin's order. Pure logic (YouTube parsing, layout, zoom math, swipe classification, form parsing) lives in `src/lib/studentWorks/` and is unit-tested; components stay thin.

**Tech Stack:** Next 16 (static export for the school site), React 19, Tailwind 4, supabase-js, Vitest + Testing Library (jsdom). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-01-featured-student-works-design.md`

## Global Constraints

- The section appears on the BSEMC program page only (program id `bsemc`). The works aren't linked to a program in the database.
- Work types: `art` (Digital art), `video` (Video), `game` (Game/app). Labels exactly: "Digital art", "Video", "Game".
- Image uploads: PNG, JPEG, WebP only; at most 25 MB (26214400 bytes).
- Every uploaded image is stored as: original (archive, never shown), display version ≤ 1600 px on the long side, zoom version ≤ 4000 px on the long side (art and game screenshots only; video thumbnails get no zoom version). Never upscale. Display and zoom are WebP.
- Storage paths: `media` bucket, `student-works/<uuid>/original.<ext>`, `display.webp`, `zoom.webp`.
- Uploads go from the admin's browser straight to Storage (Vercel rejects request bodies over 4.5 MB), never through a server action.
- Public page loads 12 works per batch, the next batch when the visitor scrolls near the end.
- Video embeds use `https://www.youtube-nocookie.com/embed/<id>`.
- Store button copy: "Play on itch.io", "Get it on Google Play", "Download on the App Store", otherwise "Play the game". Portfolio link copy: "View portfolio". External links open in a new tab with `rel="noopener noreferrer"`.
- Section copy: eyebrow "Student showcase", heading "Featured student works". The section isn't rendered when there are no visible works.
- Follow existing patterns: migrations via `supabase migration new`; RLS like `events`; admin pages like `src/app/admin/(cms)/events/`; site tokens from `src/app/globals.css`.
- Anything imported by a Vitest test must not import `server-only` (so not `src/lib/cms/forms.ts`).

## Review Focus

1. **Vertical videos:** a Shorts link or a work set to Vertical must show as a 9:16 tile and a 9:16 player, never a letterboxed 16:9 one. Pinned in Task 2 (`workAspect`, `tileImage`) and Task 3 (`parseStudentWork` default orientation).
2. **Missing `maxresdefault`:** many YouTube videos have no maxres thumbnail; the tile must fall back to `hqdefault` instead of showing YouTube's grey placeholder. Pinned in Task 9 (`WorkTile` fallback test).
3. **Zoomed gestures:** while zoomed in, a drag must pan, never change pieces or close the spotlight. Pinned in Task 2 (`classifySwipe`) and Task 11.
4. **Racing loads:** the scroll sentinel and the spotlight's "next" can both ask for the next batch at once; the wall must not duplicate works or skip a batch. Pinned in Task 8 (`useStudentWorks` concurrent `loadMore`).
5. **Changing a work's type:** an admin who switches a Game to a Video must not leave a store link or an untouched screenshot behind that later shows up; fields that don't belong to the type are cleared on save. Pinned in Task 3.

---

### Task 1: Database table, storage limit and types

**Files:**
- Create: `supabase/migrations/<timestamp>_student_works.sql` (via `supabase migration new student_works`)
- Modify: `src/lib/supabase/database.types.ts` (regenerated)
- Modify: `src/lib/cms/content.ts` (type exports only)

**Interfaces:**
- Produces: table `public.student_works`; enums `student_work_kind` (`art`, `video`, `game`) and `video_orientation` (`landscape`, `vertical`); in `content.ts`: `export type StudentWork = Tables<"student_works">`, `export type StudentWorkKind = Enums<"student_work_kind">`, `export type VideoOrientation = Enums<"video_orientation">`.

- [ ] **Step 1: Create the migration file**

Run: `supabase migration new student_works`

- [ ] **Step 2: Write the migration**

Header comment in the style of `20261030030000_events.sql`. Contents (these columns and checks are what later tasks rely on):

```sql
create type public.student_work_kind as enum ('art', 'video', 'game');
create type public.video_orientation as enum ('landscape', 'vertical');

create table public.student_works (
  id uuid primary key default gen_random_uuid(),
  kind public.student_work_kind not null,
  title text not null check (title <> ''),
  student text not null check (student <> ''),
  description text not null check (description <> ''),
  -- Display version (wall and spotlight); for videos, an optional thumbnail
  image_url text,
  image_width integer check (image_width > 0),
  image_height integer check (image_height > 0),
  -- Loaded when a visitor zooms in; art and games only
  zoom_url text,
  zoom_width integer check (zoom_width > 0),
  zoom_height integer check (zoom_height > 0),
  -- The upload as-is, kept as an archive; never shown on the site
  original_url text,
  youtube_id text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  orientation public.video_orientation,
  store_url text,
  portfolio_url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_works_image_complete check (
    (image_url is null) = (image_width is null)
    and (image_url is null) = (image_height is null)
    and (zoom_url is null) = (zoom_width is null)
    and (zoom_url is null) = (zoom_height is null)
  ),
  constraint student_works_media_for_kind check (
    case kind
      when 'art' then image_url is not null
      when 'game' then image_url is not null and store_url is not null
      when 'video' then youtube_id is not null and orientation is not null
    end
  )
);

create index student_works_visible_order_idx
  on public.student_works (visible, sort_order);
```

Then: an `updated_at` trigger using `public.set_updated_at()`, RLS enabled, and five policies mirroring `events`: "Visible student works are public" (select, `to anon, authenticated`, `using (visible)`), and admin select/insert/update/delete using `(select public.is_admin())` (update has both `using` and `with check`). Finally raise the bucket limit:

```sql
-- Digital art originals can be large; uploads go straight from the admin's
-- browser to Storage, so the 4.5 MB request limit on Vercel doesn't apply
update storage.buckets set file_size_limit = 26214400 where id = 'media';
```

- [ ] **Step 3: Apply it locally and regenerate types**

Run: `npm run db:start` (if the stack fails to start for lack of disk space, stop and ask the owner), then `supabase migration up --local`, then `npm run db:types`.
Expected: `database.types.ts` now contains `student_works`, `student_work_kind`, `video_orientation`.

- [ ] **Step 4: Verify the checks and RLS**

Run with `supabase db query --local`:
- `insert into public.student_works (kind, title, student, description) values ('art','t','s','d');` → fails with `student_works_media_for_kind`.
- Insert one visible and one hidden valid video (`youtube_id 'dQw4w9WgXcQ'`, `orientation 'vertical'`), then `set role anon; select count(*) from public.student_works;` → `1`; `reset role;` and delete the test rows.
- `supabase db advisors --local` → no new warnings for `student_works`.

- [ ] **Step 5: Add the type exports to `content.ts`** next to the existing `Post`/`Program` exports, and run `npx tsc --noEmit` → no errors.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/*_student_works.sql src/lib/supabase/database.types.ts src/lib/cms/content.ts
git commit -m "feat(db): student_works table for featured student works"
```

---

### Task 2: Pure helpers: YouTube, links, layout, zoom, gestures, ordering

**Files:**
- Create: `src/lib/studentWorks/youtube.ts`, `links.ts`, `layout.ts`, `zoom.ts`, `gestures.ts`, `order.ts`
- Test: `src/lib/studentWorks/youtube.test.ts`, `links.test.ts`, `layout.test.ts`, `zoom.test.ts`, `gestures.test.ts`, `order.test.ts`

**Interfaces:**
- Consumes: `StudentWork`, `VideoOrientation` from Task 1.
- Produces:
  - `youtube.ts`: `parseYouTubeUrl(url: string): { id: string; isShort: boolean } | null`; `youtubeWatchUrl(id: string, orientation: VideoOrientation): string` (vertical → `https://www.youtube.com/shorts/<id>`, landscape → `https://www.youtube.com/watch?v=<id>`); `youtubeEmbedUrl(id: string): string` → `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&playsinline=1`; `youtubeThumbnail(id: string, quality: "maxresdefault" | "hqdefault"): string` → `https://i.ytimg.com/vi/<id>/<quality>.jpg`.
  - `links.ts`: `storeLabel(url: string): string`; `isWebUrl(value: string): boolean` (http/https only).
  - `layout.ts`: `type Size = { width: number; height: number }`; `workAspect(work: Pick<StudentWork, "kind" | "orientation" | "image_width" | "image_height">): number` (width ÷ height); `tileImage(work: StudentWork): { src: string; fallbackSrc?: string }`; `columnCountFor(width: number): number`; `masonryLayout(aspects: number[], options: { width: number; columns: number; gap: number; captionHeight: number }): { boxes: { x: number; y: number; width: number; height: number }[]; height: number }` (box height includes the caption).
  - `zoom.ts`: `type ZoomState = { scale: number; x: number; y: number }`; `MIN_SCALE = 1`; `MAX_SCALE = 4`; `RESET: ZoomState`; `zoomAt(state: ZoomState, scale: number, focus: { x: number; y: number }, image: Size, viewport: Size): ZoomState` (focus is relative to the viewport centre; the image point under it stays put; result clamped); `panBy(state: ZoomState, dx: number, dy: number, image: Size, viewport: Size): ZoomState`. `image` is the image's fitted size at scale 1.
  - `gestures.ts`: `classifySwipe(dx: number, dy: number, zoomed: boolean): "next" | "previous" | "close" | null`.
  - `order.ts`: `moveItem<T>(list: readonly T[], from: number, to: number): T[]`.

- [ ] **Step 1: Write the failing tests** (abridged; one `it` per bullet):

```ts
// youtube.test.ts
it.each([
  ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", { id: "dQw4w9WgXcQ", isShort: false }],
  ["https://youtu.be/dQw4w9WgXcQ?si=abc", { id: "dQw4w9WgXcQ", isShort: false }],
  ["https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ", { id: "dQw4w9WgXcQ", isShort: false }],
  ["https://youtube.com/shorts/dQw4w9WgXcQ?feature=share", { id: "dQw4w9WgXcQ", isShort: true }],
  ["https://www.youtube.com/embed/dQw4w9WgXcQ", { id: "dQw4w9WgXcQ", isShort: false }],
  ["  https://youtu.be/dQw4w9WgXcQ  ", { id: "dQw4w9WgXcQ", isShort: false }],
])("parses %s", (url, expected) => expect(parseYouTubeUrl(url)).toEqual(expected));
it.each(["", "not a url", "https://vimeo.com/123", "https://youtube.com/watch?v=short", "https://evil.com/watch?v=dQw4w9WgXcQ"])(
  "rejects %s", (url) => expect(parseYouTubeUrl(url)).toBeNull());
// youtubeEmbedUrl("dQw4w9WgXcQ") starts with "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"

// links.test.ts
// storeLabel("https://team-habol.itch.io/sinamay-run") === "Play on itch.io"
// storeLabel("https://play.google.com/store/apps/details?id=x") === "Get it on Google Play"
// storeLabel("https://apps.apple.com/ph/app/x/id1") === "Download on the App Store"
// storeLabel("https://example.com/game") === "Play the game"
// storeLabel("not a url") === "Play the game"
// isWebUrl("https://behance.net/x") true; isWebUrl("javascript:alert(1)") false; isWebUrl("ftp://x") false

// layout.test.ts
// workAspect({kind:"video", orientation:"vertical", …}) === 9/16; landscape === 16/9
// workAspect({kind:"art", image_width:3000, image_height:4000, …}) === 0.75
// workAspect({kind:"art", image_width:null, image_height:null, …}) === 4/3   (defensive fallback)
// tileImage(video with image_url null, landscape) → { src: ".../maxresdefault.jpg", fallbackSrc: ".../hqdefault.jpg" }
// tileImage(video with image_url null, vertical) → { src: ".../hqdefault.jpg" }   (no fallback)
// tileImage(video with an uploaded thumbnail) → { src: work.image_url }
// columnCountFor(390) === 2; columnCountFor(640) === 3; columnCountFor(1200) === 3
// masonryLayout([1, 0.5, 1, 1], { width: 210, columns: 2, gap: 10, captionHeight: 0 }):
//   boxes[0] = {x:0, y:0, width:100, height:100}; boxes[1] = {x:110, y:0, width:100, height:200}
//   boxes[2] = {x:0, y:110, width:100, height:100}   (left column is shorter: 110 vs 210)
//   boxes[3] = {x:110, y:210, width:100, height:100} (now right is shorter: 210 vs 220); height === 310
// appending aspects never moves existing boxes:
//   masonryLayout(a.slice(0,3), o).boxes deep-equals masonryLayout(a, o).boxes.slice(0,3)

// zoom.test.ts (image 400×300 fitted, viewport 400×300)
// zoomAt(RESET, 2, {x:0,y:0}, image, viewport) → {scale:2, x:0, y:0}
// zoomAt(RESET, 2, {x:100,y:0}, …) → {scale:2, x:-100, y:0}   (point under the cursor stays put)
// zoomAt(RESET, 10, …).scale === MAX_SCALE; zoomAt(state, 0.5, …) → RESET
// panBy({scale:2,x:0,y:0}, 1000, 0, image, viewport).x === 200   (clamped: (400*2-400)/2)
// panBy(RESET, 50, 50, …) deep-equals RESET   (no panning at scale 1)

// gestures.test.ts
// classifySwipe(-80, 5, false) === "next"; classifySwipe(80, 5, false) === "previous"
// classifySwipe(5, 120, false) === "close"; classifySwipe(5, -120, false) === null (swipe up does nothing)
// classifySwipe(-30, 0, false) === null (below 60 px threshold)
// classifySwipe(-200, 0, true) === null and classifySwipe(0, 200, true) === null   (zoomed: never)

// order.test.ts
// moveItem(["a","b","c"], 0, 2) → ["b","c","a"]; moveItem(x, 2, 0) → ["c","a","b"]
// moveItem(x, 1, 1) → same order, new array; out-of-range `to` is clamped
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib/studentWorks`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the six modules**

Approach notes, where the signatures leave a choice:
- `parseYouTubeUrl`: `new URL(url.trim())` inside try; accept hosts `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`; take the id from `v=`, `/shorts/<id>`, `/embed/<id>` or the `youtu.be` path; validate `^[A-Za-z0-9_-]{11}$`.
- `storeLabel`: match on hostname: `itch.io` or `*.itch.io`; `play.google.com`; `apps.apple.com`.
- `columnCountFor`: `width < 640 ? 2 : 3`.
- `masonryLayout`: column width `(width − gap·(columns−1)) / columns`; place each item in the shortest column (ties → leftmost); box height `columnWidth / aspect + captionHeight`; each column's running height adds box height + gap; total height is the tallest column minus the trailing gap (0 when empty).
- `zoomAt`: clamp scale to `[MIN_SCALE, MAX_SCALE]`; `x' = focus.x − (focus.x − x) · (scale' / scale)`, same for y; then clamp with the same rule as `panBy` (`|x| ≤ max(0, (image.width·scale − viewport.width)/2)`). Scale ≤ 1 returns `RESET`.
- `classifySwipe`: threshold 60 px horizontal (when `|dx| > |dy|`), 100 px downward for close.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/studentWorks`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/studentWorks
git commit -m "feat(works): YouTube, layout, zoom and gesture helpers"
```

---

### Task 3: Form parsing for the admin

**Files:**
- Create: `src/lib/studentWorks/form.ts`
- Test: `src/lib/studentWorks/form.test.ts`

**Interfaces:**
- Consumes: `parseYouTubeUrl`, `isWebUrl` (Task 2); `TablesInsert<"student_works">` from `database.types.ts`.
- Produces:
  - `type UploadedWorkImage = { image_url: string; image_width: number; image_height: number; zoom_url: string | null; zoom_width: number | null; zoom_height: number | null; original_url: string }`
  - `type StudentWorkValues = Omit<TablesInsert<"student_works">, "id" | "sort_order" | "created_at" | "updated_at">`
  - `parseStudentWork(formData: FormData): { values: StudentWorkValues } | { error: string }`
  - Form field names (Task 6 renders them): `kind`, `title`, `student`, `description`, `image` (JSON of `UploadedWorkImage`, or empty for none), `youtube_url`, `orientation`, `store_url`, `portfolio_url`, `visible` (checkbox, `"on"`).

- [ ] **Step 1: Write the failing tests**

Build `FormData` with a small `form({...})` helper. Assertions (exact copy is the user-facing error text):
- A valid art work → `values` with `kind: "art"`, trimmed title/student/description, the image fields spread from the JSON, `youtube_id: null`, `orientation: null`, `store_url: null`, `visible: true`.
- Missing title → `{ error: "Enter a title." }`; missing student → `"Enter the student's or team's name."`; missing description → `"Enter a short description."`; unknown kind → `"Choose a type."`.
- Art without image → `"Upload the artwork."`; game without image → `"Upload a screenshot of the game."`; game without/with a non-web store link → `"Enter the link where the game is published (itch.io, Google Play, App Store…)."`.
- Video with `youtube_url` `https://youtube.com/shorts/dQw4w9WgXcQ` and no `orientation` → `youtube_id: "dQw4w9WgXcQ"`, `orientation: "vertical"`; a `watch?v=` link → `"landscape"`; an explicit `orientation: "landscape"` on a Shorts link wins.
- Video with an invalid link → `"Enter a YouTube link to the video."`.
- Video keeps an uploaded thumbnail's image fields but forces `zoom_url`, `zoom_width`, `zoom_height` to `null`.
- **Type switch:** a game's fields submitted with `kind: "video"` (store link + screenshot JSON + YouTube link) → `store_url: null`; image fields kept as the thumbnail. An art work submitted with a `youtube_url` → `youtube_id: null`.
- `portfolio_url` `"javascript:alert(1)"` → `"The portfolio link must start with http:// or https://."`; empty → `null`.
- `visible` absent → `false`.
- Malformed `image` JSON or non-positive dimensions → `"The image upload didn't finish. Upload it again."`.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/lib/studentWorks/form.test.ts` → FAIL.

- [ ] **Step 3: Implement `parseStudentWork`** (no `server-only` imports; trims strings itself).

- [ ] **Step 4: Run to verify pass** → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/studentWorks/form.ts src/lib/studentWorks/form.test.ts
git commit -m "feat(works): parse and validate the student work form"
```

---

### Task 4: Image processing and direct upload

**Files:**
- Create: `src/lib/studentWorks/images.ts`
- Test: `src/lib/studentWorks/images.test.ts`

**Interfaces:**
- Consumes: `UploadedWorkImage` (Task 3), `ContentClient` (`content.ts`), `Size` (Task 2).
- Produces: `IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const`; `MAX_IMAGE_BYTES = 26214400`; `DISPLAY_MAX = 1600`; `ZOOM_MAX = 4000`; `checkImageFile(file: { type: string; size: number }): string | null`; `fitWithin(size: Size, max: number): Size`; `uploadWorkImage(client: ContentClient, file: File, options: { withZoom: boolean }): Promise<UploadedWorkImage>`.

- [ ] **Step 1: Write the failing tests** (pure parts only; canvas work isn't testable in jsdom):
- `checkImageFile({type:"image/gif", size:1})` → `"Use a PNG, JPEG or WebP image."`; SVG same; `{type:"image/png", size: 26214401}` → `"That image is over 25 MB. Export a smaller version and try again."`; a 25 MB PNG → `null`.
- `fitWithin({width: 6000, height: 8000}, 1600)` → `{width: 1200, height: 1600}`; `fitWithin({width: 800, height: 600}, 1600)` → unchanged (no upscale); results are integers.

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Implement**

`uploadWorkImage`: `createImageBitmap(file)` → draw onto a canvas at `fitWithin(…, DISPLAY_MAX)` → `canvas.toBlob(…, "image/webp", 0.86)`; same at `ZOOM_MAX` when `withZoom`; upload original + versions with `client.storage.from("media").upload(path, blob, { contentType, upsert: false })` under `student-works/${crypto.randomUUID()}/`; return public URLs and the rendered sizes. Throw `Error` with a readable message on failure. The client passed in is `getBrowserClient()`, which carries the admin's session; the existing "Admins can upload media" policy allows it.

- [ ] **Step 4: Run to verify pass** → PASS. `npx tsc --noEmit` → clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/studentWorks/images.ts src/lib/studentWorks/images.test.ts
git commit -m "feat(works): resize and upload work images from the browser"
```

---

### Task 5: Admin CSP allows direct uploads and YouTube thumbnails

**Files:**
- Modify: `src/lib/cms/csp.ts`
- Test: `src/lib/cms/csp.test.ts`

- [ ] **Step 1: Write the failing tests**
- `connect-src` is `"connect-src 'self' https://abc.supabase.co"` when `supabaseOrigin: "https://abc.supabase.co"`, and `"connect-src 'self'"` without one. In development, also allow `ws:` (Next's dev websocket): `"connect-src 'self' https://abc.supabase.co ws:"`.
- `img-src` includes `https://i.ytimg.com`.

- [ ] **Step 2: Run to verify failure:** `npx vitest run src/lib/cms/csp.test.ts` → FAIL.
- [ ] **Step 3: Add the directives.**
- [ ] **Step 4: Run to verify pass** → PASS (all existing CSP tests too).
- [ ] **Step 5: Commit** `fix(cms): let the admin upload to Storage and show YouTube thumbnails`.

---

### Task 6: Admin form, actions, and create/edit pages

**Files:**
- Create: `src/app/admin/(cms)/student-works/actions.ts`, `WorkForm.tsx`, `WorkImageField.tsx`, `new/page.tsx`, `[id]/page.tsx`

**Interfaces:**
- Consumes: `parseStudentWork`, field names (Task 3); `uploadWorkImage`, `checkImageFile`, `IMAGE_TYPES` (Task 4); `youtubeWatchUrl` (Task 2); `requireAdmin`, `handleForm`, `assertDbOk`, `FormError` (`src/lib/cms/forms.ts`, `auth.ts`); `AdminForm`, `FormSection`, field components, `DeleteButton`, `PageHeader`, `SavedNotice`.
- Produces: `createStudentWork(state, formData)`, `updateStudentWork(id: string, state, formData)`, `deleteStudentWork(id: string)`, plus `reorderStudentWorks(ids: string[]): Promise<{ error?: string }>` and `setStudentWorkVisible(id: string, visible: boolean): Promise<{ error?: string }>` used by Task 7. All revalidate nothing (public pages fetch in the browser).

- [ ] **Step 1: Actions.** Mirror `events/actions.ts`. `parseStudentWork` errors become `FormError`s. Create sets `sort_order` to the current max + 1 (new works go last) and redirects to `/admin/student-works/<id>?saved=1`; update redirects to the same; delete redirects to `/admin/student-works`. `reorderStudentWorks` sets `sort_order = index` for each id; `setStudentWorkVisible` updates `visible`. Every action calls `requireAdmin()` first.

- [ ] **Step 2: `WorkImageField`** (client). Props: `{ name: "image"; label: string; hint?: string; withZoom: boolean; defaultValue?: UploadedWorkImage | null }`. On file pick: `checkImageFile` (show its message), then `uploadWorkImage(getBrowserClient(), file, { withZoom })`, showing "Uploading…" and a preview; writes `JSON.stringify(result)` into a hidden input named `image` ("" when removed). While uploading, disable the form's submit button (set a `data-uploading` attribute on the field and `aria-disabled` on submit, or lift state through `AdminForm` if it supports it; keep it simple). `accept="image/png,image/jpeg,image/webp"`.

- [ ] **Step 3: `WorkForm`** (client, needs `kind` state). Sections: "The work": Type (`SelectField`: Digital art / Video / Game), Title, Student or team (hint: "For a team, enter the team name or the members' names."), Description. "Media", by type:
  - art: `WorkImageField` label "Artwork", `withZoom`.
  - game: `WorkImageField` label "Screenshot", `withZoom`; "Store link" (`store_url`).
  - video: "YouTube link" (`youtube_url`, default `youtubeWatchUrl(id, orientation)` when editing); Orientation select (Landscape / Vertical); when the typed link is a Shorts link and the admin hasn't touched Orientation, set it to Vertical; `WorkImageField` label "Thumbnail (optional)", `withZoom: false`, hint "Recommended for vertical videos. Without one, the site uses YouTube's thumbnail."
  - "Portfolio link (optional)" (`portfolio_url`) and "Show on the BSEMC page" checkbox (`visible`, default on).
  Hidden fields for other types aren't rendered, so the server clears them (Task 3 already enforces this).

- [ ] **Step 4: Pages** `new/page.tsx` ("New student work") and `[id]/page.tsx` ("Edit student work", back to "All student works", `DeleteButton` with confirm `Delete "<title>"? This cannot be undone.`, `SavedNotice` on `?saved=1`, and a "View on site" link to `siteUrl("/programs/bsemc")`), modelled on `events/new` and `events/[id]`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npx eslint "src/app/admin/(cms)/student-works"` → clean. On the local stack with `npm run dev` pointed at it (`.env.local` with the local URL/keys from `supabase status`), create one work of each type, including a 10+ MB PNG (proves the direct upload) and a Shorts link (Orientation flips to Vertical). Check in Storage that `student-works/<uuid>/` has `original.png`, `display.webp`, `zoom.webp`, and the display version's long side is 1600.

- [ ] **Step 6: Commit** `feat(cms): create and edit featured student works`.

---

### Task 7: Admin list with reordering and the nav entry

**Files:**
- Create: `src/app/admin/(cms)/student-works/page.tsx`, `WorkList.tsx`
- Modify: `src/components/admin/AdminNav.tsx`, `src/components/admin/icons.tsx` (a `works` icon, e.g. an easel/frame path), `src/app/admin/(cms)/page.tsx` (quick action "Add a student work" next to "Add an event")
- Test: `src/app/admin/(cms)/student-works/WorkList.test.tsx`

**Interfaces:**
- Consumes: `moveItem` (Task 2), `reorderStudentWorks`, `setStudentWorkVisible` (Task 6), `tileImage` (Task 2).
- Produces: `WorkList({ works, onReorder, onToggleVisible }: { works: StudentWork[]; onReorder(ids: string[]): Promise<{ error?: string }>; onToggleVisible(id: string, visible: boolean): Promise<{ error?: string }> })`.

- [ ] **Step 1: Write the failing tests** (mock both callbacks):
- Renders works in the given order, each with a thumbnail, title, student, type label, a "Hidden" badge when `visible` is false, and a link to `/admin/student-works/<id>`.
- Clicking "Move <title> down" calls `onReorder` with the new id order and updates the list immediately.
- The first item has no enabled "Move up", the last no enabled "Move down".
- When `onReorder` resolves `{ error }`, the list reverts and shows the error.
- Toggling visibility calls `onToggleVisible(id, false)`.

- [ ] **Step 2: Run to verify failure** → FAIL.
- [ ] **Step 3: Implement** `WorkList` with HTML5 drag-and-drop (drag handle, `draggable`) for mouse plus labelled Move up / Move down buttons for keyboard and touch; `page.tsx` loads all works ordered by `sort_order`, `created_at` with `requireAdmin()` and renders the header ("Student works", "New student work"), an `EmptyState` when empty, and `WorkList` bound to the actions. Add `{ href: "/admin/student-works", label: "Student works", icon: "works" }` to the nav after Events.
- [ ] **Step 4: Run to verify pass**; `npm test` → all pass.
- [ ] **Step 5: Commit** `feat(cms): list, reorder and hide student works`.

---

### Task 8: Public data loading

**Files:**
- Modify: `src/lib/cms/content.ts`, `src/lib/cms/content.test.ts`
- Create: `src/lib/studentWorks/useStudentWorks.ts`
- Test: `src/lib/studentWorks/useStudentWorks.test.tsx`

**Interfaces:**
- Produces: `fetchStudentWorks(client: ContentClient, page: { offset: number; limit: number }): Promise<{ works: StudentWork[]; total: number }>`; `WORKS_PAGE_SIZE = 12`; `useStudentWorks(): { status: "loading" | "error" | "ready"; works: StudentWork[]; total: number; hasMore: boolean; loadMore(): Promise<void>; retry(): void }`.

- [ ] **Step 1: Write the failing tests**
- `content.test.ts` (with `recordingClient`): calls are `from("student_works")`, `select("*", { count: "exact" })`, `eq("visible", true)`, `order("sort_order")`, `order("created_at")`, `range(12, 23)` for `{ offset: 12, limit: 12 }`; returns `{ works: data, total: count }`; throws `"Failed to load student works: network down"` on error. (Extend `recordingClient`'s result type to carry `count`.)
- `useStudentWorks.test.tsx` (mock `getBrowserClient` and `fetchStudentWorks`): first render loads offset 0; `loadMore()` loads offset 12 and appends; **two `loadMore()` calls at once fetch offset 12 once** and leave no duplicate ids; `hasMore` is false once `works.length === total`; `loadMore()` with `hasMore` false makes no request; a failed first load gives `status: "error"` and `retry()` reloads.

- [ ] **Step 2: Run to verify failure** → FAIL.
- [ ] **Step 3: Implement.** The hook keeps the in-flight `loadMore` promise in a ref and returns it to concurrent callers.
- [ ] **Step 4: Run to verify pass** → PASS.
- [ ] **Step 5: Commit** `feat(works): load visible student works in batches`.

---

### Task 9: Gallery wall on the BSEMC page

**Files:**
- Create: `src/components/studentWorks/StudentWorksSection.tsx`, `WorkWall.tsx`, `WorkTile.tsx`
- Modify: `src/components/ProgramDetails.tsx`
- Test: `src/components/studentWorks/StudentWorksSection.test.tsx`, `WorkTile.test.tsx`

**Interfaces:**
- Consumes: `useStudentWorks` (Task 8), `masonryLayout`, `columnCountFor`, `workAspect`, `tileImage` (Task 2), `WorkSpotlight` (Task 10; until then the click handler only records the index).
- Produces: `StudentWorksSection()` (no props); `WorkTile({ work, onOpen }: { work: StudentWork; onOpen(): void })`.

- [ ] **Step 1: Write the failing tests**
- Section renders nothing while loading, on error, and when `total` is 0.
- With works, renders the eyebrow "Student showcase", heading "Featured student works", and one button per work **in the given order**, each named `"<title> by <student>"`.
- A tile shows the type label ("Digital art" / "Video" / "Game") and, for videos, a play marker (`aria-hidden`).
- **maxres fallback:** a landscape video tile's `<img>` starts at `maxresdefault.jpg`; firing `error` on it switches `src` to `hqdefault.jpg`.
- A vertical video tile's media box has `aspect-ratio` 9 / 16.
- Images have `loading="lazy"` and explicit `width`/`height`.
- When the sentinel intersects (mock `IntersectionObserver`) and `hasMore`, `loadMore` is called.

- [ ] **Step 2: Run to verify failure** → FAIL.
- [ ] **Step 3: Implement**
- `WorkWall` measures its width with `ResizeObserver` (fallback to 0 → render nothing until measured), computes `masonryLayout(works.map(workAspect), { width, columns: columnCountFor(width), gap: 16, captionHeight: 52 })`, and absolutely positions tiles in DOM order; container height from the layout. Caption is one line each for title and student (truncate), so 52 px is constant.
- Media `object-fit: cover` (for YouTube thumbnails this crops the letterbox bars); a sentinel after the wall with `IntersectionObserver` `rootMargin: "600px"`.
- `ProgramDetails`: after the sections, `{program.id === "bsemc" && <StudentWorksSection />}` inside the same `container`, with the section's own top border/spacing matching `ProgramSection`.

- [ ] **Step 4: Run to verify pass** → PASS.
- [ ] **Step 5: Commit** `feat(site): gallery wall of featured works on the BSEMC page`.

---

### Task 10: Spotlight

**Files:**
- Create: `src/components/studentWorks/WorkSpotlight.tsx`
- Modify: `src/components/studentWorks/StudentWorksSection.tsx` (open the spotlight)
- Test: `src/components/studentWorks/WorkSpotlight.test.tsx`

**Interfaces:**
- Consumes: `storeLabel` (Task 2), `youtubeEmbedUrl` (Task 2), `classifySwipe` (Task 2), `ZoomableImage` (Task 11; until then render a plain `<img>` of `image_url`).
- Produces: `WorkSpotlight({ works, total, index, onIndexChange, onClose, loadMore }: { works: StudentWork[]; total: number; index: number; onIndexChange(index: number): void; onClose(): void; loadMore(): Promise<void> })`.

- [ ] **Step 1: Write the failing tests**
- Renders `role="dialog"`, `aria-modal="true"`, labelled by the work's title; shows type label, title, student, description, and "1 of 20".
- Portfolio link "View portfolio" present only when `portfolio_url` is set; opens in a new tab with `rel="noopener noreferrer"`.
- A game shows the store button with `storeLabel(store_url)` text and href.
- A video renders an `<iframe>` whose `src` is `youtubeEmbedUrl(id)` and whose frame has aspect ratio 9 / 16 for vertical, 16 / 9 for landscape; art renders no iframe.
- `ArrowRight`/`ArrowLeft` call `onIndexChange(index ± 1)`; Previous is disabled at 0; Next is disabled at `total − 1`.
- **Next on the last loaded work** (`index === works.length − 1 < total − 1`) awaits `loadMore()` then calls `onIndexChange(index + 1)`.
- `Escape`, the ✕ button ("Close"), and a click on the backdrop call `onClose`; a click inside the panel doesn't.
- A single-pointer drag of −80 px horizontally on the media calls `onIndexChange(index + 1)`; +120 px down calls `onClose`.
- Focus moves into the dialog on open and returns to the tile that opened it on close (tested from `StudentWorksSection`).

- [ ] **Step 2: Run to verify failure** → FAIL.
- [ ] **Step 3: Implement.** Fixed overlay (`bg-navy/95`), panel grid `lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]`, stacked on phones; body scroll locked while open; Tab focus trapped; tap targets ≥ 44 px; swipe detection uses pointer events on the media area with `touch-action: none` there and passes `zoomed` from `ZoomableImage`'s `onZoomedChange`. Arrow buttons labelled "Previous work"/"Next work".
- [ ] **Step 4: Run to verify pass** → PASS.
- [ ] **Step 5: Commit** `feat(site): spotlight for featured student works`.

---

### Task 11: Zoomable image

**Files:**
- Create: `src/components/studentWorks/ZoomableImage.tsx`
- Modify: `src/components/studentWorks/WorkSpotlight.tsx` (use it for art and games)
- Test: `src/components/studentWorks/ZoomableImage.test.tsx`

**Interfaces:**
- Consumes: `zoomAt`, `panBy`, `RESET`, `MIN_SCALE`, `MAX_SCALE` (Task 2).
- Produces: `ZoomableImage({ work, onZoomedChange }: { work: StudentWork; onZoomedChange(zoomed: boolean): void })`.

- [ ] **Step 1: Write the failing tests**
- Buttons "Zoom in", "Zoom out", "Reset zoom"; "Zoom out" and "Reset zoom" disabled at scale 1; "Zoom in" disabled at `MAX_SCALE`.
- "Zoom in" sets the transform scale to 2 (read from the image wrapper's `style.transform`) and calls `onZoomedChange(true)`; "Reset zoom" back to 1 and `onZoomedChange(false)`.
- Double-click toggles between 1 and 2.
- When zoomed and `zoom_url` is set, an image with `src === zoom_url` is requested; once its `load` fires it replaces the display image. A work without `zoom_url` keeps `image_url`.
- A single-pointer drag while zoomed changes the translate (pan) and doesn't bubble a swipe (the spotlight's `onIndexChange` isn't called; test via the spotlight).
- Changing `work` resets the zoom.
- The `<img>` alt text is `"<title> by <student>"`.

- [ ] **Step 2: Run to verify failure** → FAIL.
- [ ] **Step 3: Implement.** Pointer events with a map of active pointers: one pointer → pan when zoomed; two → pinch (scale by distance ratio around the midpoint, via `zoomAt`); wheel → `zoomAt` around the cursor (`preventDefault`, passive: false); double-tap detected as two `pointerup`s within 300 ms and 24 px; `touch-action: none`; `transform: translate(x, y) scale(s)` with `will-change: transform`; stop propagation of pointer events while zoomed so the spotlight doesn't see them as swipes.
- [ ] **Step 4: Run to verify pass**; `npm test` → all pass.
- [ ] **Step 5: Commit** `feat(site): pinch, wheel and button zoom in the spotlight`.

---

### Task 12: End-to-end check and release

- [ ] **Step 1: Full checks**

Run: `npm test && npm run lint && npx tsc --noEmit`
Expected: all pass, no errors.

- [ ] **Step 2: School-site build**

Run: `npm run build:site` (with the site env from `.env`).
Expected: succeeds; `out/programs/_/index.html` exists. Don't upload anything.

- [ ] **Step 3: Visual check on the local stack**

With ~14 works created in the local admin (all three types, both video orientations, one without a maxres thumbnail, one hidden), open `/programs/bsemc/` at 1280 and 390 px with headless Chrome (as done for the SDG icons): the wall keeps each piece's shape, the hidden work is absent, a second batch loads on scroll, the spotlight opens, arrows move past the first batch, and zoom buttons work. Check another program page has no section.

- [ ] **Step 4: Ask the owner before deploying**

The migration must be pushed to the CICT Online project (`supabase db push --linked`, dry run first). Ask before pushing; after pushing, `supabase gen types typescript --linked` should match the committed types (diff is empty).

- [ ] **Step 5: Finish the branch** with superpowers:finishing-a-development-branch.
