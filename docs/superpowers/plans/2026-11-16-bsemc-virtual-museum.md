# BSEMC Virtual Museum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a BSEMC Virtual Museum: a page at `/programs/bsemc/museum` with
a walkable 3D gallery of approved student works, WVSU-only student accounts,
student submissions with a CMS review queue, and likes from signed-in users.

**Architecture:**
- **Database:** `student_works` is extended in place. Its `kind` becomes a
  seven-value `category`, and it gains review status, submitter, featured
  flag and like count. Row-level security plus `BEFORE` triggers decide what
  a student may write, so nothing trusts the browser.
- **Public site:** everything public, including auth and submissions, runs
  in the browser against Supabase because the public site is a static
  export.
- **3D museum:** React Three Fiber, in a dynamically imported chunk. The
  logic that decides where works hang and how the visitor moves is pure
  TypeScript, so it can be unit-tested; the scene code only renders it.

**Tech Stack:** Next 16 (static export for the site), React 19, Tailwind v4,
shadcn/ui (Radix, lucide-react, embla), three.js with `@react-three/fiber` v9
and `@react-three/drei` v10, Supabase (Postgres, Auth, Storage), Vitest +
Testing Library, pgTAP via `supabase test db`.

**Spec:** `docs/superpowers/specs/2026-11-16-bsemc-virtual-museum-design.md`
(mockup: `docs/superpowers/specs/assets/2026-11-16-virtual-museum-mockup.png`).

## Global Constraints

- Work on a new branch `feat/bsemc-virtual-museum` cut from
  `feat/supabase-cms`. Commits are authored as `mjsolidarios` and end with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Public routes:** every public page/layout file is named `page.site.tsx`
  / `layout.site.tsx`, and is a client-rendered page that loads data in the
  browser. Nothing public may use server actions, route handlers or cookies
  on the server.
- **WVSU-only sign-up:** only `@wvsu.edu.ph` addresses may sign up. The
  match is case-insensitive on the exact domain after the last `@`, after
  trimming. The server-side hook is the authority; the form only gives an
  early error.
- **Upload formats:** images are webp only and videos/audio are webm only,
  checked by content (magic bytes), not just extension.
- **Free-plan limits:**
  - images 5 MB and longest edge ≤ 2560 px;
  - video/audio 20 MB;
  - at most 5 pending + approved works per student;
  - storage budget shown as 1 GB;
  - each gallery hall holds at most 30 works.

  All TS values live in `src/lib/museum/limits.ts`. The DB repeats only the
  quota (5) and the bucket cap (20971520), each with a comment pointing to
  `limits.ts`.
- **Visibility:** public rows are `visible AND status = 'approved'`. Pending
  and rejected works never appear on public pages.
- **No comments anywhere.** Like counts shown are always real counts from
  the database.
- three.js / R3F code is imported only from the dynamically loaded museum
  chunk. No other page bundle may import `three`, `@react-three/*`, or
  anything under `src/components/museum/three/`.
- **Theme:** the existing `text-accent` / `bg-accent` and `--color-accent`
  (#ba3d1b light, #ff9470 dark) keep their current meaning. shadcn
  components must not use the `accent` token.
- **Always-dark sections:** the museum hero and the 3D section are wrapped
  in `data-theme="dark"`. The rest of the page follows the visitor's theme.
- With reduced motion turned on, camera glides become instant jumps and
  carousel autoplay is off.
- **Copy:**
  - the How It Works steps are exactly "Sign in", "Upload", "Review" and
    "Exhibit", with the spec's one-line descriptions;
  - category labels are Games, Interactive Media, 3D & XR, Digital Art,
    Animations, Short Films and Sound Design;
  - gallery names are "Gallery A — Games & Interactive Media", "Gallery B —
    Animation, Film & Sound" and "Gallery C — Digital Art & 3D".

## Review Focus

1. **A failed submission must not leave orphaned files.** When an upload
   succeeds but the row insert or update fails (session expired, quota hit,
   network), the files just uploaded are deleted and the form shows the
   error. A test for this goes in Task 11.
2. **A share link to a missing exhibit must not break the page.** For
   `?exhibit=<id>` where the work is pending, rejected, deleted or not a
   UUID, the page renders normally and shows "This exhibit isn't available
   any more." A test for this goes in Task 16.
3. **Museum keys must not fire while typing.** WASD/E/M must not act while
   the visitor types in any input, including the Browse search, the Settings
   popover and the sign-in dialog. They act only when the 3D section's
   container holds focus. A test for this goes in Task 20.
4. **Students at the quota hear about it before uploading.** A student who
   already has 5 active works sees the quota message before choosing files,
   and a DB refusal (`quota_reached`) is shown in the same words. Tests for
   this go in Tasks 11 and 12.
5. **No 3D, or a bad texture, still leaves a usable museum.** Without WebGL,
   the 3D section shows the fallback and links to Browse Exhibits. A frame
   whose texture fails (CORS, 404) shows the category placeholder instead of
   a black panel or a crash. Tests for this go in Task 19.

---

## File Map

```
supabase/migrations/
  20261116000000_museum_works.sql           categories, review status, student RLS, guard + quota triggers
  20261116010000_museum_likes_notifications.sql
  20261116020000_museum_accounts.sql        profiles, WVSU sign-up hook
  20261116030000_museum_storage.sql         submissions bucket, policies, storage-usage RPC
supabase/tests/database/                    pgTAP: works.test.sql, likes.test.sql, accounts.test.sql, storage.test.sql
supabase/templates/confirmation.html, recovery.html
supabase/config.toml                        hook, confirmations, templates, redirect URLs
scripts/create-admin.mjs                    app_metadata.cms_admin
scripts/check-site.mjs                      museum + /programs/bsemc/ checks
deploy/school-server/.htaccess              rewrite conditions
docs/virtual-museum-launch.md               production checklist

src/lib/museum/
  categories.ts   limits.ts   files.ts   poster.ts   submissions.ts
  queries.ts      likes.ts    saved.ts   share.ts    settings.ts
  notifications.ts  webgl.ts  hall.ts    movement.ts galleries.ts
src/lib/auth/  email.ts  session.ts  client.ts
src/lib/utils.ts                            shadcn cn()
src/components/ui/*                         shadcn components
src/components/account/*                    auth forms, SubmissionForm, MySubmissions, AccountMenu, NotificationsBell, SignInPrompt
src/components/museum/*                     MuseumPage, MuseumHero, ProgramStrip, Highlights, ExhibitCard,
                                            BrowseExhibits, ShareYourWork, HowItWorks, LikeButton,
                                            MuseumBanner, MuseumSection, ExhibitDetail
src/components/museum/three/*               MuseumCanvas (default export), Hall, ExhibitFrame,
                                            useExhibitTexture, PlayerRig, Overlay, InfoPanel,
                                            SettingsPopover, GallerySelect, Minimap, ControlsBar
src/app/(site)/programs/bsemc/museum/page.site.tsx
src/app/(site)/account/{page, sign-in, sign-up, forgot-password, reset-password, confirm, submit}/page.site.tsx
```

---

## Phase 1: Database and auth backend

### Task 1: Categories module

**Files:**
- Create: `src/lib/museum/categories.ts`, `src/lib/museum/limits.ts`
- Test: `src/lib/museum/categories.test.ts`

**Interfaces:**
- Produces:
  - `type Category = "game" | "interactive_media" | "xr_3d" | "digital_art" | "animation" | "short_film" | "sound_design"`
    - Later `Enums<"exhibit_category">` must equal this type. Task 2's
      migration creates the enum with these exact values in this order.
  - `CATEGORIES: readonly Category[]`, in that order.
  - `CATEGORY_LABELS: Record<Category, string>` (plural, per Global
    Constraints).
  - `CATEGORY_SINGULAR: Record<Category, string>` → "Game", "Interactive
    media", "3D & XR", "Digital art", "Animation", "Short film", "Sound
    design".
  - `type CategoryMedia = "cover_link" | "image" | "video" | "audio"`.
  - `CATEGORY_MEDIA: Record<Category, CategoryMedia>`:
    - game, interactive_media, xr_3d → `cover_link`;
    - digital_art → `image`;
    - animation, short_film → `video`;
    - sound_design → `audio`.
  - `CATEGORY_ICON: Record<Category, LucideIcon>`: Gamepad2, MonitorSmartphone,
    Box, Image, Clapperboard, Film, AudioWaveform.
  - `CATEGORY_TINT: Record<Category, { from: string; to: string }>`: hex
    gradient pairs for cards and placeholder frames.
    - Purple: game, interactive_media.
    - Blue: animation, short_film.
    - Teal: digital_art.
    - Copper: xr_3d.
    - Indigo: sound_design.
  - `type GalleryId = "a" | "b" | "c"`.
  - `GALLERIES: { id: GalleryId; label: string; name: string; categories: Category[] }[]`:
    - a: "Gallery A", "Games & Interactive Media", [game, interactive_media];
    - b: "Gallery B", "Animation, Film & Sound", [animation, short_film, sound_design];
    - c: "Gallery C", "Digital Art & 3D", [digital_art, xr_3d].
  - `galleryOf(category: Category): GalleryId`.
  - `limits.ts`:
    - `SUBMISSION_IMAGE_MAX_BYTES = 5 * 1024 * 1024`;
    - `SUBMISSION_MEDIA_MAX_BYTES = 20 * 1024 * 1024`;
    - `SUBMISSION_IMAGE_MAX_EDGE = 2560`;
    - `MAX_ACTIVE_WORKS = 5`;
    - `STORAGE_BUDGET_BYTES = 1024 ** 3`;
    - `HALL_CAPACITY = 30`;
    - `SUBMISSIONS_BUCKET = "submissions"`.

- [ ] **Step 1: Write failing tests:**
  - `every category belongs to exactly one gallery`;
  - `galleryOf maps sound_design to "b" and xr_3d to "c"`;
  - `every category has a label, singular label, media rule, icon and tint`;
  - `CATEGORIES order matches the database enum order` (a literal array
    assertion).
- [ ] **Step 2:** `npx vitest run src/lib/museum/categories.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement both modules. `lucide-react` is installed in Task 6; until then, run `npm i lucide-react` here and Task 6 reuses it.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(museum): add exhibit categories, galleries and upload limits`.

### Task 2: Works migration (categories, review status, student writes)

**Files:**
- Create: `supabase/migrations/20261116000000_museum_works.sql`, `supabase/tests/database/works.test.sql`
- Modify:
  - `package.json` (script `"test:db": "supabase test db"`);
  - `src/lib/supabase/database.types.ts` (regenerated);
  - every `kind` user listed by `grep -rn "\.kind\b\|student_work_kind" src`:
    - `WorkTile.tsx`, `WorkSpotlight.tsx`, `WorkList.tsx`, `WorkForm.tsx`;
    - `lib/studentWorks/{form,layout}.ts`, `components/studentWorks/fixtures.ts`;
    - their tests.

**Interfaces:**
- Consumes: `Category`, `CATEGORY_SINGULAR` (Task 1).
- Produces, as columns on `public.student_works`:
  - `category exhibit_category not null`;
  - `status review_status not null default 'approved'`, where
    `review_status` is `'pending' | 'approved' | 'rejected'`;
  - `submitted_by uuid null`, referencing `auth.users`, on delete cascade;
  - `rejection_reason text null`;
  - `featured boolean not null default false`;
  - `like_count integer not null default 0 check (like_count >= 0)`;
  - `video_url text null`;
  - `audio_url text null`;
  - `submitted_at timestamptz null`;
  - `reviewed_at timestamptz null`.

  `kind` and type `student_work_kind` are dropped.
  `StudentWork` (`src/lib/cms/content.ts`) keeps its name and now has these
  fields.

Migration content (decisions the implementer can't infer):

- **Backfill:** `art→digital_art`, `game→game`, `video→short_film`.
- **Replace `student_works_media_for_kind` with `student_works_media_for_category`:**
  - cover_link categories: `image_url` and `store_url` not null;
  - `digital_art`: `image_url` not null;
  - `animation`/`short_film`: either `youtube_id is not null and
    orientation is not null`, or `video_url is not null and image_url is
    not null and orientation is not null`;
  - `sound_design`: `audio_url` and `image_url` not null.
- Add `check (status <> 'rejected' or rejection_reason is not null)`.
- **Indexes:**
  - `(submitted_by)`;
  - `(status, visible, sort_order)`;
  - a partial index on `(created_at desc) where featured`.
- **Replace the policy "Visible student works are public"** with one using
  `(visible and status = 'approved')`.
- **Add authenticated policies:**
  - select own: `submitted_by = (select auth.uid())`;
  - insert with check: `submitted_by = (select auth.uid())`;
  - update own, using and with-check;
  - delete own.

  The admin policies stay.
- **`public.guard_student_work()`:** a `BEFORE INSERT OR UPDATE` trigger,
  `security invoker`, `search_path = ''`.
  - **Bypass:** return `new` unchanged when `(select public.is_admin())`, or
    when `current_user not in ('authenticated', 'anon')`. The second case
    covers the like-count trigger from Task 3 and the service role.
  - **On INSERT:**
    - force `status='pending'`, `featured=false`, `like_count=0`,
      `visible=true`;
    - force `rejection_reason=null`, `reviewed_at=null`,
      `submitted_at=now()`;
    - set `sort_order = coalesce(max(sort_order), -1) + 1`;
    - refuse with `raise exception 'quota_reached' using errcode = 'P0001'`
      when `count(*)` of the user's rows with status in
      (pending, approved) is ≥ 5.
  - **On UPDATE:**
    - refuse any change to `submitted_by`;
    - copy back from `old`: `featured`, `like_count`, `visible`,
      `sort_order`;
    - set `status='pending'`, `rejection_reason=null`, `reviewed_at=null`,
      `submitted_at=now()`;
    - when `old.status = 'rejected'`, apply the same quota check, not
      counting this row.
- **`public.stamp_review()`:** a `BEFORE UPDATE OF status` trigger. When an
  admin changes status, it sets `reviewed_at = now()`.

Steps:

- [ ] **Step 1: Write the pgTAP tests in `supabase/tests/database/works.test.sql`.**
  - **Setup:**
    - insert two users into `auth.users` (student A, student B) and one
      admin listed in `admin_users`;
    - act as a user with `set local role authenticated` plus
      `set_config('request.jwt.claims', json_build_object('sub', <uuid>, 'role','authenticated')::text, true)`.
  - **Tests:**
    - `anon sees only visible approved works` (seed one each:
      pending, rejected, approved+hidden, approved+visible; anon count = 1);
    - `student insert is forced to pending and not featured` (insert with
      `status='approved', featured=true`; read back pending/false);
    - `student cannot read another student's pending work`;
    - `student update of an approved work sends it back to pending and
      keeps like_count`;
    - `student cannot change submitted_by` (`throws_ok`);
    - `sixth active submission raises quota_reached` (`throws_ok(...,
      'P0001', 'quota_reached')`);
    - `rejected works do not count toward the quota`;
    - `admin can approve and the row gets reviewed_at`;
    - `rejecting without a reason violates the check constraint`;
    - `exhibit_category has the seven labels in order` (`enum_has_labels`
      in the Task 1 order). Check the art→digital_art backfill by hand in
      Step 4, against a database that has an `art` row from before the
      migration.
- [ ] **Step 2:** `npm run db:reset && npm run test:db`. Expected: works tests FAIL (enum/columns missing).
- [ ] **Step 3:** Write the migration as specified above.
- [ ] **Step 4:** `npm run db:reset && npm run test:db`. Expected: PASS.
- [ ] **Step 5:** `npm run db:types`. Then replace every `kind` use with `category`. Labels come from `CATEGORY_SINGULAR`, and `kind === "video"` checks become `CATEGORY_MEDIA[work.category] === "video"`. Admin `parseStudentWork` reads `category` (any of `CATEGORIES` except `sound_design`, because admins add sound design only through student submissions) and `featured` (checkbox `"on"` → true). Fixtures use `category: "digital_art", status: "approved", featured: false, like_count: 0`, with the other new fields null.
- [ ] **Step 6:** `npx tsc --noEmit && npx vitest run`. Expected: no type errors, and all existing tests PASS after updating their expectations from kind labels to the singular category labels.
- [ ] **Step 7:** Commit `feat(museum): categories, review status and student-owned works`.

### Task 3: Likes and notifications

**Files:**
- Create: `supabase/migrations/20261116010000_museum_likes_notifications.sql`, `supabase/tests/database/likes.test.sql`
- Modify: `src/lib/supabase/database.types.ts` (regenerated)

**Interfaces:**
- Produces:
  - **`public.work_likes`:**
    - `work_id uuid` references `student_works`, on delete cascade;
    - `user_id uuid not null default auth.uid()` references `auth.users`,
      on delete cascade;
    - `created_at`;
    - primary key `(work_id, user_id)`.
  - **`public.notifications`:**
    - `id uuid pk`;
    - `user_id` (cascade);
    - `work_id uuid null` (on delete set null);
    - `kind notification_kind ('approved','rejected')`;
    - `work_title text not null`;
    - `reason text null`;
    - `read_at timestamptz null`;
    - `created_at`.

Decisions:

- **`work_likes` RLS:**
  - select own;
  - insert with check `user_id = (select auth.uid()) and exists (select 1
    from public.student_works w where w.id = work_id and w.visible and
    w.status = 'approved')`;
  - delete own.

  Grant select/insert/delete to authenticated only.
- **`public.sync_like_count()`:** `security definer`, `search_path = ''`.
  Runs after insert/delete on `work_likes` and updates
  `student_works.like_count` by ±1.
- **`notifications` RLS:** select own, and update own. Grant
  `update (read_at)` only.
- **`public.notify_review()`:** `security definer`. Runs after update of
  status on `student_works`. When `submitted_by is not null`,
  `new.status in ('approved','rejected')` and `new.status is distinct from
  old.status`, it inserts one notification copying the title and
  `rejection_reason`.

Steps:

- [ ] **Step 1: pgTAP tests:**
  - `a signed-in user can like an approved work once` (a second insert →
    `throws_ok` unique violation);
  - `liking increments and unliking decrements like_count`;
  - `liking a pending work is refused`;
  - `anon cannot like`;
  - `a user sees only their own likes`;
  - `approving a submission notifies its student`;
  - `rejecting notifies with the reason`;
  - `admin-created works produce no notification`;
  - `a user cannot read another user's notifications`;
  - `a user can set read_at but not change work_title`.
- [ ] **Step 2:** `npm run db:reset && npm run test:db`. Expected: FAIL.
- [ ] **Step 3:** Write the migration.
- [ ] **Step 4:** Re-run. Expected: PASS. Then `npm run db:types`.
- [ ] **Step 5:** Commit `feat(museum): likes with counts and review notifications`.

### Task 4: Accounts (profiles, WVSU sign-up hook, email templates)

**Files:**
- Create:
  - `supabase/migrations/20261116020000_museum_accounts.sql`;
  - `supabase/tests/database/accounts.test.sql`;
  - `supabase/templates/confirmation.html`, `supabase/templates/recovery.html`;
  - `docs/virtual-museum-launch.md`.
- Modify: `supabase/config.toml`, `scripts/create-admin.mjs`, `src/lib/supabase/database.types.ts`

**Interfaces:**
- Produces:
  - **`public.profiles`:**
    - `user_id uuid pk` references `auth.users`, on delete cascade;
    - `display_name text not null check (char_length(display_name) between 1 and 80)`;
    - `created_at`, `updated_at`.

    RLS: select own, update own.
  - **`public.handle_new_user()`:** an after-insert trigger on `auth.users`.
    It inserts a profile with
    `coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''), split_part(email,'@',1))`.
  - **`public.restrict_signup_to_wvsu(event jsonb) returns jsonb`:**
    - returns `'{}'::jsonb` when the email's domain (lowercased, trimmed,
      the text after the last `@`) equals `wvsu.edu.ph`, or when
      `event->'user'->'app_metadata'->>'cms_admin' = 'true'`;
    - otherwise returns `{"error":{"http_code":403,"message":"Use your WVSU email address (@wvsu.edu.ph) to sign up."}}`;
    - grant execute to `supabase_auth_admin`, and revoke it from `public`,
      `anon` and `authenticated`.

Decisions:

- **`config.toml`:**
  - `[auth.hook.before_user_created] enabled = true`, with
    `uri = "pg-functions://postgres/public/restrict_signup_to_wvsu"`;
  - `[auth.email] enable_confirmations = true`;
  - `[auth.email.template.confirmation]`: subject "Confirm your WVSU CICT
    account", `content_path = "./supabase/templates/confirmation.html"`;
  - `[auth.email.template.recovery]`: likewise;
  - `additional_redirect_urls` gains `"http://localhost:3000/account/confirm/"`.
- **Templates:** both link to
  `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`, and recovery
  uses `type=recovery`. This is a token-hash flow, so the link works even
  when opened in a different browser from the one that signed up.
- **`create-admin.mjs`:**
  - `createUser` passes `app_metadata: { cms_admin: true }` and
    `email_confirm: true`;
  - promoting an existing user also sets that `app_metadata` via
    `updateUserById`;
  - the usage comment says non-WVSU admin emails work only through this
    script.
- **`docs/virtual-museum-launch.md`:** a checklist covering:
  - custom SMTP;
  - Site URL plus redirect URLs (school site `…/account/confirm/` and the
    CMS URL);
  - turning on the Before User Created hook to the function above;
  - pasting both templates;
  - turning on email confirmations;
  - confirming the plan's storage limit (1 GB) and per-file limit (≥ 20 MB);
  - running `supabase db push`.

  It also includes a manual test: sign up with a gmail address → refused.

Steps:

- [ ] **Step 1: pgTAP tests (call the function directly with JSON):**
  - `wvsu address is allowed` (`'Juan.Cruz@WVSU.edu.ph '` → `{}`);
  - `other domains are refused with http_code 403`;
  - `look-alike domains are refused` (`a@wvsu.edu.ph.evil.com`,
    `a@notwvsu.edu.ph`, `a@student.wvsu.edu.ph`);
  - `cms_admin app_metadata is allowed for any domain`;
  - `user_metadata cms_admin does not bypass` (put `cms_admin` under
    `user_metadata` → refused);
  - `new auth user gets a profile with their display name`;
  - `profile falls back to the email's local part`;
  - `a user cannot read another user's profile`.
- [ ] **Step 2:** `npm run db:reset && npm run test:db`. Expected: FAIL.
- [ ] **Step 3:** Write the migration, config, templates, script change and launch doc.
- [ ] **Step 4:** `npm run db:reset && npm run test:db`. Expected: PASS. Also run `supabase stop && supabase start`, then sign up `x@gmail.com` with the local client snippet in the launch doc. Expected: error "Use your WVSU email address…".
- [ ] **Step 5:** `npm run db:types` and commit `feat(auth): WVSU-only student accounts with profiles`.

### Task 5: Submissions storage

**Files:**
- Create: `supabase/migrations/20261116030000_museum_storage.sql`, `supabase/tests/database/storage.test.sql`
- Modify: `src/lib/supabase/database.types.ts`

**Interfaces:**
- Produces:
  - **Bucket `submissions`:**
    - `public = true`;
    - `file_size_limit = 20971520` (comment pointing to `limits.ts`);
    - `allowed_mime_types = ['image/webp','video/webm','audio/webm']`.
  - **Object path convention:** `<user_id>/<work_id>/<random>.<webp|webm>`.
  - **`public.submissions_storage_bytes() returns bigint`:**
    - `security definer`;
    - raises `not_admin` unless `is_admin()`;
    - returns the sum of `(metadata->>'size')::bigint` over
      `storage.objects` in that bucket.
- **Policies on `storage.objects`:**
  - **insert/update/delete:** to authenticated, where
    `bucket_id = 'submissions' and (storage.foldername(name))[1] = (select auth.uid())::text`;
  - **admin delete:** any object in `submissions`;
  - **select:** no select policy for listing. Public URLs work because the
    bucket is public.

Steps:

- [ ] **Step 1: pgTAP tests:**
  - `a student can insert an object under their own folder`;
  - `a student cannot insert under another user's folder`;
  - `an admin can delete any submission object`;
  - `submissions_storage_bytes sums object sizes for admins`;
  - `submissions_storage_bytes refuses non-admins`;
  - `bucket only allows webp and webm` (assert the bucket row).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Write the migration.
- [ ] **Step 4:** Run. Expected: PASS. Then `npm run db:types`.
- [ ] **Step 5:** Commit `feat(museum): submissions storage bucket and usage report`.

## Phase 2: Front-end foundation

### Task 6: shadcn/ui on the site's tokens

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/*`, `src/components/ui/ui-tokens.test.ts`
- Modify: `src/app/globals.css`, `package.json`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` in `src/lib/utils.ts`.
  Also these shadcn components under `@/components/ui/`:
  - button, badge, carousel, select, popover, slider, switch, tooltip,
    sheet, dialog;
  - input, label, textarea, dropdown-menu, toggle-group, separator, alert,
    progress.

Decisions:

- **Run** `npx shadcn@latest init` (Tailwind v4, aliases `@/components`,
  `@/lib/utils`, icon library lucide), then `npx shadcn@latest add <list>`.
- **Then hand-edit `globals.css`:**
  - delete shadcn's `:root`/`.dark` color blocks and its
    `@custom-variant dark`; the site's own variant stays;
  - keep `@import "tw-animate-css"`.
- **Add one `@theme inline` block mapping shadcn names to site tokens:**
  - `background`→`--color-paper`, `foreground`→`--color-ink`;
  - `card` and `popover`→`--color-surface`, with their foregrounds→ink;
  - `primary`→`--color-theme-red`, `primary-foreground`→`#fff`;
  - `secondary` and `muted`→`--color-paper-2`;
  - `secondary-foreground`→ink, `muted-foreground`→`--color-ink-soft`;
  - `destructive`→`#b42318`;
  - `border` and `input`→`--color-rule`;
  - `ring`→`--color-accent`;
  - `--radius: 0.75rem`.

  Do **not** define `--color-accent-foreground`.
- **In `src/components/ui/*`:** replace every `bg-accent` with `bg-muted`,
  and every `text-accent-foreground` with `text-foreground`.

Steps:

- [ ] **Step 1: Write `ui-tokens.test.ts`:**
  - `shadcn components never use the accent token`: reads every file in
    `src/components/ui` and expects no match for
    `/\b(bg|text|border|ring|from|to)-accent(-foreground)?\b/`;
  - `globals.css keeps the site accent`: expects
    `--color-accent: #ba3d1b;` inside `@theme`, and no `.dark {` block.
- [ ] **Step 2:** Run it. Expected: FAIL (`src/components/ui` missing).
- [ ] **Step 3:** Run the init/add, then make the edits above.
- [ ] **Step 4:** Run `npx vitest run && npx tsc --noEmit && npm run lint`. Expected: PASS. Then `npm run dev`, and open `/`, `/programs/bsemc` and `/admin` in light and dark. They should look unchanged (compare against `main` screenshots).
- [ ] **Step 5:** Commit `chore(ui): add shadcn/ui mapped onto the site's color tokens`.

### Task 7: Auth client library

**Files:**
- Create: `src/lib/auth/email.ts`, `src/lib/auth/client.ts`, `src/lib/auth/session.ts`, plus `*.test.ts(x)` for each.

**Interfaces:**
- Produces:
  - `isWvsuEmail(email: string): boolean`, using the same rule as the hook.
  - `normalizeEmail(email: string): string` (trims and lowercases).
  - `confirmUrl(origin: string): string` → `${origin}/account/confirm/`.
  - `signUp(client, { email, password, displayName }): Promise<{ error?: string }>`.
    - Refuses non-WVSU emails before calling Supabase.
    - Passes `options.data.display_name` and `options.emailRedirectTo: confirmUrl(location.origin)`.
    - Maps a hook refusal to its message.
    - Requires a password of at least 8 characters.
  - `signIn(client, { email, password })`, `signOut(client)`,
    `requestPasswordReset(client, email)` and
    `updatePassword(client, password)`. All return
    `Promise<{ error?: string }>`.
  - `verifyEmailLink(client, params: URLSearchParams): Promise<{ next: "/account/" | "/account/reset-password/" } | { error: string }>`.
    - Reads `token_hash` and `type` (`email` | `recovery`).
    - Calls `verifyOtp`.
  - `useSession(): { status: "loading" | "signed-out" | "signed-in"; user: User | null; displayName: string | null }`.
    - Uses `getBrowserClient()` and `onAuthStateChange`.
    - Loads `profiles.display_name` once per user.

Steps:

- [ ] **Step 1: Failing tests:**
  - `isWvsuEmail`: accepts `" Ana@WVSU.edu.ph"`; rejects `a@wvsu.edu.ph.evil.com`,
    `a@student.wvsu.edu.ph`, `wvsu.edu.ph`, and `""`.
  - `signUp`, against a mocked client:
    - rejects gmail without calling `auth.signUp`;
    - sends `display_name` and the redirect URL;
    - turns a 403 hook error into "Use your WVSU email address (@wvsu.edu.ph) to sign up.".
  - `verifyEmailLink`:
    - recovery → `/account/reset-password/`;
    - email → `/account/`;
    - missing token → error "This link is incomplete. Open the latest email we sent you.".
  - `useSession`: goes loading → signed-in when the mocked client emits a
    session, and loads the display name.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(auth): browser auth helpers and session hook`.

### Task 8: Account pages

**Files:**
- Create:
  - `src/app/(site)/account/{page,sign-in,sign-up,forgot-password,reset-password,confirm}/page.site.tsx`;
  - `src/components/account/{SignInForm,SignUpForm,ForgotPasswordForm,ResetPasswordForm,ConfirmLanding,AccountHome}.tsx`;
  - tests next to the components.
- Modify: `src/lib/sitemap*` / `robots` so that `/account/*` is excluded from the sitemap and gets `noindex` (via `pageMetadata` + `robots: { index: false }`).

**Interfaces:**
- Consumes: Task 7 helpers, shadcn Input/Label/Button/Alert.
- Produces:
  - Routes: `/account/`, `/account/sign-in/`, `/account/sign-up/`,
    `/account/forgot-password/`, `/account/reset-password/`,
    `/account/confirm/`.
  - Sign-in honours `?next=<path>`. It accepts only same-site paths that
    start with `/` and not `//`, and defaults to `/account/`.
  - `AccountHome` renders `MySubmissions` (Task 12). Until then it shows
    the user's name and a sign-out button.

Steps:

- [ ] **Step 1: Failing component tests:**
  - `sign-up shows the WVSU error as soon as a non-WVSU email is submitted`;
  - `sign-up success tells the user to check their email`;
  - `sign-in redirects to a safe next path and ignores //evil.com`;
  - `confirm landing verifies the token and routes recovery links to reset-password`;
  - `account page sends signed-out visitors to sign-in with next=/account/`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the pages. They are plain centered cards on `bg-surface`, using the same `container` as other pages.
- [ ] **Step 4:** Run the tests. Expected: PASS. Then `BUILD_TARGET=site npx next build` (with `.env` set). Expected: `out/account/sign-in/index.html` and the other account pages exist.
- [ ] **Step 5:** Commit `feat(auth): sign-up, sign-in and password reset pages`.

### Task 9: Header (museum link, sign-in, account menu, bell)

**Files:**
- Create:
  - `src/components/account/AccountMenu.tsx`, `src/components/account/NotificationsBell.tsx`;
  - `src/lib/museum/notifications.ts`;
  - tests.
- Modify: `src/app/layout/header.tsx`, `src/app/layout/header.test.tsx`

**Interfaces:**
- Produces:
  - `fetchNotifications(client): Promise<Notification[]>` (newest 20).
  - `markAllNotificationsRead(client): Promise<void>`.
  - `type Notification = Tables<"notifications">`.
  - `LINKS` gains `{ href: "/programs/bsemc/museum", label: "Virtual Museum" }`
    after Programs. `current()` must not also mark Programs active on the
    museum path.

Decisions:

- **Signed out:** a primary "Sign In" button (icon `User`) links to
  `/account/sign-in/?next=<current path>`.
- **Signed in:**
  - `NotificationsBell` is a Popover listing notifications;
  - an unread dot appears when any notification has `read_at` null, and
    opening the popover marks them all read;
  - `AccountMenu` is a DropdownMenu with the name, "My submissions"
    (`/account/`), "Submit work" (`/account/submit/`) and "Sign out".
- **Mobile menu:** gains the same entries as plain links.

Steps:

- [ ] **Step 1: Failing tests (extend `header.test.tsx`):**
  - `shows Virtual Museum in the nav and marks it current on the museum page only`;
  - `signed-out header links Sign In with next set to the current page`;
  - `signed-in header shows the account menu and the bell`.

  In `NotificationsBell.test.tsx`:
  - `bell shows an unread dot and marks all read when opened`;
  - `approved notification links to the exhibit and rejected links to /account/`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(site): header museum link, sign-in and notifications`.

## Phase 3: Submissions

### Task 10: File checks and poster capture

**Files:**
- Create: `src/lib/museum/files.ts`, `src/lib/museum/poster.ts`, `src/lib/museum/files.test.ts`

**Interfaces:**
- Produces:
  - `type MediaKind = "image" | "video" | "audio"`.
  - `sniffFormat(head: Uint8Array): "webp" | "webm" | null`.
    - webp = `RIFF` at bytes 0–3 and `WEBP` at 8–11.
    - webm = `1A 45 DF A3` at 0–3, plus the ASCII `webm` within the first
      64 bytes.
  - `checkSubmissionFile(file: File, kind: MediaKind): Promise<string | null>`.
    - Reads the first 64 bytes and checks format and size (image 5 MB,
      media 20 MB).
    - Error copy:
      - "Use a WebP image (.webp).";
      - "Use a WebM file (.webm).";
      - "That image is over 5 MB.";
      - "That file is over 20 MB.".
  - `readImageSize(file: File): Promise<{ width: number; height: number }>`
    via `createImageBitmap`.
  - `checkImageEdge(size): string | null` → "That image is larger than
    2560 px on its longest side. Export a smaller version." when it is too
    big.
  - `capturePoster(video: File): Promise<{ blob: Blob; width: number; height: number }>`.
    - Draws the frame at 0.5 s, or at 0 for clips shorter than 1 s.
    - Downscales to a longest edge of 1600.
    - Returns `canvas.toBlob(…, "image/webp", 0.86)`.
  - `readVideoOrientation(file: File): Promise<"landscape" | "vertical">`
    → vertical when height > width.

Steps:

- [ ] **Step 1: Failing tests:**
  - `sniffFormat recognises webp and webm headers and rejects png and mp4`
    (byte fixtures inline);
  - `checkSubmissionFile rejects a .webp-named PNG`;
  - `checkSubmissionFile rejects a 5 MB + 1 byte image and a 20 MB + 1 byte video`;
  - `checkImageEdge allows 2560 and rejects 2561`.

  (`capturePoster` and `readVideoOrientation` need real media. Leave them
  untested in jsdom and cover them in Task 12's manual check.)
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(museum): validate webp/webm submissions and capture posters`.

### Task 11: Submission data layer

**Files:**
- Create: `src/lib/museum/submissions.ts`, `src/lib/museum/submissions.test.ts`

**Interfaces:**
- Consumes:
  - `SUBMISSIONS_BUCKET` and `MAX_ACTIVE_WORKS` (Task 1);
  - the `CATEGORY_MEDIA` rules (Task 1);
  - the Task 2 columns.
- Produces:
  - `type SubmissionDraft = { title: string; category: Category; description: string; student: string; liveUrl?: string; portfolioUrl?: string; image?: File; media?: File }`.
    `image` is the cover, artwork or poster; `media` is webm video or
    audio.
  - `validateDraft(draft): string | null`. It applies the per-category
    requirements:
    - cover_link needs `image` and an http(s) `liveUrl`;
    - image needs `image`;
    - video needs `media` (the poster is captured if `image` is missing);
    - audio needs `media` and `image`.

    It also requires title, description and student, and checks URLs with
    the existing `isWebUrl`.
  - `countActiveWorks(client, userId): Promise<number>`.
  - `createSubmission(client, userId, draft): Promise<{ id: string } | { error: string }>`.
    1. Generate `id = crypto.randomUUID()`.
    2. Upload each file to `${userId}/${id}/${crypto.randomUUID()}.${ext}`
       with an explicit `contentType`.
    3. Insert the row with `id`, `submitted_by: userId`, the media URLs from
       `getPublicUrl`, `store_url` = liveUrl, image width/height,
       `orientation` for video, and `visible: true`.
    4. **If any step after the first upload fails, remove every uploaded
       path, then return the error.**
       - A `P0001 quota_reached` error maps to "You already have 5 works in
         the museum or waiting for review. Withdraw or delete one to submit
         another."
  - `updateSubmission(client, userId, work: StudentWork, draft): Promise<{ error?: string }>`.
    1. Upload only the files that changed.
    2. Update the row.
    3. On success, remove the replaced objects.
    4. On failure, remove the new uploads.
  - `deleteSubmission(client, work): Promise<{ error?: string }>`. Deletes
    the row, then removes `submissionPaths(work)`.
  - `submissionPaths(work): string[]`. Gets the object paths for
    `image_url`, `video_url` and `audio_url` that are inside the
    `submissions` bucket. Admin `media`-bucket URLs are ignored.
  - `listMySubmissions(client, userId): Promise<StudentWork[]>`, newest
    first.

Steps:

- [ ] **Step 1: Failing tests (mocked client recording storage/db calls):**
  - `validateDraft requires a live link for games and a cover for sound design`;
  - `createSubmission uploads under the user's folder and inserts a row with the same id`;
  - `createSubmission removes uploaded files when the insert fails` (Review Focus 1);
  - `createSubmission maps quota_reached to the quota message` (Review Focus 4);
  - `updateSubmission removes the old file only after a successful update`;
  - `updateSubmission removes the new upload when the update fails`;
  - `submissionPaths ignores media-bucket and YouTube works`;
  - `deleteSubmission removes the row then its files`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(museum): create, edit and withdraw submissions`.

### Task 12: Submit form and My submissions

**Files:**
- Create:
  - `src/app/(site)/account/submit/page.site.tsx`;
  - `src/components/account/SubmissionForm.tsx`, `src/components/account/MySubmissions.tsx`;
  - tests.
- Modify: `src/components/account/AccountHome.tsx`

**Interfaces:**
- Consumes: Tasks 7, 10 and 11.
- Produces:
  - `/account/submit/` creates a submission; `/account/submit/?id=<uuid>`
    edits one.
  - Signed-out visitors are sent to sign-in with `next`.

Decisions:

- **Form layout:**
  1. Category is a Select. Picking it shows only the file fields that
     category needs, with hints such as "WebP, up to 5 MB, max 2560 px"
     and "WebM, up to 20 MB".
  2. Display name is pre-filled from the profile.
  3. Files are validated as soon as they're picked, and errors show
     inline under the field.
  4. Submitting shows Progress while it runs.
- **Before showing file fields** for a new submission, call
  `countActiveWorks`. At 5, show the quota message in an Alert and disable
  the form. Editing is never blocked.
- **On success:** go to `/account/?submitted=1`, which shows "Submitted
  for review. We'll let you know when it's approved."
- **`MySubmissions` rows:**
  - each shows cover, title, category and a status Badge:
    - Pending: neutral;
    - Approved: green, linking to `/programs/bsemc/museum/?exhibit=<id>`;
    - Rejected: red, with the reason shown under it.
  - actions:
    - "Edit" on every row;
    - "Withdraw" on pending rows;
    - "Delete" on approved and rejected rows.
  - Withdraw and Delete are confirmed with a Dialog.
  - Editing an approved work first warns: "Editing sends this work back for
    review. It leaves the museum until it's approved again."
- **Below the list:** "You can have up to 5 works in the museum or waiting
  for review."

Steps:

- [ ] **Step 1: Failing tests:**
  - `shows the quota alert and no file fields at 5 active works` (Review Focus 4);
  - `game category asks for a cover and live link, digital art only for artwork`;
  - `an invalid file shows its error under the field and blocks submit`;
  - `editing an approved work asks for confirmation first`;
  - `my submissions shows the rejection reason and the right actions per status`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Manual check, with `npm run dev` and local Supabase:**
  1. Sign up a `@wvsu.edu.ph` user (confirm through Inbucket at
     `http://127.0.0.1:54324`).
  2. Submit a short webm without a poster. Expect a poster captured, and
     the correct orientation for a vertical clip.
  3. Submit a webp and a game, then confirm the rows are pending in Studio.
- [ ] **Step 6:** Commit `feat(museum): submission form and my submissions page`.

## Phase 4: CMS

### Task 13: Review queue, approve/reject, featured, file cleanup

**Files:**
- Create:
  - `src/app/admin/(cms)/student-works/ReviewPanel.tsx`, `src/app/admin/(cms)/student-works/StatusTabs.tsx`;
  - `ReviewPanel.test.tsx`.
- Modify:
  - `student-works/actions.ts`, `student-works/page.tsx`, `student-works/[id]/page.tsx`;
  - `student-works/WorkList.tsx` (+ test), `student-works/WorkForm.tsx`;
  - `src/lib/cms/csp.ts` (+ test).

**Interfaces:**
- Consumes: `submissionPaths` (Task 11).
- Produces these server actions:
  - `approveStudentWork(id: string): Promise<{ error?: string }>`;
  - `rejectStudentWork(id: string, reason: string): Promise<{ error?: string }>`.
    An empty, trimmed reason → "Give the student a reason.";
  - `setStudentWorkFeatured(id: string, featured: boolean): Promise<{ error?: string }>`.

  `deleteStudentWork` now also removes `submissionPaths(work)` from the
  `submissions` bucket.

Decisions:

- **List page tabs:** `?status=pending|approved|rejected|all`.
  - Without a param, the list opens on `pending` if any are pending,
    otherwise `all`.
  - The Pending tab label includes its count.
  - Reordering is available only on the Approved tab.
  - Rows show a "Student" or "Admin" source tag and a Featured switch.
- **Detail page:** when `submitted_by` is set and status is pending, the
  `ReviewPanel` sits above the form.
  - It shows a preview: image, a `<video controls>` or `<audio controls>`
    for webm, and the links.
  - It has Approve and Reject buttons. Reject opens a Textarea for the
    reason.
- **`WorkForm`:** `kind` becomes `category` (all categories except
  sound_design), and a "Featured in Student Highlights" checkbox is added.
- **CSP:** add `media-src 'self' blob: ${supabaseOrigin}` so admins can
  play webm previews.

Steps:

- [ ] **Step 1: Failing tests:**
  - `ReviewPanel requires a reason before rejecting`;
  - `ReviewPanel plays webm video and audio previews`;
  - `WorkList shows the pending count and only allows reordering on Approved`;
  - `csp allows media from Supabase`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS. Then, manually: approve the Task 12 submission. The student's bell shows "approved", and the work shows on `/programs/bsemc`.
- [ ] **Step 5:** Commit `feat(cms): review, approve and feature student submissions`.

### Task 14: Dashboard pending count, storage usage, nav badge

**Files:**
- Modify:
  - `src/app/admin/(cms)/page.tsx`;
  - `src/app/admin/(cms)/layout.tsx`;
  - `src/components/admin/AdminNav.tsx` (+ new `AdminNav.test.tsx`).
- Create: `src/lib/format.ts` addition `formatBytes(bytes: number): string` (+ test).

**Interfaces:**
- Produces:
  - `AdminNav({ badges }: { badges?: Partial<Record<string, number>> })`,
    keyed by href. The badge is shown when > 0.
  - `formatBytes`: 0 → "0 MB"; 1048576 → "1 MB"; 1610612736 → "1.5 GB".

Decisions:

- **Dashboard cards:**
  - "Submissions waiting for review" shows the count and links to
    `?status=pending`.
  - "Submission storage" shows "X of 1 GB", a progress bar and a warning
    color at ≥ 80%.
- The layout fetches the pending count once for the nav badge.

Steps:

- [ ] **Step 1: Failing tests:**
  - `formatBytes` cases above;
  - `AdminNav shows a badge next to Student works when pending > 0`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(cms): pending submissions and storage usage on the dashboard`.

## Phase 5: Public display

### Task 15: Likes, saved, share, and the existing wall/spotlight for all categories

**Files:**
- Create:
  - `src/lib/museum/likes.ts`, `saved.ts`, `share.ts`, `queries.ts`;
  - `src/components/museum/LikeButton.tsx`, `src/components/account/SignInPrompt.tsx`;
  - tests.
- Modify:
  - `src/components/studentWorks/{WorkTile,WorkSpotlight,WorkWall}.tsx` and tests;
  - `src/lib/studentWorks/layout.ts`;
  - `src/lib/cms/content.ts` (`fetchStudentWorks` adds `.eq("status","approved")`).

**Interfaces:**
- **Produces, likes:**
  - `fetchMyLikes(client, workIds: string[]): Promise<Set<string>>`.
  - `setLiked(client, workId: string, liked: boolean): Promise<{ error?: string }>`.
  - `useLike(work: Pick<StudentWork,"id"|"like_count">): { liked: boolean; count: number; toggle(): void; promptSignIn: boolean; dismissPrompt(): void }`.
    - The update is optimistic and rolls back on error.
    - When the visitor is signed out, it sets `promptSignIn`.
    - One shared cache per page, so the card, the panel and the spotlight
      agree.
- **Produces, saved:**
  - `getSavedIds(): string[]`, `toggleSaved(id: string): string[]` and
    `useSaved(): { ids: string[]; isSaved(id): boolean; toggle(id): void }`.
  - Stored under localStorage key `cict.museum.saved.v1`. Every access is
    wrapped in try/catch, and an empty list is the fallback.
- **Produces, share:**
  - `exhibitUrl(id: string, origin: string): string` →
    `${origin}/programs/bsemc/museum/?exhibit=${id}`.
  - `shareExhibit(work, origin): Promise<"shared" | "copied" | "failed">`
    tries `navigator.share`, then `navigator.clipboard.writeText`.
- **Produces, queries:**
  - `fetchFeaturedWorks(client, limit = 12)`.
  - `fetchGalleryWorks(client, gallery: GalleryId, capacity = HALL_CAPACITY)`:
    the gallery's categories, ordered `featured desc, created_at desc`,
    with `limit capacity`.
  - `fetchExhibit(client, id): Promise<StudentWork | null>`. Returns null
    for a non-UUID without querying.
  - `fetchExhibits(client, { offset, limit, categories?, search?, ids? }): Promise<{ works; total }>`.
    Search is an `ilike` on title or student, with `%`/`_` escaped.
  - `fetchGalleryCounts(client): Promise<Record<GalleryId, number>>`.
- **`SignInPrompt`:** a Dialog reading "Sign in with your WVSU account to
  like exhibits." with Sign In and Create account buttons. Both pass
  `next` = the current URL.

Decisions:

- **Wall and spotlight:**
  - `WorkTile`, `WorkSpotlight` and `WorkWall` use `CATEGORY_SINGULAR` and
    `CATEGORY_MEDIA`.
  - Webm video tiles show the poster with the play marker.
  - Sound tiles show the cover with an AudioWaveform marker.
  - `workAspect` uses the image dimensions for webm video. When dimensions
    are missing, it falls back to 4:3.
  - The spotlight plays `video_url` in `<video controls playsInline poster>`.
    For `audio_url`, it shows the cover plus `<audio controls>`.
  - The details section gains `LikeButton`.
  - The store button label stays as it is for cover_link categories.

Steps:

- [ ] **Step 1: Failing tests:**
  - `useLike updates the count optimistically and rolls back on error`;
  - `useLike asks signed-out visitors to sign in instead of liking`;
  - `saved ids survive a reload and fall back to empty when storage throws`;
  - `shareExhibit copies the link when share is unavailable`;
  - `fetchExhibit returns null for a non-uuid without querying`;
  - `fetchExhibits escapes % in search`;
  - `fetchGalleryWorks orders featured first then newest and limits to 30`;
  - `WorkSpotlight plays a webm video and an audio work`;
  - `WorkTile labels a short film and shows the play marker`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the whole suite. Expected: PASS.
- [ ] **Step 5:** Commit `feat(museum): likes, saved exhibits, sharing, and all categories on the wall`.

### Task 16: Museum page shell, routing and static sections

**Files:**
- Create:
  - `src/app/(site)/programs/bsemc/museum/page.site.tsx`;
  - `src/components/museum/{MuseumPage,MuseumHero,ProgramStrip,ShareYourWork,HowItWorks,MuseumBanner,ExhibitDetail}.tsx`;
  - tests.
- Modify:
  - `deploy/school-server/.htaccess`;
  - `scripts/check-site.mjs`;
  - `src/components/ProgramDetails.tsx` (adds `MuseumBanner` above `StudentWorksSection` for bsemc);
  - the sitemap source (adds `/programs/bsemc/museum/`).

**Interfaces:**
- Consumes: `fetchProgram` (existing), `fetchExhibit` (Task 15).
- Produces:
  - `MuseumPage` has sections with ids `#museum-3d`, `#highlights`,
    `#browse` and `#share`, in mockup order:
    1. Hero;
    2. ProgramStrip;
    3. Highlights (Task 17);
    4. MuseumSection (Task 19);
    5. BrowseExhibits (Task 17);
    6. ShareYourWork + HowItWorks.

    Until Tasks 17 and 19 land, their slots render nothing.
  - `ExhibitDetail({ workId, onClose })` loads with `fetchExhibit` and
    renders `WorkSpotlight` for a single work.
  - Reads `?exhibit=` on load. A missing or unapproved exhibit shows an
    Alert: "This exhibit isn't available any more."

Decisions:

- **`.htaccess`:**
  - In the first rule, replace `RewriteCond %{REQUEST_FILENAME} !-d` with
    `RewriteCond %{REQUEST_FILENAME}/index.html !-f`.
  - In the second rule, add `RewriteCond %{REQUEST_FILENAME} !-d`.
  - Add a comment explaining that `programs/bsemc/` now exists as a folder.
- **Hero:**
  - `data-theme="dark"`, on `bg-navy`.
  - An inline SVG perspective line drawing of a building, with
    `stroke` = white at 10–20% opacity.
  - The orange corner wedge comes from a clip-path.
  - The category list uses `CATEGORY_ICON`. Each item links to
    `#browse?category=<c>` (Task 17 reads it).
  - Buttons: "Enter Museum" scrolls to `#museum-3d` and dispatches
    `museum:enter`; "Browse Exhibits" scrolls to `#browse`.
- **ProgramStrip:** program name, the spec's museum line, a code link to
  `/programs/bsemc`, and the duration and semesters from the program row.
  If the program fails to load, it shows only the static name.
- **`MuseumBanner`** on the BSEMC page: navy card, "Visit the Virtual
  Museum", and a link.
- **Metadata:** title "Virtual Museum", plus a description, via
  `pageMetadata`.

Steps:

- [ ] **Step 1: Failing tests:**
  - `hero links each category to the browse section`;
  - `program strip shows duration from the program row`;
  - `an unavailable ?exhibit= shows the notice and the page still renders` (Review Focus 2);
  - `how it works lists Sign in, Upload, Review, Exhibit`;
  - `BSEMC program page shows the museum banner, other programs do not`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Static build checks:**
  1. Run `npm run build:site`. Expected: `out/programs/bsemc/museum/index.html` and `out/programs/_/index.html` exist.
  2. Extend `check-site.mjs` with checks:
     - `"/programs/bsemc/ still opens the program page"`: heading contains
       "Entertainment and Multimedia Computing";
     - `"/programs/bsemc/museum/ opens the museum"`: an h1 "Virtual Museum";
     - `"following a link from the BSEMC page to the museum works"`;
     - `"another program URL still uses the template"` (`/programs/bscs/`).
  3. Run `npm run check:site`. Expected: all checks pass.
- [ ] **Step 6:** Commit `feat(museum): museum page, BSEMC banner and school-server routing`.

### Task 17: Student Highlights and Browse Exhibits

**Files:**
- Create: `src/components/museum/{Highlights,ExhibitCard,BrowseExhibits}.tsx` and tests.
- Modify: `src/components/museum/MuseumPage.tsx`

**Interfaces:**
- Consumes: Task 15 queries and hooks, Task 1 tints and icons, the shadcn
  Carousel and ToggleGroup.
- Produces:
  - `ExhibitCard({ work, onOpen })`:
    - category tint gradient;
    - cover image, or the category icon when there is none;
    - title, singular category, and `LikeButton` in compact mode.
  - `Highlights({ onVisit })`: `onVisit(workId)` goes to the museum (Task
    20), or opens `ExhibitDetail` when 3D isn't available.
  - `BrowseExhibits`: shows a list of works.
    - Filter chips: All, then the seven categories, then Saved.
    - Search input, debounced by 300 ms.
    - A grid of `ExhibitCard`, 12 per page, with a "Show more" button.
    - It reads `category` from the hash query that the hero sets.

Decisions:

- **Highlights:**
  - It is hidden when there are no featured works.
  - "View All Exhibits →" scrolls to `#browse`.
  - Cards are about 220 px wide on desktop, with 1.2 cards visible on
    phones.
- **Browse:**
  - Empty state per filter, for example "No sound design works yet." or
    "You haven't saved any exhibits."
  - An error state with Retry (the existing `ContentError`).

Steps:

- [ ] **Step 1: Failing tests:**
  - `highlights render featured works with like counts and no comment counts`;
  - `highlights are hidden when nothing is featured`;
  - `browse filters by category and by saved ids`;
  - `browse search waits 300ms and escapes input`;
  - `hero category link preselects the browse filter`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(museum): student highlights carousel and browse exhibits`.

## Phase 6: The 3D museum

### Task 18: Hall layout, galleries and movement (pure logic)

**Files:**
- Create: `src/lib/museum/hall.ts`, `src/lib/museum/movement.ts`, `src/lib/museum/galleries.ts`, `src/lib/museum/settings.ts`, `src/lib/museum/webgl.ts`, and tests.

**Interfaces:**
- **Produces, hall:**
  - `type Box = { minX: number; maxX: number; minZ: number; maxZ: number }`.
  - `type HallSlot = { workId: string; x: number; z: number; rotationY: number; width: number; height: number; side: "left" | "right" }`.
  - `type HallLayout = { width: number; length: number; slots: HallSlot[]; obstacles: Box[]; spawn: { x: number; z: number; yaw: number } }`.
  - `layoutHall(works: { id: string; aspect: number }[]): HallLayout`.
- **Layout constants**, exported from `hall.ts` as `HALL`:
  - width 12 m, wall height 5 m, eye height 1.6 m;
  - exhibits alternate left/right with a 5 m spacing along −z, starting
    6 m from the entrance;
  - `length = max(24, 6 + ceil(n/2) * 5 + 6)`;
  - a frame fits within 3.2 × 2.2 m, keeping aspect;
  - a central pillar 2 × 2 m at `z = −length/2`;
  - benches 2.4 × 0.6 m between every second pair, along the centre line
    but offset ±2.5 m in x;
  - spawn at `z = −1.5`, facing −z (yaw 0).
- **Produces, movement:**
  - `type Player = { x: number; z: number; yaw: number; pitch: number }`.
  - `stepPlayer(p, input: { forward: number; strafe: number }, dt: number, speed: number, layout: HallLayout): Player`.
    - Base speed is 3 m/s × the setting.
    - Collision uses a radius of 0.35 m and is resolved separately per
      axis against the walls and `obstacles`.
  - `applyLook(p, dx: number, dy: number, sensitivity: number, invert: boolean): Player`.
    Pitch is clamped to ±1.1 rad.
  - `exhibitInView(p, layout, maxDistance = 6, maxAngle = 0.35): string | null`.
  - `standInFront(slot): { x: number; z: number; yaw: number }`. The
    viewer stands 2.6 m out from the frame, facing it.
  - `orderedSlots(layout): HallSlot[]`: entrance to far end, left before
    right. Used by the prev/next buttons.
- **Produces, galleries:**
  - `availableGalleries(counts: Record<GalleryId, number>): GalleryId[]`
    (non-empty only, in a→c order).
- **Produces, settings:**
  - `type MuseumSettings = { lookSensitivity: number; moveSpeed: number; invertLook: boolean; quality: "low" | "high" }`.
  - `DEFAULT_SETTINGS`: `{1, 1, false, "high"}`. On coarse-pointer
    devices, quality defaults to `"low"`.
  - `loadSettings(): MuseumSettings` clamps sensitivity and speed to
    0.5–2 and repairs bad JSON.
  - `saveSettings(s)` writes localStorage key `cict.museum.settings.v1`,
    in try/catch.
- **Produces, webgl:** `hasWebGL(): boolean` (webgl2, then webgl).

Steps:

- [ ] **Step 1: Failing tests:**
  - `an empty gallery gives the minimum 24 m hall with no slots`;
  - `seven works alternate sides and the hall grows to fit them`;
  - `a wide work keeps its aspect within 3.2 × 2.2`;
  - `the player cannot walk through a wall, the pillar or a bench`;
  - `the player slides along a wall instead of stopping dead`;
  - `exhibitInView returns the facing work within 6 m and null when looking away`;
  - `standInFront faces the frame`;
  - `pitch is clamped and invert flips dy`;
  - `loadSettings repairs out-of-range and unparseable values`;
  - `loadSettings falls back to defaults when localStorage throws`;
  - `availableGalleries drops empty galleries`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(museum): hall layout, movement and settings logic`.

### Task 19: Lazy 3D section and the scene

**Files:**
- Create:
  - `src/components/museum/MuseumSection.tsx` (+ test), `src/components/museum/loadMuseumCanvas.ts`;
  - `src/components/museum/three/{MuseumCanvas,Hall,ExhibitFrame,useExhibitTexture}.tsx`.
- Modify: `package.json` (`three`, `@react-three/fiber@^9`, `@react-three/drei@^10`, `@types/three`)

**Interfaces:**
- Consumes: Task 18 logic, `fetchGalleryWorks` and `fetchGalleryCounts`
  (Task 15).
- Produces:
  - `loadMuseumCanvas = () => import("./three/MuseumCanvas")`. This is the
    only place that imports the three chunk.
  - `MuseumSection({ initialExhibitId?: string })`:
    - States: `poster`, then `loading`, then `ready`. `no-webgl` replaces
      them when there's no WebGL.
    - Starts on the `museum:enter` event, a click on the poster, or
      `visitExhibit(id)`.
    - Exposes `visitExhibit(id)` through a context, `MuseumContext`, that
      Highlights uses.
  - `MuseumCanvas` props:
    - `{ gallery: GalleryId; works: StudentWork[]; layout: HallLayout; target: string | null; settings: MuseumSettings; onFocusExhibit(id: string | null): void; onPlayerMove(p: Player): void }`.
  - `useExhibitTexture(url: string | null): THREE.Texture | null | "failed"`.
    - Uses `TextureLoader` with `crossOrigin = "anonymous"`.
    - Disposes the texture on unmount.
    - Uses the webp `image_url`, or the YouTube thumbnail for legacy video.

Decisions:

- **Scene:**
  - Light walls (`#e9e6e1`), dark ceiling (`#1d232b`), and a concrete-grey
    floor with `MeshStandardMaterial`, roughness 0.6.
  - Orange accent panels (`#e8661f`) on the walls near the ceiling.
  - Track lights: one spotlight per slot aimed at its frame. On `low`
    quality there are no shadows, dpr is capped at 1, and the frame lights
    are emissive with no spotlights.
  - The pillar shows the "BSEMC / Virtual Museum / Student Creative
    Showcase" text with drei `Text`, using the Oswald font file from
    `public/fonts/` (copy the TTF there).
- **ExhibitFrame:**
  - a dark frame and a label plate with title and student;
  - on `"failed"` or null, a plane in the `CATEGORY_TINT` gradient with
    the category icon drawn to a `CanvasTexture`;
  - a play marker for video and a waveform marker for audio.
- **Frame loop:** `frameloop="demand"`. Invalidate on input and during
  glides only.

Steps:

- [ ] **Step 1: Failing tests (`MuseumSection.test.tsx`, with `loadMuseumCanvas` and `hasWebGL` mocked):**
  - `the three chunk is not loaded until the visitor enters`;
  - `entering loads the canvas and shows the gallery`;
  - `without WebGL the section shows the fallback with a link to Browse Exhibits` (Review Focus 5).

  In `useExhibitTexture.test.ts`, with `TextureLoader` mocked:
  - `a failed texture load returns "failed"`;
  - `the texture is disposed on unmount`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** `npm run build:site`, then check `out/_next/static/chunks`: no chunk loaded by `out/index.html` or `out/programs/_/index.html` contains `WebGLRenderer`. Expected: `grep -l WebGLRenderer` matches only chunks that neither page references.
- [ ] **Step 6:** Commit `feat(museum): lazy-loaded 3D gallery hall`.

### Task 20: Controls and overlay UI

**Files:**
- Create:
  - `src/components/museum/three/{PlayerRig,Overlay,InfoPanel,SettingsPopover,GallerySelect,Minimap,ControlsBar}.tsx`;
  - tests for the DOM overlay parts and `src/components/museum/useMuseumKeys.ts` (+ test).
- Modify: `MuseumSection.tsx`, `MuseumCanvas.tsx`

**Interfaces:**
- Consumes: Tasks 15 and 18.
- Produces:
  - `useMuseumKeys(container: RefObject<HTMLElement>, handlers: { move(input): void; interact(): void; toggleMap(): void }): void`.
    - Listens on the container, which has `tabIndex={0}`, not on `window`.
    - Ignores events whose target is an input, textarea, select or
      contenteditable, or that are inside `[data-museum-overlay]`.
    - Calls `preventDefault` on arrow keys and space only while acting.
  - `PlayerRig` drives the camera from `Player`:
    - pointer drag (mouse or touch) on the canvas calls `applyLook`;
    - a tap or click without drag (< 6 px movement) raycasts frames and
      glides to the frame's `standInFront`;
    - glides use 0.8 s ease-out, and are instant with reduced motion.
  - Overlay, all inside `data-museum-overlay`:
    - **Exit to Lobby** glides to `spawn`.
    - **Fullscreen** calls `requestFullscreen` on the section and is hidden
      when not supported.
    - **Settings:** a Popover with Sliders for sensitivity and speed, a
      Switch for invert look, and a Select for quality. Changes call
      `saveSettings`.
    - **GallerySelect:** a shadcn Select showing "Gallery A" with
      "Games & Interactive Media" underneath. Changing it reloads the
      works and respawns the visitor.
    - **Minimap:** an SVG of the hall outline, slots as dots (the focused
      one in orange), and the player as an arrow rotated by yaw. M toggles
      it, and it's hidden by default on phones.
    - **ControlsBar:** on desktop, "W A S D Move · Look · E Interact · M
      Map" with `kbd` elements. On coarse pointers, "Drag to look · Tap a
      work".
    - **Prev/next exhibit** buttons use `orderedSlots`.
  - `InfoPanel`:
    - a right card on md+ and a bottom Sheet on phones;
    - shows title, a category Badge with the icon, student and
      description;
    - `LikeButton`, Share (`shareExhibit`, with "Link copied" feedback),
      Save (`useSaved`);
    - "View Details →" opens `ExhibitDetail`, and the close button clears
      the focus.
- **Behaviour:**
  - E opens the `exhibitInView` work.
  - Visiting from Highlights or `?exhibit=` switches to that work's
    gallery, then glides to it.
  - If the work isn't among the gallery's 30, it opens `ExhibitDetail`
    instead.

Steps:

- [ ] **Step 1: Failing tests:**
  - `museum keys move the player only while the museum has focus`;
  - `typing W in the browse search or the settings popover does not move the player` (Review Focus 3);
  - `E opens the exhibit in view`;
  - `M toggles the minimap`;
  - `info panel shows like count, share copies the link, save toggles`;
  - `gallery select lists only non-empty galleries`;
  - `visiting a work outside the hall opens its detail view`;
  - `settings changes persist via saveSettings`;
  - `controls bar switches to touch hints on coarse pointers`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the whole suite, plus `npx tsc --noEmit` and `npm run lint`. Expected: PASS.
- [ ] **Step 5: Manual check (`npm run dev`, desktop and a phone-sized emulated touch device):**
  1. Enter, walk, bump the walls and pillar.
  2. Press E on a frame, like (signed out → prompt), share, save.
  3. Switch galleries, use fullscreen, and change settings and reload.
  4. Check that reduced motion makes glides instant.
- [ ] **Step 6:** Commit `feat(museum): walk, look, interact and the museum overlay`.

### Task 21: Final verification

**Files:** none new.

- [ ] **Step 1:** `npx vitest run && npm run lint && npx tsc --noEmit`. Expected: all pass.
- [ ] **Step 2:** `npm run db:reset && npm run test:db`. Expected: all pgTAP tests pass.
- [ ] **Step 3:** `npm run build` (CMS) and `npm run build:site`. Expected: both succeed, and the account and museum pages are in `out/`.
- [ ] **Step 4:** `npm run check:site`. Expected: all checks pass, including the four museum/routing checks.
- [ ] **Step 5:** Read through `docs/virtual-museum-launch.md` against the spec's production setup list. Every item should be present.
