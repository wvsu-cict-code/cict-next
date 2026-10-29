# CICT Website

Next.js site for the WVSU College of ICT. Content (news & announcements,
programs, faculty) lives in [Supabase](https://supabase.com) and is managed
through the built-in CMS at `/admin`.

## Get started

Requirements: Node.js, and Docker (for the local Supabase stack).

```bash
npm install

# 1. Start local Supabase (applies migrations + seed data on first run)
npm run db:start

# 2. Create .env.local with the URL and keys printed by the previous command
cp .env.example .env.local   # then fill in the values (`npx supabase status` shows them again)

# 3. Create your CMS login
npm run cms:create-admin -- you@example.com 'a-strong-password'

# 4. Run the site
npm run dev
```

- Website: http://localhost:3000
- CMS: http://localhost:3000/admin
- Supabase Studio (database UI): http://localhost:54323

## CMS

Sign in at `/admin` to manage:

| Section | What it controls |
| --- | --- |
| **News & Announcements** | Posts on the home page and `/news-announcements`. Supports drafts, scheduled publishing, a featured post for the home page, cover images, and Markdown bodies with inline image uploads. |
| **Programs** | Programs on the home page, `/programs` and `/programs/<id>` (logo, description, objectives, curriculum PDF). |
| **Faculty** | Departments and faculty members in the Faculty Directory, including photos and the department's position on the desktop diagram. |

Drafts and scheduled posts can be checked before they go live with **Preview**
on the post's edit page. It opens the post on the CMS deployment, where the
signed-in admin's session can read it; visitors never see it.

Public sign-up is disabled. New admins are added with
`npm run cms:create-admin` (needs `SUPABASE_SECRET_KEY`), or by inserting the
user's id into the `admin_users` table from Supabase Studio.

### How it fits together

- `supabase/migrations/` – database schema, row-level security and the `media` storage bucket.
  Anyone can read published content; only users in `admin_users` can write.
- `supabase/seed.sql` – starting content (the site's original data), loaded on `npm run db:reset`.
- `src/lib/cms/content.ts` – content queries used by the public pages (in the browser) and
  `src/lib/cms/useContent.ts`, the hook that loads them with loading/error states.
- `src/app/(site)/` – the public pages (`*.site.tsx`, see [Deploying](#deploying)).
- `src/app/admin/` – the CMS (server actions write through the signed-in admin's session).
- `src/proxy.ts` – on the CMS deployment: keeps the admin session fresh, redirects signed-out
  users to the login page, applies the CSP to `/admin`, and sends visitors of public pages
  to the school site.

Public pages are static shells that load their content from Supabase in the
browser on every visit, so published changes (including scheduled posts
reaching their time) show up on the next page load. Pages for individual posts,
programs and departments are one template each that reads the slug from the
URL.

### Database changes

```bash
npx supabase migration new <name>   # write SQL in the new file
npm run db:reset                    # re-create the local DB from migrations + seed
npm run db:types                    # regenerate src/lib/supabase/database.types.ts
```

## Deploying

The project deploys as two parts from this one codebase:

- **The CMS on Vercel** (`npm run build`): the whole app. `/admin` is where
  content is edited.
- **The public site on `cict.wvsu.edu.ph`** (`npm run build:site`): a folder of
  static files for the school's Apache server. Its pages load content from
  Supabase in the visitor's browser, so anything published in the CMS shows up
  on the next page load, with no rebuild or re-upload.

### Supabase (once)

1. Create a Supabase project and link it: `npx supabase link --project-ref <ref>`.
2. Apply the schema: `npx supabase db push`. To load the starting content once,
   run `npx supabase db push --include-seed` (or run `supabase/seed.sql` in the
   project's SQL editor).
3. Create the first admin with `npm run cms:create-admin -- <email> <password>`
   (using the project's URL and secret key in `.env.local`).

### CMS on Vercel

1. Import the repository in Vercel. The default build settings are correct.
2. Set these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://cict.wvsu.edu.ph`

   Don't add `SUPABASE_SECRET_KEY`; the app doesn't use it.
3. Sign in at `<vercel-url>/admin`. The public pages on the Vercel URL are only
   for admins previewing drafts. Everyone else is redirected to the same page on
   `cict.wvsu.edu.ph`.

### Public site on the school server

1. Build it: `npm run build:site`. This writes the site to `out/`, using the
   Supabase URL and publishable key from `.env`.
2. Optional: `npm run check:site` serves `out/` on a local Apache (Docker) and
   checks it in Chrome before you upload.
3. Upload the **contents** of `out/` to the web root over FTP. Include the
   hidden `.htaccess` file: turn on "show hidden files" in your FTP client.
   The server needs Apache's `mod_rewrite` enabled.
4. Re-upload only after code or design changes, never for content changes.

New public pages and layouts must be named `page.site.tsx` /
`layout.site.tsx`. Files named `page.tsx` are left out of the school site
build (that's how the CMS is kept out of it).

## Pipeline for dev
Follow these steps to ensure stable updates:
```bash
# After your changes, run linter
npx eslint --fix . # then fix that are flagged as error

# then build to verify your changes won't crash production 
npm run build

# If no errors, you can simply now use git to push your changes
```
