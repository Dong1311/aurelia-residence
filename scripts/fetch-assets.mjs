#!/usr/bin/env node
/**
 * AURELIA — asset pipeline.
 *
 * Downloads the eight licensed Pexels photographs listed in ASSET_MANIFEST,
 * normalises them with Sharp and writes deterministic local WebP files into
 * `public/images/`. The production site never hotlinks a remote image.
 *
 * Resolution order per asset:
 *   1. `directDownloadUrl`
 *   2. `og:image` / `twitter:image` discovered on `sourcePage`
 *   3. Pexels REST API — only when `PEXELS_API_KEY` is present
 *
 * The script never bypasses a CAPTCHA, a login wall, a robots restriction or
 * any other access control, and it never invents a substitute image.
 *
 * Usage: pnpm assets:fetch
 */

import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/* ------------------------------------------------------------------ */
/* Asset records                                                       */
/* ------------------------------------------------------------------ */

/**
 * Canonical asset records. Kept byte-for-byte in sync with `src/data/assets.ts`,
 * which is the runtime source of truth for the application.
 */
const ASSET_MANIFEST = [
  {
    id: 'exterior-day',
    pexelsId: 28586202,
    filename: 'exterior-day',
    role: 'Primary hero exterior',
    photographer: 'Jonathan Borba',
    sourcePage:
      'https://www.pexels.com/photo/modern-luxury-home-with-glass-facade-and-pool-28586202/',
    directDownloadUrl:
      'https://images.pexels.com/photos/28586202/pexels-photo-28586202.jpeg?cs=srgb&dl=pexels-jonathanborba-28586202.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Modern white residence with a glass facade, timber deck and swimming pool',
  },
  {
    id: 'exterior-night',
    pexelsId: 12975922,
    filename: 'exterior-night',
    role: 'Closing night scene',
    photographer: 'Jahangir Alam Jahan',
    sourcePage:
      'https://www.pexels.com/photo/a-house-with-a-swimming-pool-at-night-12975922/',
    directDownloadUrl:
      'https://images.pexels.com/photos/12975922/pexels-photo-12975922.jpeg?cs=srgb&dl=pexels-jahangir-alam-jahan-279240197-12975922.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Illuminated modern house and swimming pool at night',
  },
  {
    id: 'living-room-main',
    pexelsId: 7534563,
    filename: 'living-room-main',
    role: 'Living room chapter',
    photographer: 'Max Vakhtbovych',
    sourcePage:
      'https://www.pexels.com/photo/luxury-living-room-in-modern-apartment-7534563/',
    directDownloadUrl:
      'https://images.pexels.com/photos/7534563/pexels-photo-7534563.jpeg?cs=srgb&dl=pexels-artbovich-7534563.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Spacious luxury apartment with a light-filled living and dining area',
  },
  {
    id: 'living-room-editorial',
    pexelsId: 15173314,
    filename: 'living-room-editorial',
    role: 'Editorial image and layered gallery',
    photographer: 'alleksana',
    sourcePage: 'https://www.pexels.com/photo/modern-interior-design-15173314/',
    directDownloadUrl:
      'https://images.pexels.com/photos/15173314/pexels-photo-15173314.jpeg?cs=srgb&dl=pexels-alleksana-15173314.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Minimalist neutral-toned interior with a curved wooden table',
  },
  {
    id: 'kitchen',
    pexelsId: 15220867,
    filename: 'kitchen',
    role: 'Kitchen chapter',
    photographer: 'Hiba Q. Omar',
    sourcePage:
      'https://www.pexels.com/photo/modern-minimalist-kitchen-interior-design-15220867/',
    directDownloadUrl:
      'https://images.pexels.com/photos/15220867/pexels-photo-15220867.jpeg?cs=srgb&dl=pexels-hiba-q-omar-106562569-15220867.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Modern kitchen with a marble island, timber cabinetry and pendant lights',
  },
  {
    id: 'staircase',
    pexelsId: 15535457,
    filename: 'staircase',
    role: 'Architectural detail chapter',
    photographer: 'Denys Gromov',
    sourcePage:
      'https://www.pexels.com/photo/interior-staircase-of-modern-building-15535457/',
    directDownloadUrl:
      'https://images.pexels.com/photos/15535457/pexels-photo-15535457.jpeg?cs=srgb&dl=pexels-jdgromov-15535457.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Sculptural curved staircase in a bright contemporary interior',
  },
  {
    id: 'bedroom',
    pexelsId: 7598140,
    filename: 'bedroom',
    role: 'Bedroom chapter',
    photographer: 'Max Vakhtbovych',
    sourcePage:
      'https://www.pexels.com/photo/luxury-contemporary-bedroom-interior-design-7598140/',
    directDownloadUrl:
      'https://images.pexels.com/photos/7598140/pexels-photo-7598140.jpeg?cs=srgb&dl=pexels-artbovich-7598140.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Spacious contemporary bedroom with large windows and neutral furniture',
  },
  {
    id: 'bathroom',
    pexelsId: 7031574,
    filename: 'bathroom',
    role: 'Bathroom chapter',
    photographer: 'Max Vakhtbovych',
    sourcePage:
      'https://www.pexels.com/photo/minimalist-luxury-interior-design-of-modern-bathroom-7031574/',
    directDownloadUrl:
      'https://images.pexels.com/photos/7031574/pexels-photo-7031574.jpeg?cs=srgb&dl=pexels-artbovich-7031574.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Minimalist light-gray bathroom with a freestanding bathtub and double sinks',
  },
]

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const HERO_ID = 'exterior-day'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE_DIR = path.join(ROOT, '.cache', 'assets')
const OUTPUT_DIR = path.join(ROOT, 'public', 'images')
const PUBLIC_DIR = path.join(ROOT, 'public')

const MAX_WIDTH = 2400
const MOBILE_WIDTH = 960
/** Open Graph card plate. JPEG, because Satori cannot decode WebP. */
const OG_SIZE = { width: 1200, height: 630 }
const OG_FILE = 'og-hero.jpg'
const WEBP_QUALITY = 82
const MOBILE_WEBP_QUALITY = 78
const MAX_BYTES = 35 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 45_000

const USER_AGENT =
  'aurelia-residence-asset-fetcher/1.0 (+https://example.com/aurelia; educational demo; contact studio@aurelia.example)'

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const styles = {
  dim: (s) => `[2m${s}[0m`,
  bold: (s) => `[1m${s}[0m`,
  green: (s) => `[32m${s}[0m`,
  yellow: (s) => `[33m${s}[0m`,
  red: (s) => `[31m${s}[0m`,
}

function log(message) {
  process.stdout.write(`${message}\n`)
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * `fetch` with an abort-based timeout and a descriptive User-Agent.
 * Redirects are followed, but authentication and challenge pages are not
 * negotiated — a non-image response is simply treated as a failure.
 */
async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      redirect: 'follow',
      ...init,
      headers: {
        'user-agent': USER_AGENT,
        accept: init.accept ?? '*/*',
        ...init.headers,
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Streams a remote image to disk after validating status, content type and
 * declared size. Returns the number of bytes written.
 */
async function downloadImage(url, destination) {
  const response = await fetchWithTimeout(url, {
    accept: 'image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }

  const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
  if (!contentType.startsWith('image/')) {
    throw new Error(`unexpected content-type "${contentType || 'unknown'}"`)
  }

  const declaredLength = Number(response.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_BYTES) {
    throw new Error(`declared size ${formatBytes(declaredLength)} exceeds the ${formatBytes(MAX_BYTES)} limit`)
  }

  if (!response.body) {
    throw new Error('response contained no body')
  }

  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination))

  const { size } = await stat(destination)
  if (size === 0) {
    throw new Error('downloaded file was empty')
  }
  if (size > MAX_BYTES) {
    throw new Error(`file size ${formatBytes(size)} exceeds the ${formatBytes(MAX_BYTES)} limit`)
  }

  return size
}

/**
 * Reads the public HTML of a Pexels photo page and returns the social preview
 * image it advertises. This uses only openly published metadata.
 */
async function resolveFromSourcePage(sourcePage) {
  const response = await fetchWithTimeout(sourcePage, {
    accept: 'text/html,application/xhtml+xml',
  })

  if (!response.ok) {
    throw new Error(`source page returned HTTP ${response.status}`)
  }

  const html = await response.text()
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      return match[1].replaceAll('&amp;', '&')
    }
  }

  throw new Error('no og:image or twitter:image metadata found')
}

/**
 * Optional authenticated fallback. Only runs when the operator supplied their
 * own Pexels API key, which is the platform's sanctioned access path.
 */
async function resolveFromPexelsApi(pexelsId, apiKey) {
  const response = await fetchWithTimeout(`https://api.pexels.com/v1/photos/${pexelsId}`, {
    accept: 'application/json',
    headers: { authorization: apiKey },
  })

  if (!response.ok) {
    throw new Error(`Pexels API returned HTTP ${response.status}`)
  }

  const payload = await response.json()
  const candidate =
    payload?.src?.original ?? payload?.src?.large2x ?? payload?.src?.large ?? null

  if (!candidate) {
    throw new Error('Pexels API response contained no usable source')
  }

  return candidate
}

/* ------------------------------------------------------------------ */
/* Acquisition                                                         */
/* ------------------------------------------------------------------ */

async function acquireOriginal(asset, apiKey) {
  const destination = path.join(CACHE_DIR, `${asset.filename}.original`)
  const attempts = []

  // 1 — the publisher's direct download URL.
  try {
    const size = await downloadImage(asset.directDownloadUrl, destination)
    return { destination, size, strategy: 'direct download URL', attempts }
  } catch (error) {
    attempts.push(`direct download URL — ${error.message}`)
  }

  // 2 — social preview metadata published on the source page.
  try {
    const discovered = await resolveFromSourcePage(asset.sourcePage)
    const size = await downloadImage(discovered, destination)
    return { destination, size, strategy: 'source page metadata', attempts }
  } catch (error) {
    attempts.push(`source page metadata — ${error.message}`)
  }

  // 3 — authenticated Pexels API, only when a key was provided.
  if (apiKey) {
    try {
      const discovered = await resolveFromPexelsApi(asset.pexelsId, apiKey)
      const size = await downloadImage(discovered, destination)
      return { destination, size, strategy: 'Pexels API', attempts }
    } catch (error) {
      attempts.push(`Pexels API — ${error.message}`)
    }
  } else {
    attempts.push('Pexels API — skipped, PEXELS_API_KEY is not set')
  }

  const failure = new Error(`every acquisition strategy failed for "${asset.id}"`)
  failure.attempts = attempts
  throw failure
}

/* ------------------------------------------------------------------ */
/* Processing                                                          */
/* ------------------------------------------------------------------ */

/**
 * Auto-rotates from EXIF, drops non-essential metadata, downsizes without
 * enlarging and emits a desktop and a mobile WebP derivative.
 */
async function processImage(asset, originalPath) {
  const base = sharp(originalPath, { failOn: 'error' }).rotate()
  const metadata = await base.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('could not read image dimensions')
  }

  const desktopFile = `${asset.filename}.webp`
  const mobileFile = `${asset.filename}-960.webp`

  const desktop = await sharp(originalPath, { failOn: 'error' })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(path.join(OUTPUT_DIR, desktopFile))

  const mobile = await sharp(originalPath, { failOn: 'error' })
    .rotate()
    .resize({ width: MOBILE_WIDTH, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: MOBILE_WEBP_QUALITY, effort: 5 })
    .toFile(path.join(OUTPUT_DIR, mobileFile))

  // The hero doubles as the Open Graph plate. `next/og` renders through Satori,
  // whose image decoder handles JPEG but not WebP, so this one is a JPEG.
  if (asset.id === HERO_ID) {
    await sharp(originalPath, { failOn: 'error' })
      .rotate()
      .resize({ ...OG_SIZE, fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(OUTPUT_DIR, OG_FILE))
  }

  return {
    desktop: {
      file: desktopFile,
      path: `/images/${desktopFile}`,
      width: desktop.width,
      height: desktop.height,
      bytes: desktop.size,
    },
    mobile: {
      file: mobileFile,
      path: `/images/${mobileFile}`,
      width: mobile.width,
      height: mobile.height,
      bytes: mobile.size,
    },
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const apiKey = process.env.PEXELS_API_KEY?.trim() || null

  log('')
  log(styles.bold('  AURELIA — asset pipeline'))
  log(styles.dim(`  ${ASSET_MANIFEST.length} records · max ${MAX_WIDTH}px · WebP q${WEBP_QUALITY}`))
  log(styles.dim(`  Pexels API key: ${apiKey ? 'provided' : 'not provided (direct links are sufficient)'}`))
  log('')

  await mkdir(CACHE_DIR, { recursive: true })
  await mkdir(OUTPUT_DIR, { recursive: true })

  const prepared = []
  const failed = []

  for (const asset of ASSET_MANIFEST) {
    const label = asset.id.padEnd(22)
    try {
      const { destination, size, strategy, attempts } = await acquireOriginal(asset, apiKey)
      for (const note of attempts) {
        log(styles.dim(`  ${' '.repeat(24)}retry: ${note}`))
      }

      const derivatives = await processImage(asset, destination)
      await rm(destination, { force: true })

      prepared.push({
        id: asset.id,
        role: asset.role,
        alt: asset.alt,
        src: derivatives.desktop.path,
        mobileSrc: derivatives.mobile.path,
        width: derivatives.desktop.width,
        height: derivatives.desktop.height,
        mobileWidth: derivatives.mobile.width,
        mobileHeight: derivatives.mobile.height,
        bytes: derivatives.desktop.bytes,
        mobileBytes: derivatives.mobile.bytes,
        sourcePage: asset.sourcePage,
        photographer: asset.photographer,
        licenseUrl: asset.licenseUrl,
        pexelsId: asset.pexelsId,
      })

      log(
        `  ${styles.green('✓')} ${label} ${styles.dim(
          `${derivatives.desktop.width}×${derivatives.desktop.height} · ${formatBytes(
            derivatives.desktop.bytes,
          )} + ${formatBytes(derivatives.mobile.bytes)} · from ${strategy} · source ${formatBytes(size)}`,
        )}`,
      )
    } catch (error) {
      failed.push({
        id: asset.id,
        role: asset.role,
        filename: asset.filename,
        sourcePage: asset.sourcePage,
        reason: error.message,
        attempts: error.attempts ?? [error.message],
      })
      log(`  ${styles.red('✗')} ${label} ${styles.red(error.message)}`)
      for (const note of error.attempts ?? []) {
        log(styles.dim(`  ${' '.repeat(24)}${note}`))
      }
      await rm(path.join(CACHE_DIR, `${asset.filename}.original`), { force: true })
    }
  }

  /* -- generated artefacts ----------------------------------------- */

  const generatedNote =
    'Generated by scripts/fetch-assets.mjs. Do not edit by hand — run `pnpm assets:fetch`.'

  await writeFile(
    path.join(OUTPUT_DIR, 'manifest.json'),
    `${JSON.stringify(
      {
        $note: generatedNote,
        maxWidth: MAX_WIDTH,
        mobileWidth: MOBILE_WIDTH,
        webpQuality: WEBP_QUALITY,
        images: prepared,
        missing: failed.map(({ id, role, filename, sourcePage, reason }) => ({
          id,
          role,
          filename,
          sourcePage,
          reason,
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  await writeFile(
    path.join(PUBLIC_DIR, 'image-credits.json'),
    `${JSON.stringify(
      {
        $note: generatedNote,
        disclaimer:
          'AURELIA — House of Light is a fictional concept site created for design and development demonstration. The photographs below are stock images and may depict different properties.',
        license: 'https://www.pexels.com/license/',
        credits: ASSET_MANIFEST.map((asset) => ({
          id: asset.id,
          role: asset.role,
          photographer: asset.photographer,
          sourcePage: asset.sourcePage,
          pexelsId: asset.pexelsId,
          licenseUrl: asset.licenseUrl,
          localFile: `/images/${asset.filename}.webp`,
          localMobileFile: `/images/${asset.filename}-960.webp`,
          prepared: prepared.some((image) => image.id === asset.id),
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  /* -- cache cleanup ------------------------------------------------ */

  try {
    const leftovers = await readdir(CACHE_DIR)
    if (leftovers.length === 0) {
      await rm(path.join(ROOT, '.cache'), { recursive: true, force: true })
    }
  } catch {
    /* the cache directory is optional — nothing to clean up */
  }

  /* -- report ------------------------------------------------------- */

  log('')
  log(`  ${styles.bold('Prepared')} ${prepared.length}/${ASSET_MANIFEST.length} assets in public/images/`)
  log(styles.dim('  Wrote public/images/manifest.json and public/image-credits.json'))

  if (failed.length > 0) {
    log('')
    log(styles.yellow(`  ${failed.length} asset(s) could not be prepared:`))
    for (const item of failed) {
      log(styles.yellow(`    · ${item.id} (${item.role}) — ${item.sourcePage}`))
    }
    log(
      styles.dim(
        '    Sections using these images fall back to a CSS gradient placeholder.\n' +
          '    Re-run `pnpm assets:fetch`, optionally with PEXELS_API_KEY set.',
      ),
    )
  }

  const heroPrepared = prepared.some((image) => image.id === HERO_ID)
  if (!heroPrepared) {
    log('')
    log(styles.red(`  Fatal: the hero image "${HERO_ID}" could not be prepared.`))
    log(styles.red('  The landing page cannot be built without it. Aborting.'))
    log('')
    process.exitCode = 1
    return
  }

  log('')
}

main().catch((error) => {
  log('')
  log(styles.red(`  Asset pipeline crashed: ${error?.stack ?? error}`))
  log('')
  process.exitCode = 1
})
