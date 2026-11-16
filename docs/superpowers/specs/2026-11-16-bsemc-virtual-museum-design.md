# BSEMC Virtual Museum

Date: 2026-11-16
Status: approved 2026-11-16

## Intent

The BSEMC program page already has a "Featured student works" wall that CMS
admins curate. The owner wants a bigger stage for student work: a **Virtual
Museum**, which is a page under the BSEMC program where visitors walk a 3D
gallery hung with student games, animations, films, digital art and more.

It is also a student platform. Students **sign up with their WVSU email,
submit their own work, and a CMS admin approves it** before it goes on the
walls. Signed-in WVSU users can **like** exhibits. There are no comments.

The target look is the owner's mockup (generated with ChatGPT), stored with
this spec at `docs/superpowers/specs/assets/2026-11-16-virtual-museum-mockup.png`.
The build follows it section by section. Where the mockup shows things the
owner ruled out (comment counts, "Get Feedback"), those are dropped.

The owner asked for **React, three.js and shadcn/ui**.

## Goals

- A museum page at `/programs/bsemc/museum` that matches the mockup.
- A walkable 3D gallery that works with a keyboard and mouse on desktop and
  with touch on phones.
- Student accounts restricted to `@wvsu.edu.ph` email addresses.
- Student submissions with an admin review queue in the CMS.
- Likes from signed-in WVSU users, with real counts.

## Non-goals

- Comments of any kind.
- Likes from visitors who aren't signed in.
- Checking that a user is actually a BSEMC student. Any WVSU email can sign
  up; admin approval is the filter for what appears.
- Hosting game builds or 3D model files. Games, 3D & XR and Interactive Media
  link out to where the work lives.
- Converting other formats. Students upload webp and webm only.
- VR headsets, multiplayer, avatars or voice.

## Anti-goals (failure even if it works)

- Unapproved or rejected work visible on the public site.
- Someone without a WVSU email getting an account.
- Made-up numbers. Like counts are real or not shown.
- Making the page slow for people who never enter the museum: three.js and
  the 3D scene load only when the visitor goes into the museum section.
- The 3D view being the *only* way to see the work. Keyboard, screen-reader
  and low-end-device users must be able to browse everything in a normal grid.

## Constraints from the existing project

- **Two builds.** The public site is a static export for the school's Apache
  server (`npm run build:site`). Only `page.site.tsx` / `layout.site.tsx`
  routes are in it. Everything public, including sign-up, sign-in and
  submitting, has to run in the browser against Supabase. The CMS (Vercel)
  is the full Next app.
- **`.htaccess` rewrites.** `programs/<anything>/` is rewritten to the one
  program template page unless a real file or directory exists. Exporting
  `programs/bsemc/museum/` creates a real `out/programs/bsemc/` directory
  with no `index.html`, which would break `/programs/bsemc/`. The rewrite
  conditions must be changed so `/programs/bsemc/` still reaches the
  template and `/programs/bsemc/museum/` serves its own page. Both rules
  (page and router data files) need checking.
- **Existing auth.** One Supabase project. Admins are rows in
  `public.admin_users` and are checked with `public.is_admin()`. The CMS
  route guard (`src/lib/cms/access.ts`) already sends non-admin signed-in
  users away from public pages on the CMS deployment, so students won't end
  up in the CMS.
- **Existing works.** `public.student_works` (kinds `art`, `video`, `game`;
  videos are YouTube IDs) feeds the BSEMC page wall and `WorkSpotlight`.
  The museum builds on this table rather than starting a second one.
- **Theme.** The site has light and dark themes driven by `data-theme` and
  its own color tokens in `src/app/globals.css`. shadcn/ui is not installed.
  Its default `accent` token clashes with the site's `--color-accent`, which
  is a text color. shadcn must be set up so its tokens map onto the site's,
  without changing how existing `text-accent` / `bg-accent` classes look.
- **Fonts.** Oswald for headings and Source Sans 3 for body text, already
  loaded.

## The page

Route: `/programs/bsemc/museum`. Linked from:

- the header: a "Virtual Museum" nav item, as in the mockup;
- the BSEMC program page: a museum banner near the "Featured student works"
  section.

The existing "Featured student works" wall on `/programs/bsemc` stays and
shows **every approved work**, the same set as the museum (confirmed by the
owner). `WorkWall`, `WorkTile` and `WorkSpotlight` must therefore handle all
seven categories, webm video/audio and works without known image
dimensions. The Featured flag only drives Student Highlights.

The hero and the 3D section are always dark (navy), as in the mockup. The
rest of the page follows the visitor's light/dark choice. *(Builder's call:
it's an immersive area, and forcing the whole page dark would clash with the
light header.)*

### 1. Hero

- "BSEMC" badge, "Virtual Museum" title, a short intro line, and the buttons
  **Enter Museum** (scrolls to the 3D section and starts it) and **Browse
  Exhibits** (scrolls to the grid, see 5).
- A line drawing of a building in perspective behind the text (SVG), and the
  orange corner wedge.
- Right column: the category list with icons. Each item jumps to that
  category in Browse Exhibits.

### 2. Program strip

Program name, description line, program code (links to `/programs/bsemc`)
and duration, read from the existing `programs` row for `bsemc`.

### 3. Student Highlights

- Eyebrow "Featured exhibits", title "Student Highlights", "View All
  Exhibits →" (goes to Browse Exhibits).
- A horizontally scrolling row of cards with prev/next arrows (shadcn
  Carousel). Each card shows the cover, title, category and **like count**,
  with no comment count. The card's tint comes from its category, as in the
  mockup.
- Which works appear is chosen by admins with a new **Featured** flag.
- Clicking a card takes the visitor into the 3D museum, standing in front of
  that exhibit. If 3D isn't available (see 4), it opens the exhibit's detail
  view instead.

### 4. The 3D museum

Built with React Three Fiber (`@react-three/fiber` v9 for React 19) and
`@react-three/drei` on three.js.

**Loading.** The section first shows a still poster with a "Click to enter"
prompt. The 3D code is a separate, dynamically imported chunk that loads
when the visitor clicks Enter Museum, a highlight card or the poster. If
WebGL isn't available, the section says so and points to Browse Exhibits.

**The space.** A gallery hall like the mockup: light walls, a dark ceiling
with track lights, orange accent panels, benches, and a central pillar
reading "BSEMC Virtual Museum — Student Creative Showcase". Works hang on
the side walls in frames, each with a small label plate (title, student).
The hall grows in length to fit the number of works in the current gallery.
*(Builder's call: room proportions, lighting and materials, matched to the
mockup.)*

**Galleries.** A selector at bottom left switches galleries. Each gallery is
the same hall hung with different works:

| Gallery | Name | Categories |
| --- | --- | --- |
| A | Games & Interactive Media | Games, Interactive Media |
| B | Animation, Film & Sound | Animations, Short Films, Sound Design |
| C | Digital Art & 3D | Digital Art, 3D & XR |

Galleries with no approved works are left out of the selector. *(Builder's
call: grouping.)*

**Capacity.** A gallery hall hangs at most 30 works: featured works first,
then the newest. The rest are still in Browse Exhibits, and opening one of
them from a share link or Browse goes to its detail view, not the hall.
This keeps texture memory bounded on phones however many works pile up
over the years. *(Builder's call: the number 30 and the ordering.)*

**What hangs on the wall:**

- images: the webp itself;
- webm videos (animations, short films): the poster image with a play
  marker. Videos never stream on the walls; they play only in the detail
  view (Free plan bandwidth, see Supabase plan limits);
- sound design: the cover image with a sound-wave plate;
- games, 3D & XR, interactive media: the cover image;
- legacy YouTube videos: their thumbnail.

If an image can't be loaded as a texture (for example a CORS failure), the
frame shows a category-colored panel with the category icon, like the
mockup's placeholder art.

**Controls.**

- Desktop: **WASD / arrow keys** to move, **drag the mouse** to look,
  **E** to open the exhibit in front of you, **M** to show or hide the
  minimap. The visitor can't walk through walls, the pillar or benches.
- Clicking an exhibit glides the camera to stand in front of it and opens
  its info panel. This is also the main way to move on touch screens, where
  dragging looks around. Prev/next buttons step through exhibits in order.
  *(Builder's call: there's no on-screen joystick.)*
- Keys only act while the 3D section has focus, so they never hijack page
  scrolling or typing elsewhere.
- A controls bar along the bottom ("W A S D Move · Look · E Interact · M
  Map"), hidden on touch devices and replaced by "Drag to look · Tap a work".

**Overlay UI** (shadcn components, styled for the dark scene):

- **Exit to Lobby** (top left): glides back to the hall entrance.
- **Fullscreen** and **Settings** (top right). Settings holds look
  sensitivity, movement speed, invert look and graphics quality
  (low/high: shadows, resolution). Settings are remembered in the browser.
- **Minimap** (bottom left): the hall outline, exhibit positions and the
  visitor's position and heading.
- **Info panel** (right side; a bottom sheet on phones): title, category
  badge, student, description, then **Like** (with count), **Share** and
  **Save**, and **View Details →**.
  - Like when not signed in opens a prompt to sign in with a WVSU account.
  - Share uses the system share sheet where there is one, otherwise copies
    a link. The link opens the museum page with that exhibit selected
    (`?exhibit=<id>`).
  - Save bookmarks the exhibit in this browser. Browse Exhibits has a
    "Saved" filter. *(Builder's call: no account needed, no server storage.)*
  - View Details opens the existing `WorkSpotlight`, extended to play webm
    video and audio and to show the like button.

With reduced motion turned on, camera glides become instant jumps.

### 5. Browse Exhibits

The accessible, non-3D way through everything: a grid of all approved works
with category filter chips, a "Saved" filter, and a search on title and
student. Opening a work uses the same detail view as above. This is where
"Browse Exhibits", "View All Exhibits" and the hero category list lead.
*(Builder's call: grid layout, page size and whether it reuses the existing
`WorkWall`.)*

### 6. Share Your Work + How It Works

As in the mockup:

- **Share Your Work**: a short line, a checklist of accepted kinds of work,
  and **Upload Exhibit →**. That goes to the submission form, or to sign-in
  first when the visitor isn't signed in.
- **How It Works**, in four steps: **Sign in** (with your WVSU account),
  **Upload** (add project files, details and media), **Review** (a CICT
  admin checks your submission), **Exhibit** (your work goes live in the
  Virtual Museum). This replaces the mockup's "Get Feedback" step.

## Categories

The three kinds become seven categories:

| Category | Student provides |
| --- | --- |
| Games | cover image (webp) + link to the live game |
| Interactive Media | cover image (webp) + link |
| 3D & XR | cover image (webp) + link |
| Digital Art | the artwork (webp) |
| Animations | the video (webm) + optional poster (webp) |
| Short Films | the video (webm) + optional poster (webp) |
| Sound Design | the audio (webm) + cover image (webp) |

The owner set the formats: webp for images, webm for video, and a cover
photo plus a live link for games. Applying the same rules to Interactive
Media, 3D & XR and Sound Design was agreed in conversation.

Existing works are moved over: `art` → Digital Art, `game` → Games,
`video` → Short Films. Admins can recategorize. Works an admin adds in the
CMS may still use a YouTube link instead of a webm file, so existing videos
keep working.

When a video has no poster, the first frame is captured in the browser at
submit time and saved as its poster. *(Builder's call.)*

## Accounts

- **Sign-up**: email and password, with a confirmation email. Only
  `@wvsu.edu.ph` addresses are accepted. This is enforced **on the server**
  by a Supabase "before user created" auth hook that rejects other domains,
  not just by the form. The form checks the domain too, so people get an
  early error message.
- Admin accounts made with `npm run cms:create-admin` are exempt: the hook
  only blocks self-service sign-ups. If the hook can't tell the two apart,
  it blocks both, and new admins then need a WVSU address; the script's
  docs must say so. *(Builder's call.)*
- Pages (static, browser-driven): sign up, sign in, forgot/reset password,
  the confirmation-link landing page, and an account page. *(Builder's call:
  they live under `/account/…`.)*
- The header gets a **Sign In** button, as in the mockup. When signed in it
  becomes an account menu (My submissions, Sign out), next to a
  **notifications bell**.
- Any signed-in WVSU user can like and submit. Admins are still decided only
  by `admin_users`.
- Students need a display name, asked for at sign-up and shown on their
  exhibits by default. Each submission can override it, for example with a
  team name.
- **Production setup**: Supabase's built-in email sender is heavily rate
  limited. Before launch the project needs custom SMTP, the school site URL
  in the auth redirect allow-list, and the auth hook turned on. The plan must
  include a checklist for this.

## Submissions

**Form** (signed-in only): title, category, description, display name
(pre-filled), the files the category needs (see Categories), the live link
where needed, and an optional portfolio link. Files are checked in the
browser for type (by content, not just extension), size and, for images,
dimensions. They are then uploaded straight to Supabase Storage.

**Size limits**: images 5 MB and at most 2560 px on the longest side;
video and audio 20 MB. See Supabase plan limits.

**My submissions** (account page): each submission with its status:
**Pending**, **Approved** or **Rejected** (with the admin's reason).

- A pending submission can be edited or withdrawn. Withdrawing deletes it
  and its files.
- Editing an approved submission sends it back to Pending, and it leaves the
  museum until it's approved again. Its likes are kept. *(Builder's call.)*
- A rejected submission can be edited and resubmitted.
- A student can delete their own work at any time.

**Storage**: submission files go in a separate bucket, under a folder per
user, with policies so a user can only write in their own folder. Files are
public by URL (random paths, no listing), so the static site can show them
without signed URLs. A pending file is reachable only by someone who already
has its exact URL. *(Builder's call; a private bucket with signed URLs would
complicate the static site for little gain.)*

**Data**: extend `student_works` rather than adding a parallel table: a
category, a review status (pending / approved / rejected), the submitting
user (null for admin-created works), a rejection reason, a featured flag,
webm media fields, and a like count. The public read policy becomes
`visible AND status = 'approved'`. Row-level security lets a student read
and change only their own rows, and only in allowed ways: a student can
never set the status to approved, set featured, or edit another user's work.
Status changes by a student (edit → pending) are done by trigger or RPC,
not trusted from the client. *(Builder's call: exact columns, and whether
student writes go through RPCs.)*

## Supabase plan limits

The project is on Supabase's **Free plan** (confirmed by the owner): about
1 GB of file storage and 5 GB of downloads a month. The design is sized for
that:

- the file limits above (5 MB images, 20 MB video/audio);
- each student can have at most **5 works** that are pending or approved at
  once. A sixth submission is refused with a clear message;
- files of rejected-then-deleted, withdrawn and deleted works are removed
  from Storage straight away, and replaced files are removed on edit;
- videos don't play on the museum walls, and the 3D hall uses the webp
  covers, never the full-size zoom images;
- the CMS dashboard shows total storage used by submissions against the
  1 GB limit, so admins see trouble coming.

All of these limits live in one place in code (and the matching database
and bucket settings), so they can be raised if the project moves to Pro.
*(Builder's call: the exact numbers.)*

## Likes

- One like per user per work, which can be undone. Stored in a likes table
  keyed by (work, user).
- Counts are public and shown on cards, the info panel and the detail view.
  They are kept as a denormalized count on the work (updated by trigger) so
  public lists don't need a join.
- Liking an unapproved work is refused by the database.

## Notifications

The bell shows unread notifications for the signed-in user:

- "Your submission *X* was approved" (links to it in the museum);
- "Your submission *X* was rejected: *reason*" (links to My submissions).

Notifications are created by the database when the status changes. They can
be marked read. Nothing is emailed. *(Builder's call.)*

## CMS (admin)

On the existing **Student works** page:

- Status tabs: **Pending** (with a count, also shown on the dashboard and
  the nav item), Approved, Rejected, All.
- A review view that previews the submission as it will appear (image,
  playable webm, links), with **Approve** and **Reject** (a reason is
  required).
- A **Featured** toggle (drives Student Highlights) and a category field on
  the work form.
- Admins can still create works directly; those are approved immediately.

## shadcn/ui

Set up for Tailwind v4 (`components.json`, `cn()` helper). Add only the
components the museum and account pages need: likely Button, Badge,
Carousel, Select, Popover, Slider, Switch, Tooltip, Sheet, Dialog, Input,
Label, Textarea, Form controls and DropdownMenu. Map shadcn's tokens onto
the site's (background → paper/surface, primary → theme red, and so on) so
both themes look right. Rename or remap shadcn's `accent` so existing
`text-accent` usage is unchanged. Existing pages are not migrated to shadcn.

## Testing

Follow the repo's existing pattern: Vitest tests for pure logic and React
components. Things that need tests:

- the WVSU email check;
- file validation;
- hall layout (how many works fit, positions);
- movement and collision math;
- gallery grouping;
- the `.htaccess` behavior for `/programs/bsemc/` and
  `/programs/bsemc/museum/`;
- the database rules: a student can't approve their own work, can't see
  other students' pending work, can't like twice, and can't like unapproved
  work. These can be SQL tests against the local Supabase.

The site build (`npm run build:site`) must still pass and include the new
pages.

## Left to the builder

Everything marked *builder's call* above, plus: component structure, exact
schema and migration steps, how three.js textures and videos are loaded and
cleaned up, minimap drawing, performance budgets on low-end phones, and the
copy text where the mockup doesn't give it.
