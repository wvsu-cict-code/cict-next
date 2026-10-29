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

Drafts can be checked before publishing with **Preview draft** on the post's
edit page (uses Next.js Draft Mode; only signed-in admins can enable it).

Public sign-up is disabled. New admins are added with
`npm run cms:create-admin` (needs `SUPABASE_SECRET_KEY`), or by inserting the
user's id into the `admin_users` table from Supabase Studio.

### How it fits together

- `supabase/migrations/` – database schema, row-level security and the `media` storage bucket.
  Anyone can read published content; only users in `admin_users` can write.
- `supabase/seed.sql` – starting content (the site's original data), loaded on `npm run db:reset`.
- `src/lib/cms/queries.ts` – read functions used by the public pages.
- `src/app/admin/` – the CMS (server actions write through the signed-in admin's session).
- `src/proxy.ts` – keeps the admin session fresh, redirects signed-out users to the login page,
  and applies the CSP to `/admin`.

Public pages are statically generated and refreshed automatically whenever
content is saved in the CMS (plus a periodic refresh so scheduled posts appear
on time).

### Database changes

```bash
npx supabase migration new <name>   # write SQL in the new file
npm run db:reset                    # re-create the local DB from migrations + seed
npm run db:types                    # regenerate src/lib/supabase/database.types.ts
```

## Deploying

1. Create a Supabase project and link it: `npx supabase link --project-ref <ref>`.
2. Apply the schema: `npx supabase db push`. To load the starting content once,
   run `supabase/seed.sql` in the project's SQL editor.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   in the hosting environment. Supabase must be reachable during `npm run build`,
   because public pages are pre-rendered from it.
4. Create the first admin with `npm run cms:create-admin` (using the
   project's URL and secret key in `.env.local`).

## Pipeline for dev
Follow these steps to ensure stable updates:
```bash
# After your changes, run linter
npx eslint --fix . # then fix that are flagged as error

# then build to verify your changes won't crash production 
npm run build

# If no errors, you can simply now use git to push your changes
```
