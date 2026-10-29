# Split deployment: CMS on Vercel, public site on the school server

Date: 2026-10-29
Status: draft, awaiting approval

## Intent

The CICT website is one Next.js app today: the public site (`src/app/(site)`)
and the CMS (`src/app/admin`) are deployed together, and public pages are
server-rendered from Supabase with ISR.

It needs to be deployed as two parts:

- **The CMS on Vercel**, where faculty and staff sign in and edit programs,
  departments, faculty members and news/announcements.
- **The public site on the school's hosting at `https://cict.wvsu.edu.ph`**
  (site root, not a subfolder). That host is Apache-based and receives files
  over FTP. It can't run Node.js.

Content published in the CMS has to appear on the public site **instantly**:
on the next page load, with no rebuild and no re-upload. The owner looked at
an automatic rebuild-and-upload approach that takes 2–5 minutes and turned it
down for that reason.

## Goals

1. Publishing, editing, unpublishing or deleting content in the CMS shows on
   `cict.wvsu.edu.ph` on the next page load.
2. The public site is a folder of static files. The owner uploads it to the
   Apache host over FTP, and only when the site's code or design changes.
3. Public URLs stay as they are today, including content created after the
   last upload:
   - `/news-announcements/news/<slug>`
   - `/programs/<id>`
   - `/faculty-profiles/<dept>`
4. The CMS on Vercel keeps working as it does now: login, editing, media
   uploads, and draft preview of posts.
5. One codebase. The public site and the CMS share components, types and query
   logic, and are produced by two build modes of the same repo.

## Non-goals

- Automated deployment to the school server (FTP from CI, webhooks). The owner
  uploads by hand.
- Full search-engine and link-preview metadata for individual posts, programs
  and departments. The owner accepted that content loaded in the browser is
  less visible to crawlers and link previews (Facebook/Messenger).
- Image optimization on the school site. Images are served as they are.
- Server-side features on the school host (PHP, Node, a database).

## Anti-goals (unacceptable even if everything else works)

- **Any secret in the static build.** Only `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL` can reach
  the browser bundle. `SUPABASE_SECRET_KEY` must never be read by public-site
  code.
- **Drafts or future-scheduled posts visible on `cict.wvsu.edu.ph`.**
- **Two indexable copies of the public site.** The Vercel deployment must not
  serve the public pages to ordinary visitors or crawlers.
- **A content change that needs a re-upload to appear**, including a brand-new
  post, program or department reached by a normal link.

## Constraints and existing facts

- **Supabase project:** "CICT Online" (`ztdtjgqfmloydxgrbyxo`). The schema
  migration and seed data are already applied.
- **RLS:** `anon` can read published posts only
  (`status = 'published' and published_at <= now()`), plus all programs,
  departments and faculty members. Admins (via `public.is_admin()`) can read
  everything, drafts included. This is what makes reading from the browser
  safe, and it must remain the only gate.
- **Server-only code:** `src/lib/cms/queries.ts` and
  `src/lib/supabase/server.ts` are `server-only` today. Every public page and
  `src/components/NewsHomeSection.tsx` imports them.
- **Pieces a static export can't include:** `src/app/admin/**` (server
  actions, cookies), `src/app/api/preview/**` (route handlers, `draftMode`),
  `src/proxy.ts`, `revalidate` exports, and `generateMetadata` that fetches
  data.
- **Links from the CMS to the public site** (`/`, posts, programs,
  departments) are root-relative today:
  `src/app/admin/(cms)/layout.tsx`, `posts/[id]/page.tsx`,
  `programs/[id]/page.tsx`, `faculty/departments/[slug]/page.tsx`.
- `src/app/layout.tsx` still has a placeholder `metadataBase` /
  `openGraph.url` (`https://www.your-cict-domain.edu.ph`).
- **Consequence of instant publishing:** every public page now needs
  Supabase to be reachable at the moment someone visits. Today, ISR keeps
  serving the last good page during an outage. After this change, an outage
  (or a paused free-tier project) means pages show their error state instead
  of content. This comes with fetching in the browser and is accepted.
- **CMS address (my call):** the Vercel project's default `*.vercel.app`
  domain. A custom domain (e.g. `cms.cict.wvsu.edu.ph`) can be added later in
  Vercel without code changes, since nothing hard-codes the CMS's own URL.

## Design

### Two build modes

- **CMS build (Vercel):** `next build`, same as today. Deploys the whole app.
- **Site build (school server):** a new script (for example
  `npm run build:site`) that does a Next.js static export (`output: "export"`)
  of only the public routes, into `out/`. Turn on `images.unoptimized`. The
  output includes an `.htaccess` file, so the upload is "copy the contents of
  `out/` to the web root". Whether to use `trailingSlash` is up to the
  builder, as long as the `.htaccess` rules match the layout it produces.

How the site build leaves out `admin/`, `api/` and `proxy.ts` is up to the
builder. Options include build-mode-specific `pageExtensions`, a build script
that exports from a filtered copy of `src`, or moving the CMS routes under a
route group whose files only the CMS build sees. Requirements: the normal
`npm run dev` / `next build` keep working unchanged for the CMS, and the
site-build mechanism doesn't leave the working tree modified if it fails
partway.

### Public pages fetch content in the browser

- Every public page that shows CMS content becomes a client-rendered page.
  The static shell (header, footer, fixed copy such as the home page's
  About/Mission/Vision) is in the HTML. CMS content loads from Supabase in
  the browser with the publishable key and a browser Supabase client.
- Query logic is shared. Split `src/lib/cms/queries.ts` so the queries
  themselves (filters, ordering, the `toDepartment` / `toFacultyMember` /
  `toNewsArticle` mapping) are written once, and the CMS server code and the
  browser code each supply their own client. The browser side must not import
  `server-only` modules.
- Lists of posts must explicitly filter to `status = 'published'`, not rely on
  RLS alone, so that an admin signed in on the Vercel deployment doesn't see
  drafts mixed into lists (see Preview below).
- **My call:** no new data-fetching dependency. A small shared hook (loading,
  data, error, retry) is enough for this site. The builder may choose
  otherwise if there's a clear reason.
- **Loading state (my call):** a light placeholder in the page's existing
  layout and colors, not a full-page spinner, so the shell doesn't jump when
  content arrives.
- **Error state (my call):** if Supabase can't be reached, show a short
  message with a "Try again" button in place of the content. Don't show a
  blank page.
- **Fetch on every page load. My call: no caching** that could serve stale
  content, because instant publishing is the point.

### Detail pages via one template page + Apache rewrites

- The site build produces **one template page** per detail section, e.g.
  `/news-announcements/news/_/`, `/programs/_/`, `/faculty-profiles/_/`
  (exact placeholder name is the builder's call). Real slugs are **not**
  pre-rendered. **My call:** pre-rendering would bake in content that can go
  stale or be deleted, for little gain since the content loads in the browser
  anyway.
- The template reads the real slug/id from the browser URL (e.g.
  `usePathname()`), not from route params, which would be the placeholder.
- `.htaccess` (needs `mod_rewrite`) rewrites — internally, not redirects —
  any request under those three prefixes that isn't an existing file or
  directory to the matching template's `index.html`. The address bar keeps
  the real URL.
- Client-side navigation: Next's router fetches a per-route RSC payload file
  when following a `<Link>`. For a slug with no exported files, that request
  must either be rewritten to the template's payload or reliably fall back to
  a full page load. **Verify this works on Apache.** Clicking a news card on
  the home page and landing on the right post is the test.
- An unknown slug shows the existing "not found" UI for that section (news
  already has "Article Not Found"). Ideally Apache also returns HTTP 404 for
  unknown URLs outside the three prefixes, via an `ErrorDocument` pointing at
  the exported 404 page.
- **Page titles (my call):** detail pages set `document.title` once content
  loads (e.g. `"<post title> | CICT"`), matching today's title template.
  Other per-item metadata (description, Open Graph) isn't needed (non-goal).

### The Vercel deployment

- It deploys the whole app, as today.
- **Public routes on Vercel are for CMS preview only.** A visitor who isn't
  signed in as an admin and requests a public route is redirected to the same
  path on `NEXT_PUBLIC_SITE_URL`. Signed-in admins see the public pages so
  that preview works. Public pages on Vercel are also `noindex`.
- **Preview:** on Vercel, the browser Supabase client carries the admin's
  session, so RLS lets the post detail page load drafts. The CMS "Preview"
  button opens the post on the Vercel deployment and shows the existing
  "Preview mode — this post is a draft" banner. **My call:** this replaces
  Next `draftMode` and the `/api/preview` routes, which can be removed if
  nothing else needs them. On `cict.wvsu.edu.ph` there is never an admin
  session (different domain), so drafts can't appear there.
- **CMS links to the public site:** "View site", "view post", "view program"
  and "view department" open `NEXT_PUBLIC_SITE_URL` + path. "Preview" (for
  drafts) stays on the Vercel deployment.
- `revalidateSite()` / `revalidatePath` in `src/lib/cms/forms.ts` become
  pointless once public pages aren't server-rendered, and can be removed.

### Configuration

| Variable | CMS build (Vercel) | Site build (`out/`) |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes (baked into JS) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | yes (baked into JS) |
| `NEXT_PUBLIC_SITE_URL` = `https://cict.wvsu.edu.ph` | yes (links, redirect) | yes (metadata) |
| `SUPABASE_SECRET_KEY` | only for `cms:create-admin`, not needed by the app | **never** |

- Replace the placeholder `metadataBase` / `openGraph.url` in
  `src/app/layout.tsx` with `NEXT_PUBLIC_SITE_URL`.
- Update `.env.example`.

### Documentation

Update the README's "Deploying" section to cover both parts:

- **Vercel:** environment variables to set; the site is the CMS.
- **School server:** build with `npm run build:site`, upload the contents of
  `out/` to the web root over FTP (including the hidden `.htaccess`); re-upload
  only after code changes; `mod_rewrite` must be on.

## Verification the owner will care about

1. Publish a new post in the CMS. Without rebuilding, open
   `https://cict.wvsu.edu.ph/news-announcements/news/<new-slug>` directly, and
   also reach it by clicking it on the home page and the news list. All three
   show the post.
2. A draft and a future-scheduled post never appear on the school site; the
   draft is viewable through the CMS "Preview" button.
3. Adding a new program and a new department in the CMS makes their pages
   reachable on the school site with no re-upload.
4. A signed-out visitor to a public page on the Vercel URL lands on the same
   page at `cict.wvsu.edu.ph`.
5. `grep` of `out/` finds no secret key.
6. The static output is checked on a real Apache (local container or the
   school host) before calling it done. `next start` or a generic static
   server doesn't test the `.htaccess` rules.

## Left to the builder

- How the site build excludes CMS-only routes (see above).
- Placeholder segment name; `trailingSlash` setting; exact `.htaccess` rules.
- How to split the query module and the shape of the client hook.
- Exact look of loading and error placeholders, within the existing design.
- How the Vercel "signed-in admins only" check for public routes is done
  (e.g. extending `src/proxy.ts`'s matcher), provided the CMS's existing CSP
  and session handling keep working.
