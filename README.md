# AURELIA — House of Light

A cinematic, scroll-driven landing page for a **fictional** coastal residence.
Built as an editorial architecture presentation: full-bleed photography, a pinned
hero transformation, a five-chapter walk through the house, a layered gallery,
a materials study and a day-to-night closing scene.

Everything is 2D. There is no WebGL, no Three.js, no video and no iframe — the
motion is GSAP transforms, opacity and `clip-path` over locally served images.

> **AURELIA is not a real building, practice or address.** This repository is a
> design and engineering demonstration. The photographs are stock images of eight
> different buildings, assembled as an art-directed narrative. Full attribution
> is in [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md) and on the `/credits`
> page of the running site.

---

## Screenshots

Capture these yourself after `pnpm dev` — they are not committed (only the
source photographs the site uses are).

| View | Where |
|---|---|
| Hero — "House of Light" | `/` at scroll 0 |
| Pinned hero transformation | `/` around 55–90% through the hero pin |
| Architectural statement | `/#project` |
| Spatial journey, chapters 01–05 | `/#spaces` |
| Layered editorial gallery | `/#gallery` |
| Materials study | `/#materials` |
| Night closing | `/#nightfall` |
| Image credits | `/credits` |

```bash
# suggested placement
mkdir -p docs/screenshots
# then save captures as docs/screenshots/01-hero.webp, 02-hero-pin.webp, …
```

---

## Setup

Requirements: **Node 20.9+**, **pnpm 9+**. Developed against Node 24 and
pnpm 11.

```bash
pnpm install      # dependencies
pnpm dev          # http://localhost:3000
```

The processed images **are committed** to this repository, so a fresh clone runs
and renders fully without any network step. If you want to regenerate them from
source — or verify the pipeline — run:

```bash
pnpm assets:fetch # re-download + re-process the eight photographs (optional)
```

The pipeline overwrites `public/images/` deterministically from the manifest. If
you ever start from an empty `public/images/`, `assets:fetch` must run before
`pnpm dev` or `pnpm build` for the photographs to appear; otherwise the frames
fall back to the ivory-to-clay CSS gradient.

### Other scripts

| Script | Purpose |
|---|---|
| `pnpm assets:fetch` | Download, validate and process every photograph |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint (flat config, `eslint-config-next`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | `lint` → `typecheck` → `build` |

### Environment variables

Copy `.env.example` to `.env.local` if you need it:

```
PEXELS_API_KEY=
```

**The key is optional.** The pipeline resolves every photograph from the direct
download URLs recorded in the manifest, and that path is expected to succeed. The
key only enables the third fallback strategy (see below), which is useful on
networks where direct image requests are blocked.

---

## The asset pipeline

`scripts/fetch-assets.mjs` is the only thing that touches the network at build
time. For each of the eight records it tries, in order:

1. the publisher's **direct download URL**;
2. the `og:image` / `twitter:image` advertised on the **source page**;
3. the **Pexels REST API**, only if `PEXELS_API_KEY` is set.

Every response is validated — successful status, `image/*` content type, non-empty
body, under 35 MB — behind a 45-second timeout and a descriptive `User-Agent`.
The script never negotiates a CAPTCHA, a login wall or a robots restriction, and
it never substitutes a different image when a download fails.

Each original is then run through Sharp:

- auto-rotated from EXIF and stripped of non-essential metadata;
- resized to a maximum width of **2400 px**, never enlarged;
- written as **WebP at quality 82**, plus a **960 px** derivative at quality 78;
- the hero additionally produces `og-hero.jpg`, a 1200×630 JPEG for the Open
  Graph card (Satori, the renderer behind `next/og`, cannot decode WebP).

Originals live in `.cache/assets/` and are deleted after a successful conversion.

**Outputs**

- `public/images/<name>.webp` and `public/images/<name>-960.webp`
- `public/images/manifest.json` — local path, dimensions, byte size, source page,
  photographer, licence URL and Pexels ID for each prepared image
- `public/image-credits.json` — the attribution record

**Failure behaviour**

- If the **hero** (`exterior-day`) cannot be prepared, the script exits non-zero.
  The page has no meaningful opening without it.
- Any **other** failure is reported and the build continues. The affected frames
  fall back to the ivory-to-clay CSS gradient defined on `.media` in
  `src/styles/aurelia.css`, which is a composed surface rather than a broken
  image. Failures are also listed in `public/images/manifest.json` under
  `missing`, and printed at the end of the run.

At the time of writing, all eight assets resolve from their direct URLs.

---

## Image sources

See [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md) for the full table with
source pages, Pexels IDs, licence URLs and local filenames, plus a map of where
each photograph appears.

| Role | Photographer | Pexels ID |
|---|---|---|
| Primary hero exterior | Jonathan Borba | 28586202 |
| Closing night scene | Jahangir Alam Jahan | 12975922 |
| Living room chapter | Max Vakhtbovych | 7534563 |
| Editorial image and layered gallery | alleksana | 15173314 |
| Kitchen chapter | Hiba Q. Omar | 15220867 |
| Architectural detail chapter | Denys Gromov | 15535457 |
| Bedroom chapter | Max Vakhtbovych | 7598140 |
| Bathroom chapter | Max Vakhtbovych | 7031574 |

### Licence notes

- All photographs: [Pexels licence](https://www.pexels.com/license/). Free for
  commercial and non-commercial use, no attribution required — this project
  credits every photographer anyway, in the footer of every page and on
  `/credits`, and links each credit to the exact source page.
- The attribution fields in `src/data/assets.ts` are a deliberate obligation of
  this repository. **Do not remove `sourcePage`, `photographer`, `licenseUrl` or
  `pexelsId`.**
- Fonts: Cormorant Garamond and Inter, SIL OFL 1.1, self-hosted at build time by
  `next/font/google`. No font files are committed.
- No image is sourced from Pinterest. Pinterest was treated strictly as a
  design-reference platform and was not crawled.

---

## Accessibility

- **Reduced motion is a first-class layout, not a degradation.** Under
  `prefers-reduced-motion: reduce` the page: skips Lenis entirely and uses native
  scrolling; builds no ScrollTriggers and therefore creates no pins; and returns
  the spatial journey and the night closing to ordinary stacked document flow via
  CSS. Verified: 0 pin spacers, Lenis inactive, all five chapters in normal
  document order.
- Semantic landmarks — `header`, `main`, `footer`, `section`, `nav` — with a
  single `h1` and a flat, ordered heading structure beneath it.
- A skip-to-content link is the first focusable element; activating it moves
  focus to `main`.
- Focus is visible everywhere, and inverts to ivory over dark sections.
- In-page navigation moves focus to the target section as well as scrolling it
  into view, so keyboard and screen-reader users land where sighted users do.
- Alt text comes from the licensed manifest records. Re-crops of a photograph
  already described elsewhere use empty `alt`, so a screen reader is not read the
  same room twice.
- No important text is baked into an image.
- The hero title carries its own contrast plate, because ivory display type over
  a white building does not otherwise clear 4.5:1.
- ARIA is used only where the semantics require it — a loading status, and
  `aria-hidden` on the decorative split halves of the `h1` whose accessible name
  is supplied by a visually hidden sibling.
- Decorative cursor and hover affordances are gated behind
  `(hover: hover) and (pointer: fine)`.

---

## Performance

- Every image is local after `pnpm assets:fetch`. `next.config.ts` configures an
  **empty `remotePatterns`** on purpose — the site must never hotlink.
- All images go through `next/image` in `fill` mode inside aspect-ratio-locked
  frames, so nothing reflows as images arrive.
- Only the hero uses `priority`. Everything else is lazy.
- `sizes` is set per usage. Small render boxes (credits thumbnails, some gallery
  plates) source the 960 px derivative rather than the 2400 px master; the
  materials swatches do the opposite, because they magnify a small region.
- Motion is limited to transforms, opacity and `clip-path`. No filter is animated
  per frame, and `will-change` is set on exactly two elements.
- The film grain is an inline SVG turbulence in CSS — no texture download.
- The favicon and Open Graph card are generated at build time from code and a
  local plate.
- Lenis is the only smooth-scroll system. ScrollSmoother is intentionally absent.
- GSAP plugins are registered once, in `src/lib/gsap.ts`. Every animation lives
  inside a `useGSAP` context and every `gsap.matchMedia` is reverted on unmount,
  so nothing leaks across route changes.

---

## Project structure

```
aurelia-residence/
├─ scripts/
│  └─ fetch-assets.mjs         # download → validate → Sharp → public/images
├─ public/
│  ├─ images/                  # committed; regenerable via pnpm assets:fetch
│  │  ├─ <name>.webp, <name>-960.webp, og-hero.jpg
│  │  └─ manifest.json
│  └─ image-credits.json       # committed; regenerable
├─ src/
│  ├─ app/
│  │  ├─ globals.css           # Tailwind entry + design tokens
│  │  ├─ layout.tsx            # fonts, metadata, header/footer, smooth scroll
│  │  ├─ page.tsx              # scene composition
│  │  ├─ icon.tsx              # "A" monogram, drawn in code
│  │  ├─ opengraph-image.tsx   # OG card from the local hero plate
│  │  ├─ robots.ts
│  │  └─ credits/page.tsx
│  ├─ components/aurelia/
│  │  ├─ SmoothScrollProvider.tsx  # Lenis ↔ ScrollTrigger, anchors, cleanup
│  │  ├─ Preloader.tsx             # leaves when the hero image decodes
│  │  ├─ SiteHeader.tsx
│  │  ├─ Hero.tsx                  # markup only — server component
│  │  ├─ HeroTransition.tsx        # intro + pinned reframe
│  │  ├─ StatementSection.tsx
│  │  ├─ SpatialJourney.tsx        # five chapters, one timeline
│  │  ├─ EditorialGallery.tsx      # asymmetric grid + scroll marquee
│  │  ├─ MaterialsSection.tsx
│  │  ├─ NightClosing.tsx          # vertical mask reveal
│  │  ├─ SiteFooter.tsx
│  │  └─ Media.tsx                 # framed next/image with gradient fallback
│  ├─ data/
│  │  ├─ assets.ts             # licensed photography records
│  │  └─ chapters.ts           # project facts, chapters, materials, nav
│  ├─ lib/
│  │  ├─ gsap.ts               # single plugin registration + breakpoints
│  │  ├─ images.ts             # asset lookup helpers
│  │  └─ ready.ts              # preloader ↔ hero handshake
│  └─ styles/
│     └─ aurelia.css           # scene styles and the reduced-motion layout
├─ THIRD_PARTY_ASSETS.md
└─ .env.example
```

### Responsive behaviour

Breakpoints live in one place, `MEDIA` in `src/lib/gsap.ts`, and are consumed
through `gsap.matchMedia`.

| | Hero pin | Journey (per chapter) | Night pin | Notes |
|---|---|---|---|---|
| Desktop ≥1024px | 140% | 105% | 110% | Full sequence |
| Tablet 640–1023px | 110% | 80% | 85% | Shorter pins |
| Mobile <640px | 80% | 55% | 65% | Fewer simultaneous transforms: no architectural grid, no per-scene `object-position` drift, smaller scales |
| Reduced motion | none | none | none | No pins, no Lenis, document flow |

Mobile is composed rather than scaled: the hero metadata becomes a 2×2 block, the
navigation drops to Spaces and Credits, and the gallery switches from a 6-column
asymmetric grid to a 4-column alternating rhythm. Section heights use `svh`, so
mobile browser chrome does not clip a scene.

---

## Known limitations

- **The five journey photographs load together.** They are stacked absolutely
  inside the pinned stage, so the browser considers all five in-viewport as the
  section approaches and fetches them at once (~1.5 MB total, after the fold).
  Splitting them would need an IntersectionObserver keyed to timeline progress.
- **The eight photographs are eight different buildings.** A single shared colour
  grade (`saturate(.82) contrast(1.03)` plus a sand multiply veil) pulls them
  towards one palette, but they are not one house and the site says so.
- **`og-hero.jpg` is a fixed centre crop.** It is not art-directed per platform.
- **No test suite.** Validation here is `lint` + `typecheck` + `build` plus manual
  browser inspection at 1440px, 1280px and 390px, in normal and reduced-motion
  modes.
- **`metadataBase` points at `https://aurelia.example`,** a reserved example
  domain. Change it before deploying anywhere real.
- **`robots.ts` disallows everything.** A fictional building should not appear in
  search results as though it exists. Remove it if you fork this for real work.
- Two `sizes` attributes intentionally exceed the rendered box width, because the
  materials swatches magnify their images ~2.6×. That is deliberate, not an
  oversight.

---

## Licence

The source code in this repository is a demonstration and carries no warranty.
The photographs remain under the Pexels licence and belong to their photographers
— see [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md).
