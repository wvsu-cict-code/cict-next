# Featured student works on the BSEMC program page

Date: 2026-11-01
Status: approved 2026-11-01

## Intent

BSEMC (Bachelor of Science in Entertainment and Media Computing) students
make digital artwork, animated and filmed videos, and published games and
apps. The BSEMC program page currently only describes the program. The owner
wants visitors to also *see what the students make*: a "Featured student
works" section on that page, below the program information, that shows the
work itself and lets visitors look at each piece closely.

CMS admins curate the section: they add works, choose their order, and take
them down.

## What the visitor sees

### The section

- Appears on `/programs/bsemc` only, below the existing program sections
  (brochure/description, objectives, "At a glance").
- Heading styled like the site's other section headings, e.g. eyebrow
  "Student showcase", title "Featured student works".
- Layout is a **gallery wall** (chosen from three mockups): a masonry-style
  arrangement where every piece keeps its own shape (tall, wide, square),
  like a portfolio. Pieces are not cropped to a uniform size.
- Each piece on the wall shows its image, a small type label (Digital art /
  Video / Game), the title, and the student or team name. Videos show a play
  marker over their thumbnail.
- When there are no visible works, the section is not shown at all.
- Expected size: around 20 works.

### Loading

- The wall loads a first batch of works, and loads more as the visitor scrolls
  toward the end (infinite scroll triggered by scrolling, not a "load more"
  button).
- Images load only as they come into view.
- Each piece's space is reserved before its image arrives, so the wall doesn't
  shift while images load. This needs each image's width and height to be
  known ahead of time (see Data).

### The spotlight

Clicking or tapping a piece opens it in a **spotlight**: a full-screen overlay
that dims the page and shows the work large with its details beside it on
wide screens, stacked underneath on phones.

Details shown: type label, title, student/team name, description, and links:

- **"View portfolio"** link (Behance or any portfolio site), when the work
  has one.
- For games/apps, a **store button** labelled from the link's site:
  "Play on itch.io", "Get it on Google Play", "Download on the App Store";
  anything else gets a generic label such as "Play the game". (Labelling is
  the designer's call; the owner asked for itch.io, Google Play "or any app
  store".)

Links open in a new tab.

Per type:

- **Digital art**: the full image, uncropped, with zoom controls (below).
- **Video**: the YouTube video plays inside the spotlight, in a 16:9 or a
  tall 9:16 frame to match the video. Students post vertical videos (Shorts,
  9:16 animations), and those appear as tall tiles on the wall.
- **Game/app**: the screenshot, plus the store button.

Moving and closing:

- Previous/next arrows, and swiping left/right on touch screens, move through
  **all** works in wall order, including ones the wall hasn't loaded yet.
- ✕ button, Esc, clicking the dimmed backdrop, and swiping down on touch
  screens close it.
- The owner explicitly asked for it to be **touch friendly**: comfortable tap
  targets and gestures that feel native on phones.

### Zoom (images in the spotlight)

The owner asked for "user friendly controls like zoom" and touch support.
For digital art:

- Pinch to zoom on touch screens.
- Double-tap / double-click toggles zoom in and back out.
- Visible + / − / reset buttons for mouse users; the scroll wheel zooms too.
- When zoomed in, drag (finger or mouse) pans around the image.
- While zoomed in, swipes pan instead of changing pieces, so exploring a
  zoomed image never jumps to the next work. Swipe-to-navigate works only at
  normal size.
- Zoom shows the full-resolution image, so detail like brushwork is visible.

Video and game screenshots don't zoom.

## Managing works (CMS)

A new **"Student works"** area in the admin, alongside Posts, Events,
Programs, etc. Only CMS admins (the existing `is_admin()` access) can manage
it.

Each work has:

| Field | Notes |
|---|---|
| Type | Digital art, Video, or Game/app |
| Title | required |
| Student name | required; free text, so a team can be "Team Habol" or a list of members' names |
| Description | short; required |
| Image | required for digital art and games (the artwork / a screenshot). Not needed for videos: the thumbnail comes from YouTube |
| YouTube link | required for videos; regular `watch`, `youtu.be` and `shorts/` links all work |
| Orientation | videos only: Landscape (16:9) or Vertical (9:16). Pre-set to Vertical for `youtube.com/shorts/` links, Landscape otherwise; the admin can change it |
| Thumbnail | videos only, optional: an uploaded image to show on the wall instead of YouTube's. Recommended for vertical videos |
| Store link | required for games/apps (itch.io, Google Play, App Store, or any other URL) |
| Portfolio link | optional, any type |
| Visible | show/hide switch, so a work can be taken off the wall without deleting it |
| Order | position on the wall |

Admins **reorder** works in the list by drag and drop, with a keyboard/button
alternative. The wall and the spotlight follow this order.

## Goals

1. BSEMC page shows a gallery wall of featured student works below the
   program information.
2. Photos, YouTube videos and published games/apps are all supported.
3. The spotlight shows the work large with title, student, description,
   portfolio and store links; images can be zoomed and panned; everything works
   well by touch.
4. CMS admins can add, edit, hide, delete and reorder works, and changes show
   on the public site on the next page load (like all other CMS content).
5. Scrolling loads more works; images load lazily without the layout jumping.

## Non-goals

- Featured works sections on other programs' pages. (The original request said
  "per program, especially BSEMC"; the owner then narrowed it to the EMC page
  only.)
- Uploading video files: videos are YouTube links only.
- Students submitting their own work, or EMC faculty having separate access:
  CMS admins manage everything.
- Multiple images per work, comments, likes, or individual pages/URLs per
  work.

## Anti-goals

- Cropping artwork to a uniform shape on the wall or in the spotlight.
- Swipe gestures fighting each other (a pan on a zoomed image changing the
  piece, or a swipe closing the spotlight while zoomed).
- A wall that jumps around as images load.
- Making visitors download every full-resolution original just to view the
  wall.

## Constraints

- **Two builds, one codebase.** The public site is a static export uploaded to
  the school's Apache server; it fetches content from Supabase in the browser
  (`src/lib/cms/content.ts`, `useContent`). There is no server and **no image
  optimization** on the school site (`images: { unoptimized: true }`). The CMS
  runs on Vercel. See
  `docs/superpowers/specs/2026-10-29-split-cms-static-site-design.md`.
- The program page is `src/components/ProgramDetails.tsx`, which loads the
  program client-side by the ID in the URL. The section renders when the
  program ID is `bsemc`.
- New public routes, if any, must be `*.site.tsx` (they aren't needed for this
  feature: the section lives on an existing page).
- **Database:** imperative migrations in `supabase/migrations/`, created with
  `supabase migration new`. Public tables need RLS: visitors (`anon`) see only
  visible works; admins (`is_admin()`) can do everything. Follow existing
  patterns (`events`, `pages`). Regenerate `database.types.ts` after the
  schema change.
- **Uploads** go to the public `media` storage bucket, currently limited to
  **10 MB per file** with image MIME types allowed. CMS uploads currently pass
  through server actions (`experimental.serverActions.bodySizeLimit: "10mb"`),
  but **Vercel rejects request bodies over 4.5 MB** before Next sees them, so
  in production the real limit through a server action is 4.5 MB. See
  `resolveMediaField` and `uploadMedia` in `src/lib/cms/forms.ts` and the
  `<MediaField>` component.
- **The CMS has a Content-Security-Policy** (`src/lib/cms/csp.ts`). It has no
  `connect-src`, so `default-src 'self'` blocks the browser from talking to
  Supabase Storage directly, and `img-src` doesn't allow YouTube thumbnails
  (`i.ytimg.com`). Both need adding for this feature.
- Supabase image transformations aren't assumed to be available, so the site
  can't ask Supabase for resized images on the fly.
- The site has no Content-Security-Policy restricting frames, so YouTube
  embeds work.
- Existing dependencies: Next 16, React 19, Tailwind 4, GSAP, supabase-js. No
  gallery, lightbox or gesture library is installed.
- Styling follows the site's tokens in `src/app/globals.css` (`theme-red`,
  `ink`, `navy`, Oswald headings, Source Sans body).

## Decisions made by Claude (owner can override)

- **Data:** a new `student_works` table rather than reusing posts. No program
  column, since only BSEMC has the section.
- **Image versions:** each uploaded image gets three files:
  - the **original**, kept in Storage as an archive and never sent to visitors;
  - a **zoom** version capped at about 4000 px on the long side, which the
    spotlight loads when the visitor zooms in (a full 25 MB original would be
    slow on mobile data and can fail to decode on iPhones);
  - a **display** version, about 1600 px on the long side, for the wall and
    the spotlight's first view.

  Width and height are recorded for the display and zoom versions, so the wall
  can reserve space and the zoom knows the real size. Images smaller than a cap
  aren't enlarged.
- **Large originals:** digital art can be well over 4.5 MB. Uploads go
  straight from the admin's browser to Storage (signed upload URL or the
  supabase-js client with the admin's session), not through a server action.
  Allow up to about 25 MB for these files. The CMS CSP gets a `connect-src`
  for the Supabase origin.
- **Formats:** digital art and game screenshots accept PNG, JPEG and WebP
  only. Animated pieces go on YouTube as videos; animated GIFs and SVGs aren't
  accepted (GIFs lose their animation when resized, and SVGs have no fixed
  pixel size).
- **Video thumbnails:** an uploaded thumbnail is used when there is one
  (processed like other images, display version only). Otherwise the wall uses
  YouTube's thumbnail: the 16:9 `maxresdefault` for landscape videos, falling
  back to `hqdefault` cropped to 16:9 when it doesn't exist; for vertical
  videos, `hqdefault` cropped to the 9:16 picture in its centre. The tile's
  shape comes from the orientation, never from the thumbnail. Embeds use
  `youtube-nocookie.com`, and the CMS CSP's `img-src` allows `i.ytimg.com`
  for previews in the admin.
- **Hidden works** stay in the admin list, marked hidden, and are excluded from
  the public query and RLS.
- **Batch size** for scroll loading: about 12 per batch.
- **Accessibility:** the spotlight is a proper modal dialog (focus moves into
  it and back out when closed, Esc closes it, arrows have labels); wall items
  are buttons with the work's title and student as their name; zoom buttons
  are labelled; image alt text is built from the title and student name.

## Left to the builder

- Whether to build the gallery wall, the spotlight and the zoom/gestures
  by hand or add a small, well-maintained library. Hand-built is fine given
  the site's existing GSAP and the narrow needs; a library is fine if it
  handles pinch/pan/swipe conflicts well.
- How the masonry layout is implemented (CSS columns, grid with measured
  spans, etc.), as long as the reading order of the wall matches the admin's
  order and new batches append without reshuffling what's already shown.
- How the display version is generated (in the browser before upload, or on
  the CMS server).
- Exact admin UI for drag-and-drop reordering, matching the existing admin
  look.
- Mobile layout details of the spotlight within the decisions above.
