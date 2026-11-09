# Split CMS (Vercel) / Static Public Site (Apache) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One codebase, two builds. The full Next.js app (the CMS) deploys to Vercel. A static export of the public site, whose pages fetch content from Supabase in the browser, is uploaded over FTP to `cict.wvsu.edu.ph` (Apache).

**Architecture:** Public route files are renamed `*.site.tsx`. The site build uses `pageExtensions: ["site.tsx", "site.ts"]` + `output: "export"`, which drops `admin/`, `api/` and `proxy.ts`. The CMS build includes both normal and `.site` files. Public pages become client components that load data through a shared query module and a `useContent` hook. Detail pages are exported once as a `_` template, and `.htaccess` rewrites every slug to it (including the RSC payload files). On Vercel, the proxy redirects non-admins on public routes to the school site, and admins use those routes to preview drafts through RLS.

**Tech Stack:** Next.js 16.2 (App Router, Turbopack), React 19, `@supabase/ssr` / `@supabase/supabase-js`, Tailwind 4. New dev deps: `vitest`, `jsdom`, `@testing-library/react`, `@vitejs/plugin-react`, `puppeteer-core` (end-to-end check, uses the system Chrome). Docker `httpd:2.4` for the Apache check.

**Spec:** `docs/superpowers/specs/2026-10-29-split-cms-static-site-design.md`

**Verified by spike (2026-10-29, Next 16.2.3, throwaway app):**
- `pageExtensions: ["site.tsx","site.ts"]` + `output: "export"` excludes `page.tsx` routes, `route.ts` handlers and `proxy.ts`.
- With CMS-build `pageExtensions: ["tsx","ts","site.tsx","site.ts"]`, both kinds are included.
- `generateStaticParams() → [{ slug: "_" }]` **without** `dynamicParams = false`:
  - the export emits only `news/_/` (`index.html`, `index.txt`, `__next.*.txt` segment files);
  - the CMS build still renders any real slug on demand (200).
  - **Do not set `dynamicParams = false`**: it 404s real slugs on Vercel.
- On Apache, rewriting `<prefix>/<slug>/` → `<prefix>/_/index.html` and `<prefix>/<slug>/<file>` → `<prefix>/_/<file>` makes:
  - direct loads work;
  - `<Link>` clicks to unexported slugs do a **soft** navigation.
- `usePathname()` returns `/x/slug` on a direct load but `/x/slug/` after a client navigation (trailing slash). Slug parsing must handle both.

## Global Constraints

- Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` may be read by public-site code. `SUPABASE_SECRET_KEY` must never appear in `out/`.
- Drafts and posts with `published_at` in the future never appear on `cict.wvsu.edu.ph`.
- Content changes never require a rebuild/re-upload, including new posts, programs and departments reached by a normal link.
- Public URLs are unchanged: `/news-announcements/news/<slug>`, `/programs/<id>`, `/faculty-profiles/<dept>`.
- `NEXT_PUBLIC_SITE_URL` = `https://cict.wvsu.edu.ph` (site root, no subfolder, no trailing slash).
- Placeholder segment: `_` (DB slug/id check only allows lowercase letters, digits and dashes, so it can't collide).
- No new runtime dependencies. No client-side caching of content: fetch on every page load.
- Page titles follow the existing template `"<title> | CICT"`.
- `npm run dev` and `next build` (CMS) keep working unchanged.

## Review Focus

1. **Slug URL variants:** trailing slash, no trailing slash, percent-encoded characters and the bare placeholder `/news-announcements/news/_/` must resolve to the right post or to "not found". They must never be a crash or the `_` template's blank state. (Task 1 tests.)
2. **Fast navigation between two posts/departments:** the older request finishing last must not overwrite the newer page's content. (Task 3 test: stale response ignored.)
3. **Admin signed in on Vercel browsing public pages:** lists, the home featured post and the news page must still exclude drafts and future-scheduled posts. Only the single-post page shows them, with a banner. (Task 2 tests.)
4. **Supabase slow or unreachable:** show a placeholder, then an error with "Try again" that actually refetches. Never a blank page or an endless placeholder. (Task 3 tests.)
5. **Signed-out visitor deep-linking to the Vercel URL** (e.g. `/programs/bscs?x=1`): lands on the same path and query at `cict.wvsu.edu.ph`, while `/admin/*` still goes to the login page. (Task 7 tests.)

---

### Task 1: Test tooling and URL helpers

**Files:**
- Modify: `package.json` (devDeps; script `"test": "vitest run"`)
- Create: `vitest.config.mts` (`@vitejs/plugin-react`, `environment: "jsdom"`, alias `@` → `./src`)
- Create: `src/lib/routes.ts`, `src/lib/routes.test.ts`
- Create: `src/lib/site.ts`, `src/lib/site.test.ts`

**Interfaces:**
- Produces:
  - `PLACEHOLDER_SEGMENT = "_"`
  - `NEWS_PREFIX = "/news-announcements/news"`, `PROGRAMS_PREFIX = "/programs"`, `FACULTY_PREFIX = "/faculty-profiles"`
  - `segmentFromPathname(pathname: string, prefix: string): string | null`
  - `siteUrl(path: string): string`

- [ ] **Step 1: Install dev deps**

Run: `npm i -D vitest jsdom @testing-library/react @vitejs/plugin-react`

- [ ] **Step 2: Write failing tests**

`src/lib/routes.test.ts`, test `segmentFromPathname`:

```ts
expect(segmentFromPathname("/news-announcements/news/icc-2025", NEWS_PREFIX)).toBe("icc-2025");
expect(segmentFromPathname("/news-announcements/news/icc-2025/", NEWS_PREFIX)).toBe("icc-2025");
expect(segmentFromPathname("/news-announcements/news/caf%C3%A9", NEWS_PREFIX)).toBe("café");
expect(segmentFromPathname("/news-announcements/news/_/", NEWS_PREFIX)).toBeNull();
expect(segmentFromPathname("/news-announcements/news/", NEWS_PREFIX)).toBeNull();
expect(segmentFromPathname("/programs/bscs", PROGRAMS_PREFIX)).toBe("bscs");
expect(segmentFromPathname("/programs/bscs/extra", PROGRAMS_PREFIX)).toBeNull();
expect(segmentFromPathname("/news-announcements/news/%E0%A4%A", NEWS_PREFIX)).toBeNull(); // malformed encoding
```

`src/lib/site.test.ts`, test `siteUrl` (stub the env with `vi.stubEnv` and re-import via `vi.resetModules()`, or read the env lazily inside the function):
- `NEXT_PUBLIC_SITE_URL="https://cict.wvsu.edu.ph"` → `siteUrl("/programs/bscs") === "https://cict.wvsu.edu.ph/programs/bscs"`
- a trailing slash in the env is not doubled
- env unset → returns `"/programs/bscs"` (local dev links stay relative)

- [ ] **Step 3: Run `npm test`.** Expected: FAIL (modules missing).
- [ ] **Step 4: Implement both modules**

`segmentFromPathname` strips the prefix and the trailing slash, requires exactly one remaining segment, and `decodeURIComponent`s it (returning null on throw). It returns null for `_`. `siteUrl` reads `process.env.NEXT_PUBLIC_SITE_URL` literally so Next inlines it.

- [ ] **Step 5: Run `npm test`.** Expected: PASS.
- [ ] **Step 6: Commit** — `test: add vitest; add route and site URL helpers`

---

### Task 2: Shared content queries and browser Supabase client

**Files:**
- Create: `src/lib/cms/content.ts`, `src/lib/cms/content.test.ts`
- Create: `src/lib/supabase/browser.ts`
- Modify: `src/app/admin/(cms)/posts/PostForm.tsx:13`, `src/app/admin/(cms)/programs/ProgramForm.tsx:5`: import `Post` / `Program` from `@/lib/cms/content`

**Interfaces:**
- Consumes: `toDepartment`, `toFacultyMember` (`src/lib/faculty.ts`); `Database`, `Tables`, `Enums` types; `getSupabaseEnv()`.
- Produces (no `server-only`; each takes `client: SupabaseClient<Database>` first and throws `Error("Failed to load …: <message>")` on error, like `src/lib/cms/queries.ts` does today):
  - types `Post`, `Program`, `PostCategory`, `ContentClient = SupabaseClient<Database>`
  - `fetchPublishedPosts(client, options?: { category?: PostCategory; limit?: number }): Promise<Post[]>`
  - `fetchFeaturedPost(client): Promise<Post | null>`
  - `fetchPostBySlug(client, slug: string): Promise<Post | null>` (no status filter; RLS decides, so admins can preview)
  - `fetchPrograms(client): Promise<Program[]>`
  - `fetchProgram(client, id: string): Promise<Program | null>`
  - `fetchDepartments(client): Promise<Department[]>`
  - `fetchDepartmentWithFaculty(client, slug: string): Promise<{ department: Department; faculty: FacultyMember[] } | null>`
  - `previewLabel(post: Post, now?: Date): string | null`
  - `getBrowserClient(): ContentClient`: a module-level singleton from `createBrowserClient` (`@supabase/ssr`), so on Vercel it carries the admin's cookie session and on the school domain it's anonymous

- [ ] **Step 1: Write failing tests** in `content.test.ts`

Use a recording fake client: a chainable object whose methods record `[name, ...args]` and that is thenable to `{ data, error }`.
- `fetchPublishedPosts` records `eq("status","published")` and `lte("published_at", <ISO now>)`, and orders by `published_at` desc. With `{ category: "news", limit: 5 }` it also records `eq("category","news")` and `limit(5)`.
- `fetchFeaturedPost` records the same two published filters plus `eq("is_featured", true)`.
- `fetchPostBySlug` records `eq("slug", "x")` and **no** `status` filter.
- Every fetcher rejects with a message starting `"Failed to load"` when `error` is set.
- `previewLabel`:
  - published with `published_at` in the past → `null`;
  - `status: "draft"` → `"Preview — this post is a draft"`;
  - published with `published_at` in the future → `"Preview — scheduled for <formatDate(published_at)>"`.

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement `content.ts` and `browser.ts`.** Port the queries' selects/orderings from `src/lib/cms/queries.ts`. Add the explicit published filters to the two list queries.
- [ ] **Step 4: Run `npm test`.** Expected: PASS. Run `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 5: Commit** — `feat(cms): shared content queries usable from the browser`

---

### Task 3: `useContent` hook, content states, page titles

**Files:**
- Create: `src/lib/cms/useContent.ts`, `src/lib/cms/useContent.test.tsx`
- Create: `src/components/ContentState.tsx`
- Create: `src/lib/useDocumentTitle.ts`

**Interfaces:**
- Consumes: `getBrowserClient`, `ContentClient` (Task 2).
- Produces:
  - `useContent<T>(key: string | null, load: (client: ContentClient) => Promise<T>): ContentResult<T>`
    - `ContentResult<T> = { status: "loading" } | { status: "error"; retry: () => void } | { status: "ready"; data: T }`
    - `key === null` → stays `"loading"` without fetching (used before the slug is known)
  - `ContentPlaceholder({ className?: string })`: a pulsing neutral block; size comes from `className`
  - `ContentError({ onRetry: () => void })`: the text "We couldn't load this content." and a "Try again" button, in the site's existing orange-pill button style
  - `useDocumentTitle(title: string | undefined): void`: sets `document.title = \`${title} | CICT\`` when defined

- [ ] **Step 1: Write failing tests** (`renderHook` from `@testing-library/react`, with `getBrowserClient` mocked)
- `loading → ready` with the resolved data.
- A rejected `load` → `"error"`; calling `retry()` re-runs `load` and ends `"ready"`.
- Key change `"a"` → `"b"`, where `"a"` resolves **after** `"b"`: final data is `b`'s.
- Key change resets to `"loading"` before the new data arrives.
- `key === null` → `load` never called.

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement.** Use a per-effect `cancelled` flag (or request counter) to drop stale results. `retry` bumps a counter that's included in the effect's deps.
- [ ] **Step 4: Run `npm test`.** Expected: PASS.
- [ ] **Step 5: Commit** — `feat: useContent hook with loading/error states`

---

### Task 4: Home and news pages load content in the browser

**Files:**
- Modify: `src/components/NewsHomeSection.tsx`: `"use client"`, use `useContent("home-news", …)` with `fetchFeaturedPost` + `fetchPublishedPosts({ limit: 5 })`; keep the existing featured-fallback logic and markup
- Create: `src/components/HomePrograms.tsx`: client; the "Offered Programs" grid moved out of `src/app/(site)/page.tsx`
- Modify: `src/app/(site)/page.tsx`: drop `getPrograms`/`revalidate`/`async`; render `<HomePrograms />`
- Create: `src/components/NewsAnnouncementsPage.tsx`: client; loads announcements (limit 10) and news, renders `NewsAnnouncementsView`
- Modify: `src/app/(site)/news-announcements/page.tsx`: renders `<NewsAnnouncementsPage />`; drop `revalidate`
- Create: `src/components/NewsArticle.tsx`: client; the body of today's article page
- Modify: `src/app/(site)/news-announcements/news/[slug]/page.tsx`: `generateStaticParams() → [{ slug: PLACEHOLDER_SEGMENT }]`; renders `<NewsArticle />`; drop `revalidate`, `draftMode`, data fetching
- Modify: `src/app/(site)/news-announcements/news/[slug]/layout.tsx`: remove `generateMetadata` (keep a plain pass-through layout or delete the file)

**Interfaces:**
- Consumes: Tasks 1–3 (`segmentFromPathname`, `NEWS_PREFIX`, fetchers, `previewLabel`, `useContent`, `ContentPlaceholder`, `ContentError`, `useDocumentTitle`), `toNewsArticle`, `newsHref`.

`NewsArticle` behavior:
- slug from `segmentFromPathname(usePathname(), NEWS_PREFIX)`;
- `null` slug or `null` post → the existing "Article Not Found" block, unchanged;
- `previewLabel(post)` non-null → the existing dark banner showing that label (no "Exit preview" link any more);
- title via `useDocumentTitle(post?.title)`.

Placeholders sit where the content goes: the featured card and the news list on home, the list on the news page, the title/body on the article. Errors render `ContentError` in the same spot.

- [ ] **Step 1:** Make the changes above.
- [ ] **Step 2: Run `npx tsc --noEmit && npm run lint && npm test`.** Expected: clean.
- [ ] **Step 3: Run `npm run dev`** and check:
  - `/` shows the 4 seeded posts and 6 programs after a brief placeholder;
  - `/news-announcements` lists them;
  - `/news-announcements/news/cict-faculty-publishes-ai-research-paper` shows the post with tab title "CICT Faculty Publishes AI Research Paper | CICT";
  - `/news-announcements/news/nope` shows "Article Not Found".
- [ ] **Step 4: Commit** — `feat(site): load home and news content in the browser`

---

### Task 5: Programs and faculty pages load content in the browser; remove server queries

**Files:**
- Create: `src/components/ProgramsList.tsx` (client; the program cards from `src/app/(site)/programs/page.tsx`)
- Create: `src/components/ProgramDetails.tsx` (client; body of `programs/[id]/page.tsx`)
- Modify: `src/app/(site)/programs/page.tsx`, `src/app/(site)/programs/[id]/page.tsx` (`generateStaticParams → [{ id: "_" }]`), `src/app/(site)/programs/[id]/layout.tsx` (remove `generateMetadata`)
- Modify: `src/app/(site)/faculty-profiles/page.tsx`, `src/app/(site)/faculty-profiles/[dept]/page.tsx` (`generateStaticParams → [{ dept: "_" }]`, remove `generateMetadata`). Each renders a small client wrapper that loads data and passes it to the existing `FacultyDirectory` / `FacultyDetail`.
- Delete: `src/lib/cms/queries.ts`; `createPublicClient` from `src/lib/supabase/server.ts`
- Remove every `export const revalidate` under `src/app/(site)`

**Interfaces:**
- Consumes: Tasks 1–3; `PROGRAMS_PREFIX`, `FACULTY_PREFIX`.

Behavior:
- Unknown program → a "Program not found" message styled like `FacultyDetail`'s "Department not found". Don't call `notFound()`, which has no client-side equivalent in the export.
- Unknown department → `FacultyDetail` with `dept={null}` (existing UI).
- Titles: program name; `"<department name> Faculty"`.

- [ ] **Step 1:** Make the changes above.
- [ ] **Step 2: Run `grep -rn "cms/queries\|createPublicClient\|draftMode\|revalidate =" src/app/\(site\) src/components src/lib`.** Expected: no output.
- [ ] **Step 3: Run `npx tsc --noEmit && npm run lint && npm test`.** Expected: clean.
- [ ] **Step 4: Run `npm run dev`** and check:
  - `/programs` and `/programs/bscs` show content;
  - `/programs/nope` shows "Program not found";
  - `/faculty-profiles` diagram and `/faculty-profiles/cs` work;
  - clicking a department from the directory still plays the zoom transition.
- [ ] **Step 5: Commit** — `feat(site): load programs and faculty in the browser; drop server queries`

---

### Task 6: Two build modes, `.htaccess`, `npm run build:site`

**Files:**
- Rename to `*.site.tsx`: `src/app/layout.tsx` and **every** `page.tsx` / `layout.tsx` under `src/app/(site)/` (git mv)
- Modify: `next.config.mjs`
- Create: `deploy/school-server/.htaccess`
- Modify: `package.json`: `"build:site": "BUILD_TARGET=site next build && cp deploy/school-server/.htaccess out/"`

**`next.config.mjs` decision:**
- `const isSiteBuild = process.env.BUILD_TARGET === "site"`.
- Site build: `{ output: "export", trailingSlash: true, images: { unoptimized: true }, pageExtensions: ["site.tsx", "site.ts"], reactCompiler: true }`.
- CMS build: today's config plus `pageExtensions: ["tsx", "ts", "site.tsx", "site.ts"]`.

Add a comment at the top of the config that new public pages **must** be named `page.site.tsx` / `layout.site.tsx`, or they won't be in the school site.

**`.htaccess` (exact):**

```apache
# Public site for cict.wvsu.edu.ph. Generated pages load content from Supabase
# in the browser; news posts, programs and departments are served by one
# template page each (the "_" folder), so new content needs no re-upload.
RewriteEngine On
ErrorDocument 404 /404.html

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(news-announcements/news|programs|faculty-profiles)/[^/]+/?$ $1/_/index.html [L]

# Next.js router data files for the same pages (used when following links)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(news-announcements/news|programs|faculty-profiles)/[^/]+/(.+)$ $1/_/$2 [L]
```

- [ ] **Step 1:** Rename files, update config, add `.htaccess` and the script.
- [ ] **Step 2: Run `npm run build:site`.** Expected:
  - succeeds;
  - `out/news-announcements/news/_/index.html`, `out/programs/_/index.html`, `out/faculty-profiles/_/index.html`, `out/404.html` and `out/.htaccess` exist;
  - no `out/admin` or `out/api`.
- [ ] **Step 3: Run `grep -rl "$(grep ^SUPABASE_SECRET_KEY= .env | cut -d= -f2-)" out/`.** Expected: no output.
- [ ] **Step 4: Run `npm run build`** (CMS). Expected: route list shows `ƒ /admin…` routes, `ƒ Proxy (Middleware)`, and the public routes.
- [ ] **Step 5: Commit** — `build: add static site build for the school server`

---

### Task 7: Vercel side: public routes for admins only, CMS links, cleanup

**Files:**
- Create: `src/lib/cms/access.ts`, `src/lib/cms/access.test.ts`
- Modify: `src/lib/supabase/proxy.ts`: `updateSession` returns `{ response: NextResponse; isSignedIn: boolean; supabase }` and no longer redirects
- Modify: `src/proxy.ts`: matcher covers all paths except `_next/static`, `_next/image`, and paths containing a `.`; keeps the existing prefetch exclusions. Apply CSP **only** to `/admin` paths, and decide routing with `routeAccess`.
- Delete: `src/app/api/preview/route.ts`, `src/app/api/preview/exit/route.ts`
- Modify: `src/app/admin/(cms)/posts/[id]/page.tsx`:
  - when `previewLabel(post)` is non-null, link to `newsHref(slug)` (relative, the Vercel copy) with "Preview ↗";
  - otherwise link to `siteUrl(newsHref(slug))` with "View on site ↗".
- Modify: `src/app/admin/(cms)/layout.tsx` ("View site" → `siteUrl("/")`), `src/app/admin/(cms)/programs/[id]/page.tsx`, `src/app/admin/(cms)/faculty/departments/[slug]/page.tsx`: links through `siteUrl`
- Modify: `src/lib/cms/forms.ts`: remove `revalidateSite`; remove its calls in `posts/actions.ts`, `programs/actions.ts`, `faculty/actions.ts`
- Modify: `src/app/layout.site.tsx`: `metadataBase` and `openGraph.url` use `process.env.NEXT_PUBLIC_SITE_URL ?? "https://cict.wvsu.edu.ph"`; remove the TODOs
- Modify: `.env.example`: add `NEXT_PUBLIC_SITE_URL=https://cict.wvsu.edu.ph` with a one-line comment

**Interfaces:**
- Consumes: `siteUrl` (Task 1), `previewLabel` (Task 2).
- Produces: `routeAccess(input: { pathname: string; isSignedIn: boolean; isAdmin: boolean }): "allow" | "login" | "site"`
  - `/admin/login` → `"allow"`
  - other `/admin/*`: `"allow"` if signed in, else `"login"` (the admin role check stays in `requireAdmin`, as today)
  - `/api/*` → `"allow"`
  - everything else: `"allow"` if `isAdmin`, else `"site"`
- `src/proxy.ts`:
  - `"site"` → 307 redirect to `siteUrl(pathname + search)`;
  - `"login"` → redirect to `/admin/login` (existing behavior);
  - `"allow"` on a public path → add `X-Robots-Tag: noindex`.
  - Call `supabase.rpc("is_admin")` only for public paths when signed in.

- [ ] **Step 1: Write failing tests** in `access.test.ts`
  - `("/programs/bscs", signed out)` → `"site"`
  - `("/", signed in, not admin)` → `"site"`
  - `("/news-announcements/news/x", admin)` → `"allow"`
  - `("/admin/posts", signed out)` → `"login"`
  - `("/admin/login", signed out)` → `"allow"`
  - `("/admin", signed in)` → `"allow"`
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement `access.ts`, then the proxy, link, cleanup and metadata changes.**
- [ ] **Step 4: Run `npm test && npx tsc --noEmit && npm run lint && npm run build`.** Expected: clean; no `/api/preview` in the route list.
- [ ] **Step 5: Run `npm run build && npm start`** with `NEXT_PUBLIC_SITE_URL=https://cict.wvsu.edu.ph`, then:
  - `curl -sI localhost:3000/programs/bscs?x=1` → `307` with `location: https://cict.wvsu.edu.ph/programs/bscs?x=1`
  - `curl -sI localhost:3000/admin/posts` → redirect to `/admin/login`
  - signed in as admin in a browser: `/news-announcements/news/<a draft's slug>` shows the draft with "Preview — this post is a draft", and the response has `X-Robots-Tag: noindex`
  - the CMS "View site ↗" opens `https://cict.wvsu.edu.ph/`
- [ ] **Step 6: Commit** — `feat(cms): Vercel serves public pages to admins only; links point to school site`

---

### Task 8: Apache end-to-end check and deployment docs

**Files:**
- Create: `scripts/check-site.mjs`; `package.json` script `"check:site": "node --env-file=.env scripts/check-site.mjs"`; dev dep `puppeteer-core`
- Modify: `README.md`: "Deploying" section

**`scripts/check-site.mjs` behavior:**
- Serves `out/` with Docker `httpd:2.4`:
  - copy the image's `httpd.conf`, uncomment `LoadModule rewrite_module`, and set `AllowOverride All` for the htdocs directory;
  - mount `out/` read-only, on port 18080.
- Picks a live published post slug, program id and department slug from Supabase with the publishable key.
- Drives Chrome (`CHROME_PATH`, default `/usr/bin/google-chrome`) through `puppeteer-core`.
- Exits non-zero on the first failing check and always removes the container.

Checks:
1. Direct `/news-announcements/news/<slug>` → `h1` equals the post title.
2. `/` → click the first news link → URL is that post's path, `h1` is its title, and the navigation was soft (a `window` marker set before the click survives).
3. `/news-announcements/news/does-not-exist` → page shows "Article Not Found".
4. `/news-announcements/news/_/` → "Article Not Found".
5. `/programs/<id>` shows the program name; `/faculty-profiles/<dept>` shows the department name.
6. `GET /nope/` → HTTP 404.
7. No file under `out/` contains the value of `SUPABASE_SECRET_KEY`.

**README "Deploying"** replaces the current steps with two parts:

- **CMS on Vercel:**
  - import the repo with the default build;
  - set the env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://cict.wvsu.edu.ph`;
  - `/admin` is the CMS; public paths redirect to the school site unless an admin is signed in (preview).
- **Public site on cict.wvsu.edu.ph:**
  - `npm run build:site`, then optionally `npm run check:site`;
  - upload the **contents** of `out/` to the web root over FTP, including the hidden `.htaccess` (enable "show hidden files" in the FTP client);
  - `mod_rewrite` must be enabled;
  - re-upload only after code/design changes, never for content.
  - New public pages must be named `page.site.tsx`.
- Keep the existing Supabase steps (link, `db push`, seed, `cms:create-admin`).

- [ ] **Step 1:** Write the script and the README section.
- [ ] **Step 2: Run `npm run build:site && npm run check:site`.** Expected: all 7 checks print `ok`; exit 0.
- [ ] **Step 3: Live-content proof.** Publish a new test post in the CMS (`npm run dev`, `/admin/posts/new`) **without rebuilding**, then:
  - open `http://localhost:18080/news-announcements/news/<new-slug>` (rerun `check:site` with `KEEP=1` so the container stays up) → shows the post;
  - unpublish it (set back to draft) → shows "Article Not Found";
  - delete it afterwards.
- [ ] **Step 4: Commit** — `test: Apache end-to-end check for the static site; document both deployments`

---

**After the plan:** deploying (creating the Vercel project and the first FTP upload) is done together with the owner. It's outward-facing and needs their accounts.
