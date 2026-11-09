# Social post composer and article photo galleries

Date: 2026-11-03
Status: approved 2026-11-03

## Why

The college shares every news article, announcement and event on its
Facebook page. Today one person rebuilds each post by hand in Canva:
a branded cover graphic, then each photo with a footer strip, then the
caption. The CMS already holds the title, text and photos, so it should
produce the whole post.

Articles on Facebook usually carry many photos (the Startup Challenge post
had 14), but the site only stores one cover image per post or event. The
site needs to hold and show all of them.

## Goals

1. **Photo galleries.** News articles, announcements and events can each
   hold an ordered list of photos, and the public site shows them.
2. **Composer.** From an article's or event's edit page in the CMS, an
   admin builds a ready-to-post Facebook pack and downloads it as a zip.
   No Canva needed.

## Non-goals

- Posting to Facebook (or anywhere) automatically. The output is a zip the
  admin uploads by hand.
- Saving composer settings (layout, crops, edited text). Each export
  starts fresh from the article. (My call; easy to add later.)
- Freeform design tools (moving text, changing colours, adding shapes).
  The look is fixed; the admin only chooses photos, crops, layout and
  text.
- Other formats such as Instagram stories or X-sized images.

## Anti-goals (would make this a failure even if it works)

- The two cover halves don't line up when Facebook stacks them, so the
  "one tall picture" effect breaks.
- Output that looks visibly worse than the Canva version: blurry photos,
  wrong fonts, stretched images.
- The public site gets slower or breaks because of large galleries.
- Exports that need a server the school site doesn't have. The school site
  is static files; the composer lives only in the CMS (Vercel).

## The pack (what's in the zip)

Reference: the college's "WVSU CICT Shines with Four Teams in the Top 10
of Philippine Startup Challenge XI" Facebook post. Mockups from the
brainstorm: `.superpowers/brainstorm/199428-1793672990/content/post-pack-v2.html`
and `composer.html` (local only, not committed).

Files, in posting order:

| File | Size | What |
|------|------|------|
| `01.jpg` | 940×940 | Cover, top half |
| `02.jpg` | 940×940 | Cover, bottom half |
| `03.jpg` … | 940×940 each | Every gallery photo, in gallery order, with the footer strip |
| `caption.txt` | | Title, blank line, article text as plain text (Markdown stripped), blank line, link to the article |

**Which photos go in the pack (my call):** the article's cover image
(`cover_image_url`) first, then the gallery photos in order. The same set
is offered for the collage. Existing articles with only a cover image
still export a full pack, and a new article's main photo never has to be
uploaded twice.

**Photo count (my call):** the left-column stack is Facebook's layout for
posts with five or more images, which is what the college posts. The
composer shows a warning when the pack has fewer than five images ("Facebook
may not stack the cover halves") but still exports.

**Caption link (my call):** built from `SITE_URL` (`src/lib/seo.ts`), not
`siteUrl()`, so it is always absolute and points at whichever domain is
serving the public site.

Zip name: the article's slug, e.g. `wvsu-cict-shines-startup-challenge.zip`.

### The cover (940×1880, cut into two 940×940 squares)

Facebook stacks images 1 and 2 in the left column of a multi-photo post,
so together they read as one tall picture. The cover is drawn once at
940×1880 and cut across the middle at y = 940.

Layers, bottom to top:

1. **Background collage.** Several of the article's photos fill the whole
   940×1880 frame, chosen and cropped by the admin (see Composer). It is
   one continuous background, so the two halves fit like puzzle pieces.
2. **Top: orange wave** behind the title, with the WVSU seal and the CICT
   logo side by side above the title.
3. **Title** in bold white display type (Oswald, the site's display font),
   centred, wrapped and auto-sized to fit the wave. Label, date, summary
   and footer use Source Sans 3, the site's body font. (Decided: the
   site's own fonts.)
4. **Bottom: orange wash** over the collage, fading to white behind the
   text block.
5. **Label + date**: a black italic tag (default "UPFLASH") followed by
   the date, e.g. "October 29, 2026".
6. **Summary** in bold navy (`#102033`), from the post's `excerpt`
   (events: `summary`).
7. **Footer strip** across the bottom: Facebook `/cictwvsu`, X
   `/cictwvsu`, email `cict@wvsu.edu.ph`, each with its icon.

Colours: orange as in the sample (builder picks the exact value from the
sample post and keeps it in one constant), navy `#102033` (the site's
theme colour).

### Photo images (940×940)

Each gallery photo is cropped to a centred square (cover-fit) and gets the
same footer strip as the cover. The admin doesn't crop these individually
(my call; the composer could add it later).

## Composer (CMS)

Entry point: an "Export for social media" button on the edit pages for
posts (news and announcements) and events. Opens a full-page composer
route under `/admin`.

Layout (see `composer.html` mockup):

- **Left:** live preview of the full 940×1880 cover, scaled down, with a
  red line where it's cut. Below it, small previews of the photo images.
- **Right:**
  - **Collage layout**: pick one of a few fixed arrangements. Starting
    set: 2 stacked, 3 stacked (taller first), 1 full-width over 2
    side-by-side, 4 stacked. Each layout is data (a list of slot
    rectangles in the 940×1880 frame), so adding one is a small change.
  - **Photos**: the article's gallery as thumbnails. Clicking one puts it
    in the next empty collage slot; its number shows which slot. Clicking
    again removes it.
  - **Crop**: click a slot in the preview, drag to move the photo inside
    the slot, scroll (or a slider) to zoom. The photo always covers the
    slot (no empty gaps).
  - **Text on the cover**: title, summary, label, date. Pre-filled from
    the article (events use their start date); editing here does not
    change the article.
  - **Download zip** button.

Defaults when the composer opens: layout "3 stacked", the first three
photos (cover image, then gallery) in the slots, centred crops. An article
with no photos at all can still export a cover with a plain navy background
(my call).

Everything is drawn in the browser on a `<canvas>` and zipped in the
browser. Nothing new runs on the server.

## Galleries

### Data

Posts and events get an ordered list of photos. Each photo needs a URL,
width and height (the composer and the site's layout need dimensions),
and optional alt text. Storage, table shape (a JSON column or a child
table) and how `cover_image_url` relates to the gallery are the
builder's call, with these rules:

- Existing posts and events keep working with no data migration by hand;
  an existing `cover_image_url` still shows.
- The cover image stays the card/thumbnail image on the site (news cards,
  home page, carousel). (My call: keep `cover_image_url` as its own
  field; the gallery is extra photos, and the public photo grid shows only
  the gallery so the cover isn't shown twice.)
- Public read access follows the same rules as the parent row (published
  only); writes are admin only, like every other CMS table.

### CMS editing

On the post and event forms, a "Photos" section: upload several images at
once, see them as thumbnails, drag to reorder, remove, edit alt text.

### Public site

Below the article body (news/announcement article page and event page), a
photo grid; clicking a photo opens it large with next/previous. Images
lazy-load. Works in the static school-site build (content loads in the
browser from Supabase, like the rest of those pages).

## Constraints

- Two builds (see `next.config.mjs`): public pages must be `*.site.tsx`
  and work as a static export; the composer and CMS editing live only in
  the CMS build.
- Server actions have a 10 MB body limit. Uploading many photos in one
  form submit will exceed it; uploads go straight from the browser to
  Supabase Storage (the `media` bucket's admin-only policies allow it),
  resized in the browser first, following the student works pattern in
  `src/lib/studentWorks/images`.
- The admin pages have a strict CSP (`src/lib/cms/csp.ts`). Canvas drawing
  of Storage images needs them loaded with CORS so the canvas isn't
  tainted; check `img-src`/`connect-src` cover what's used.
- Fonts on the canvas must be loaded before drawing (`document.fonts`), or
  the first export uses a fallback font.
- A zip library is a new dependency (small, browser-side, e.g. `fflate`).
- Follow the repo's existing patterns: `AdminForm`, `FormSection`,
  `MediaField`, `lib/cms/forms.ts`, Supabase migrations in
  `supabase/migrations`, types via `npm run db:types`, Vitest tests next
  to the code.

## Open for the builder

- Exact table/column design for galleries.
- Upload mechanism (per-file server action vs browser-to-Storage).
- Canvas drawing code structure, text wrapping and auto-sizing.
- The public lightbox (reuse anything suitable from student works).
- Exact orange value and the wave/wash shapes, matched to the sample post.

## Assets

- **WVSU seal:** not in the repo yet. The composer draws
  `public/wvsu-seal.png` beside the CICT logo when that file exists, and
  the CICT logo (`public/icons/cictlogo.png`) alone, centred, when it
  doesn't. Adding the file later needs no code change. (Decided.)
- **Look:** no Canva template or exported images were provided. The
  builder matches the orange, wave and fade to the screenshot of the
  reference post, keeping all colours and shapes in one module so they're
  easy to tune after the admin sees real output. (Decided: go ahead with
  the builder's best match.)
